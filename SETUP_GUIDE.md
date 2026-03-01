# ARES — Quick Setup Guide (New Machine)

## Prerequisites (Install These First)

### 1. Python 3.11+
Download from: https://www.python.org/downloads/
> ⚠️ During install, CHECK "Add Python to PATH"

### 2. Node.js 18+
Download from: https://nodejs.org/ (LTS version)

---

## Setup Steps (5 minutes)

### Step 1: Extract the ZIP
Extract the `AMD.zip` folder anywhere on the laptop.

### Step 2: Install Backend Dependencies
Open a terminal in the project folder and run:
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
Open another terminal:
```bash
cd frontend
npm install
```

### Step 4: Start Backend Server
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
You should see: `Uvicorn running on http://0.0.0.0:8000`

### Step 5: Start Frontend Server
In the second terminal:
```bash
cd frontend
npm run dev
```
You should see: `VITE ready` with a localhost URL.

### Step 6: Open Browser
Go to **http://localhost:5173**

---

## Using ARES

1. Click **GENERATE CAMPUS** → creates the network graph
2. Adjust sliders (infection probability, iterations, etc.)
3. Click **RUN** → executes Monte Carlo simulation
4. Use **Timeline ▶** to replay infection step-by-step
5. View defense recommendations at the bottom

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `python not found` | Reinstall Python, check "Add to PATH" |
| `npm not found` | Reinstall Node.js, restart terminal |
| `Port 8000 in use` | `python -m uvicorn main:app --port 8001` and update `vite.config.js` proxy |
| Frontend shows errors | Make sure backend is running first |
| `pip install` fails | Try `python -m pip install -r requirements.txt` |
