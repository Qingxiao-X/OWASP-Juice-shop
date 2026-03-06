# HW3 - OWASP Juice Shop (Simple Login Form)
## What’s in this repo
- `index.html` + `app.js`: front-end login UI with client-side validation
- `server.js`: Express backend with server-side validation + rate limiting
- Uses `bcryptjs` to store/compare bcrypt password hashes (demo)
## Run locally
```bash
npm install
npm start
# open http://localhost:3000
```
## SQL Injection demo branch (intentionally vulnerable)
This project includes a **demo-only vulnerable endpoint** on branch
`demo/vuln-sqli-lab`.

Run vulnerable mode:
```bash
DEMO_VULN=true npm start
# then open http://localhost:3000/?mode=vuln
```

Reproduce SQLi:
1. Email: `' OR 1=1--`
2. Password: `anything123`
3. Click **Sign in**
4. Expected result: `SQLi demo success. Logged in as: admin@demo.local`

Screenshot evidence to capture:
- Browser showing the success message in green.
- Optional: DevTools Network response from `/api/login-vuln` includes
  `"attack":{"success":true,"type":"SQLi",...}`.

## XSS attempt (payload + rendered result)
1. Start server in demo mode:
   `DEMO_VULN=true npm start`
2. Open:
   `http://localhost:3000/?mode=xss`
3. Enter payload in **Email**:
   `<b style="color:#e91e63">XSS rendered</b>`
4. Password can be:
   `anything123`
5. Click **Sign in**
6. Expected result:
   the message area renders pink bold text `XSS rendered` (from payload),
   proving unsanitized HTML execution in the page.

## Security notes 
- Client-side: prevents empty fields, requires `@` in email, password >= 8.
- Server-side: repeats validation (never trust the browser).
- Safe DOM updates: uses `textContent` (not `innerHTML`) to prevent XSS.
- Adds rate limiting on `/api/*` to slow brute-force attempts.
- Password handling: stores bcrypt hashes (not plaintext).