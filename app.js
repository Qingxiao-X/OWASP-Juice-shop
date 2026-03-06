// Safe rendering by default; demo modes intentionally weaken behavior.
const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const vulnerableMode = mode === "vuln";
const xssMode = mode === "xss";
function show(text, ok = false) {
 msg.textContent = text; // textContent prevents XSS
 msg.className = "msg " + (ok ? "ok" : "err");
}
form.addEventListener("submit", async (e) => {
 e.preventDefault();
 const email = document.getElementById("email").value.trim();
 const password = document.getElementById("password").value;
 if (!email || !password) return show("Email and password cannot be empty.");
 if (!vulnerableMode && !xssMode && !email.includes("@")) return show('Email must contain "@".');
 if (password.length < 8) return show("Password must be at least 8 characters.");
 try {
 const endpoint = vulnerableMode
 ? "/api/login-vuln"
 : (xssMode ? "/api/echo-vuln" : "/api/login");
 const res = await fetch(endpoint, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email, password })
 });
 const data = await res.json();
 if (!res.ok) return show(data.error || "Login failed.");
 if (vulnerableMode && data.attack?.success) {
 return show("SQLi demo success. Logged in as: " + data.user.email, true);
 }
 if (xssMode) {
 // Intentional vulnerability for demo: do not use innerHTML with untrusted input.
 msg.className = "msg ok";
 msg.innerHTML = "XSS demo rendered output: " + data.echo;
 return;
 }
 show("Login success (demo): " + data.user.email, true);
 } catch {
 show("Network/server error.");
 }
});