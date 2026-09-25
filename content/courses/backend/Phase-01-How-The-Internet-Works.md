# Phase 01 — How The Internet Works

## Table of Contents

- [What is the Internet?](#what-is-the-internet)
- [Client-Server Model](#client-server-model)
- [IP Addresses & Ports](#ip-addresses--ports)
- [DNS — Domain Name System](#dns--domain-name-system)
- [TCP/IP Protocol Stack](#tcpip-protocol-stack)
- [HTTP & HTTPS](#http--https)
- [What Happens When You Type a URL](#what-happens-when-you-type-a-url)
- [Where Backend Fits In](#where-backend-fits-in)
- [Key Takeaways](#key-takeaways)

---

## What is the Internet?

The internet is a **global network of computers** connected to each other. These computers communicate using a set of agreed-upon rules called **protocols**.

Think of it like a postal system:

- **Your computer** = your house
- **Server** = the store you're ordering from
- **Internet** = the road system connecting them
- **Protocol (HTTP)** = the rules about how to write the address, package the letter, etc.

### The Internet vs The Web

| Term | What It Is |
|------|-----------|
| **Internet** | The physical network infrastructure (cables, routers, servers) |
| **World Wide Web (WWW)** | A service that runs ON the internet (websites, HTTP) |
| **Email** | Another service that runs on the internet (SMTP protocol) |
| **FTP** | File transfer service on the internet |

The Web is just ONE service that uses the internet. The internet existed before websites — it was used for email and file transfers first.

---

## Client-Server Model

This is the **most fundamental concept** in backend development.

```
┌──────────┐         Request          ┌──────────┐
│          │  ───────────────────────► │          │
│  CLIENT  │                          │  SERVER  │
│ (Browser)│  ◄─────────────────────  │ (Node.js)│
│          │         Response         │          │
└──────────┘                          └──────────┘
```

### Client

The **client** is any program that **initiates** a request. Examples:

- A web browser (Chrome, Firefox)
- A mobile app
- Another server (server-to-server communication)
- A CLI tool like `curl` or Postman

### Server

The **server** is a program that **listens for requests** and **sends back responses**. Examples:

- A Node.js application running Express
- A Python application running Django
- An Apache or Nginx web server

### The Golden Rule

> **The client ALWAYS initiates the communication. The server ALWAYS waits and responds.**

The server never randomly sends data to the client (unless using WebSockets, which we'll cover later).

### Real-World Analogy

Think of a restaurant:

| Restaurant | Web |
|-----------|-----|
| You (the customer) | Client (Browser) |
| The waiter | HTTP Protocol |
| The kitchen | Server (Node.js/Express) |
| Your order | HTTP Request |
| Your food | HTTP Response |
| Menu | API Documentation |

You don't walk into the kitchen. You tell the waiter what you want (request), and the kitchen prepares it and sends it back through the waiter (response).

---

## IP Addresses & Ports

### IP Address

Every device connected to the internet has a unique address called an **IP Address** (Internet Protocol Address).

```
IPv4: 192.168.1.1       (4 groups of numbers, 0-255 each)
IPv6: 2001:0db8:85a3::8a2e:0370:7334  (longer, more addresses)
```

**Special IP addresses:**

| IP | Meaning |
|----|---------|
| `127.0.0.1` | **localhost** — your own computer |
| `0.0.0.0` | All network interfaces on your machine |
| `192.168.x.x` | Private/local network addresses |

### Port

A **port** is like an apartment number in a building. The IP address gets you to the building (computer), and the port tells you which door (service) to knock on.

```
IP Address:Port
192.168.1.1:3000
```

**Common ports:**

| Port | Service |
|------|---------|
| `80` | HTTP (web traffic) |
| `443` | HTTPS (secure web traffic) |
| `3000` | Common Node.js development port |
| `5432` | PostgreSQL database |
| `27017` | MongoDB database |
| `6379` | Redis |

When you run `app.listen(3000)` in Express, you're telling your server: "Listen on port 3000 of this computer."

```javascript
// Your server listens on port 3000
// Accessible at http://localhost:3000
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
```

---

## DNS — Domain Name System

Humans are terrible at remembering numbers like `142.250.190.14`. That's why we have **DNS** — it's like the internet's phone book.

### How DNS Works

```
You type: google.com
    │
    ▼
Browser asks DNS: "What's the IP for google.com?"
    │
    ▼
DNS responds: "142.250.190.14"
    │
    ▼
Browser connects to 142.250.190.14
```

### DNS Resolution Step by Step

1. **Browser Cache** — Did I recently look this up?
2. **OS Cache** — Does the operating system know?
3. **Router Cache** — Does the router know?
4. **ISP DNS Server** — Ask the internet provider
5. **Root DNS Server** → **TLD Server (.com)** → **Authoritative Server** → IP found!

### DNS Record Types (Important for Backend Devs)

| Record | Purpose | Example |
|--------|---------|---------|
| `A` | Maps domain to IPv4 | `example.com → 93.184.216.34` |
| `AAAA` | Maps domain to IPv6 | `example.com → 2606:2800:220:1:...` |
| `CNAME` | Alias for another domain | `www.example.com → example.com` |
| `MX` | Mail server for the domain | `example.com → mail.example.com` |
| `TXT` | Text info (verification, SPF) | Used for domain verification |

---

## TCP/IP Protocol Stack

Data doesn't just magically fly between computers. It goes through **layers**, each adding its own information.

### The 4 Layers

```
┌─────────────────────────────┐
│  4. APPLICATION LAYER       │  ← HTTP, HTTPS, FTP, SMTP
│     (Your Express app)      │
├─────────────────────────────┤
│  3. TRANSPORT LAYER         │  ← TCP, UDP
│     (Reliable delivery)     │
├─────────────────────────────┤
│  2. INTERNET LAYER          │  ← IP (addressing & routing)
│     (Find the right computer│
├─────────────────────────────┤
│  1. NETWORK ACCESS LAYER    │  ← Ethernet, Wi-Fi
│     (Physical transmission) │
└─────────────────────────────┘
```

### TCP vs UDP

| Feature | TCP | UDP |
|---------|-----|-----|
| **Reliability** | Guaranteed delivery | Best effort (may lose packets) |
| **Order** | Maintains order | No ordering guarantee |
| **Speed** | Slower (handshake + checks) | Faster (no handshake) |
| **Use case** | Web, email, file transfer | Video streaming, gaming, DNS |

**HTTP uses TCP** — when you send a request, TCP guarantees the server gets it and the response comes back intact.

### The TCP Three-Way Handshake

Before any data is sent, TCP establishes a connection:

```
Client                    Server
  │                          │
  │──── SYN ────────────────►│   1. "Hey, I want to connect"
  │                          │
  │◄──── SYN-ACK ───────────│   2. "Sure, I acknowledge"
  │                          │
  │──── ACK ────────────────►│   3. "Great, let's go!"
  │                          │
  │◄════ DATA TRANSFER ═════►│   Connection established!
```

---

## HTTP & HTTPS

### HTTP (HyperText Transfer Protocol)

HTTP is the **language** that clients and servers use to communicate on the web. We'll dive much deeper in Phase 04, but here's the overview.

An HTTP message has two parts:

**Request (Client → Server):**
```
GET /api/users HTTP/1.1          ← Request line (method, path, version)
Host: example.com                ← Headers
Content-Type: application/json
                                 ← Empty line
                                 ← Body (optional, for POST/PUT)
```

**Response (Server → Client):**
```
HTTP/1.1 200 OK                  ← Status line (version, status code, message)
Content-Type: application/json   ← Headers
Content-Length: 45
                                 ← Empty line
{"users": [{"name": "Avinash"}]} ← Body
```

### HTTPS

HTTPS = HTTP + **TLS/SSL encryption**

```
HTTP:  Data sent as plain text     → Anyone can read it
HTTPS: Data encrypted with TLS    → Only client and server can read it
```

HTTPS uses **certificates** to verify the server's identity and establish an encrypted connection. As a backend developer, you'll need to understand:

- SSL/TLS certificates
- How to configure HTTPS in production
- Why HTTPS is mandatory for sensitive data

---

## What Happens When You Type a URL

Let's trace the complete journey when you type `https://example.com/api/users` in your browser:

```
Step 1: URL Parsing
   Browser breaks down: protocol (https), domain (example.com), path (/api/users)

Step 2: DNS Lookup
   Browser finds the IP address for example.com → 93.184.216.34

Step 3: TCP Connection
   Three-way handshake with the server at 93.184.216.34:443

Step 4: TLS Handshake (because HTTPS)
   Encryption is established between client and server

Step 5: HTTP Request Sent
   GET /api/users HTTP/1.1
   Host: example.com

Step 6: Server Processes Request
   Express receives the request → runs middleware → hits route handler
   → queries database → builds response

Step 7: HTTP Response Sent
   HTTP/1.1 200 OK
   Content-Type: application/json
   {"users": [...]}

Step 8: Browser Renders Response
   If HTML → renders page. If JSON → displays data.

Step 9: TCP Connection Closed (or kept alive for more requests)
```

---

## Where Backend Fits In

As a backend developer, you control **Steps 6 and 7** — processing the request and building the response. But understanding the entire flow helps you:

- Debug network issues
- Configure servers correctly
- Understand performance bottlenecks
- Set up HTTPS and security
- Design efficient APIs

### What a Backend Developer Does

```
┌────────────────────────────────────────────────────┐
│                  BACKEND DEVELOPER                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. Receive HTTP requests                          │
│  2. Validate & parse the request data              │
│  3. Run business logic                             │
│  4. Interact with databases                        │
│  5. Interact with external APIs                    │
│  6. Handle authentication & authorization          │
│  7. Build and send HTTP responses                  │
│  8. Handle errors gracefully                       │
│  9. Log events for monitoring                      │
│ 10. Ensure security & performance                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **The internet is a network of computers** communicating via protocols
2. **Client-Server model**: Client requests, server responds — always
3. **IP addresses** identify computers; **ports** identify services on that computer
4. **DNS** translates human-readable domains to IP addresses
5. **TCP** guarantees reliable, ordered data delivery (used by HTTP)
6. **HTTP** is the protocol for web communication — it's text-based and stateless
7. **HTTPS** adds encryption via TLS — always use it in production
8. **Backend = the server-side code** that processes requests and sends responses

---

## Practice Exercise

1. Open your terminal and run:
   ```bash
   # Look up DNS for a domain
   nslookup google.com
   
   # Trace the route to a server
   tracert google.com    # Windows
   traceroute google.com # Mac/Linux
   
   # Make a raw HTTP request
   curl -v https://jsonplaceholder.typicode.com/posts/1
   ```

2. Look at the `curl -v` output and identify:
   - The TCP connection
   - The TLS handshake
   - The HTTP request headers
   - The HTTP response status code and headers
   - The response body

---

**Next:** [Phase 02 — Node.js Fundamentals →](Phase-02-NodeJS-Fundamentals.md)
