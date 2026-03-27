import { useState, useEffect, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "./api";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Instrument+Serif&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0a0b0d;--bg1:#0f1114;--bg2:#141720;--bg3:#1a1e2a;--bg4:#1f2435;
  --line:rgba(255,255,255,0.06);--line2:rgba(255,255,255,0.1);--line3:rgba(255,255,255,0.18);
  --text:#c8cdd8;--text2:#8892a4;--text3:#505a6e;--text-inv:#0a0b0d;
  --green:#00ff88;--green-dim:rgba(0,255,136,0.08);--green-mid:rgba(0,255,136,0.15);--green-glow:rgba(0,255,136,0.25);
  --red:#ff3b5c;--red-dim:rgba(255,59,92,0.08);
  --amber:#ffb020;--amber-dim:rgba(255,176,32,0.08);
  --blue:#4d9eff;--blue-dim:rgba(77,158,255,0.08);
  --mono:'IBM Plex Mono',monospace;--serif:'Instrument Serif',serif;--sans:'IBM Plex Sans',sans-serif;
  --r:4px;--r2:6px;
}
html,body{background:var(--bg);color:var(--text);font-family:var(--sans);height:100%;overflow-x:hidden;font-size:14px;line-height:1.6;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px;}
.app{display:flex;height:100vh;overflow:hidden;}
/* SIDEBAR */
.sidebar{width:220px;min-width:220px;background:var(--bg1);border-right:1px solid var(--line);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.sidebar::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px);pointer-events:none;}
.sidebar-top{padding:28px 20px 24px;border-bottom:1px solid var(--line);position:relative;}
.logo-wordmark{font-family:var(--mono);font-size:15px;font-weight:600;letter-spacing:0.08em;color:var(--green);}
.logo-sub{font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--text3);text-transform:uppercase;margin-top:2px;}
.nav{padding:16px 12px;flex:1;}
.nav-group-label{font-family:var(--mono);font-size:9px;letter-spacing:0.18em;color:var(--text3);text-transform:uppercase;padding:0 8px 8px;margin-top:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r);cursor:pointer;font-size:13px;color:var(--text2);transition:all 0.12s;margin-bottom:1px;position:relative;}
.nav-item:hover{background:var(--bg3);color:var(--text);}
.nav-item.active{background:var(--green-dim);color:var(--green);}
.nav-item.active::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:2px;background:var(--green);border-radius:0 1px 1px 0;}
.nav-icon{width:16px;height:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.nav-badge{margin-left:auto;background:var(--red);color:white;font-family:var(--mono);font-size:9px;font-weight:600;padding:1px 5px;border-radius:10px;min-width:16px;text-align:center;}
.sidebar-bottom{padding:14px 12px;border-top:1px solid var(--line);}
.user-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r);cursor:pointer;transition:background 0.12s;}
.user-row:hover{background:var(--bg3);}
.initials{width:30px;height:30px;border-radius:50%;border:1px solid var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:600;color:var(--green);flex-shrink:0;background:var(--green-dim);}
.user-meta{flex:1;min-width:0;}
.user-name-sm{font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.user-role-sm{font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:0.1em;}
.sign-out-btn{width:100%;margin-top:8px;padding:7px 10px;background:transparent;border:1px solid var(--line2);border-radius:var(--r);cursor:pointer;font-family:var(--mono);font-size:10px;letter-spacing:0.08em;color:var(--text3);transition:all 0.12s;text-align:center;}
.sign-out-btn:hover{border-color:var(--line3);color:var(--text2);background:var(--bg3);}
/* MAIN */
.main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
.topbar{background:var(--bg1);border-bottom:1px solid var(--line);padding:0 32px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;flex-shrink:0;}
.topbar-breadcrumb{font-family:var(--mono);font-size:10px;letter-spacing:0.12em;color:var(--text3);text-transform:uppercase;}
.topbar-sep{color:var(--text3);font-family:var(--mono);font-size:10px;margin:0 6px;}
.topbar-page{font-family:var(--mono);font-size:11px;letter-spacing:0.1em;color:var(--text2);text-transform:uppercase;}
.topbar-right{display:flex;align-items:center;gap:8px;}
.topbar-btn{width:32px;height:32px;border-radius:var(--r);background:transparent;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.12s;color:var(--text3);}
.topbar-btn:hover{background:var(--bg3);border-color:var(--line2);color:var(--text2);}
.status-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse-dot 2.5s ease-in-out infinite;}
@keyframes pulse-dot{0%,100%{opacity:1;}50%{opacity:0.4;}}
/* PAGE */
.page{padding:32px;max-width:1080px;flex:1;}
.page-header{margin-bottom:32px;}
.page-eyebrow{font-family:var(--mono);font-size:9px;letter-spacing:0.2em;color:var(--green);text-transform:uppercase;margin-bottom:6px;}
.page-title{font-family:var(--serif);font-size:28px;font-weight:400;color:var(--text);line-height:1.2;margin-bottom:6px;}
.page-subtitle{font-size:13px;color:var(--text2);}
.section-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);}
.section-title{font-family:var(--mono);font-size:10px;letter-spacing:0.15em;color:var(--text2);text-transform:uppercase;}
.section-count{font-family:var(--mono);font-size:10px;color:var(--text3);}
/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
/* CARDS */
.card{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);padding:20px;}
.card-sm{padding:14px;}.card-flush{padding:0;overflow:hidden;}
.stat-card{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);padding:18px 20px;position:relative;overflow:hidden;}
.stat-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--green-mid),transparent);}
.stat-val{font-family:var(--mono);font-size:26px;font-weight:600;line-height:1;margin-bottom:4px;color:var(--text);}
.stat-val.green{color:var(--green);}.stat-val.amber{color:var(--amber);}.stat-val.blue{color:var(--blue);}.stat-val.red{color:var(--red);}
.stat-lbl{font-family:var(--mono);font-size:9px;letter-spacing:0.12em;color:var(--text3);text-transform:uppercase;}
/* MODULE CARDS */
.module-card{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);padding:22px;cursor:pointer;transition:all 0.15s;position:relative;}
.module-card:hover{border-color:var(--line3);background:var(--bg2);}
.module-card.done{border-left:2px solid var(--green);}
.module-tag{font-family:var(--mono);font-size:9px;letter-spacing:0.15em;color:var(--text3);text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.module-tag::before{content:'';display:block;width:4px;height:4px;background:var(--green);border-radius:50%;flex-shrink:0;}
.module-title{font-family:var(--serif);font-size:18px;font-weight:400;color:var(--text);margin-bottom:8px;line-height:1.3;}
.module-desc{font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:16px;}
.module-meta{display:flex;gap:10px;flex-wrap:wrap;}
.module-chip{font-family:var(--mono);font-size:9px;letter-spacing:0.08em;color:var(--text3);padding:3px 7px;border:1px solid var(--line2);border-radius:2px;text-transform:uppercase;}
.module-chip.g{color:var(--green);border-color:rgba(0,255,136,0.2);}
.module-chip.a{color:var(--amber);border-color:rgba(255,176,32,0.2);}
.module-status{position:absolute;top:16px;right:16px;}
/* PROGRESS */
.pbar{height:2px;background:var(--bg4);border-radius:1px;margin-top:14px;}
.pbar-fill{height:100%;background:var(--green);border-radius:1px;transition:width 0.4s ease;}
.pbar-label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9px;color:var(--text3);margin-top:4px;}
/* TAGS */
.tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:2px;font-family:var(--mono);font-size:9px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;}
.tag-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(0,255,136,0.2);}
.tag-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(255,176,32,0.2);}
.tag-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(255,59,92,0.2);}
.tag-blue{background:var(--blue-dim);color:var(--blue);border:1px solid rgba(77,158,255,0.2);}
.tag-muted{background:var(--bg3);color:var(--text3);border:1px solid var(--line2);}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--r);font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:0.06em;cursor:pointer;transition:all 0.12s;border:none;outline:none;text-transform:uppercase;}
.btn:disabled{opacity:0.4;cursor:not-allowed;}
.btn-primary{background:var(--green);color:var(--text-inv);}
.btn-primary:hover:not(:disabled){box-shadow:0 0 16px var(--green-glow);}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--line2);}
.btn-ghost:hover:not(:disabled){background:var(--bg3);border-color:var(--line3);color:var(--text);}
.btn-danger-ghost{background:transparent;color:var(--red);border:1px solid rgba(255,59,92,0.2);}
.btn-danger-ghost:hover:not(:disabled){background:var(--red-dim);}
.btn-sm{padding:5px 11px;font-size:9px;}
/* FORMS */
.form-field{margin-bottom:16px;}
.form-label{display:block;font-family:var(--mono);font-size:9px;letter-spacing:0.12em;color:var(--text3);text-transform:uppercase;margin-bottom:6px;}
.form-input{width:100%;padding:9px 12px;background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;outline:none;transition:border-color 0.12s;}
.form-input:focus{border-color:var(--green);}
.form-input::placeholder{color:var(--text3);}
.form-textarea{width:100%;padding:9px 12px;background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;outline:none;resize:vertical;min-height:90px;transition:border-color 0.12s;}
.form-textarea:focus{border-color:var(--green);}
.form-select{width:100%;padding:9px 12px;background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23505a6e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;transition:border-color 0.12s;}
.form-select:focus{border-color:var(--green);}
.form-error{font-family:var(--mono);font-size:10px;color:var(--red);margin-top:4px;letter-spacing:0.05em;}
/* TABS */
.tabs{display:flex;gap:0;border-bottom:1px solid var(--line);margin-bottom:24px;}
.tab{padding:10px 18px;cursor:pointer;font-family:var(--mono);font-size:10px;letter-spacing:0.1em;color:var(--text3);text-transform:uppercase;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.12s;}
.tab:hover{color:var(--text2);}
.tab.active{color:var(--green);border-bottom-color:var(--green);}
/* TABLE */
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;padding:10px 16px;font-family:var(--mono);font-size:9px;letter-spacing:0.12em;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--line);font-weight:500;}
.tbl td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:middle;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tbody tr:hover td{background:var(--bg2);}
/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:100;}
.modal{background:var(--bg1);border:1px solid var(--line2);border-radius:var(--r2);width:760px;max-width:95vw;max-height:90vh;overflow-y:auto;padding:32px;position:relative;}
.modal-close{position:absolute;top:18px;right:18px;width:28px;height:28px;border-radius:var(--r);background:var(--bg3);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:var(--mono);font-size:12px;color:var(--text3);transition:all 0.12s;}
.modal-close:hover{background:var(--bg4);color:var(--text);}
/* AUTH */
.auth-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.auth-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(0,255,136,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.03) 1px,transparent 1px);background-size:48px 48px;}
.auth-card{width:400px;background:var(--bg1);border:1px solid var(--line2);border-radius:var(--r2);padding:40px;position:relative;z-index:1;}
.auth-wordmark{font-family:var(--mono);font-size:16px;font-weight:600;color:var(--green);letter-spacing:0.1em;margin-bottom:2px;}
.auth-tagline{font-size:12px;color:var(--text3);font-family:var(--mono);letter-spacing:0.05em;margin-bottom:32px;}
.mfa-code-display{background:var(--bg);border:1px solid var(--line2);border-radius:var(--r);padding:20px;text-align:center;margin-bottom:20px;}
.mfa-code{font-family:var(--mono);font-size:32px;font-weight:600;letter-spacing:12px;color:var(--green);margin:8px 0;}
.mfa-note{font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:0.08em;}
/* XP */
.xp-track{background:var(--bg3);height:3px;border-radius:1px;}
.xp-fill{height:100%;background:var(--green);border-radius:1px;transition:width 0.5s;}
/* QUIZ */
.q-opt{padding:12px 16px;border-radius:var(--r);border:1px solid var(--line2);cursor:pointer;font-size:13px;transition:all 0.12s;margin-bottom:8px;background:var(--bg2);}
.q-opt:hover{border-color:var(--line3);background:var(--bg3);}
.q-opt.sel{border-color:var(--blue);background:var(--blue-dim);}
.q-opt.right{border-color:var(--green);background:var(--green-dim);cursor:default;}
.q-opt.wrong{border-color:var(--red);background:var(--red-dim);cursor:default;}
/* LAB */
.lab-msg{background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);padding:18px;margin-bottom:14px;}
.lab-msg-header{border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:10px;}
.lab-field{display:flex;gap:8px;margin-bottom:3px;font-size:12px;}
.lab-field-lbl{color:var(--text3);font-family:var(--mono);font-size:10px;min-width:56px;}
.lab-suspect{border-color:rgba(255,59,92,0.3);background:rgba(255,59,92,0.04);}
/* TOAST */
.toast-wrap{position:fixed;top:18px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;}
.toast{background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);padding:12px 16px;min-width:280px;max-width:360px;display:flex;align-items:flex-start;gap:10px;cursor:pointer;animation:toast-in 0.2s ease;}
.toast.ok{border-left:2px solid var(--green);}.toast.err{border-left:2px solid var(--red);}.toast.inf{border-left:2px solid var(--blue);}
@keyframes toast-in{from{transform:translateX(20px);opacity:0;}to{transform:none;opacity:1;}}
.toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.toast-dot.ok{background:var(--green);}.toast-dot.err{background:var(--red);}.toast-dot.inf{background:var(--blue);}
.toast-title{font-size:12px;font-weight:500;margin-bottom:1px;}
.toast-msg{font-size:11px;color:var(--text2);}
/* MISC */
.lesson-body{font-size:13px;line-height:1.75;color:var(--text2);}
.lesson-body strong{color:var(--text);font-weight:500;}
.divider{height:1px;background:var(--line);margin:20px 0;}
.spinner{width:32px;height:32px;border:2px solid var(--bg4);border-top-color:var(--green);border-radius:50%;animation:spin 0.7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading-wrap{padding:60px;display:flex;justify-content:center;}
.empty{text-align:center;padding:40px 20px;color:var(--text3);font-size:12px;font-family:var(--mono);}
.mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99;}
.hamburger{display:none;width:36px;height:36px;border-radius:var(--r);background:transparent;border:1px solid var(--line);align-items:center;justify-content:center;cursor:pointer;color:var(--text3);flex-shrink:0;margin-right:10px;}
.hamburger:hover{background:var(--bg3);color:var(--text2);}
@media(max-width:768px){
  .g2,.g3,.g4{grid-template-columns:1fr;}
  .page{padding:16px;}
  .sidebar{display:none;}
  .sidebar.mobile-open{display:flex;position:fixed;top:0;left:0;bottom:0;width:280px;z-index:100;}
  .mobile-overlay{display:block;}
  .hamburger{display:flex !important;}
}
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  learn:   "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  report:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  profile: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  admin:   "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  bell:    "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  check:   "M20 6L9 17l-5-5",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Spinner() { return <div className="loading-wrap"><div className="spinner"></div></div>; }

