# YK AI Gemini Backend

This is the FastAPI backend for the portfolio's **YK AI** assistant.
The Gemini API key stays server-side and is never placed in the portfolio JavaScript.

## 1. Create a virtual environment

From inside the `backend` directory:

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Yes, you should use both a `requirements.txt` and a virtual environment:

- `requirements.txt` makes the Python dependencies reproducible.
- `.venv` keeps these dependencies isolated from the rest of your machine.
- `.venv` is local only and should not be committed to GitHub.

## 3. Add your API key

Open:

```text
backend/.env
```

Put only this value in the file:

```env
GEMINI_API_KEY=YOUR_REAL_GEMINI_API_KEY
```

You do not need to add the model, CORS, or rate limit settings for the default setup.
The backend has sensible defaults for those values.

**Never commit `backend/.env` to GitHub.**

## 4. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

A successful configuration returns `"configured": true`.

## 5. Connect the portfolio frontend

Edit:

```text
assets/ai-config.js
```

and set:

```js
window.YK_AI_ENDPOINT = 'http://127.0.0.1:8000/api/chat';
```

for local testing.

After the backend is deployed, replace it with your public backend URL:

```js
window.YK_AI_ENDPOINT = 'https://YOUR-BACKEND-DOMAIN/api/chat';
```

Do **not** put the Gemini API key in `assets/ai-config.js`.

## 6. GitHub Pages limitation

GitHub Pages can host the static portfolio, but it cannot run the FastAPI Python backend. The backend must run on a separate Python-capable service.
