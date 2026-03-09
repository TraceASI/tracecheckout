:root {
  --bg: #0b1020;
  --card: #121935;
  --card-2: #0f1530;
  --text: #edf2ff;
  --muted: #a8b3cf;
  --line: rgba(255,255,255,0.12);
  --accent: #5ea0ff;
  --accent-2: #7dd3fc;
  --danger: #ff6b6b;
  --success: #2dd4bf;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: linear-gradient(180deg, #08101f 0%, #0e1730 100%); color: var(--text); }
body { min-height: 100vh; }
.wrap { width: min(960px, calc(100% - 32px)); margin: 32px auto; }
.brand { display:flex; align-items:center; gap:12px; margin-bottom: 20px; }
.logo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color:#08101f; font-weight:700; display:grid; place-items:center; }
.brand h1 { font-size: 28px; margin: 0; }
.brand p { margin: 2px 0 0; color: var(--muted); }
.grid { display:grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px; }
.card { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border:1px solid var(--line); border-radius: 18px; padding: 22px; box-shadow: 0 16px 40px rgba(0,0,0,0.22); }
.section-title { margin: 0 0 16px; font-size: 18px; }
.small { color: var(--muted); font-size: 14px; }
.amount-box { background: linear-gradient(135deg, rgba(94,160,255,0.16), rgba(125,211,252,0.12)); border:1px solid rgba(125,211,252,0.25); border-radius: 16px; padding: 18px; margin-bottom: 18px; }
.amount { font-size: 36px; font-weight: 700; letter-spacing: 0.5px; }
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display:flex; flex-direction:column; gap:8px; margin-bottom: 14px; }
.field.full { grid-column: 1 / -1; }
label { font-size: 14px; color: var(--muted); }
input, select { width: 100%; padding: 13px 14px; border-radius: 12px; border:1px solid var(--line); background: var(--card-2); color: var(--text); outline: none; }
input:focus, select:focus { border-color: rgba(125,211,252,0.5); box-shadow: 0 0 0 3px rgba(125,211,252,0.12); }
.error { color: #ffd2d2; background: rgba(255,107,107,0.12); border:1px solid rgba(255,107,107,0.35); padding: 12px 14px; border-radius: 12px; margin-bottom: 14px; display:none; }
.error.show { display:block; }
.note { margin-top: 14px; color: var(--muted); font-size: 13px; line-height: 1.45; }
#paypal-button-container { margin-top: 16px; }
.summary-row { display:flex; justify-content:space-between; gap:12px; padding: 12px 0; border-bottom:1px solid var(--line); }
.summary-row:last-child { border-bottom:0; }
.summary-label { color: var(--muted); }
.confirmation { display:none; }
.confirmation.show { display:block; }
.badge { display:inline-flex; align-items:center; gap:8px; background: rgba(45,212,191,0.12); color: #ddfff7; border:1px solid rgba(45,212,191,0.35); padding: 8px 12px; border-radius: 999px; font-size: 14px; margin-bottom: 14px; }
.confirm-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.confirm-item { background: rgba(255,255,255,0.03); border:1px solid var(--line); border-radius: 14px; padding: 14px; }
.confirm-item strong { display:block; margin-bottom: 6px; color: var(--muted); font-size: 13px; }
.action-link { display:inline-block; margin-top: 16px; text-decoration:none; color: #08101f; background: linear-gradient(135deg, var(--accent), var(--accent-2)); padding: 12px 16px; border-radius: 12px; font-weight: 700; }
.links { display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 20px; }
.links a { text-decoration:none; color: var(--text); background: rgba(255,255,255,0.04); border:1px solid var(--line); padding: 14px 16px; border-radius: 14px; }
.links a:hover { border-color: rgba(125,211,252,0.45); }
@media (max-width: 820px) {
  .grid { grid-template-columns: 1fr; }
  .form-grid, .confirm-grid { grid-template-columns: 1fr; }
  .amount { font-size: 30px; }
}