function Toast({ toasts, remove }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          <div className={`toast-dot ${t.type}`}></div>
          <div><div className="toast-title">{t.title}</div>{t.msg && <div className="toast-msg">{t.msg}</div>}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, addToast }) {
  const [tab, setTab]       = useState("signin");
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [name, setName]     = useState("");
  const [mfa, setMfa]       = useState(false);
  const [code, setCode]     = useState("");
  const [simCode, setSimCode]   = useState("");
  const [preToken, setPreToken] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.auth.login({ email, password });
      setPreToken(res.preAuthToken);
      setSimCode(res.simulatedMfaCode);
      setMfa(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const doMfa = async () => {
    if (!code) { setError("Enter the 6-digit code."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.auth.verifyMfa({ preAuthToken: preToken, mfaCode: code });
      setToken(res.token);
      onLogin(res.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const doRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setLoading(true); setError("");
    try {
      await api.auth.register({ name, email, password });
      addToast("ok", "Account created", "Please sign in.");
      setTab("signin"); setName(""); setPass(""); setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-grid-bg"></div>
      <div className="auth-card">
        <div className="auth-wordmark">JIKINGE AFRICA</div>
        <div className="auth-tagline">// cybersecurity awareness platform v1.0</div>

        {!mfa ? (
          <>
            <div className="tabs" style={{marginBottom:20}}>
              <div className={`tab ${tab==="signin"?"active":""}`} onClick={()=>{setTab("signin");setError("");}}>Sign In</div>
              <div className={`tab ${tab==="register"?"active":""}`} onClick={()=>{setTab("register");setError("");}}>Register</div>
            </div>
            {tab==="register" && <div className="form-field"><label className="form-label">Full Name</label><input className="form-input" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} /></div>}
            <div className="form-field"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="user@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(tab==="signin"?doLogin():doRegister())} /></div>
            <div className="form-field"><label className="form-label">Password</label><input className="form-input" type="password" placeholder={tab==="register"?"Min 8 characters":"••••••••"} value={password} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(tab==="signin"?doLogin():doRegister())} /></div>
            {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"10px"}} disabled={loading} onClick={tab==="signin"?doLogin:doRegister}>
              {loading?"Please wait...":tab==="signin"?"Authenticate":"Create Account"}
            </button>
            {tab==="signin" && <div style={{marginTop:16,padding:"10px 12px",background:"var(--bg)",border:"1px solid var(--line)",borderRadius:"var(--r)"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.1em",marginBottom:6}}>DEMO CREDENTIALS</div>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text2)"}}>demo@alu.edu / Demo1234!</div>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text2)"}}>admin@jikinge.africa / Admin1234!</div>
            </div>}
          </>
        ) : (
          <>
            <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:12}}>MFA Verification Required</div>
            <div className="mfa-code-display">
              <div className="mfa-note" style={{marginBottom:4}}>AUTHENTICATOR CODE (prototype simulation)</div>
              <div className="mfa-code">{simCode}</div>
              <div className="mfa-note">Real app: use Google Authenticator or Authy</div>
            </div>
            <div className="form-field"><label className="form-label">Enter Code</label>
              <input className="form-input" placeholder="000000" value={code} onChange={e=>setCode(e.target.value)} maxLength={6} style={{fontFamily:"var(--mono)",fontSize:20,letterSpacing:8,textAlign:"center"}} onKeyDown={e=>e.key==="Enter"&&doMfa()} />
            </div>
            {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"10px"}} disabled={loading} onClick={doMfa}>{loading?"Verifying...":"Verify Identity"}</button>
            <button className="btn btn-ghost" style={{width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>{setMfa(false);setError("");}}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── INTERACTIVE LABS ─────────────────────────────────────────────────────────
function PhishingLab({ onComplete }) {
  const cases = [
    {from:"KRA-Revenue@gmail.com",subject:"URGENT: Tax Refund — Action Required Within 24hrs",body:"Dear Taxpayer,\n\nA refund of KES 45,000 is pending against your account. Verify your identity within 24 hours by providing your KRA PIN at the link below.\n\n  kra-refund-verify.suspicious-domain.co\n\nFailure to act results in permanent forfeiture.\n\n— Kenya Revenue Authority",phish:true,notes:["Sender is gmail.com, not kra.go.ke","Artificial urgency — suppresses critical thinking","Third-party domain unaffiliated with KRA","KRA never solicits PIN via email"]},
    {from:"noreply@github.com",subject:"New sign-in to your account from Nairobi, Kenya",body:"Hi,\n\nWe detected a sign-in to your GitHub account:\n\n  Location: Nairobi, Kenya\n  Time: Today, 14:32 EAT\n\nIf this was you, no action needed. If not, secure your account at github.com/settings/security\n\n— GitHub Security",phish:false,notes:["Official @github.com domain","No credential request","Directs to main domain only","No artificial urgency"]},
    {from:"alu-it-support@alu-systems.online",subject:"Your ALU Account — Suspension Notice",body:"Dear Student,\n\nYour account is suspended in 48 hours due to a policy violation. Verify your credentials at:\n\n  alu-verify.account-restore.online/login\n\nProvide your student ID, email, and password.\n\n— ALU IT Support",phish:true,notes:["alu-systems.online is not ALU's domain","Third-party redirect domain","IT never solicits passwords","Suspension threat is coercive framing"]},
  ];
  const [ans, setAns]   = useState({});
  const [done, setDone] = useState(false);
  const score = Object.entries(ans).filter(([i,v])=>v===String(cases[i].phish)).length;
  if (done) return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontFamily:"var(--mono)",fontSize:28,color:"var(--green)",marginBottom:8}}>{score}/3</div>
      <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--text)",marginBottom:8}}>{score===3?"All threats correctly identified.":score===2?"Two of three identified correctly.":"Review detection indicators and retry."}</div>
      <div style={{color:"var(--text2)",fontSize:12,marginBottom:24}}>Sender domain verification is the most reliable phishing indicator.</div>
      <button className="btn btn-primary" onClick={onComplete}>Complete Lab</button>
    </div>
  );
  return (
    <div>
      <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:16}}>Lab — Phishing Detection // Classify each message</div>
      {cases.map((c,i)=>(
        <div key={i} className={`lab-msg ${ans[i]!==undefined&&c.phish?"lab-suspect":""}`}>
          <div className="lab-msg-header">
            <div className="lab-field"><span className="lab-field-lbl">FROM</span><span style={{color:"var(--text)"}}>{c.from}</span></div>
            <div className="lab-field"><span className="lab-field-lbl">SUBJECT</span><span>{c.subject}</span></div>
          </div>
          <pre style={{whiteSpace:"pre-wrap",fontFamily:"var(--sans)",fontSize:12,color:"var(--text2)",lineHeight:1.7,marginBottom:12}}>{c.body}</pre>
          {ans[i]===undefined ? (
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-danger-ghost btn-sm" onClick={()=>setAns(p=>({...p,[i]:"true"}))}>Mark as Phishing</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>setAns(p=>({...p,[i]:"false"}))}>Mark as Legitimate</button>
            </div>
          ) : (
            <div style={{fontSize:11}}>
              <span style={{color:ans[i]===String(c.phish)?"var(--green)":"var(--red)",fontFamily:"var(--mono)",fontWeight:600}}>{ans[i]===String(c.phish)?"CORRECT":"INCORRECT"}</span>
              <span style={{color:"var(--text2)",marginLeft:8}}>{c.phish?"Phishing.":"Legitimate."} Indicators: {c.notes.join(" / ")}</span>
            </div>
          )}
        </div>
      ))}
      {Object.keys(ans).length===cases.length && <button className="btn btn-primary" style={{marginTop:8}} onClick={()=>setDone(true)}>View Results</button>}
    </div>
  );
}

