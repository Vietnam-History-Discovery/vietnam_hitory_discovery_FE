# Vietnam Chronicles — Frontend

A web application for exploring Vietnamese history through AI-powered chat and knowledge graphs.

🌐 **Live**: [https://vietnam-history-frontend.onrender.com](https://vietnam-history-frontend.onrender.com)

---

## Features

- 🏛️ **Dynasty Explorer** — Browse historical dynasties with detailed information
- 💬 **Chronicle AI** — Chat with an AI grounded in Đại Việt Sử Ký Toàn Thư
- 📜 **Historical Documents** — Read original passages from DVSKTT
- 🗺️ **Timeline** — Chronological view of Vietnamese history

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Dark theme with gold accents

---

## Setup

```bash
git clone https://github.com/Vietnam-History-Discovery/vietnam_hitory_discovery_FE
cd vietnam_hitory_discovery_FE/vietnamese-history-frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Environment

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

Make sure the backend is running before starting the frontend. See [Backend Repository](https://github.com/Vietnam-History-Discovery/vietnam_hitory_discovery_BE) for setup instructions.

For Docker (recommended):

```bash
# Run entire stack from backend repo
docker-compose up -d
```

Frontend available at `http://localhost:3000`.

---

## Related

- [Backend Repository](https://github.com/Vietnam-History-Discovery/vietnam_hitory_discovery_BE)
- [AI Service (HuggingFace)](https://huggingface.co/spaces/nguynanhkhoa/vietnam-history-ai-service)
- [Organization](https://github.com/Vietnam-History-Discovery)
