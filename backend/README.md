# YK AI Gemini Backend

This is the secure backend for the portfolio's **YK AI** assistant. The browser calls `POST /api/chat`; the Gemini API key stays on this server.

## 1. Create the environment

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

## 2. Configure Gemini

Create a Gemini API key in Google AI Studio and set it as `GEMINI_API_KEY`. Do not put the key inside the portfolio JavaScript.

On Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
$env:ALLOWED_ORIGINS="https://yathesh777.github.io"
```

## 3. Run

```bash
uvicorn main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Chat endpoint:

```text
POST http://127.0.0.1:8000/api/chat
Content-Type: application/json

{"message":"What does Yathesh work on?"}
```

## 4. Connect the GitHub Pages site

Edit `assets/ai-config.js` in the portfolio and set:

```js
window.YK_AI_ENDPOINT = 'https://YOUR-BACKEND-DOMAIN/api/chat';
```

Do **not** put `GEMINI_API_KEY` in the frontend. The frontend only needs the backend URL.

## 5. Deployment note

GitHub Pages hosts static files, so the FastAPI backend must run on a separate Python-capable service. Point `YK_AI_ENDPOINT` at that deployed backend URL.