function MFALab({ onComplete }) {
  const [step, setStep] = useState(0);
  const [sel, setSel]   = useState(null);
  const [done, setDone] = useState(false);
  const apps = [{name:"Google Authenticator",note:"Free. No cloud backup. Offline-only.",rec:false},{name:"Authy",note:"Free. Encrypted multi-device backup. Recommended.",rec:true},{name:"Microsoft Authenticator",note:"Free. Push notifications. Microsoft ecosystem.",rec:false}];
  const steps = [
    {title:"Why MFA Matters",body:"A stolen password alone is insufficient to access MFA-protected accounts. Even with full credential compromise, an adversary requires the second factor to authenticate — eliminating the majority of automated account takeover attacks."},
    {title:"Select Your Authenticator App",body:null},
    {title:"Enrolment Process",body:"During MFA setup, the service presents a QR code encoding a shared secret. Your authenticator app scans this once and derives time-based 6-digit codes every 30 seconds using the TOTP algorithm (RFC 6238). No internet connection is required after initial setup."},
    {title:"Recovery Code Storage",body:"Upon MFA activation, the service generates single-use recovery codes. Store them offline — printed and secured, or in an encrypted password manager. Never store recovery codes in email or cloud storage accessible through the same account."},
  ];
  if (done) return (<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--text)",marginBottom:8}}>Lab complete.</div><div style={{color:"var(--text2)",fontSize:12,marginBottom:24}}>Enable MFA on your institutional and personal accounts today.</div><button className="btn btn-primary" onClick={onComplete}>Complete Lab</button></div>);
  return (
    <div>
      <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:16}}>Lab — MFA Configuration // Step {step+1} of {steps.length}</div>
      <div style={{display:"flex",gap:4,marginBottom:20}}>{steps.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?"var(--green)":"var(--bg4)",transition:"background 0.3s"}}></div>)}</div>
      <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--text)",marginBottom:12}}>{steps[step].title}</div>
      {step===1 ? apps.map((a,i)=>(
        <div key={i} onClick={()=>setSel(i)} style={{padding:"12px 14px",border:`1px solid ${sel===i?"var(--green)":"var(--line2)"}`,borderRadius:"var(--r)",marginBottom:8,cursor:"pointer",background:sel===i?"var(--green-dim)":"var(--bg2)",transition:"all 0.12s"}}>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{a.name}{a.rec&&<span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--green)",marginLeft:8}}>RECOMMENDED</span>}</div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{a.note}</div>
        </div>
      )) : <div className="lesson-body" style={{marginBottom:16}}>{steps[step].body}</div>}
      <div style={{display:"flex",gap:8}}>
        {step>0&&<button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>Back</button>}
        <button className="btn btn-primary" style={{marginLeft:"auto"}} disabled={step===1&&sel===null} onClick={()=>step===steps.length-1?setDone(true):setStep(s=>s+1)}>{step===steps.length-1?"Finish":"Continue"}</button>
      </div>
    </div>
  );
}

