import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class ChatServer {

    public static final int PORTA = 12345;
    public static final List<ClientHandler> clientes = new CopyOnWriteArrayList<>();

    public static final String SERVER_IP;
    static {
        String ip = "127.0.0.1";
        try { ip = InetAddress.getLocalHost().getHostAddress(); } catch (Exception ignored) {}
        SERVER_IP = ip;
    }

    public static void main(String[] args) {
        System.out.println("Servidor de Chat TCP — porta " + PORTA);
        System.out.println("IP do servidor: " + SERVER_IP);
        System.out.println("Aguardando conexões...\n");

        try (ServerSocket serverSocket = new ServerSocket(PORTA)) {
            serverSocket.setReuseAddress(true);

            while (true) {
                Socket socket = serverSocket.accept();
                socket.setTcpNoDelay(true); // envia pacotes imediatamente, sem buffer de 200ms
                ClientHandler handler = new ClientHandler(socket);
                clientes.add(handler);
                Thread t = new Thread(handler);
                t.setDaemon(true);
                t.start();
            }
        } catch (IOException e) {
            System.err.println("Erro fatal: " + e.getMessage());
        }
    }

    // Roteia mensagem para "todos" (broadcast) ou destinatários específicos
    public static void rotearMensagem(String json, ClientHandler remetente, List<String> destinatarios) {
        if (destinatarios.contains("todos")) {
            for (ClientHandler c : clientes) {
                if (c != remetente && c.getNome() != null)
                    c.enviarMensagem(json);
            }
        } else {
            for (ClientHandler c : clientes) {
                if (c.getNome() != null && destinatarios.contains(c.getNome()))
                    c.enviarMensagem(json);
            }
        }
    }

    // Envia lista atualizada de conectados para todos (chamado em login/logoff)
    public static void broadcastListaConectados() {
        List<String> nomes = new ArrayList<>();
        for (ClientHandler c : clientes)
            if (c.getNome() != null) nomes.add(c.getNome());

        StringBuilder sb = new StringBuilder("{\"tipo\":\"NN\",\"nomes\":[");
        for (int i = 0; i < nomes.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escaparJson(nomes.get(i))).append("\"");
        }
        sb.append("]}");
        String msg = sb.toString();
        for (ClientHandler c : clientes) c.enviarMensagem(msg);
    }

    public static void removerCliente(ClientHandler handler) { clientes.remove(handler); }

    public static ClientHandler buscarPorNome(String nome) {
        for (ClientHandler c : clientes)
            if (nome.equals(c.getNome())) return c;
        return null;
    }

    public static String escaparJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}
