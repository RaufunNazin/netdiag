# Network Diagram

A web application for visualizing and managing network diagrams with a modern frontend and a Python backend.

---

## Features

- Interactive network diagram editor
- User authentication
- Node and edge management
- Export and import diagrams

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [Python 3.8+](https://www.python.org/) (for backend)
- [pip](https://pip.pypa.io/en/stable/)

---

### Backend Setup

1. **Clone the repository** and navigate to the backend directory:

```bash
git clone <repo-url>
cd backend-network-diagram
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**

- Copy `.env.example` to `.env` and update as needed.

4. **Run the backend server:**

```bash
uvicorn main:app --reload
```

---

### Frontend Setup

1. **Navigate to the frontend directory:**

```bash
cd network-diagram
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Usage

- Access the frontend in your browser.
- Log in with your credentials.
- Create, edit, and manage your network diagrams.

---

### Notes

- Ensure the backend server is running before using the frontend.
- For production deployment, configure environment variables and use appropriate process managers.

---
