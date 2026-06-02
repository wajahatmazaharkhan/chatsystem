# Chat System - Microservices Architecture

This repository contains the backend for the Chat System, built using a **Node.js Microservices Architecture**. It uses an API Gateway to route traffic to 7 independent backend services.

## 🏗️ Architecture

The backend consists of the following 8 components:
1. **API Gateway** (Port 5000): The single entry point for all frontend traffic. Routes requests to appropriate microservices.
2. **Auth Service** (Port 5001): Handles login, registration, and JWT token validation.
3. **User Service** (Port 5002): Manages user profiles.
4. **Group Service** (Port 5003): Manages groups and batches.
5. **Chat Service** (Port 5004): Handles chat messaging and Socket.IO real-time events.
6. **Activity Service** (Port 5005): Logs user actions and activities.
7. **Status Service** (Port 5006): Aggregates user status and online presence.
8. **Analytics Service** (Port 5007): Generates reports by pulling data from other services.

*Note: The services communicate with each other synchronously via internal HTTP requests (`axios`).*

## 🚀 Getting Started

To run the entire system locally, you don't need to manually start each service. We have set up a root orchestrator.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed globally.
- `nodemon` installed globally (`npm install -g nodemon`).
- A MongoDB cluster (e.g., MongoDB Atlas or local MongoDB).

### 2. Environment Variables (.env)
Make sure every service folder inside `/backend/*` has its own `.env` file configured.
*If you need to change your Database URI, you will need to update it in all 7 service `.env` files.*

### 3. Installation
To install the dependencies for **all 8 services** at the same time, open a terminal in this root directory and run:

```bash
npm run install:all
```
*(This uses the root package.json to traverse through all backend folders and install their packages).*

### 4. Running the System
To boot up the API Gateway and all 7 microservices simultaneously, run:

```bash
npm run dev:all
```

You will see color-coded logs indicating the status of each service. 
The system will now be accessible via the API Gateway at `http://localhost:5000`.
