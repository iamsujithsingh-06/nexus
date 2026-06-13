# NEXUS — Personal AI Operating System

NEXUS is a production-ready, ChatGPT-style AI chat platform built with the MERN stack (MongoDB, Express, React, Node.js) and Google Gemini API. This is Phase 1 of a larger Personal AI Operating System.

## Architecture Overview

```
nexus/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/           # DB & Gemini config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth & validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Gemini integration
│   │   └── utils/            # Error handling
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── layouts/          # Auth & App layouts
│   │   ├── services/         # API client & services
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   └── routes/           # Route definitions
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## Features (Phase 1)

- **User Authentication** — Register, login, JWT-based session persistence, logout
- **Chat Interface** — ChatGPT-inspired layout with sidebar and message area
- **Chat History** — Create, open, delete, and retrieve conversations
- **AI Integration** — Google Gemini 2.0 Flash API with system prompt
- **Space-inspired UI** — Cosmic gradients, glassmorphism, starfield effects
- **Responsive** — Fully functional on desktop, tablet, and mobile
- **Secure** — bcrypt password hashing, JWT auth, input validation, rate limiting

## Prerequisites

- Node.js 18+
- MongoDB Atlas (or local MongoDB instance)
- Google Gemini API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nexus
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

### Backend (Render / Railway)

1. Set the build command to `cd backend && npm install`
2. Set the start command to `cd backend && npm start`
3. Add all environment variables from `.env`
4. Set `NODE_ENV` to `production`

### Frontend (Vercel)

1. Set the root directory to `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable `VITE_API_URL` to your deployed backend URL

## API Endpoints

| Method | Endpoint            | Auth | Description              |
|--------|---------------------|------|--------------------------|
| POST   | /api/auth/register  | No   | Register a new user      |
| POST   | /api/auth/login     | No   | Login                    |
| GET    | /api/auth/profile   | Yes  | Get user profile         |
| POST   | /api/chat           | Yes  | Create new chat          |
| GET    | /api/chats          | Yes  | List user chats          |
| GET    | /api/chats/:id      | Yes  | Get chat with messages   |
| DELETE | /api/chats/:id      | Yes  | Delete chat              |
| POST   | /api/chat/message   | Yes  | Send a message           |

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js, Mongoose, JWT, bcrypt
- **Database:** MongoDB
- **AI:** Google Gemini 2.0 Flash API
- **Deployment:** Vercel (frontend), Render/Railway (backend)

## Future Phases

- Phase 2: Memory & Context Management
- Phase 3: Goals & Task Management
- Phase 4: Notes & Knowledge Base
- Phase 5: PDF & Document Processing
- Phase 6: Analytics & Insights
- Phase 7: Admin Dashboard & Multi-user
