# TicketHub System Flow

This document provides a visual representation of how data flows through the TicketHub system. These diagrams will help you understand how the different components work together.

## Ticket Creation Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Patient   │ ──────> │  Frontend   │ ──────> │   Backend   │
│             │  submit  │   React     │   API   │   Express   │
└─────────────┘  ticket  └─────────────┘  call   └─────────────┘
                                                       │
                                                       │ store
                                                       ▼
                                              ┌─────────────┐
                                              │             │
                                              │  Database   │
                                              │  MongoDB    │
                                              └─────────────┘
                                                       │
                                                       │ trigger
                                                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Patient   │ <────── │  Frontend   │ <────── │    AI       │
│             │ display │             │  send   │  Service    │
└─────────────┘ response└─────────────┘ response└─────────────┘
```

## Message Processing Flow

```
┌─────────────┐
│  Patient    │
│  Message    │
└─────────────┘
       │
       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│ Tokenization│ ──────> │  Intent     │ ──────> │  Entity     │
│             │         │Classification│         │ Recognition │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
                                                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  Response   │ <────── │  Context    │ <────── │  Sentiment  │
│ Generation  │         │ Management  │         │  Analysis   │
└─────────────┘         └─────────────┘         └─────────────┘
       │
       ▼
┌─────────────┐
│    AI       │
│  Response   │
└─────────────┘
```

## User Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │  login  │             │  verify │             │
│    User     │ ──────> │   Auth      │ ──────> │  Database   │
│             │ request │  Controller │ credentials           │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
                                                       │ if valid
                                                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │  store  │             │ generate│             │
│    User     │ <────── │   Browser   │ <────── │  JWT Token  │
│             │  token  │             │  token  │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Healthcare Provider Workflow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Healthcare │  view   │             │  fetch  │             │
│  Provider   │ ──────> │  Dashboard  │ ──────> │  Ticket     │
│             │         │             │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
       │                                                │
       │                                                │
       ▼                                                ▼
┌─────────────┐                                ┌─────────────┐
│  Respond to │                                │  Update     │
│  Patient    │                                │  Ticket     │
│  Message    │                                │  Status     │
└─────────────┘                                └─────────────┘
```

## Data Model Relationships

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id         │
│ name        │
│ email       │
│ password    │
│ role        │
└─────────────┘
       ▲
       │
       │ created by
       │
┌─────────────┐         ┌─────────────┐
│   Ticket    │ contains │  Message    │
├─────────────┤ ◄────── ├─────────────┤
│ _id         │         │ sender      │
│ title       │         │ content     │
│ description │         │ isAI        │
│ status      │         │ timestamp   │
│ user        │         └─────────────┘
│ assignedTo  │
└─────────────┘
```

These diagrams provide a simplified view of how data flows through the TicketHub system. For more detailed information about specific components, refer to the code documentation and comments.