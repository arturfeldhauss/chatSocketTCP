function ClientList({ clients, myName, selected, onSelect, unread = {} }) {
  const initials = (name) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const others = clients.filter(n => n !== myName);

  return (
    <aside className="client-list">
      <div className="client-list-section-title">Grupo</div>

      <div
        className={`client-item todos ${selected === 'todos' ? 'selected' : ''}`}
        onClick={() => onSelect('todos')}
      >
        <div className="client-avatar todos-avatar">👥</div>
        <div className="client-item-info">
          <span className="client-name-text">Todos</span>
          <span className="client-sub">{clients.length} {clients.length === 1 ? 'participante' : 'participantes'}</span>
        </div>
        {unread['todos'] > 0 && <span className="unread-badge">{unread['todos']}</span>}
      </div>

      <div className="client-list-section-title">Privado</div>

      <div className="client-list-items">
        {others.length === 0 && (
          <div className="client-empty">Nenhum outro usuário conectado</div>
        )}
        {others.map(nome => (
          <div
            key={nome}
            className={`client-item ${selected === nome ? 'selected' : ''}`}
            onClick={() => onSelect(nome)}
          >
            <div className="client-avatar">{initials(nome)}</div>
            <div className="client-item-info">
              <span className="client-name-text">{nome}</span>
              <span className="client-sub">mensagem privada</span>
            </div>
            {unread[nome] > 0 && <span className="unread-badge">{unread[nome]}</span>}
          </div>
        ))}
      </div>

      <div className="client-list-footer">
        <div className="client-avatar client-avatar-sm">{initials(myName)}</div>
        <span className="client-me-name">{myName} (você)</span>
      </div>
    </aside>
  );
}

export default ClientList;
