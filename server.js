// Minimal Express server with server-side validation and safe responses.
// Run:
// npm install
// npm start
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs"); // pure JS bcrypt (easy install)
const app = express();
const DEMO_VULN = process.env.DEMO_VULN === "true";
app.use(helmet({ contentSecurityPolicy: false })); // enable CSP if desired
app.use(express.json());
app.use(express.static("."));
app.use("/api/",
 rateLimit({ windowMs: 60_000, max: 30 })
);
function isValidEmail(e) {
 return typeof e === "string" &&
 e.includes("@") &&
 e.length <= 254;
}
function isValidPassword(p) {
 return typeof p === "string" &&
 p.length >= 8 &&
 p.length <= 128;
}
// Demo user store (replace with DB + per-user salts in production)
const USERS = [{
 email: "admin@demo.local",
 passwordHash: bcrypt.hashSync("password123", 12)
}];
app.post("/api/login", async (req, res) => {
 const { email, password } = req.body || {};
 if (!isValidEmail(email) || !isValidPassword(password)) {
 // Do not reflect raw input back to the page
 return res.status(400).json({ error: "Invalid input." });
 }
 const u = USERS.find(x => x.email === email);
 const ok = u ? await bcrypt.compare(password, u.passwordHash) : false;
 if (!ok) return res.status(401).json({ error: "Invalid credentials." });
 // Real systems: issue secure session cookie (HttpOnly, SameSite) or signed JWT
 return res.json({ user: { email: u.email } });
});

if (DEMO_VULN) {
 // Intentionally vulnerable route for classroom demo only.
 // It simulates classic SQL string-concatenation authentication.
 app.post("/api/login-vuln", (req, res) => {
 const email = String(req.body?.email ?? "");
 const password = String(req.body?.password ?? "");
 const fakeQuery =
 `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
 const sqliBypass = /'\s*or\s*1=1\s*--/i.test(email);

 if (sqliBypass) {
 return res.json({
 user: { email: "admin@demo.local" },
 attack: { success: true, type: "SQLi", query: fakeQuery }
 });
 }

 return res.status(401).json({
 error: "Invalid credentials.",
 attack: { success: false, type: "SQLi", query: fakeQuery }
 });
 });

 // Intentionally vulnerable reflected XSS demo route for classroom use only.
 app.post("/api/echo-vuln", (req, res) => {
 const email = String(req.body?.email ?? "");
 return res.json({
 attack: { type: "XSS", success: /<[^>]+>/.test(email) },
 echo: email
 });
 });
} else {
 app.post("/api/login-vuln", (_req, res) => {
 return res.status(404).json({
 error: "Vulnerable demo route is disabled. Start with DEMO_VULN=true."
 });
 });

 app.post("/api/echo-vuln", (_req, res) => {
 return res.status(404).json({
 error: "Vulnerable demo route is disabled. Start with DEMO_VULN=true."
 });
 });
}
app.listen(3000, () => {
 console.log("Server running on http://localhost:3000");
});