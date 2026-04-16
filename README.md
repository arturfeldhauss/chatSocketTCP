# Chat com Sockets TCP

## Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|-----------|
| Servidor | Java 11+ (Sockets TCP, Threads) |
| Bridge | Node.js 18+ (ws) |
| Cliente | Vite + React 18 |
| Protocolo | JSON sobre TCP |

> O frontend foi desenvolvido com auxílio de Inteligência Artificial (Claude - Anthropic).

---

## Como Executar

### 1. Servidor Java

```bash
cd server
javac ChatServer.java ClientHandler.java
java ChatServer
```

### 2. Cliente (bridge + interface)

```bash
cd client
npm install
npm run start
```

Acesse: **http://localhost:5173**

Preencha: servidor `localhost`, porta `12345`, seu nome → **Conectar**

Para múltiplos clientes: abra novas abas no mesmo endereço com nomes diferentes.
