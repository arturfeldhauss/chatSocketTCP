import { useState, useRef } from 'react';

function SendPanel({ onSendText, onSendFile, selectedRecipient, connected }) {
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || !connected) return;
    onSendText(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { onSendFile(file); e.target.value = ''; }
  };

  const destLabel = selectedRecipient === 'todos' ? 'Todos' : selectedRecipient;

  return (
    <div className="send-panel">
      <span className="send-dest-badge">Para: <strong>{destLabel}</strong></span>
      <input
        className="send-input" type="text" value={text}
        onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
        placeholder={`Mensagem para ${destLabel}...`}
        disabled={!connected} maxLength={2000}
      />
      <button className="btn btn-send" onClick={handleSend} disabled={!connected || !text.trim()}>
        Enviar
      </button>
      <button className="btn btn-file" onClick={() => fileInputRef.current?.click()} disabled={!connected}>
        Arquivo
      </button>
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}

export default SendPanel;
