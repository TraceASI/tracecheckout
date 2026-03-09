:root {
  --bg: #0b1020;
  --card: #121935;
  --muted: #8f9bb3;
  --text: #f4f7ff;
  --line: rgba(255,255,255,0.08);
  --accent: #3b82f6;
  --accent-2: #7c3aed;
  --ok: #16a34a;
  --danger: #dc2626;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(180deg, #0a0f1d 0%, #0b1020 100%);
  color: var(--text);
}
.container {
  width: min(960px, calc(100% - 32px));
  margin: 40px auto;
}
.header {
  margin-bottom: 20px;
}
.brand {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.sub {
  color: var(--muted);
  margin-top: 6px;
}
.grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
}
.card {
  background: rgba(18, 25, 53, 0.92);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field { margin-bottom: 14px; }
label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #d9e2ff;
}
input, select {
  width: 100%;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.04);
  color: var(--text);
  outline: none;
}
input::placeholder { color: #9aa7c2; }
input:focus, select:focus {
  border-color: rgba(59,130,246,0.7);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.16);
}
.summary-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.summary-line:last-child { border-bottom: 0; }
.amount {
  font-size: 36px;
  font-weight: 700;
  margin: 6px 0 16px;
}
.note {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}
.notice, .error {
  margin: 12px 0 0;
  font-size: 14px;
}
.error { color: #fca5a5; }
.notice { color: #bfdbfe; }
#paypal-button-container {
  margin-top: 18px;
}
.confirmation {
  display: none;
  text-align: center;
  padding: 40px 20px;
}
.confirmation.show { display: block; }
.check {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(22,163,74,0.16);
  color: #86efac;
  font-size: 34px;
  border: 1px solid rgba(22,163,74,0.35);
  margin-bottom: 16px;
}
.confirmation h2 { margin: 0 0 10px; }
.confirmation p { color: var(--muted); }
.code {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  padding: 12px;
  border-radius: 12px;
  word-break: break-word;
}
.links {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}
.links a {
  color: #c7d2fe;
  text-decoration: none;
}
.links a:hover { text-decoration: underline; }
.btn {
  display: inline-block;
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  color: white;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
@media (max-width: 820px) {
  .grid, .row { grid-template-columns: 1fr; }
  .container { margin: 20px auto; }
}
