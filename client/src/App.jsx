import { useState, useEffect, useRef, useCallback } from 'react';
import ConnectionPanel from './components/ConnectionPanel.jsx';
import ClientList      from './components/ClientList.jsx';
import MessageArea     from './components/MessageArea.jsx';
import SendPanel       from './components/SendPanel.jsx';

function App() {
  const [host, setHost]       = useState('localhost');
  const [port, setPort]       = useState('12345');
  const [myName, setMyName]   = useState('');
  const [connected, setConnected]             = useState(false);
  const [clients, setClients]                 = useState([]);
  const [messages, setMessages]               = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('todos');
  const [unread, setUnread]   = useState({});

  const wsRef = useRef(null);
  // ref para selectedRecipient usado dentro de closures sem criar dependência circular
  const selectedRecipientRef = useRef('todos');

  useEffect(() => {
    selectedRecipientRef.current = selectedRecipient;
    setUnread(prev => ({ ...prev, [selectedRecipient]: 0 }));
  }, [selectedRecipient]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  const addSystemMessage = useCallback((text) => {
    addMessage({ tipo: 'sistema', texto: text, timestamp: new Date() });
  }, [addMessage]);

  const handleServerMessage = useCallback((data) => {
    let msg;
    try { msg = JSON.parse(data); }
    catch { console.warn('[App] JSON inválido:', data); return; }

    switch (msg.tipo) {
      case 'NN':
        setClients(msg.nomes || []);
        break;

      case 'M': {
        const convKey = msg.destinatarios?.includes('todos') ? 'todos' : msg.remetente;
        if (convKey !== selectedRecipientRef.current)
          setUnread(prev => ({ ...prev, [convKey]: (prev[convKey] || 0) + 1 }));
        addMessage({
          tipo: 'texto', remetente: msg.remetente,
          destinatarios: msg.destinatarios, texto: msg.texto,
          timestamp: new Date(), proprio: false,
        });
        break;
      }

      case 'NA': {
        const convKey = msg.destinatarios?.includes('todos') ? 'todos' : msg.remetente;
        if (convKey !== selectedRecipientRef.current)
          setUnread(prev => ({ ...prev, [convKey]: (prev[convKey] || 0) + 1 }));
        addMessage({
          tipo: 'arquivo-anuncio', remetente: msg.remetente,
          nomeArquivo: msg.nome, tamanho: msg.tamanho,
          destinatarios: msg.destinatarios, timestamp: new Date(),
        });
        break;
      }

      case 'A':
        setMessages(prev => {
          const idx = [...prev].reverse().findIndex(
            m => m.tipo === 'arquivo-anuncio' && m.nomeArquivo === msg.nome
              && m.remetente === msg.remetente && !m.dadosBase64
          );
          if (idx === -1) return [...prev, {
            id: Date.now() + Math.random(), tipo: 'arquivo-pronto',
            remetente: msg.remetente, nomeArquivo: msg.nome,
            dadosBase64: msg.dados, destinatarios: msg.destinatarios, timestamp: new Date(),
          }];
          const realIdx = prev.length - 1 - idx;
          const updated = [...prev];
          updated[realIdx] = { ...updated[realIdx], tipo: 'arquivo-pronto', dadosBase64: msg.dados };
          return updated;
        });
        break;

      default:
        console.log('[App] Tipo desconhecido:', msg.tipo);
    }
  }, [addMessage]);

  const connect = useCallback(() => {
    const nome = myName.trim();
    if (!nome) { alert('Informe seu nome antes de conectar!'); return; }

    const ws = new WebSocket(
      `ws://localhost:8080?server=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}`
    );

    ws.onopen    = () => { ws.send(JSON.stringify({ tipo: 'N', nome })); setConnected(true); addSystemMessage(`Conectado como "${nome}".`); };
    ws.onmessage = (e) => { console.log('[WS recebido]', e.data.substring(0, 120)); handleServerMessage(e.data); };
    ws.onclose   = () => { setConnected(false); setClients([]); setSelectedRecipient('todos'); setUnread({}); addSystemMessage('Desconectado.'); wsRef.current = null; };
    ws.onerror   = () => { addSystemMessage('Erro ao conectar. Verifique se o servidor Java e o bridge estão rodando.'); };

    wsRef.current = ws;
  }, [host, port, myName, addSystemMessage, handleServerMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ tipo: 'S', nome: myName }));
      wsRef.current.close();
    }
  }, [myName]);

  useEffect(() => () => { wsRef.current?.close(); }, []);

  const sendText = useCallback((texto) => {
    if (!texto.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      tipo: 'M', remetente: myName, destinatarios: [selectedRecipient], texto: texto.trim(),
    }));
    addMessage({ tipo: 'texto', remetente: myName, destinatarios: [selectedRecipient], texto: texto.trim(), timestamp: new Date(), proprio: true });
  }, [myName, selectedRecipient, addMessage]);

  const sendFile = useCallback((file) => {
    if (!file || !wsRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      wsRef.current.send(JSON.stringify({ tipo: 'NA', nome: file.name, tamanho: file.size, remetente: myName, destinatarios: [selectedRecipient] }));
      wsRef.current.send(JSON.stringify({ tipo: 'A',  nome: file.name, remetente: myName, destinatarios: [selectedRecipient], dados: base64 }));
      addMessage({ tipo: 'arquivo-enviado', remetente: myName, nomeArquivo: file.name, tamanho: file.size, destinatarios: [selectedRecipient], timestamp: new Date(), proprio: true });
    };
    reader.onerror = () => addSystemMessage(`Erro ao ler "${file.name}".`);
    reader.readAsDataURL(file);
  }, [myName, selectedRecipient, addMessage, addSystemMessage]);

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">Chat TCP</span>
        <span className={`app-status ${connected ? 'status-online' : 'status-offline'}`}>
          {connected ? `Conectado como "${myName}"` : 'Desconectado'}
        </span>
      </header>

      <ConnectionPanel host={host} setHost={setHost} port={port} setPort={setPort}
        myName={myName} setMyName={setMyName} connected={connected}
        onConnect={connect} onDisconnect={disconnect} />

      {connected && (
        <div className="chat-layout">
          <ClientList clients={clients} myName={myName} selected={selectedRecipient}
            onSelect={setSelectedRecipient} unread={unread} />
          <div className="chat-main">
            <MessageArea messages={messages} myName={myName} selectedRecipient={selectedRecipient} />
            <SendPanel onSendText={sendText} onSendFile={sendFile}
              selectedRecipient={selectedRecipient} connected={connected} />
          </div>
        </div>
      )}

      {!connected && (
        <div className="welcome-screen">
          <div className="welcome-icon">💬</div>
          <h2>Chat com Sockets TCP</h2>
          <p>Preencha os dados acima e clique em <strong>Conectar</strong> para entrar.</p>
        </div>
      )}
    </div>
  );
}

export default App;
