// Bridge WebSocket <-> TCP
// Cada conexão WebSocket do browser gera uma conexão TCP separada ao servidor Java.
const WebSocket = require('ws');
const net       = require('net');
const { URL }   = require('url');

const BRIDGE_PORT = 8080;
const wss = new WebSocket.Server({ port: BRIDGE_PORT });

console.log(`Bridge WebSocket iniciada na porta ${BRIDGE_PORT}`);

wss.on('connection', (ws, request) => {
    let serverHost = 'localhost';
    let serverPort = 12345;

    try {
        const url = new URL(request.url, `http://localhost:${BRIDGE_PORT}`);
        serverHost = url.searchParams.get('server') || 'localhost';
        serverPort = parseInt(url.searchParams.get('port') || '12345', 10);
    } catch (e) {
        console.error('[Bridge] URL inválida:', e.message);
    }

    console.log(`[Bridge] WS conectado → abrindo TCP para ${serverHost}:${serverPort}`);

    const tcpClient = new net.Socket();
    let buffer = '';

    tcpClient.connect(serverPort, serverHost, () => {
        console.log(`[Bridge] TCP conectado a ${serverHost}:${serverPort}`);
    });

    // Browser → Servidor Java
    ws.on('message', (data) => {
        const texto = data.toString();
        console.log(`[Bridge WS→TCP] ${texto.substring(0, 120)}`);
        tcpClient.write(texto.endsWith('\n') ? texto : texto + '\n');
    });

    // Servidor Java → Browser
    tcpClient.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
            const linha = buffer.substring(0, idx).trim();
            buffer = buffer.substring(idx + 1);
            if (linha.length > 0) {
                console.log(`[Bridge TCP→WS] estado=${ws.readyState} | ${linha.substring(0, 120)}`);
                if (ws.readyState === WebSocket.OPEN) ws.send(linha);
            }
        }
    });

    ws.on('close', () => { tcpClient.destroy(); });
    ws.on('error', (err) => { console.error('[Bridge] Erro WS:', err.message); tcpClient.destroy(); });

    tcpClient.on('close', () => { if (ws.readyState === WebSocket.OPEN) ws.close(); });
    tcpClient.on('error', (err) => { console.error('[Bridge] Erro TCP:', err.message); ws.close(); });
});