function MalwareLab({ onComplete }) {
  const [choice, setChoice] = useState(null);
  const [done, setDone]     = useState(false);
  const opts = [
    {text:"Pay the ransom immediately to restore patient services",correct:false,fb:"Incorrect. Ransom payment funds criminal operations and does not guarantee decryption. ~35% of organisations that paid did not recover their data."},
    {text:"Isolate affected systems from the network, notify security team and management, then restore from verified offline backups",correct:true,fb:"Correct. Network isolation prevents lateral spread. Management notification enables coordinated response. Clean backup restoration is the only reliable recovery path."},
    {text:"Restart affected systems and attempt manual file recovery",correct:false,fb:"Incorrect. Restarting may hinder forensic investigation. AES-256 encrypted files cannot be recovered without the decryption key."},
    {text:"Continue operations while negotiating a reduced ransom payment",correct:false,fb:"Incorrect. Continued use facilitates further infection spread. Negotiation legitimises the attack and encourages future incidents."},
  ];
  const note = "YOUR FILES HAVE BEEN ENCRYPTED\n\nAll patient records and billing systems have been encrypted using AES-256.\n\nTransfer 0.5 BTC within 48 hours to obtain the decryption key.\n\nAddress: 1A2b3C4d5E6f...\n\nDo not contact law enforcement — doing so results in permanent key deletion.";
  if (done) return (<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--text)",marginBottom:8}}>{choice===1?"Correct response protocol.":"Suboptimal response."}</div><div style={{color:"var(--text2)",fontSize:12,marginBottom:24}}>{opts[choice].fb}</div><div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginBottom:24}}>Offline backups are the only reliable defence against ransomware data loss.</div><button className="btn btn-primary" onClick={onComplete}>Complete Lab</button></div>);
  return (
    <div>
      <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:12}}>Lab — Ransomware Response // Nairobi Medical Clinic Scenario</div>
      <div style={{fontSize:12,color:"var(--text2)",marginBottom:14}}>Three workstations at a Nairobi medical clinic display this message on Monday morning:</div>
      <div style={{background:"var(--bg)",border:"1px solid rgba(255,59,92,0.2)",borderRadius:"var(--r)",padding:18,fontFamily:"var(--mono)",fontSize:12,lineHeight:1.8,color:"rgba(255,100,100,0.8)",marginBottom:18,whiteSpace:"pre-wrap"}}>{note}</div>
      <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.12em",color:"var(--text3)",textTransform:"uppercase",marginBottom:10}}>Select the correct immediate response:</div>
      {opts.map((o,i)=><div key={i} className={`q-opt ${choice===i?(o.correct?"right":"wrong"):""}`} onClick={()=>choice===null&&setChoice(i)}>{o.text}</div>)}
      {choice!==null&&<div style={{marginTop:12}}><div style={{fontSize:12,color:"var(--text2)",padding:"10px 12px",background:"var(--bg2)",borderRadius:"var(--r)",marginBottom:12}}>{opts[choice].fb}</div><button className="btn btn-primary" onClick={()=>setDone(true)}>View Results</button></div>}
    </div>
  );
}

function ScamLab({ onComplete }) {
  const msgs = [
    {msg:"CONGRATULATIONS — You have been selected to receive KES 100,000 from the Safaricom Loyalty Programme. To claim, send KES 500 as a processing fee to Paybill 123456. Offer expires in 2 hours.",scam:true,note:"No legitimate reward requires upfront payment. Artificial expiry suppresses deliberation. Classic advance fee fraud."},
    {msg:"Your Safaricom bill of KES 1,200 is due on 15th January 2026. Pay via M-Pesa Paybill 200300 or the Safaricom app. Assistance: safaricom.co.ke or call 100.",scam:false,note:"Legitimate. Official paybill, no urgency, no credential request, official channels only."},
    {msg:"Hi, I am Dr. Emmanuel Osei, a petroleum engineer in Lagos. I have USD 4.5 million to transfer and will give you 30% for your assistance. WhatsApp me urgently.",scam:true,note:"Advance fee fraud (419). Unsolicited contact, disproportionate promised return, manufactured urgency. The funds do not exist."},
    {msg:"This is your bank's fraud department. We detected a suspicious transaction of KES 25,000. Confirm your card number, expiry, and PIN by replying to this message.",scam:true,note:"Financial institutions never request PIN via SMS. This impersonates a fraud department to harvest payment credentials."},
  ];
  const [ans, setAns]   = useState({});
  const [done, setDone] = useState(false);
  const score = Object.entries(ans).filter(([i,v])=>v===String(msgs[i].scam)).length;
  return (
    <div>
      <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:16}}>Lab — Fraud Recognition // Classify each message</div>
      {msgs.map((m,i)=>(
        <div key={i} className="lab-msg" style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"var(--text2)",fontStyle:"italic",padding:"10px 12px",background:"var(--bg)",borderRadius:"var(--r)",marginBottom:10,lineHeight:1.6}}>"{m.msg}"</div>
          {!ans[i] ? (
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-danger-ghost btn-sm" onClick={()=>setAns(p=>({...p,[i]:"true"}))}>Fraudulent</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>setAns(p=>({...p,[i]:"false"}))}>Legitimate</button>
            </div>
          ) : <div style={{fontSize:11}}><span style={{color:ans[i]===String(m.scam)?"var(--green)":"var(--red)",fontFamily:"var(--mono)",fontWeight:600}}>{ans[i]===String(m.scam)?"CORRECT":"INCORRECT"}</span><span style={{color:"var(--text2)",marginLeft:8}}>{m.note}</span></div>}
        </div>
      ))}
      {Object.keys(ans).length===msgs.length&&!done&&<button className="btn btn-primary" style={{marginTop:8}} onClick={()=>{setDone(true);onComplete();}}>Complete Lab — {score}/{msgs.length} correct</button>}
    </div>
  );
}

const LABS = {"1c":PhishingLab,"2c":MFALab,"3c":MalwareLab,"4c":ScamLab};

