function ConnectionPanel({ host, setHost, port, setPort, myName, setMyName, connected, onConnect, onDisconnect }) {
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !connected) onConnect(); };

  return (
    <div className="connection-panel">
      <label>
        Servidor:
        <input className="input-host" type="text" value={host} onChange={e => setHost(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="localhost" disabled={connected} />
      </label>
      <label>
        Porta:
        <input className="input-port" type="number" value={port} onChange={e => setPort(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="12345" disabled={connected} min="1" max="65535" />
      </label>
      <label>
        Nome:
        <input className="input-name" type="text" value={myName} onChange={e => setMyName(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="Seu apelido" disabled={connected} maxLength={30} />
      </label>
      {!connected
        ? <button className="btn btn-connect" onClick={onConnect} disabled={!myName.trim() || !host.trim() || !port.trim()}>Conectar</button>
        : <button className="btn btn-disconnect" onClick={onDisconnect}>Desconectar</button>
      }
    </div>
  );
}

export default ConnectionPanel;
