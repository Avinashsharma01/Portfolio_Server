# Phase 09 — Message Queues & Asynchronous Processing

## Table of Contents

- [Why Asynchronous Processing?](#why-asynchronous-processing)
- [What Is a Message Queue?](#what-is-a-message-queue)
- [Message Queue Components](#message-queue-components)
- [Messaging Patterns](#messaging-patterns)
- [Pub/Sub — Publish-Subscribe Pattern](#pubsub--publish-subscribe-pattern)
- [Apache Kafka — Distributed Event Streaming](#apache-kafka--distributed-event-streaming)
- [RabbitMQ — Traditional Message Broker](#rabbitmq--traditional-message-broker)
- [Kafka vs RabbitMQ](#kafka-vs-rabbitmq)
- [Event-Driven Architecture](#event-driven-architecture)
- [Handling Failures in Message Systems](#handling-failures-in-message-systems)
- [Dead Letter Queues](#dead-letter-queues)
- [Exactly-Once, At-Least-Once, At-Most-Once](#exactly-once-at-least-once-at-most-once)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## Why Asynchronous Processing?

Not every operation needs to happen **right now**. Some tasks can happen **in the background** while the user gets an immediate response.

```
Synchronous (blocking):
User clicks "Place Order"
  → Validate order          (10ms)
  → Charge payment          (500ms)
  → Update inventory        (50ms)
  → Send confirmation email (2000ms)
  → Generate invoice PDF    (1000ms)
  → Update analytics        (100ms)
  → Return response         
  Total: ~3,660ms  😰  (User waits 3.6 seconds!)

Asynchronous (non-blocking):
User clicks "Place Order"
  → Validate order          (10ms)
  → Charge payment          (500ms)
  → Update inventory        (50ms)
  → Queue: send email       (1ms)  ← Background
  → Queue: generate invoice (1ms)  ← Background
  → Queue: update analytics (1ms)  ← Background
  → Return response
  Total: ~563ms  🚀  (User waits 0.5 seconds!)

Background workers process the queued tasks later.
```

### What Should Be Async?

```
Keep Synchronous:                    Make Asynchronous:
├── User authentication              ├── Sending emails/SMS
├── Payment processing               ├── Generating reports/PDFs
├── Core data validation             ├── Processing images/videos
├── Reading user data                ├── Updating search indexes
└── Anything user waits for          ├── Analytics & metrics
                                     ├── Sending notifications
                                     ├── Syncing data to other services
                                     └── Anything user doesn't wait for
```

---

## What Is a Message Queue?

A message queue is a **buffer** that sits between services. Producers add messages to the queue, and consumers process them.

```
┌──────────┐     ┌───────────────────────────┐     ┌──────────┐
│ Producer │────►│     Message Queue         │────►│ Consumer │
│ (Sender) │     │                           │     │ (Worker) │
│          │     │  [Msg1] [Msg2] [Msg3]     │     │          │
└──────────┘     └───────────────────────────┘     └──────────┘

Producer adds messages → Queue stores them → Consumer processes them

Key property: Producer and consumer are DECOUPLED
├── Producer doesn't need to know who consumes
├── Consumer doesn't need to know who produces
├── They don't even need to be running at the same time!
```

### Real-World Analogy

Think of a **restaurant kitchen**:

| Restaurant | Message Queue System |
|-----------|---------------------|
| Waiter takes order, puts slip on rack | Producer adds message to queue |
| Order slips hanging on rack | Messages in the queue |
| Chef picks up next order when ready | Consumer processes next message |
| Waiter doesn't cook; chef doesn't serve | Decoupled! |
| Orders pile up during rush hour | Queue handles traffic spikes (backpressure) |

---

## Message Queue Components

```
┌───────────────────────────────────────────────────────┐
│                   MESSAGE QUEUE SYSTEM                 │
│                                                       │
│  ┌──────────┐  ┌──────────────────────────┐          │
│  │ Producer │  │         QUEUE            │          │
│  │   (API   │──►  ┌─────┐ ┌─────┐ ┌─────┐│  ┌──────┐│
│  │  Server) │  │  │Msg 1│ │Msg 2│ │Msg 3││──►Worker││
│  └──────────┘  │  └─────┘ └─────┘ └─────┘│  │  1   ││
│                └──────────────────────────┘  └──────┘│
│  ┌──────────┐                                ┌──────┐│
│  │ Producer │  ┌──────────────────────────┐  │Worker││
│  │  (Cron   │──►  ┌─────┐ ┌─────┐       │──►│  2   ││
│  │   Job)   │  │  │Msg 4│ │Msg 5│       │  └──────┘│
│  └──────────┘  └──────────────────────────┘          │
│                                                       │
│  Components:                                          │
│  ├── Producer: Creates and sends messages             │
│  ├── Queue/Topic: Stores messages in order            │
│  ├── Consumer/Worker: Processes messages              │
│  ├── Message: The payload (data + metadata)           │
│  └── Broker: The software managing queues             │
└───────────────────────────────────────────────────────┘
```

### Message Structure

```json
{
    "id": "msg-abc-123",
    "timestamp": "2024-09-22T14:30:00Z",
    "type": "order.created",
    "data": {
        "orderId": "ORD-456",
        "userId": "USR-789",
        "items": [
            { "productId": "PRD-1", "quantity": 2 }
        ],
        "total": 2500
    },
    "metadata": {
        "source": "order-service",
        "retryCount": 0,
        "correlationId": "req-xyz-789"
    }
}
```

---

## Messaging Patterns

### 1. Point-to-Point (Queue)

One message is processed by **exactly one consumer**.

```
Producer ──► Queue ──► Consumer 1  (gets Msg 1)
                  ──► Consumer 2  (gets Msg 2)
                  ──► Consumer 3  (gets Msg 3)

Each message goes to ONE consumer only.
Consumers compete for messages (competing consumers pattern).

Use case: Task processing (email sending, image resizing)
```

### 2. Publish-Subscribe (Fan-Out)

One message is delivered to **all subscribers**.

```
Producer ──► Topic ──► Subscriber 1  (gets ALL messages)
                  ──► Subscriber 2  (gets ALL messages)
                  ──► Subscriber 3  (gets ALL messages)

Each message goes to ALL subscribers.

Use case: Event notifications, real-time updates
```

### 3. Request-Reply

Producer sends a message and **waits for a response** via a reply queue.

```
Producer ──► Request Queue ──► Consumer
Producer ◄── Reply Queue ◄──── Consumer

Use case: Synchronous-like communication via queues (RPC over messaging)
```

---

## Pub/Sub — Publish-Subscribe Pattern

Pub/Sub is one of the most important patterns in system design. It **decouples** services that produce events from services that react to them.

```
                    ┌──────────────────────────────┐
                    │     EVENT BUS / TOPIC         │
                    │     "order.created"           │
                    └────────┬──────────┬───────────┘
                             │          │
                    ┌────────┘          └────────┐
                    │          │                  │
             ┌──────▼──────┐  ▼           ┌──────▼──────┐
             │ Email       │ ┌──────────┐ │ Analytics  │
             │ Service     │ │Inventory │ │ Service    │
             │             │ │Service   │ │            │
             │ Sends order │ │Decrements│ │Records the │
             │ confirmation│ │stock     │ │purchase    │
             └─────────────┘ └──────────┘ └────────────┘

Order Service publishes: "Order #456 created"
Three subscribers independently react to the same event.
```

### Benefits of Pub/Sub

```
1. Decoupling:
   Order Service doesn't know about Email, Inventory, or Analytics services.
   New subscribers can be added without changing the publisher.

2. Scalability:
   Each subscriber can scale independently.
   
3. Resilience:
   If Email Service is down, Inventory Service still works.
   Email Service processes the message when it comes back up.

4. Extensibility:
   Want to add a "Fraud Detection" subscriber? Just subscribe — no changes to existing code.
```

---

## Apache Kafka — Distributed Event Streaming

Kafka is a **distributed, high-throughput, persistent** message streaming platform. It's the industry standard for event-driven architectures.

### Kafka Architecture

```
┌──────────────────── KAFKA CLUSTER ────────────────────┐
│                                                        │
│  Topic: "orders"                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Partition 0  │ │ Partition 1  │ │ Partition 2  │  │
│  │ ┌──┬──┬──┬─┐│ │ ┌──┬──┬──┐  │ │ ┌──┬──┐      │  │
│  │ │M1│M2│M3│M4││ │ │M1│M2│M3│  │ │ │M1│M2│      │  │
│  │ └──┴──┴──┴─┘│ │ └──┴──┴──┘  │ │ └──┴──┘      │  │
│  │ Leader:Brk 1│ │ Leader:Brk 2│ │ Leader:Brk 3 │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                        │
│  Brokers:  [Broker 1]  [Broker 2]  [Broker 3]        │
│  ZooKeeper / KRaft: Manages cluster metadata           │
└────────────────────────────────────────────────────────┘

Key Concepts:
├── Topic:     Category of messages (like "orders", "users")
├── Partition: Topic split into ordered, immutable logs
├── Offset:    Position of a message within a partition
├── Broker:    A Kafka server that stores partitions
├── Producer:  Writes messages to topics
├── Consumer:  Reads messages from topics
└── Consumer Group: Set of consumers that share work
```

### Kafka Consumer Groups

```
Topic "orders" has 3 partitions:

Consumer Group A (3 consumers):
  Consumer A1 ← Partition 0
  Consumer A2 ← Partition 1
  Consumer A3 ← Partition 2
  Each consumer handles 1 partition (parallel processing)

Consumer Group B (2 consumers):
  Consumer B1 ← Partition 0, Partition 1
  Consumer B2 ← Partition 2
  Partitions are distributed among available consumers

Consumer Group C (1 consumer):
  Consumer C1 ← Partition 0, Partition 1, Partition 2
  One consumer handles all partitions (sequential)

Key rule: Within a consumer group, each partition is consumed
by exactly ONE consumer. But different groups can all read
the same partitions independently.
```

### Why Kafka Is Special

```
1. Persistent Storage:
   Messages are stored on disk (not just in memory)
   Can replay messages from any point in time!
   Retention: 7 days by default (configurable to forever)

2. High Throughput:
   Millions of messages per second
   LinkedIn processes 7 trillion messages/day with Kafka

3. Ordering Guarantee:
   Messages within a partition are strictly ordered
   
4. Replayability:
   Consumer can reset its offset and re-process old messages
   Great for: fixing bugs, rebuilding search indexes, testing

5. Scalability:
   Add more partitions = more parallelism
   Add more brokers = more capacity
```

---

## RabbitMQ — Traditional Message Broker

RabbitMQ is a **traditional message broker** that focuses on flexible routing and reliable delivery.

```
RabbitMQ Architecture:

┌──────────┐                              ┌──────────┐
│ Producer │─── Message ──► Exchange ──► Queue ──► │ Consumer │
└──────────┘                    │         └──────────┘
                                │
                         Routing Rules
                      (binding key matches?)
                                │
                         ┌──────┴──────┐
                         ▼             ▼
                      Queue A       Queue B
                         │             │
                    Consumer 1    Consumer 2

Exchange Types:
├── Direct:  Route by exact match on routing key
├── Fanout:  Route to ALL bound queues (pub/sub)
├── Topic:   Route by pattern match (orders.*, *.created)
└── Headers: Route by message headers
```

### RabbitMQ Features

```
1. Acknowledgments:
   Consumer processes message → sends ACK → message removed from queue
   Consumer fails → no ACK → message requeued for another consumer

2. Flexible Routing:
   Complex routing rules via exchanges and binding keys

3. Priority Queues:
   High-priority messages processed first

4. Message TTL:
   Messages expire after a configurable time

5. Plugins:
   Management UI, federation, shovel, delayed messages
```

---

## Kafka vs RabbitMQ

| Feature | Kafka | RabbitMQ |
|---------|-------|----------|
| **Model** | Distributed log (append-only) | Message broker (queue) |
| **Throughput** | Millions/sec | Thousands/sec |
| **Message retention** | Persistent (days/weeks/forever) | Deleted after consumption |
| **Ordering** | Per partition | Per queue |
| **Replay** | Yes (consumer can re-read) | No (message gone after ACK) |
| **Routing** | Topic + partition | Flexible (exchanges, routing keys) |
| **Consumer model** | Pull (consumer reads at its pace) | Push (broker delivers) |
| **Latency** | Higher (batching) | Lower (immediate delivery) |
| **Best for** | Event streaming, log aggregation, big data | Task queues, RPC, request routing |

### When to Use What

```
Use Kafka when:
├── High throughput (millions of messages/sec)
├── Event sourcing / event streaming
├── Log aggregation
├── Stream processing (real-time analytics)
├── Need to replay messages
└── Multiple consumers need the same messages

Use RabbitMQ when:
├── Task/job queues (email sending, image processing)
├── Complex routing requirements
├── Priority queues needed
├── Request-reply pattern
├── Lower latency required
└── Simpler setup needed
```

---

## Event-Driven Architecture

Event-driven architecture (EDA) is where services communicate by **producing and consuming events** rather than direct API calls.

```
Traditional (Request-Driven):
Order Service ──POST /email──► Email Service
Order Service ──POST /inventory──► Inventory Service
Order Service ──POST /analytics──► Analytics Service
(Order Service knows about and depends on ALL downstream services)

Event-Driven:
Order Service ──publishes: "order.created"──► Event Bus
                                               ├──► Email Service (subscribed)
                                               ├──► Inventory Service (subscribed)
                                               └──► Analytics Service (subscribed)
(Order Service doesn't know or care about subscribers)
```

### Event Sourcing

Instead of storing **current state**, store **all events** that led to the current state.

```
Traditional (State-based):
User account balance: $500
(How did we get to $500? We don't know!)

Event Sourced:
Event 1: AccountCreated { balance: 0 }
Event 2: Deposited { amount: 1000 }
Event 3: Withdrew { amount: 300 }
Event 4: Deposited { amount: 200 }
Event 5: Withdrew { amount: 400 }
Current balance: 0 + 1000 - 300 + 200 - 400 = $500

Benefits:
├── Complete audit trail (every change recorded)
├── Can reconstruct state at any point in time
├── Can replay events to rebuild views/indexes
└── Natural fit for Kafka (append-only log)
```

---

## Handling Failures in Message Systems

### Retry Strategies

```
1. Immediate Retry:
   Failed → Retry immediately
   Risk: If the failure is persistent, you waste resources

2. Fixed Delay Retry:
   Failed → Wait 5s → Retry → Wait 5s → Retry
   Better, but may not give enough time for transient failures

3. Exponential Backoff (Recommended):
   Failed → Wait 1s → Retry
   Failed → Wait 2s → Retry
   Failed → Wait 4s → Retry
   Failed → Wait 8s → Retry
   Failed → Wait 16s → Retry (max 5 retries)
   
   With jitter (random delay to prevent thundering herd):
   Wait = min(cap, base * 2^attempt) + random(0, 1000ms)
```

### Circuit Breaker Pattern

```
States:
┌────────────┐    too many    ┌──────────┐    timeout    ┌───────────────┐
│   CLOSED   │───failures───►│   OPEN   │──────────────►│  HALF-OPEN    │
│ (normal)   │                │ (reject  │               │ (test with    │
│            │◄───success─────│  all)    │◄──failures────│  few requests)│
└────────────┘                └──────────┘               └───────────────┘

CLOSED:  Normal operation, requests pass through
OPEN:    All requests immediately rejected (give downstream time to recover)
HALF-OPEN: Allow a few test requests through
           If they succeed → back to CLOSED
           If they fail → back to OPEN
```

---

## Dead Letter Queues

Messages that **fail repeatedly** are moved to a Dead Letter Queue (DLQ) for investigation.

```
Normal flow:
Queue ──► Consumer ──► Process ──► ACK ──► Message removed ✓

Failure flow:
Queue ──► Consumer ──► Process ──► FAIL ──► Retry (3 times)
                                         ──► Still failing
                                         ──► Move to DLQ

┌─────────────────┐                    ┌──────────────────┐
│   Main Queue    │ ── after 3 fails ──►│ Dead Letter Queue│
│                 │                    │ (DLQ)             │
│ [Msg1] [Msg2]   │                    │ [FailedMsg1]     │
└─────────────────┘                    └──────────────────┘
                                              │
                                       Manual investigation
                                       Fix the issue
                                       Re-process messages
```

---

## Exactly-Once, At-Least-Once, At-Most-Once

Message delivery guarantees are critical for system correctness.

```
At-Most-Once:
  Send message → Don't wait for ACK → Move on
  Message may be lost (fire-and-forget)
  Use case: Logging, metrics (losing some is OK)

At-Least-Once:
  Send message → Wait for ACK → Retry if no ACK
  Message may be delivered MULTIPLE times (duplicates!)
  Use case: Most systems (handle duplicates with idempotency)

Exactly-Once:
  Each message processed exactly one time
  Very hard to achieve in distributed systems!
  Kafka supports this within its ecosystem (idempotent producer + transactions)
  Use case: Financial transactions, order processing
```

```
Delivery Guarantees:

At-Most-Once:    [M1] [M2] [  ] [M4] [M5]     ← M3 lost
At-Least-Once:   [M1] [M2] [M2] [M3] [M4]     ← M2 duplicated
Exactly-Once:    [M1] [M2] [M3] [M4] [M5]     ← Perfect (but hard!)
```

> **Industry standard:** Use **at-least-once delivery** with **idempotent consumers**. This is the most practical approach.

---

## Key Takeaways

1. **Asynchronous processing** reduces response times by offloading non-critical work to background queues
2. **Message queues** decouple producers and consumers — they don't need to know about each other
3. Two main patterns: **Point-to-Point** (one consumer) and **Pub/Sub** (all subscribers)
4. **Kafka** is for high-throughput event streaming with persistence and replay capability
5. **RabbitMQ** is for flexible task queues with complex routing and lower latency
6. **Event-Driven Architecture** decouples services via events instead of direct API calls
7. Handle failures with **exponential backoff**, **circuit breakers**, and **dead letter queues**
8. Use **at-least-once delivery with idempotent consumers** — the most practical guarantee
9. **Event Sourcing** stores events instead of state — provides audit trail and replayability

---

## Practice Exercises

1. **Async Design:**
   - You're building an e-commerce checkout. The flow is:
     Validate → Charge payment → Reserve inventory → Send receipt → Notify warehouse → Update analytics
   - Which steps should be synchronous? Which should be async?
   - Draw the architecture with queues.

2. **Kafka vs RabbitMQ:**
   - You need to build: (a) a real-time analytics pipeline processing 1M events/sec, (b) a task queue for sending emails.
   - Which technology would you use for each? Why?

3. **Dead Letter Queue:**
   - Design a DLQ strategy for a payment processing system.
   - How many retries before sending to DLQ?
   - How would you alert the operations team about DLQ messages?
   - How would you re-process DLQ messages after fixing the issue?

4. **Event-Driven Refactor:**
   - You have a monolith where the order creation function directly calls: emailService.send(), inventoryService.decrement(), analyticsService.record().
   - Refactor this to an event-driven architecture.
   - What events would you publish? What would subscribe to each?

---

**Next:** [Phase 10 — CAP Theorem & Consistency Models →](Phase-10-CAP-Theorem-Consistency.md)