// ─── MODULE VIEWER ────────────────────────────────────────────────────────────
function ModuleViewer({ mod, prog, onSave, onClose }) {
  const [li, setLi]           = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(new Set(prog?.completed_lessons || []));

  const lesson = mod.lessons[li];
  const Lab    = LABS[lesson?.id];
  const score  = () => Math.round(mod.quiz.filter((q,i)=>answers[i]===q.answer).length/mod.quiz.length*100);
  const markDone = (id) => setDone(p=>{const n=new Set(p);n.add(id);return n;});

  const submit = async () => {
    setSubmitted(true);
    const s = score();
    const xp = mod.xp + done.size*25 + (s>=70?50:0);
    setSaving(true);
    await onSave(mod.id, { completed:true, quiz_score:s, xp_earned:xp, completed_lessons:[...done] });
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={e=>e.target.className==="overlay"&&onClose()}>
      <div className="modal">
        <div className="modal-close" onClick={onClose}>✕</div>
        <div style={{marginBottom:4}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--green)",textTransform:"uppercase",marginBottom:6}}>{mod.tag}</div>
          <div style={{fontFamily:"var(--serif)",fontSize:22,color:"var(--text)"}}>{mod.title}</div>
          <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginTop:2}}>{mod.duration} · {mod.xp} XP · {mod.difficulty}</div>
        </div>
        <div className="divider"></div>
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {mod.lessons.map((l,i)=>(
            <button key={l.id} className={`btn btn-sm ${li===i&&!showQuiz?"btn-primary":"btn-ghost"}`} onClick={()=>{setLi(i);setShowQuiz(false);}}>
              {done.has(l.id)&&<Icon d={I.check} size={10}/>}{l.type==="lab"?"LAB":"THEORY"} {String(i+1).padStart(2,"0")}
            </button>
          ))}
          <button className={`btn btn-sm ${showQuiz?"btn-primary":"btn-ghost"}`} onClick={()=>setShowQuiz(true)}>
            {prog?.completed&&<Icon d={I.check} size={10}/>}QUIZ
          </button>
        </div>

        {!showQuiz ? (
          <>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:"var(--serif)",fontSize:17,color:"var(--text)",marginBottom:2}}>{lesson.title}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{lesson.duration} · {lesson.type==="lab"?"Practical Lab":"Theory"}</div>
            </div>
            {lesson.content==="INTERACTIVE_LAB" ? (
              Lab ? <Lab onComplete={()=>markDone(lesson.id)} /> :
              <div style={{padding:40,textAlign:"center"}}><div style={{fontFamily:"var(--serif)",fontSize:16,color:"var(--text2)",marginBottom:12}}>Interactive Lab</div><button className="btn btn-primary" onClick={()=>markDone(lesson.id)}>Complete Lab</button></div>
            ) : (
              <>
                <div className="lesson-body">
                  {lesson.content.split("\n").map((line,i)=>(
                    <p key={i} style={{marginBottom:line.trim()?4:10}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")||"&nbsp;"}} />
                  ))}
                </div>
                <div style={{marginTop:20}}>
                  {!done.has(lesson.id)
                    ? <button className="btn btn-primary btn-sm" onClick={()=>markDone(lesson.id)}>Mark Complete</button>
                    : <span className="tag tag-green"><Icon d={I.check} size={9}/> Completed</span>}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--text)",marginBottom:4}}>Knowledge Assessment</div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.1em",marginBottom:20}}>{mod.quiz.length} QUESTIONS · PASS THRESHOLD 70%</div>
            {!submitted ? (
              <>
                {mod.quiz.map((q,qi)=>(
                  <div key={qi} style={{marginBottom:20}}>
                    <div style={{fontWeight:500,fontSize:13,marginBottom:10,color:"var(--text)"}}>{qi+1}. {q.question}</div>
                    {q.options.map((opt,oi)=>(
                      <div key={oi} className={`q-opt ${answers[qi]===oi?"sel":""}`} onClick={()=>setAnswers(p=>({...p,[qi]:oi}))}>
                        <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginRight:8}}>{["A","B","C","D"][oi]}</span>{opt}
                      </div>
                    ))}
                  </div>
                ))}
                <button className="btn btn-primary" disabled={Object.keys(answers).length<mod.quiz.length||saving} onClick={submit}>
                  {saving?"Saving...":"Submit Assessment"}
                </button>
              </>
            ) : (
              <>
                <div style={{padding:"20px",textAlign:"center",background:"var(--bg2)",border:`1px solid ${score()>=70?"rgba(0,255,136,0.2)":"rgba(255,59,92,0.2)"}`,borderRadius:"var(--r)",marginBottom:20}}>
                  <div style={{fontFamily:"var(--mono)",fontSize:36,fontWeight:600,color:score()>=70?"var(--green)":"var(--red)"}}>{score()}%</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.12em",color:"var(--text3)",marginTop:4}}>
                    {score()>=70?"ASSESSMENT PASSED":"BELOW PASS THRESHOLD"} · +{mod.xp+done.size*25+(score()>=70?50:0)} XP
                  </div>
                </div>
                {mod.quiz.map((q,qi)=>(
                  <div key={qi} style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:"var(--text)"}}>{qi+1}. {q.question}</div>
                    {q.options.map((opt,oi)=>(
                      <div key={oi} className={`q-opt ${oi===q.answer?"right":answers[qi]===oi&&oi!==q.answer?"wrong":""}`} style={{cursor:"default",fontSize:12}}>
                        <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",marginRight:8}}>{["A","B","C","D"][oi]}</span>{opt}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function Dashboard({ user, addToast, onNav }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api.progress.get(), api.incidents.list(), api.modules.list()])
      .then(([prog, rpts, mods]) => setData({ prog, rpts, mods }))
      .catch(e => addToast("err","Load error",e.message));
  }, [addToast]);

  if (!data) return <div className="page"><Spinner /></div>;

  const { prog, rpts, mods } = data;
  const progMap = {};
  prog.progress.forEach(p => { progMap[p.module_id] = p; });
  const inProg  = mods.filter(m=>progMap[m.id]&&!progMap[m.id].completed).slice(0,2);
  const next    = mods.filter(m=>!progMap[m.id]).slice(0,2);
  const show    = inProg.length ? inProg : next;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Overview</div>
        <div className="page-title">Welcome back, {user.name.split(" ")[0]}.</div>
        <div className="page-subtitle">Your security posture at a glance.</div>
      </div>

      <div className="card" style={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text2)",letterSpacing:"0.1em"}}>{user.level.toUpperCase()} · {prog.totalXP} XP</div>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{Math.max(0,500-prog.totalXP)} XP to next level</div>
        </div>
        <div className="xp-track"><div className="xp-fill" style={{width:`${Math.min(100,(prog.totalXP/500)*100)}%`}}></div></div>
      </div>

      <div className="g4" style={{marginBottom:20}}>
        {[
          {label:"Modules Complete",val:`${prog.completedCount}/${mods.length}`,cls:"green"},
          {label:"XP Earned",val:prog.totalXP,cls:""},
          {label:"Incidents Filed",val:rpts.filter(r=>r.reporter_id===user.id).length,cls:"amber"},
          {label:"Avg Score",val:prog.progress.filter(p=>p.quiz_score!=null).length?`${Math.round(prog.progress.reduce((s,p)=>s+(p.quiz_score||0),0)/prog.progress.filter(p=>p.quiz_score!=null).length)}%`:"—",cls:"blue"},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className={`stat-val ${s.cls}`}>{s.val}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{marginBottom:20}}>
        <div className="card">
          <div className="section-hd">
            <div className="section-title">Training Queue</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNav("learn")}>View All</button>
          </div>
          {show.map(m=>(
            <div key={m.id} onClick={()=>onNav("learn")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"var(--bg2)",borderRadius:"var(--r)",marginBottom:8,cursor:"pointer",border:"1px solid var(--line)",transition:"border-color 0.12s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--line3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{m.title}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.08em",marginTop:2}}>{m.tag} · {m.duration}</div>
              </div>
              <span className={`tag ${progMap[m.id]?"tag-amber":"tag-muted"}`}>{progMap[m.id]?"IN PROGRESS":"QUEUED"}</span>
            </div>
          ))}
          {show.length===0&&<div className="empty">All modules complete.</div>}
        </div>

        <div className="card">
          <div className="section-hd">
            <div className="section-title">Recent Incidents</div>
            <span className="tag tag-red">{rpts.filter(r=>r.status==="Pending").length} pending</span>
          </div>
          {rpts.slice(0,3).map(r=>(
            <div key={r.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid var(--line)"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:r.severity==="Critical"?"var(--red)":r.severity==="High"?"var(--amber)":"var(--text3)",marginTop:4,flexShrink:0}}></div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:"var(--text)"}}>{r.type}</div>
                <div style={{fontSize:11,color:"var(--text2)",marginTop:1}}>{r.description.slice(0,70)}...</div>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",marginTop:3}}>{r.location} · {r.created_at?.split(" ")[0]}</div>
              </div>
              <span className={`tag ${r.status==="Resolved"?"tag-green":r.status==="Under Review"?"tag-amber":"tag-blue"}`} style={{whiteSpace:"nowrap"}}>
                {r.status==="Under Review"?"REVIEW":r.status.toUpperCase()}
              </span>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center",marginTop:12}} onClick={()=>onNav("report")}>File Incident Report</button>
        </div>
      </div>

      <div className="card" style={{borderLeft:"2px solid var(--green)",padding:"16px 20px"}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--green)",textTransform:"uppercase",marginBottom:6}}>Security Advisory</div>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>Enable multi-factor authentication across all institutional and personal accounts. A compromised password alone is insufficient to breach an MFA-protected account — this single control eliminates the majority of automated credential attacks targeting students and staff.</div>
      </div>
    </div>
  );
}

function LearnPage({ addToast }) {
  const [modules, setModules]   = useState([]);
  const [progMap, setProgMap]   = useState({});
  const [filter, setFilter]     = useState("All");
  const [active, setActive]     = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [mods, prog] = await Promise.all([api.modules.list(), api.progress.get()]);
      setModules(mods);
      const map = {};
      prog.progress.forEach(p => { map[p.module_id] = p; });
      setProgMap(map);
    } catch (e) { addToast("err","Load error",e.message); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (moduleId, data) => {
    try {
      await api.progress.save(moduleId, data);
      if (data.completed) addToast("ok","Module complete",`+${data.xp_earned} XP earned`);
      await load();
    } catch (e) { addToast("err","Save error",e.message); }
  };

  const openModule = async (m) => {
    try {
      const full = await api.modules.get(m.id);
      setActive(full);
    } catch (e) { addToast("err","Load error",e.message); }
  };

  if (loading) return <div className="page"><Spinner /></div>;

  const cats     = ["All", ...new Set(modules.map(m=>m.tag.split(" ")[0]))];
  const filtered = filter==="All" ? modules : modules.filter(m=>m.tag.startsWith(filter));

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Curriculum</div>
        <div className="page-title">Learning Modules</div>
        <div className="page-subtitle">{Object.values(progMap).filter(p=>p.completed).length} of {modules.length} modules completed</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {cats.map(c=><button key={c} className={`btn btn-sm ${filter===c?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter(c)}>{c}</button>)}
      </div>
      <div className="g2">
        {filtered.map(m=>{
          const p   = progMap[m.id];
          const cl  = p?.completed_lessons?.length||0;
          const tot = m.lesson_count||3;
          const pct = p?.completed?100:Math.round((cl/tot)*100);
          return (
            <div key={m.id} className={`module-card ${p?.completed?"done":""}`} onClick={()=>openModule(m)}>
              <div className="module-tag">{m.tag}</div>
              <div className="module-title">{m.title}</div>
              <div className="module-desc">{m.description}</div>
              <div className="module-meta">
                <span className="module-chip">{m.duration}</span>
                <span className={`module-chip ${m.difficulty==="Beginner"?"g":"a"}`}>{m.difficulty}</span>
                <span className="module-chip">{m.xp} XP</span>
              </div>
              <div className="module-status">
                {p?.completed?<span className="tag tag-green"><Icon d={I.check} size={9}/> COMPLETE</span>:pct>0?<span className="tag tag-amber">IN PROGRESS</span>:<span className="tag tag-muted">NOT STARTED</span>}
              </div>
              {pct>0&&<><div className="pbar"><div className="pbar-fill" style={{width:`${pct}%`}}></div></div><div className="pbar-label"><span>Progress</span><span>{pct}%</span></div></>}
            </div>
          );
        })}
      </div>
      {active&&<ModuleViewer mod={active} prog={progMap[active.id]} onSave={handleSave} onClose={()=>{setActive(null);load();}} />}
    </div>
  );
}

function ReportPage({ user, addToast }) {
  const [tab, setTab]         = useState("file");
  const [reports, setReports] = useState([]);
  const [form, setForm]       = useState({type:"",desc:"",severity:"Medium",location:""});
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const types = ["Phishing Email","Mobile Money Fraud","Ransomware","Online Fraud","Data Breach","Social Engineering","Malware Infection","Business Email Compromise","Digital Sextortion","Other"];

  useEffect(()=>{ api.incidents.list().then(setReports).catch(()=>{}); },[done]);

  const submit = async () => {
    if (!form.type||!form.desc) { addToast("err","Missing fields","Type and description are required."); return; }
    setLoading(true);
    try {
      await api.incidents.report({type:form.type,description:form.desc,severity:form.severity,location:form.location});
      addToast("ok","Report submitted","Assigned for administrator review.");
      setDone(true);
      setTimeout(()=>{setDone(false);setForm({type:"",desc:"",severity:"Medium",location:""});},3000);
    } catch(e){ addToast("err","Submission failed",e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Incident Management</div>
        <div className="page-title">Incident Reporting</div>
        <div className="page-subtitle">Submit threat intelligence to assist coordinated response efforts.</div>
      </div>
      <div className="tabs">
        <div className={`tab ${tab==="file"?"active":""}`} onClick={()=>setTab("file")}>File Report</div>
        <div className={`tab ${tab==="log"?"active":""}`} onClick={()=>setTab("log")}>Report Log ({reports.length})</div>
      </div>
      {tab==="file" ? (
        <div className="g2" style={{alignItems:"start"}}>
          <div>
            {done ? (
              <div className="card" style={{textAlign:"center",padding:40,borderLeft:"2px solid var(--green)"}}>
                <div style={{fontFamily:"var(--serif)",fontSize:22,color:"var(--text)",marginBottom:8}}>Report received.</div>
                <div style={{fontSize:12,color:"var(--text2)"}}>Your submission has been logged and assigned for review. Thank you for helping keep Africa safe online.</div>
              </div>
            ) : (
              <div className="card">
                <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:20}}>New Incident Report</div>
                <div className="form-field"><label className="form-label">Incident Classification</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    <option value="">Select type...</option>
                    {types.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Incident Description</label>
                  <textarea className="form-textarea" placeholder="Provide a detailed account. Include sender addresses, URLs, phone numbers, and any indicators of compromise..." value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} rows={5}></textarea>
                </div>
                <div className="g2">
                  <div className="form-field"><label className="form-label">Severity</label>
                    <select className="form-select" value={form.severity} onChange={e=>setForm(p=>({...p,severity:e.target.value}))}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, Country" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} />
                  </div>
                </div>
                <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} disabled={!form.type||!form.desc||loading} onClick={submit}>
                  {loading?"Submitting...":"Submit Report"}
                </button>
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="card" style={{borderLeft:"2px solid rgba(255,59,92,0.4)"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--red)",textTransform:"uppercase",marginBottom:12}}>Reporting Protocol</div>
              {["Include all available indicators: URLs, domains, phone numbers, email addresses","Do not interact with or confront adversaries directly","Preserve evidence — screenshot communications before deletion","Financial losses should also be reported to your bank and local authorities","All reports are reviewed by administrators before distribution to response teams"].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:11,color:"var(--text2)"}}><span style={{color:"var(--text3)",flexShrink:0}}>—</span>{t}</div>
              ))}
            </div>
            <div className="card">
              <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.15em",color:"var(--text3)",textTransform:"uppercase",marginBottom:12}}>National Response Contacts</div>
              {[["Kenya","Cyber Crime Unit","+254 703 122 000"],["Rwanda","RIB Cyber Crime","cybercrimes@rib.gov.rw"],["Nigeria","EFCC","info@efcc.gov.ng"],["South Africa","SAPS","10111"]].map(([c,d,v])=>(
                <div key={c} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--line)",fontSize:11}}>
                  <span style={{color:"var(--text2)"}}>{c} <span style={{color:"var(--text3)",fontFamily:"var(--mono)",fontSize:9}}>{d}</span></span>
                  <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card card-flush">
          <table className="tbl">
            <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {reports.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:500,fontSize:12}}>{r.type}</td>
                  <td style={{maxWidth:200,fontSize:11,color:"var(--text2)"}}>{r.description.slice(0,70)}...</td>
                  <td><span className={`tag ${r.severity==="Critical"?"tag-red":r.severity==="High"?"tag-amber":"tag-muted"}`}>{r.severity}</span></td>
                  <td style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>{r.location}</td>
                  <td style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>{r.created_at?.split(" ")[0]}</td>
                  <td><span className={`tag ${r.status==="Resolved"?"tag-green":r.status==="Under Review"?"tag-amber":"tag-blue"}`}>{r.status==="Under Review"?"REVIEW":r.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminPage({ addToast }) {
  const [tab, setTab]         = useState("incidents");
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]     = useState([]);
  const [modules, setModules] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rpts, ana, usrs, mods] = await Promise.all([api.incidents.list(), api.admin.analytics(), api.admin.users(), api.modules.list()]);
      setReports(rpts); setAnalytics(ana); setUsers(usrs); setModules(mods);
    } catch(e){ addToast("err","Load error",e.message); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(()=>{ load(); },[load]);

  const loadAudit = async () => {
    if (auditLog.length) return;
    try { setAuditLog(await api.admin.auditLog()); } catch(e){ addToast("err","Audit log error",e.message); }
  };

  const updateStatus = async (id, status) => {
    try { await api.incidents.updateStatus(id,status); addToast("inf","Updated",`→ ${status}`); load(); }
    catch(e){ addToast("err","Update failed",e.message); }
  };

  if (loading) return <div className="page"><Spinner /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>
        <div className="page-title">Platform Management</div>
        <div className="page-subtitle">Incident oversight, module management, and analytics.</div>
      </div>

      {analytics && (
        <div className="g4" style={{marginBottom:20}}>
          {[["Total Users",analytics.users.total,""],["Pending Reports",analytics.incidents.pending,"red"],["Module Completions",analytics.learning.total_completions,"green"],["Avg Quiz Score",`${analytics.learning.avg_quiz_score||0}%`,"blue"]].map(([l,v,c])=>(
            <div key={l} className="stat-card"><div className={`stat-val ${c}`}>{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
      )}

      <div className="tabs">
        <div className={`tab ${tab==="incidents"?"active":""}`} onClick={()=>setTab("incidents")}>Incident Queue</div>
        <div className={`tab ${tab==="modules"?"active":""}`} onClick={()=>setTab("modules")}>Module Registry</div>
        <div className={`tab ${tab==="analytics"?"active":""}`} onClick={()=>setTab("analytics")}>Analytics</div>
        <div className={`tab ${tab==="users"?"active":""}`} onClick={()=>setTab("users")}>Users</div>
        <div className={`tab ${tab==="audit"?"active":""}`} onClick={()=>{setTab("audit");loadAudit();}}>Audit Log</div>
      </div>

      {tab==="incidents"&&(
        <div className="card card-flush">
          <table className="tbl">
            <thead><tr><th>Reporter</th><th>Type</th><th>Severity</th><th>Summary</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {reports.map(r=>(
                <tr key={r.id}>
                  <td style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text2)"}}>{r.reporter_name}</td>
                  <td style={{fontSize:12,fontWeight:500}}>{r.type}</td>
                  <td><span className={`tag ${r.severity==="Critical"?"tag-red":r.severity==="High"?"tag-amber":"tag-muted"}`}>{r.severity}</span></td>
                  <td style={{fontSize:11,color:"var(--text2)",maxWidth:180}}>{r.description.slice(0,60)}...</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{r.created_at?.split(" ")[0]}</td>
                  <td><span className={`tag ${r.status==="Resolved"?"tag-green":r.status==="Under Review"?"tag-amber":"tag-blue"}`}>{r.status==="Under Review"?"REVIEW":r.status.toUpperCase()}</span></td>
                  <td>
                    {r.status==="Pending"&&<button className="btn btn-ghost btn-sm" onClick={()=>updateStatus(r.id,"Under Review")}>Review</button>}
                    {r.status==="Under Review"&&<button className="btn btn-sm" style={{background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:"var(--r)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:9,padding:"5px 11px",textTransform:"uppercase"}} onClick={()=>updateStatus(r.id,"Resolved")}>Resolve</button>}
                    {r.status==="Resolved"&&<span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>CLOSED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="modules"&&(
        <div className="card card-flush">
          <table className="tbl">
            <thead><tr><th>Module</th><th>Category</th><th>Level</th><th>Lessons</th><th>XP</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {modules.map(m=>(
                <tr key={m.id}>
                  <td style={{fontWeight:500,fontSize:13}}>{m.title}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.08em"}}>{m.tag}</td>
                  <td><span className={`tag ${m.difficulty==="Beginner"?"tag-green":"tag-amber"}`}>{m.difficulty}</span></td>
                  <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text2)"}}>{m.lesson_count} + quiz</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--green)"}}>{m.xp}</td>
                  <td><span className="tag tag-green">Active</span></td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>addToast("inf","Edit Module","Module editing coming in next sprint.")}>Edit</button>
                      <button className="btn btn-danger-ghost btn-sm" onClick={()=>addToast("inf","Archive Module","Module archiving coming in next sprint.")}>Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {tab==="analytics"&&(
        <div className="g2">
          <div className="card">
            <div className="section-hd"><div className="section-title">Completions by Module</div></div>
            {analytics.learning.by_module.map(m=>(
              <div key={m.title} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:"var(--text2)"}}><span>{m.title}</span><span style={{fontFamily:"var(--mono)",color:"var(--text3)"}}>{m.completions}</span></div>
                <div className="pbar" style={{height:3}}><div className="pbar-fill" style={{width:`${Math.max(5,(m.completions/Math.max(...analytics.learning.by_module.map(x=>x.completions),1))*100)}%`}}></div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-hd"><div className="section-title">Incidents by Type</div></div>
            {analytics.incidents.by_type.map(t=>(
              <div key={t.type} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--line)",fontSize:12}}>
                <span style={{color:"var(--text2)"}}>{t.type}</span>
                <span className="tag tag-muted">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="users"&&(
        <div className="card card-flush">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Points</th><th>Joined</th><th>Last Login</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td style={{fontWeight:500,fontSize:13}}>{u.name}</td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{u.email}</td>
                  <td><span className={`tag ${u.role==="admin"?"tag-amber":u.role==="irt"?"tag-blue":"tag-muted"}`}>{u.role}</span></td>
                  <td style={{fontSize:12}}>{u.level}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--green)"}}>{u.points}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{u.created_at?.split(" ")[0]}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{u.last_login?.split(" ")[0]||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="audit"&&(
        <div className="card card-flush">
          <table className="tbl">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th><th>IP</th></tr></thead>
            <tbody>
              {auditLog.map(l=>(
                <tr key={l.id}>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",whiteSpace:"nowrap"}}>{l.created_at}</td>
                  <td style={{fontSize:12}}>{l.user_name||"—"}</td>
                  <td><span className="tag tag-blue" style={{fontSize:9}}>{l.action}</span></td>
                  <td style={{fontSize:11,color:"var(--text2)",maxWidth:260}}>{l.detail}</td>
                  <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProfilePage({ user, addToast }) {
  const [progress, setProgress] = useState({ progress:[], totalXP:0 });
  const [reports, setReports]   = useState([]);

  useEffect(()=>{
    Promise.all([api.progress.get(), api.incidents.list()])
      .then(([p,r])=>{ setProgress(p); setReports(r); })
      .catch(e=>addToast("err","Load error",e.message));
  },[addToast]);

  const completed = progress.progress.filter(p=>p.completed);
  const mine      = reports.filter(r=>r.reporter_id===user.id);
  const avg       = completed.length ? Math.round(completed.reduce((s,p)=>s+(p.quiz_score||0),0)/completed.length) : null;

  const checklist = [
    {label:"Enable MFA on institutional email",done:true},
    {label:"Use a password manager",done:false},
    {label:"Apply available OS and software updates",done:true},
    {label:"Audit social media privacy settings",done:false},
    {label:"Establish offline backup routine",done:false},
    {label:"Complete Phishing Awareness module",done:!!progress.progress.find(p=>p.module_id===1&&p.completed)},
    {label:"Submit at least one incident report",done:mine.length>0},
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Account</div>
        <div className="page-title">{user.name}</div>
        <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
          <span className="tag tag-muted">{user.email}</span>
          <span className="tag tag-green">{user.level}</span>
          <span className="tag tag-blue">ALU Community</span>
          <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",padding:"2px 0"}}>Member since {user.joined}</span>
        </div>
      </div>

      <div className="g3" style={{marginBottom:20}}>
        <div className="stat-card"><div className="stat-val green">{completed.length}</div><div className="stat-lbl">Modules Complete</div></div>
        <div className="stat-card"><div className="stat-val">{progress.totalXP}</div><div className="stat-lbl">XP Earned</div></div>
        <div className="stat-card"><div className="stat-val blue">{avg!=null?`${avg}%`:"—"}</div><div className="stat-lbl">Avg Assessment Score</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="section-hd"><div className="section-title">Completed Modules</div><div className="section-count">{completed.length}</div></div>
          {completed.length>0 ? completed.map(p=>(
            <div key={p.module_id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--line)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{p.title}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.08em",marginTop:2}}>{p.tag}</div>
              </div>
              <span className="tag tag-muted">{p.quiz_score}%</span>
              <span className="tag tag-green">+{p.xp_earned} XP</span>
            </div>
          )) : <div style={{padding:"20px 0",color:"var(--text3)",fontSize:12,fontFamily:"var(--mono)"}}>No modules completed yet. Begin with Phishing Awareness.</div>}
        </div>

        <div className="card">
          <div className="section-hd"><div className="section-title">Hygiene Checklist</div><div className="section-count">{checklist.filter(c=>c.done).length}/{checklist.length}</div></div>
          {checklist.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<checklist.length-1?"1px solid var(--line)":"none",fontSize:12}}>
              <div style={{width:14,height:14,borderRadius:2,border:`1px solid ${c.done?"var(--green)":"var(--line3)"}`,background:c.done?"var(--green-dim)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {c.done&&<Icon d={I.check} size={8}/>}
              </div>
              <span style={{color:c.done?"var(--text)":"var(--text3)"}}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(null);
  const [page, setPage]     = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [booting, setBooting] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  // Auto-login from stored token
  useEffect(()=>{
    if (getToken()) {
      api.auth.me()
        .then(u => setUser(u))
        .catch(()=>clearToken())
        .finally(()=>setBooting(false));
    } else { setBooting(false); }
  },[]);

  const addToast = useCallback((type,title,msg)=>{
    const id = Date.now();
    setToasts(p=>[...p,{id,type,title,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  const handleLogin = (u) => { setUser(u); addToast("ok","Authenticated",`Session started for ${u.name}.`); };
  const handleSignOut = () => { clearToken(); setUser(null); setPage("dashboard"); setMenuOpen(false); };
  const navigate = (id) => { setPage(id); setMenuOpen(false); };

  if (booting) return (
    <div style={{minHeight:"100vh",background:"var(--bg, #0a0b0d)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"2px solid #1f2435",borderTopColor:"#00ff88",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}></div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={handleLogin} addToast={addToast} />;

  const nav = [
    {id:"dashboard",label:"Overview",icon:I.home},
    {id:"learn",label:"Modules",icon:I.learn},
    {id:"report",label:"Incidents",icon:I.report},
    {id:"profile",label:"Profile",icon:I.profile},
    ...(user.role==="admin"?[{id:"admin",label:"Admin",icon:I.admin}]:[]),
  ];
  const titles = {dashboard:"Overview",learn:"Curriculum",report:"Incident Management",profile:"Account",admin:"Administration"};

  return (
    <div className="app">
      <Toast toasts={toasts} remove={id=>setToasts(p=>p.filter(t=>t.id!==id))} />

      {menuOpen && <div className="mobile-overlay" onClick={()=>setMenuOpen(false)}/>}

      <aside className={`sidebar${menuOpen?" mobile-open":""}`}>
        <div className="sidebar-top" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div>
            <div className="logo-wordmark">JIKINGE</div>
            <div className="logo-sub">// Africa Cyber Platform</div>
          </div>
          <button className="hamburger" style={{marginRight:0}} onClick={()=>setMenuOpen(false)}>
            <Icon d="M6 18L18 6M6 6l12 12" size={16}/>
          </button>
        </div>
        <nav className="nav">
          <div className="nav-group-label">Navigation</div>
          {nav.map(item=>(
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>navigate(item.id)}>
              <span className="nav-icon"><Icon d={item.icon} size={14}/></span>
              {item.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-row" onClick={()=>navigate("profile")}>
            <div className="initials">{user.initials}</div>
            <div className="user-meta">
              <div className="user-name-sm">{user.name}</div>
              <div className="user-role-sm">{user.role==="admin"?"ADMINISTRATOR":"STUDENT"}</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>SIGN OUT</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"center"}}>
            <button className="hamburger" onClick={()=>setMenuOpen(o=>!o)}>
              <Icon d={menuOpen?"M6 18L18 6M6 6l12 12":"M4 6h16M4 12h16M4 18h16"} size={16}/>
            </button>
            <span className="topbar-breadcrumb">JIKINGE AFRICA</span>
            <span className="topbar-sep">/</span>
            <span className="topbar-page">{titles[page]}</span>
          </div>
          <div className="topbar-right">
            <div style={{display:"flex",alignItems:"center",gap:6,marginRight:8}}>
              <div className="status-dot"></div>
              <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",letterSpacing:"0.1em"}}>ONLINE</span>
            </div>
            <button className="topbar-btn" onClick={()=>addToast("inf","Advisory","Apply available software updates to reduce your attack surface.")}>
              <Icon d={I.bell} size={14}/>
            </button>
            <div className="initials" style={{width:28,height:28,fontSize:10,cursor:"pointer",borderRadius:"var(--r)"}} onClick={()=>setPage("profile")}>{user.initials}</div>
          </div>
        </div>

        {page==="dashboard"&&<Dashboard user={user} addToast={addToast} onNav={setPage}/>}
        {page==="learn"    &&<LearnPage addToast={addToast}/>}
        {page==="report"   &&<ReportPage user={user} addToast={addToast}/>}
        {page==="profile"  &&<ProfilePage user={user} addToast={addToast}/>}
        {page==="admin"&&user.role==="admin"&&<AdminPage addToast={addToast}/>}
      </div>
    </div>
  );
}
