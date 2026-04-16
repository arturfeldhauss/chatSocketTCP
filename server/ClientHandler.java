import java.io.*;
import java.net.*;
import java.time.*;
import java.time.format.*;
import java.util.*;

public class ClientHandler implements Runnable {

    private final Socket socket;
    private final String ip;
    private String nome;
    private PrintWriter writer;
    private volatile boolean desconectou = false;

    public ClientHandler(Socket socket) {
        this.socket = socket;
        this.ip = socket.getInetAddress().getHostAddress();
        System.out.println("[INFO] Nova conexão: " + ip);
    }

    @Override
    public void run() {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
            writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);

            String linha;
            while ((linha = reader.readLine()) != null) {
                linha = linha.trim();
                if (!linha.isEmpty()) processarMensagem(linha);
            }
        } catch (IOException e) {
            // conexão encerrada abruptamente
        } finally {
            tratarLogoff();
        }
    }

    private void processarMensagem(String json) {
        String tipo = extrairString(json, "tipo");
        if (tipo == null) return;

        switch (tipo) {
            case "N": {
                String novoNome = extrairString(json, "nome");
                if (novoNome != null && !novoNome.isEmpty()) {
                    this.nome = novoNome;
                    log(ip, nome, ChatServer.SERVER_IP, "servidor", "login");
                    ChatServer.broadcastListaConectados();
                }
                break;
            }
            case "M": {
                List<String> dest = extrairArray(json, "destinatarios");
                String texto = extrairString(json, "texto");
                log(ip, nome, resolverIPs(dest), String.join("-", dest), "msg:" + texto);
                ChatServer.rotearMensagem(json, this, dest);
                break;
            }
            case "NA": {
                String nomeArq = extrairString(json, "nome");
                List<String> dest = extrairArray(json, "destinatarios");
                log(ip, nome, resolverIPs(dest), String.join("-", dest), "arq:" + nomeArq);
                ChatServer.rotearMensagem(json, this, dest);
                break;
            }
            case "A": {
                ChatServer.rotearMensagem(json, this, extrairArray(json, "destinatarios"));
                break;
            }
            case "S": {
                tratarLogoff();
                break;
            }
        }
    }

    private void tratarLogoff() {
        if (desconectou) return;
        desconectou = true;
        if (nome != null) {
            log(ip, nome, ChatServer.SERVER_IP, "servidor", "logoff");
            ChatServer.removerCliente(this);
            ChatServer.broadcastListaConectados();
        } else {
            ChatServer.removerCliente(this);
        }
        try { socket.close(); } catch (IOException ignored) {}
    }

    // synchronized evita que duas threads escrevam no mesmo PrintWriter ao mesmo tempo
    public synchronized void enviarMensagem(String json) {
        if (writer != null && !socket.isClosed())
            writer.println(json);
    }

    // Formato: DD/MM/YYYY; HH:MM; IP_rem; nome_rem; IP(s)_dest; nome(s)_dest; ação
    private void log(String ipRem, String nomeRem, String ipsDest, String nomesDest, String acao) {
        LocalDateTime now = LocalDateTime.now();
        System.out.printf("%s; %s; %s; %s; %s; %s; %s%n",
            now.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            now.format(DateTimeFormatter.ofPattern("HH:mm")),
            ipRem, nomeRem, ipsDest, nomesDest, acao);
    }

    private String resolverIPs(List<String> nomes) {
        if (nomes.contains("todos")) {
            List<String> ips = new ArrayList<>();
            for (ClientHandler c : ChatServer.clientes)
                if (c != this && c.getNome() != null) ips.add(c.getIp());
            return ips.isEmpty() ? "nenhum" : String.join("-", ips);
        }
        List<String> ips = new ArrayList<>();
        for (String n : nomes) {
            ClientHandler c = ChatServer.buscarPorNome(n);
            ips.add(c != null ? c.getIp() : "?");
        }
        return String.join("-", ips);
    }

    // Extrai valor de campo string de um JSON simples
    public static String extrairString(String json, String chave) {
        String padrao = "\"" + chave + "\"";
        int idx = json.indexOf(padrao);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx + padrao.length());
        if (colon == -1) return null;
        int start = colon + 1;
        while (start < json.length() && json.charAt(start) == ' ') start++;
        if (start >= json.length()) return null;
        if (json.charAt(start) == '"') {
            StringBuilder sb = new StringBuilder();
            int pos = start + 1;
            while (pos < json.length()) {
                char c = json.charAt(pos);
                if (c == '\\' && pos + 1 < json.length()) {
                    char next = json.charAt(pos + 1);
                    switch (next) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case 'n': sb.append('\n'); break;
                        default: sb.append(next); break;
                    }
                    pos += 2; continue;
                }
                if (c == '"') break;
                sb.append(c); pos++;
            }
            return sb.toString();
        }
        int end = start;
        while (end < json.length() && ",}]".indexOf(json.charAt(end)) == -1) end++;
        return json.substring(start, end).trim();
    }

    // Extrai array de strings de um campo JSON: "chave":["val1","val2"]
    public static List<String> extrairArray(String json, String chave) {
        String padrao = "\"" + chave + "\"";
        int idx = json.indexOf(padrao);
        if (idx == -1) return new ArrayList<>();
        int colon = json.indexOf(":", idx + padrao.length());
        int arrStart = json.indexOf("[", colon);
        int arrEnd = json.indexOf("]", arrStart);
        if (arrStart == -1 || arrEnd == -1) return new ArrayList<>();
        String conteudo = json.substring(arrStart + 1, arrEnd).trim();
        List<String> resultado = new ArrayList<>();
        if (conteudo.isEmpty()) return resultado;
        int pos = 0;
        while (pos < conteudo.length()) {
            if (conteudo.charAt(pos) == '"') {
                StringBuilder sb = new StringBuilder();
                pos++;
                while (pos < conteudo.length()) {
                    char ch = conteudo.charAt(pos);
                    if (ch == '\\' && pos + 1 < conteudo.length()) { pos += 2; continue; }
                    if (ch == '"') break;
                    sb.append(ch); pos++;
                }
                resultado.add(sb.toString());
            }
            pos++;
        }
        return resultado;
    }

    public String getNome() { return nome; }
    public String getIp()   { return ip; }
}
