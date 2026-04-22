# Chat com Sockets TCP

## Tecnologias Utilizadas
Servidor = Java 11+ (Sockets TCP, Threads)
Bridge = Node.js 18+ (ws) 
Cliente(front) = Vite + React 18 
Protocolo JSON sobre TCP 

> O frontend foi desenvolvido com auxílio de Inteligência Artificial (Claude - Anthropic).

---

## Como Executar 
## IMPORTANTE: Rode primeiro o servidor e depois o client

Rodar o serve(Primeiro a rodar, antes do cliente)
cd server
javac ChatServer.java ClientHandler.java
java ChatServer

Rodar o front(Só rodar quando o server já estiver rodando)
cd client
npm install
npm run start


Acesse: **http://localhost:5173**
Preencha: servidor `localhost`, porta `12345`, seu nome → **Conectar**
Para múltiplos clientes: abra novas abas no mesmo endereço com nomes diferentes.
