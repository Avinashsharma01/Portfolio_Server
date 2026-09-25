# Phase 16 — WebSockets & Real-Time Communication

## Table of Contents

- [Real-Time Communication Overview](#real-time-communication-overview)
- [WebSocket Protocol](#websocket-protocol)
- [Socket.io — Getting Started](#socketio--getting-started)
- [Events & Communication Patterns](#events--communication-patterns)
- [Rooms & Namespaces](#rooms--namespaces)
- [Authentication with Socket.io](#authentication-with-socketio)
- [Real-Time Chat Application](#real-time-chat-application)
- [Real-Time Notifications](#real-time-notifications)
- [Server-Sent Events (SSE)](#server-sent-events-sse)
- [Scaling WebSockets](#scaling-websockets)
- [Key Takeaways](#key-takeaways)

---

## Real-Time Communication Overview

```
Traditional HTTP (Request-Response):
Client ──request──→ Server
Client ←──response── Server
(Connection closed. Client must ask again for updates.)

Polling:
Client ──"Any updates?"──→ Server → "No"
Client ──"Any updates?"──→ Server → "No"
Client ──"Any updates?"──→ Server → "Yes! Here's data"
(Wasteful — many empty requests)

Long Polling:
Client ──"Any updates?"──→ Server  (holds connection open)
                           ......  (waits until data is available)
Client ←──"Here's data"── Server  (responds, connection closes)
Client ──"Any updates?"──→ Server  (immediately reconnects)

WebSocket (Full-Duplex):
Client ←──────────→ Server
(Persistent connection. Both can send at any time.)
```

### When to Use What

| Technology | Use Case |
|-----------|----------|
| **HTTP** | Standard CRUD operations, forms, API calls |
| **SSE** | Server pushes updates (notifications, live feeds) |
| **WebSocket** | Bidirectional real-time (chat, gaming, collaboration) |
| **Long Polling** | Fallback when WebSocket isn't available |

---

## WebSocket Protocol

```
HTTP Upgrade Handshake:
1. Client sends HTTP request with "Upgrade: websocket" header
2. Server responds with 101 Switching Protocols
3. Connection upgraded to WebSocket
4. Both sides can now send/receive messages freely

GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket          ← Request upgrade
Connection: Upgrade
Sec-WebSocket-Key: dGhl...  ← Security key

HTTP/1.1 101 Switching Protocols
Upgrade: websocket           ← Upgrade accepted
Connection: Upgrade
Sec-WebSocket-Accept: s3p... ← Security response
```

### Native WebSocket (Node.js)

```bash
npm install ws
```

```javascript
// server.js
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (data) => {
        const message = data.toString();
        console.log("Received:", message);

        // Echo back
        ws.send(`Server received: ${message}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.send("Welcome to WebSocket server!");
});
```

> **In practice, use Socket.io** instead of raw `ws`. It provides automatic reconnection, room support, fallbacks, and a much better developer experience.

---

## Socket.io — Getting Started

```bash
npm install socket.io           # Server
npm install socket.io-client    # Client (if Node.js client)
```

### Server Setup

```javascript
// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for custom event
    socket.on("chat:message", (data) => {
        console.log("Message received:", data);

        // Broadcast to all OTHER clients
        socket.broadcast.emit("chat:message", data);
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.id} — ${reason}`);
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
```

### Client Setup (Browser)

```html
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.emit("chat:message", { text: "Hello!", user: "Avinash" });

socket.on("chat:message", (data) => {
    console.log("New message:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
</script>
```

---

## Events & Communication Patterns

### Emit Patterns

```javascript
// 1. Client → Server (one way)
// Client:
socket.emit("chat:message", { text: "Hello" });
// Server:
socket.on("chat:message", (data) => { /* handle */ });

// 2. Server → One Client (one way)
socket.emit("notification", { text: "Welcome!" });

// 3. Server → All Clients
io.emit("announcement", { text: "Server will restart in 5 min" });

// 4. Server → All EXCEPT Sender
socket.broadcast.emit("user:joined", { name: "Avinash" });

// 5. Client → Server with Acknowledgement (request-response)
// Client:
socket.emit("chat:message", { text: "Hi" }, (response) => {
    console.log("Server acknowledged:", response);
});
// Server:
socket.on("chat:message", (data, callback) => {
    // Save message to DB...
    callback({ status: "ok", messageId: "abc123" });
});
```

### Emit Diagram

```
io.emit()              → All connected clients
socket.emit()          → Only this client
socket.broadcast.emit() → All clients EXCEPT this one
io.to("room").emit()   → All clients in a specific room
socket.to("room").emit() → All in room EXCEPT sender
```

---

## Rooms & Namespaces

### Rooms

Rooms are server-side groupings of sockets. A socket can join multiple rooms.

```javascript
io.on("connection", (socket) => {

    // Join a room
    socket.on("room:join", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit("user:joined", {
            userId: socket.id,
            room: roomId,
        });
    });

    // Leave a room
    socket.on("room:leave", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("user:left", {
            userId: socket.id,
            room: roomId,
        });
    });

    // Send message to a room
    socket.on("room:message", ({ roomId, message }) => {
        io.to(roomId).emit("room:message", {
            sender: socket.id,
            message,
            room: roomId,
            timestamp: new Date(),
        });
    });
});
```

### Namespaces

Namespaces separate different types of communication on the same server.

```javascript
// Chat namespace
const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
    console.log("Chat user connected:", socket.id);
    socket.on("message", (data) => { /* ... */ });
});

// Dashboard namespace
const dashNamespace = io.of("/dashboard");
dashNamespace.on("connection", (socket) => {
    console.log("Dashboard user connected:", socket.id);
    socket.on("metric:subscribe", (metric) => { /* ... */ });
});

// Client connects to specific namespace
const chatSocket = io("http://localhost:3000/chat");
const dashSocket = io("http://localhost:3000/dashboard");
```

---

## Authentication with Socket.io

### Middleware Authentication

```javascript
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return next(new Error("User not found"));
        }

        // Attach user to socket
        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log(`Authenticated user connected: ${socket.user.name}`);

    // Now socket.user is available in all event handlers
    socket.on("chat:message", (data) => {
        io.emit("chat:message", {
            ...data,
            sender: socket.user.name,
            senderId: socket.user._id,
        });
    });
});
```

### Client with Auth

```javascript
const socket = io("http://localhost:3000", {
    auth: {
        token: localStorage.getItem("accessToken"),
    },
});

socket.on("connect_error", (error) => {
    if (error.message === "Authentication required") {
        // Redirect to login
    }
});
```

---

## Real-Time Chat Application

```javascript
// Complete chat server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
    const user = socket.user; // From auth middleware

    // Add to online users
    onlineUsers.set(user._id.toString(), {
        socketId: socket.id,
        name: user.name,
        avatar: user.avatar,
    });

    // Broadcast online users list
    io.emit("users:online", Array.from(onlineUsers.values()));

    // Join personal room (for private messages)
    socket.join(`user:${user._id}`);

    // Join a chat room
    socket.on("room:join", async (roomId) => {
        socket.join(roomId);

        // Send last 50 messages
        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("sender", "name avatar")
            .lean();

        socket.emit("room:history", messages.reverse());

        socket.to(roomId).emit("room:userJoined", {
            user: user.name,
            timestamp: new Date(),
        });
    });

    // Handle chat message
    socket.on("chat:message", async ({ roomId, text }) => {
        // Save to database
        const message = await Message.create({
            sender: user._id,
            room: roomId,
            text,
        });

        const populated = await message.populate("sender", "name avatar");

        // Emit to all in room
        io.to(roomId).emit("chat:message", {
            _id: message._id,
            sender: populated.sender,
            text: message.text,
            createdAt: message.createdAt,
        });
    });

    // Typing indicator
    socket.on("chat:typing", ({ roomId }) => {
        socket.to(roomId).emit("chat:typing", { user: user.name });
    });

    socket.on("chat:stopTyping", ({ roomId }) => {
        socket.to(roomId).emit("chat:stopTyping", { user: user.name });
    });

    // Private message
    socket.on("private:message", async ({ recipientId, text }) => {
        const message = await Message.create({
            sender: user._id,
            recipient: recipientId,
            text,
        });

        const populated = await message.populate("sender", "name avatar");

        // Send to recipient's personal room
        io.to(`user:${recipientId}`).emit("private:message", {
            _id: message._id,
            sender: populated.sender,
            text: message.text,
            createdAt: message.createdAt,
        });
    });

    // Disconnect
    socket.on("disconnect", () => {
        onlineUsers.delete(user._id.toString());
        io.emit("users:online", Array.from(onlineUsers.values()));
    });
});
```

---

## Real-Time Notifications

```javascript
// services/notificationService.js
const Notification = require("../models/Notification");

class NotificationService {
    constructor(io) {
        this.io = io;
    }

    async send(userId, notification) {
        // Save to database
        const saved = await Notification.create({
            user: userId,
            ...notification,
        });

        // Send in real-time via Socket.io
        this.io.to(`user:${userId}`).emit("notification", {
            _id: saved._id,
            type: saved.type,
            message: saved.message,
            data: saved.data,
            createdAt: saved.createdAt,
        });

        return saved;
    }

    async sendToMany(userIds, notification) {
        for (const userId of userIds) {
            await this.send(userId, notification);
        }
    }
}

module.exports = NotificationService;
```

```javascript
// Usage in controllers
const notificationService = new NotificationService(io);

// When someone likes a post
const likePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    post.likes.push(req.user._id);
    await post.save();

    // Send real-time notification to post author
    await notificationService.send(post.author, {
        type: "like",
        message: `${req.user.name} liked your post`,
        data: { postId: post._id },
    });

    res.json({ success: true });
};
```

---

## Server-Sent Events (SSE)

SSE is simpler than WebSocket — **one-way** (server → client only).

```javascript
// Server
app.get("/api/events", (req, res) => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send event every 5 seconds
    const intervalId = setInterval(() => {
        const data = JSON.stringify({
            time: new Date().toISOString(),
            activeUsers: getActiveUserCount(),
        });
        res.write(`data: ${data}\n\n`);
    }, 5000);

    // Send named event
    res.write(`event: notification\ndata: ${JSON.stringify({ text: "Connected!" })}\n\n`);

    // Clean up on disconnect
    req.on("close", () => {
        clearInterval(intervalId);
        res.end();
    });
});
```

```javascript
// Client (Browser)
const eventSource = new EventSource("/api/events");

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Update:", data);
};

eventSource.addEventListener("notification", (event) => {
    const data = JSON.parse(event.data);
    console.log("Notification:", data);
});

eventSource.onerror = () => {
    console.log("SSE connection lost, reconnecting...");
    // Browser reconnects automatically
};
```

### WebSocket vs SSE

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| Direction | Bidirectional | Server → Client only |
| Protocol | WebSocket (ws://) | HTTP |
| Reconnection | Manual | Automatic |
| Binary data | Yes | No (text only) |
| Browser support | Modern browsers | Modern browsers |
| Use case | Chat, gaming | Notifications, feeds |
| Complexity | Higher | Lower |

---

## Scaling WebSockets

### The Problem

```
Without adapter:
Server 1 has users A, B    ← A sends message
Server 2 has users C, D    ← C and D don't receive it!

Each server only knows about its own sockets.
```

### Redis Adapter

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));

// Now io.emit() works across all server instances!
```

```
With Redis adapter:
Server 1 → Redis PUB/SUB ← Server 2
     ↕                        ↕
Users A, B              Users C, D

A sends message → Server 1 → Redis → Server 2 → C and D receive it ✅
```

---

## Key Takeaways

1. **WebSockets** provide persistent, bidirectional communication
2. **Socket.io** adds reconnection, rooms, namespaces, and fallbacks on top of WebSocket
3. **Rooms** are perfect for chat rooms, game lobbies, and group features
4. **Always authenticate** WebSocket connections using middleware
5. **Save messages to database** — don't rely on sockets for persistence
6. **SSE** is simpler when you only need server → client updates
7. **Use Redis adapter** to scale Socket.io across multiple servers
8. **Track online users** in memory (Map) and broadcast on changes
9. **Typing indicators** improve UX — use debounced events
10. **Emit only to relevant users/rooms** — don't broadcast everything to everyone

---

## Practice Exercises

1. **Basic chat:** Build a chat server with Socket.io (join rooms, send messages, show online users)
2. **Private messaging:** Implement direct messages between two users
3. **Typing indicator:** Show "User is typing..." with debounce
4. **Notifications:** Build a real-time notification system (likes, comments, follows)
5. **SSE dashboard:** Create a live dashboard using Server-Sent Events
6. **Auth middleware:** Add JWT authentication to Socket.io connections

---

**Previous:** [← Phase 15 — Caching & Performance](Phase-15-Caching-Performance.md)

**Next:** [Phase 17 — Task Queues & Background Jobs →](Phase-17-Task-Queues-Background-Jobs.md)
