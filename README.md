# 💬 Chat com Sockets TCP

Projeto de chat em tempo real utilizando **Sockets TCP**, com servidor em Java, bridge em Node.js e interface web em React.

---

## 🚀 Tecnologias Utilizadas

- **Servidor:** Java 11+ (Sockets TCP + Threads)
- **Bridge:** Node.js 18+ (`ws`)
- **Cliente:** React 18 + Vite
- **Comunicação:** JSON sobre TCP

> O frontend foi desenvolvido com auxílio de Inteligência Artificial (Claude - Anthropic).

---

## ▶️ Como Executar

### ⚠️ Importante
Execute primeiro o servidor e depois o cliente.

---

### 🖥️ Rodar o Servidor

```bash
cd server
javac ChatServer.java ClientHandler.java
java ChatServer
```

---

### ⚛️ Rodar o Cliente

```bash
cd client
npm install
npm run start
```

---

## 🌐 Acesso

Abra no navegador:

```bash
http://localhost:5173
```

Preencha:

- Servidor: `localhost`
- Porta: `12345`
- Nome: seu usuário

Clique em **Conectar**.

---

## 👥 Testar Múltiplos Clientes

Abra novas abas no navegador utilizando nomes diferentes.

---

## 👨‍💻 Autores

- **Artur Feldhaus**
- **Rafael Cecatto**
