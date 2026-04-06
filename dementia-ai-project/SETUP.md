# Lumina Bio (EarlyDementia AI) - Setup & Run Guide

Welcome to the **EarlyDementia AI Project**. This application features an Awwwards-level, cinematic frontend (React + Tailwind CSS + Framer Motion) integrated with a highly robust Python backend (FastAPI + SQLite). 

Follow these instructions to get your development environment running perfectly.

---

## 🚀 The Easiest Way to Run Everything (Windows)

We've provided automated batch scripts in the root of the project to remove the friction of starting up.

### 1. First-Time Installation
If this is your first time cloning or downloading the project, you need to install the dependencies.
- Double-click `setup.bat` in the root folder.
> *This script creates your Python `.venv`, installs all backend API requirements (including `python-jose`, `passlib`, `python-multipart`), and runs `npm install` for the React frontend to grab `framer-motion` and other UI libraries.*

### 2. Launching the App
Once installed, starting the app takes just one click:
- Double-click `start.bat` in the root folder.
> *This automatically opens two terminal windows: one running the FastAPI backend at `http://localhost:8000` and another running the Vite frontend at `http://localhost:5173`. You can safely close these windows when you're done developing.*

---

## ⚙️ Manual Setup & Run Instructions

If you prefer to run things manually in your own terminal (or if you are on macOS/Linux), follow these steps.

### Backend (FastAPI)
1. **Navigate to the backend directory:**
   ```bash
   cd dementia-ai-project/backend
   ```
2. **Activate your virtual environment:**
   - **Windows:** `.\.venv\Scripts\activate`
   - **Mac/Linux:** `source .venv/bin/activate`
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Start the API Server:**
   ```bash
   uvicorn main:app --reload
   ```
   *(Backend runs on `http://localhost:8000`)*

### Frontend (React + Vite)
1. **Open a new terminal and navigate to the frontend:**
   ```bash
   cd dementia-ai-project/frontend
   ```
2. **Install Node modules:**
   ```bash
   npm install
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*

---

## 🎨 Setting up the Cinematic Landing Page Images
Your frontend now includes a highly sophisticated, scroll-scrubbing HTML5 Canvas element on the home page! 

To feed it the sequence of 120 photorealistic cellular renders:
1. Locate your 120 high-res image frames.
2. Rename them sequentially (e.g., `0001.webp` through `0120.webp`).
3. Place them directly inside the following folder:
   `frontend/public/cell explosion hero page/`
   
Once the images are inside that `/public/` directory, the code will automatically detect them and play the sequence as the user scrolls! If the images are missing, the system gracefully falls back to a purely code-generated simulation of glowing dividing cells.

---

## 🛠️ Data Seeding & Database
The first time you boot the backend, it will dynamically create the `early_dementia.db` SQLite database file. 
If you need mock user data to test the cognitive assessments:
- Navigate to `http://localhost:8000/api/seed` in your browser while the backend is running to generate a test patient.
