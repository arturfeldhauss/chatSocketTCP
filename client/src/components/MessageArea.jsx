import { useEffect, useRef } from 'react';

function MessageArea({ messages, myName, selectedRecipient }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRecipient]);

  // Filtra mensagens pela conversa ativa (igual ao modelo de conversas do WhatsApp)
  const conversationMessages = messages.filter(msg => {
    if (msg.tipo === 'sistema') return true;
    if (selectedRecipient === 'todos') return msg.destinatarios?.includes('todos');
    const euEnviei = msg.proprio && msg.destinatarios?.includes(selectedRecipient);
    const eleEnviou = msg.remetente === selectedRecipient && !msg.destinatarios?.includes('todos');
    return euEnviei || eleEnviou;
  });

  const formatTime = (ts) => (ts instanceof Date ? ts : new Date(ts))
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024)    return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const salvarArquivo = async (nomeArquivo, dadosBase64) => {
    try {
      const binary = atob(dadosBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      if ('showDirectoryPicker' in window) {
        const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
        const fh  = await dir.getFileHandle(nomeArquivo, { create: true });
        const w   = await fh.createWritable();
        await w.write(bytes); await w.close();
        alert(`"${nomeArquivo}" salvo com sucesso!`);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([bytes]));
        link.download = nomeArquivo;
        link.click();
      }
    } catch (err) {
      if (err.name !== 'AbortError') alert('Erro ao salvar: ' + err.message);
    }
  };

  const isGroup = selectedRecipient === 'todos';

  return (
    <div className="message-area-wrapper">
      <div className={`conv-header ${isGroup ? 'group' : 'private'}`}>
        <span className="conv-header-icon">{isGroup ? '👥' : '🔒'}</span>
        <span className="conv-header-label">
          {isGroup ? 'Grupo — Todos' : `Conversa privada com ${selectedRecipient}`}
        </span>
      </div>

      <div className="message-area">
        {conversationMessages.length === 0 && (
          <div className="msg-system">
            {isGroup ? 'Nenhuma mensagem no grupo ainda.' : `Nenhuma mensagem privada com ${selectedRecipient} ainda.`}
          </div>
        )}

        {conversationMessages.map((msg) => {
          if (msg.tipo === 'sistema') {
            return <div key={msg.id} className="msg-system">{msg.texto}</div>;
          }

          if (msg.tipo === 'texto') {
            const isOwn = msg.proprio || msg.remetente === myName;
            const isPrivate = !msg.destinatarios?.includes('todos');
            const bubbleClass = `msg-bubble ${isOwn ? 'proprio' : isPrivate ? 'privada' : 'publica'}`;
            return (
              <div key={msg.id} className={`msg-bubble-wrap ${isOwn ? 'proprio' : 'recebido'}`}>
                <div className="msg-meta">
                  <span className="sender">{isOwn ? 'Você' : msg.remetente}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {isPrivate && <span className="dest-badge private-badge">🔒 Privado</span>}
                </div>
                <div className={bubbleClass}>{msg.texto}</div>
              </div>
            );
          }

          if (msg.tipo === 'arquivo-enviado') {
            return (
              <div key={msg.id} className="msg-bubble-wrap proprio">
                <div className="msg-meta">
                  <span className="sender">Você</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {!msg.destinatarios?.includes('todos') && <span className="dest-badge private-badge">🔒 Privado</span>}
                </div>
                <div className="msg-bubble arquivo">
                  <span className="file-icon">📤</span>
                  <div className="file-info">
                    <span className="file-name">{msg.nomeArquivo}</span>
                    <span className="file-size">{formatSize(msg.tamanho)} — Enviado</span>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.tipo === 'arquivo-anuncio') {
            return (
              <div key={msg.id} className="msg-bubble-wrap recebido">
                <div className="msg-meta">
                  <span className="sender">{msg.remetente}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="msg-bubble arquivo">
                  <span className="file-icon">📥</span>
                  <div className="file-info">
                    <span className="file-name">{msg.nomeArquivo}</span>
                    <span className="file-size arquivo-aguardando">{formatSize(msg.tamanho)} — Recebendo...</span>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.tipo === 'arquivo-pronto') {
            return (
              <div key={msg.id} className="msg-bubble-wrap recebido">
                <div className="msg-meta">
                  <span className="sender">{msg.remetente}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="msg-bubble arquivo">
                  <span className="file-icon">📁</span>
                  <div className="file-info">
                    <span className="file-name">{msg.nomeArquivo}</span>
                    <span className="file-size">Arquivo recebido</span>
                  </div>
                  <button className="btn-salvar" onClick={() => salvarArquivo(msg.nomeArquivo, msg.dadosBase64)}>
                    Salvar
                  </button>
                </div>
              </div>
            );
          }

          return null;
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default MessageArea;
