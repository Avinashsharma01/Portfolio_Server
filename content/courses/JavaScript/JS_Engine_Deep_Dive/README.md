# 🚀 JavaScript Engine Deep Dive

> **A Complete Guide to Understanding How JavaScript Really Works Under the Hood**

This guide takes you from fundamentals to advanced internals of the JavaScript engine. Each chapter builds on the previous one, creating a complete mental model of JavaScript execution.

---

## 📚 Table of Contents

| Chapter | Topic | What You'll Learn |
|---------|-------|-------------------|
| [01](./01-Parsing-Compilation-Execution.md) | Parsing, Compilation & Execution | How your code becomes machine instructions |
| [02](./02-Execution-Context-Call-Stack.md) | Execution Context & Call Stack | How JavaScript tracks and executes your code |
| [03](./03-Memory-Allocation-Garbage-Collection.md) | Memory & Garbage Collection | How memory is allocated and cleaned up |
| [04](./04-Undefined-vs-Null-Internals.md) | undefined vs null Internals | The truth about these special values |
| [05](./05-Synchronous-vs-Asynchronous.md) | Synchronous vs Asynchronous | Why JavaScript is "single-threaded but async" |
| [06](./06-Event-Loop-Internals.md) | Event Loop Internals | The heart of asynchronous JavaScript |
| [07](./07-Macro-Tasks-vs-Micro-Tasks.md) | Macro Tasks vs Micro Tasks | Task prioritization and execution order |
| [08](./08-Promises-Lifecycle.md) | Promises Lifecycle | How promises work internally |
| [09](./09-Web-APIs-Browser-Interaction.md) | Web APIs & Browser | How browser and JS engine communicate |
| [10](./10-Async-Await-Deep-Dive.md) | async/await Deep Dive | Syntactic sugar unwrapped |
| [11](./11-Everything-Connected.md) | Everything Connected | The complete runtime mental model |

---

## 🎯 Prerequisites

Before diving in, you should have:
- Basic JavaScript knowledge (variables, functions, objects)
- Understanding of basic programming concepts
- Curiosity about how things work underneath

---

## 🧠 The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JAVASCRIPT RUNTIME ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      JAVASCRIPT ENGINE (V8, SpiderMonkey, etc.)      │   │
│  │                                                                       │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │   │
│  │   │   PARSER    │───▶│  COMPILER   │───▶│  EXECUTION ENGINE       │ │   │
│  │   │ (Tokenizer  │    │ (Interpreter │    │  (Executes bytecode/    │ │   │
│  │   │  + AST)     │    │  + JIT)      │    │   machine code)         │ │   │
│  │   └─────────────┘    └─────────────┘    └─────────────────────────┘ │   │
│  │                                                                       │   │
│  │   ┌────────────────────────┐    ┌────────────────────────────────┐   │   │
│  │   │       CALL STACK       │    │      MEMORY HEAP               │   │   │
│  │   │  (Execution Contexts)  │    │  (Objects, Functions, Data)    │   │   │
│  │   └────────────────────────┘    └────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      BROWSER/NODE.js ENVIRONMENT                     │   │
│  │                                                                       │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │   │   WEB APIs   │  │ CALLBACK     │  │      EVENT LOOP          │  │   │
│  │   │  (setTimeout │  │ QUEUE        │  │  ┌─────────────────────┐ │  │   │
│  │   │   fetch,     │  │ (Task Queue) │  │  │ Checks Call Stack   │ │  │   │
│  │   │   DOM, etc.) │  │              │  │  │ + Callback Queues   │ │  │   │
│  │   └──────────────┘  └──────────────┘  │  └─────────────────────┘ │  │   │
│  │                                        └──────────────────────────┘  │   │
│  │   ┌──────────────────────────────────────────────────────────────┐   │   │
│  │   │              MICROTASK QUEUE (Promises, queueMicrotask)       │   │   │
│  │   └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How to Use This Guide

### For Deep Learning:
1. **Read sequentially** - Each chapter builds on previous concepts
2. **Run the examples** - Type them out, don't just read
3. **Draw the diagrams** - Visualizing helps solidify understanding
4. **Teach someone else** - The best way to learn is to explain

### For Reference:
- Jump directly to specific chapters using the table of contents
- Each chapter is self-contained with its own examples

---

## 📖 Key Mental Models You'll Build

After completing this guide, you'll understand:

1. **The Parsing Pipeline**: How `let x = 5` becomes executable instructions
2. **The Execution Model**: Why `this` behaves the way it does
3. **Memory Management**: Why some code causes memory leaks
4. **The Async Model**: Why `setTimeout(fn, 0)` doesn't run immediately
5. **The Event Loop**: How JavaScript handles thousands of requests
6. **Task Prioritization**: Why promises resolve before setTimeout

---

## 🎓 Learning Outcomes

By the end of this guide, you'll be able to:

- [ ] Explain what happens when JavaScript code runs
- [ ] Debug complex async code with confidence
- [ ] Write more performant JavaScript
- [ ] Understand memory leaks and how to prevent them
- [ ] Predict the output of tricky interview questions
- [ ] Build a complete mental model of the JavaScript runtime

---

## 📚 Additional Resources

- [V8 Blog](https://v8.dev/blog) - Official V8 engine blog
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript Specification (ECMAScript)](https://tc39.es/ecma262/)
- [Node.js Event Loop Documentation](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

**Let's begin the journey! Start with [Chapter 01: Parsing, Compilation & Execution](./01-Parsing-Compilation-Execution.md)**
