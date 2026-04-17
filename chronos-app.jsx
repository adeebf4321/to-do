import { useState, useEffect, useRef } from "react";
import {
  Home, CheckSquare, Calendar, LayoutGrid, FileText,
  Plus, X, Edit2, Trash2, Check, ChevronLeft, ChevronRight,
  Bell, Target, Clock, BookOpen, Dumbbell, Briefcase, Heart,
  Star, Coffee, Music, Play, Pause, RotateCcw, Zap, Search, Flame
} from "lucide-react";

// ─── CONSTANTS ──────────────────────────────────────────────────────
const TYPES = {
  study:    { label: "Study",    color: "#60A5FA", bg: "rgba(96,165,250,0.12)",   Icon: BookOpen  },
  workout:  { label: "Workout",  color: "#FB923C", bg: "rgba(251,146,60,0.12)",   Icon: Dumbbell  },
  work:     { label: "Work",     color: "#A78BFA", bg: "rgba(167,139,250,0.12)",  Icon: Briefcase },
  personal: { label: "Personal", color: "#34D399", bg: "rgba(52,211,153,0.12)",   Icon: Coffee    },
  health:   { label: "Health",   color: "#F472B6", bg: "rgba(244,114,182,0.12)",  Icon: Heart     },
  music:    { label: "Music",    color: "#FBBF24", bg: "rgba(251,191,36,0.12)",   Icon: Music     },
  other:    { label: "Other",    color: "#94A3B8", bg: "rgba(148,163,184,0.12)",  Icon: Star      },
};

const PRIORITIES = {
  high:   { label: "High",   color: "#EF4444" },
  medium: { label: "Medium", color: "#F59E0B" },
  low:    { label: "Low",    color: "#10B981"  },
};

const NOTE_PALS = [
  { bg: "#0a1628", accent: "#60A5FA" },
  { bg: "#160a28", accent: "#A78BFA" },
  { bg: "#0a2818", accent: "#34D399" },
  { bg: "#281a0a", accent: "#FB923C" },
  { bg: "#280a18", accent: "#F472B6" },
  { bg: "#102808", accent: "#4ADE80" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am–9pm

const QUOTES = [
  "Small steps every day lead to big results.",
  "Progress over perfection — always.",
  "Show up. That's already half the battle.",
  "Your future self is watching. Make them proud.",
  "Done is better than perfect.",
  "Consistency beats intensity every time.",
  "One task at a time. You've got this.",
];

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt2 = (n) => String(n).padStart(2, "0");
const toDay = () => new Date().toISOString().slice(0, 10);
const fmt12 = (h) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
const fmtH  = (h) => h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h - 12}PM`;

// ─── SAMPLE DATA ────────────────────────────────────────────────────
const INIT_TASKS = [
  { id: uid(), title: "Review Chapter 5 Notes", desc: "Calculus & Linear Algebra", type: "study",   priority: "high",   due: toDay(), done: false },
  { id: uid(), title: "Morning Run 5km",          desc: "Around the park",          type: "workout", priority: "medium", due: toDay(), done: true  },
  { id: uid(), title: "Team Standup Meeting",     desc: "Daily sync at 10 AM",      type: "work",    priority: "high",   due: toDay(), done: false },
  { id: uid(), title: "Read Novel",               desc: "30 min before bed",        type: "personal",priority: "low",    due: toDay(), done: false },
  { id: uid(), title: "Take Vitamins",            desc: "With breakfast",           type: "health",  priority: "medium", due: toDay(), done: true  },
];
const INIT_EVENTS = [
  { id: uid(), title: "Project Deadline",   date: toDay(),                                       time: "14:00", type: "work",    desc: "Submit final report"    },
  { id: uid(), title: "Doctor Checkup",     date: new Date(Date.now()+864e5).toISOString().slice(0,10), time: "10:30", type: "health",  desc: "Annual appointment"     },
  { id: uid(), title: "Study Group",        date: new Date(Date.now()+2*864e5).toISOString().slice(0,10), time: "15:00", type: "study",   desc: "Library Room 204"       },
];
const INIT_TT = [
  { id: uid(), day:"Mon", start:9,  end:10, subject:"Mathematics",    type:"study",    room:"Room 101", done:false },
  { id: uid(), day:"Mon", start:11, end:12, subject:"Physics",        type:"study",    room:"Lab 3",    done:false },
  { id: uid(), day:"Mon", start:14, end:15, subject:"History",        type:"study",    room:"Room 305", done:true  },
  { id: uid(), day:"Tue", start:9,  end:11, subject:"English Lit",    type:"study",    room:"Room 204", done:false },
  { id: uid(), day:"Tue", start:13, end:14, subject:"Art Class",      type:"personal", room:"Studio B", done:false },
  { id: uid(), day:"Wed", start:8,  end:9,  subject:"Morning Workout",type:"workout",  room:"Gym",      done:true  },
  { id: uid(), day:"Wed", start:10, end:12, subject:"Chemistry",      type:"study",    room:"Lab 1",    done:false },
  { id: uid(), day:"Thu", start:9,  end:10, subject:"Mathematics",    type:"study",    room:"Room 101", done:false },
  { id: uid(), day:"Thu", start:14, end:15, subject:"Team Meeting",   type:"work",     room:"Conf Rm",  done:false },
  { id: uid(), day:"Fri", start:10, end:12, subject:"Physics Lab",    type:"study",    room:"Lab 3",    done:false },
  { id: uid(), day:"Fri", start:13, end:14, subject:"Music Theory",   type:"music",    room:"Room 202", done:false },
  { id: uid(), day:"Sat", start:10, end:11, subject:"Guitar Practice",type:"music",    room:"Studio",   done:false },
  { id: uid(), day:"Sun", start:11, end:12, subject:"Yoga",           type:"health",   room:"Park",     done:false },
];
const INIT_NOTES = [
  { id: uid(), title: "Ideas 💡",    body: "Build a habit tracker app. Add dark mode. Explore new frameworks and tools.",   pal: 0 },
  { id: uid(), title: "Shopping 🛒", body: "Milk, Eggs, Bread, Coffee, Fruits, Vegetables, Chicken, Pasta, Olive Oil",      pal: 2 },
  { id: uid(), title: "Goals 🎯",    body: "Complete 3 chapters per week. Solve 20 problems daily. Stay consistent always.", pal: 1 },
  { id: uid(), title: "Quotes ✨",   body: '"The expert was once a beginner." Start before you are ready. Trust the process.', pal: 3 },
];

// ─── STYLES ─────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #05080f; --surf: #0b1120; --card: rgba(255,255,255,0.04);
  --card-h: rgba(255,255,255,0.07); --bdr: rgba(255,255,255,0.08);
  --bdr2: rgba(255,255,255,0.14); --t1: #e2e8ff; --t2: #8896b3; --t3: #3d4f6e;
  --acc: #5b8af8; --acc-g: rgba(91,138,248,0.25); --nav: 68px;
  --f: 'Outfit',sans-serif; --fb: 'DM Sans',sans-serif;
}
html,body { background: var(--bg); font-family: var(--fb); color: var(--t1); height:100%; overflow:hidden; -webkit-font-smoothing:antialiased; }
#root { height:100%; }
.shell { max-width:430px; margin:0 auto; height:100vh; height:100dvh; display:flex; flex-direction:column; background:var(--bg); position:relative; overflow:hidden; }

/* ── Loading ── */
.load { position:fixed; inset:0; background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:9999; gap:28px; transition:opacity .4s; }
.load-ring-wrap { position:relative; width:96px; height:96px; display:flex; align-items:center; justify-content:center; }
.lr1 { position:absolute; inset:0; border-radius:50%; border:2.5px solid transparent; border-top-color:var(--acc); border-right-color:rgba(91,138,248,.3); animation:spin 1.1s linear infinite; }
.lr2 { position:absolute; inset:10px; border-radius:50%; border:2px solid transparent; border-bottom-color:#f472b6; border-left-color:rgba(244,114,182,.2); animation:spin 1.7s linear infinite reverse; }
.lr3 { position:absolute; inset:20px; border-radius:50%; border:1.5px solid transparent; border-top-color:#fbbf24; animation:spin 2.3s linear infinite; }
.load-icon { width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#1a2d5a,#0c1830); display:flex; align-items:center; justify-content:center; box-shadow:0 0 30px var(--acc-g); animation:glow 2.5s ease-in-out infinite; }
.load-name { font-family:var(--f); font-size:30px; font-weight:900; letter-spacing:-1px; background:linear-gradient(135deg,#fff 20%,#8ab4ff 80%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.load-sub { font-size:11px; color:var(--t2); letter-spacing:3px; text-transform:uppercase; margin-top:-22px; }
.load-track { width:180px; height:3px; background:var(--bdr); border-radius:99px; overflow:hidden; }
.load-fill { height:100%; background:linear-gradient(90deg,var(--acc),#f472b6); border-radius:99px; transition:width .15s ease; box-shadow:0 0 8px var(--acc-g); }

/* ── Layout ── */
.scroll { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; }
.scroll::-webkit-scrollbar { display:none; }
.p-in { padding:16px; }
.page { animation:pageIn .22s ease; }

/* ── Cards ── */
.card { background:var(--card); border:1px solid var(--bdr); border-radius:14px; transition:all .2s; }
.card:active { transform:scale(.98); background:var(--card-h); }

/* ── Buttons ── */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:9px 16px; border:none; cursor:pointer; border-radius:11px; font-family:var(--fb); font-size:13px; font-weight:500; transition:all .15s; -webkit-tap-highlight-color:transparent; }
.btn:active { transform:scale(.94); }
.bp { background:var(--acc); color:#fff; box-shadow:0 4px 14px var(--acc-g); }
.bp:hover { background:#6b9aff; }
.bg { background:var(--card); color:var(--t2); border:1px solid var(--bdr); }
.bg:hover { background:var(--card-h); color:var(--t1); }
.bd { background:rgba(239,68,68,.12); color:#ef4444; border:1px solid rgba(239,68,68,.2); }
.icon-btn { width:32px; height:32px; padding:0; border-radius:9px; }

/* ── FAB ── */
.fab { position:absolute; right:20px; bottom:calc(var(--nav) + 14px); width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,var(--acc),#7c3aed); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px var(--acc-g),0 0 0 1px rgba(255,255,255,.1); transition:all .2s; z-index:50; -webkit-tap-highlight-color:transparent; }
.fab:active { transform:scale(.88) rotate(-90deg); }
.fab:hover { transform:translateY(-2px); box-shadow:0 12px 28px var(--acc-g); }

/* ── Bottom Nav ── */
.bnav { height:var(--nav); background:rgba(11,17,32,.96); border-top:1px solid var(--bdr); display:flex; align-items:center; padding:0 6px; backdrop-filter:blur(20px); flex-shrink:0; }
.ni { flex:1; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; cursor:pointer; border:none; background:none; -webkit-tap-highlight-color:transparent; transition:all .15s; border-radius:10px; padding:6px 0; }
.ni:active { transform:scale(.88); }
.ni-iw { width:34px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:9px; transition:all .2s; }
.ni.act .ni-iw { background:var(--acc-g); }
.ni-lbl { font-size:10px; font-family:var(--f); font-weight:500; transition:color .2s; }

/* ── Inputs ── */
.inp { width:100%; background:rgba(255,255,255,.05); border:1.5px solid var(--bdr2); border-radius:11px; padding:11px 13px; color:var(--t1); font-family:var(--fb); font-size:14px; outline:none; transition:border-color .2s,box-shadow .2s; }
.inp:focus { border-color:var(--acc); box-shadow:0 0 0 3px var(--acc-g); }
.inp::placeholder { color:var(--t3); }
select.inp { appearance:none; }
input[type=date].inp, input[type=time].inp { color-scheme:dark; }

/* ── Modal ── */
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(10px); z-index:200; display:flex; align-items:flex-end; animation:fadeIn .2s; }
.sheet { width:100%; max-width:430px; margin:0 auto; background:#0b1120; border-radius:22px 22px 0 0; border-top:1px solid var(--bdr2); padding:0 0 36px; animation:slideUp .28s cubic-bezier(.34,1.4,.64,1); max-height:92vh; overflow-y:auto; }
.sheet::-webkit-scrollbar { display:none; }
.handle { width:34px; height:4px; background:var(--bdr2); border-radius:99px; margin:10px auto 18px; }

/* ── Task Card ── */
.tc { display:flex; align-items:flex-start; gap:11px; padding:13px 14px; background:var(--card); border:1px solid var(--bdr); border-radius:13px; transition:all .2s; }
.tc:active { transform:scale(.98); }
.chk { width:22px; height:22px; border-radius:7px; border:2px solid var(--bdr2); flex-shrink:0; display:flex; align-items:center; justify-content:center; margin-top:1px; transition:all .2s; cursor:pointer; background:none; }
.chk.on { background:#10b981; border-color:#10b981; animation:pop .3s ease; }

/* ── Calendar ── */
.cd { aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:10px; font-size:12.5px; font-family:var(--f); font-weight:500; cursor:pointer; transition:all .15s; flex-direction:column; gap:2px; }
.cd:active { transform:scale(.88); }
.cd.tod { background:var(--acc); color:#fff; font-weight:800; }
.cd.sel:not(.tod) { background:rgba(91,138,248,.18); border:1.5px solid var(--acc); color:var(--acc); }
.cd.dim { opacity:.28; pointer-events:none; }
.e-dot { width:4px; height:4px; border-radius:50%; background:#f472b6; }

/* ── Chip ── */
.chip { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:600; font-family:var(--f); }

/* ── Focus Timer ── */
.timer-ring { position:relative; display:flex; align-items:center; justify-content:center; }
.timer-svg { transform:rotate(-90deg); }
.timer-track { fill:none; stroke:var(--bdr2); stroke-width:4; }
.timer-prog { fill:none; stroke:url(#tgrad); stroke-width:4; stroke-linecap:round; transition:stroke-dashoffset .5s ease; }

/* ── Stat card ── */
.sc { background:var(--card); border:1px solid var(--bdr); border-radius:13px; padding:13px 12px; display:flex; flex-direction:column; gap:5px; }

/* ── Animations ── */
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes glow { 0%,100% { box-shadow:0 0 20px var(--acc-g); } 50% { box-shadow:0 0 40px var(--acc-g),0 0 60px rgba(244,114,182,.15); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
@keyframes pageIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes pop { 0%,100% { transform:scale(1); } 50% { transform:scale(1.35); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
@keyframes slideInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

/* ── Misc ── */
.label { display:block; font-size:11.5px; font-weight:600; color:var(--t2); margin-bottom:5px; letter-spacing:.4px; font-family:var(--f); text-transform:uppercase; }
.section-title { font-size:11px; font-weight:700; color:var(--t2); text-transform:uppercase; letter-spacing:1.2px; margin-bottom:10px; font-family:var(--f); }
`;

// ─── HOME PAGE ───────────────────────────────────────────────────────
function HomePage({ tasks, time }) {
  const h = time.getHours();
  const greeting = h < 5 ? "Good Night" : h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  const emoji = h < 5 ? "🌙" : h < 12 ? "☀️" : h < 17 ? "🌤️" : "🌙";
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  const todayT = tasks.filter((t) => t.due === toDay());
  const done = todayT.filter((t) => t.done).length;
  const total = todayT.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const top = tasks.find((t) => !t.done && t.priority === "high");

  // Focus Timer
  const PRESETS = [{ l: "25 min", s: 1500 }, { l: "15 min", s: 900 }, { l: "5 min", s: 300 }];
  const [preset, setPreset] = useState(0);
  const [secs, setSecs] = useState(PRESETS[0].s);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const total_s = PRESETS[preset].s;
  const R = 42, C = 2 * Math.PI * R;
  const offset = C - (secs / total_s) * C;

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs((p) => { if (p <= 1) { clearInterval(ref.current); setRunning(false); return 0; } return p - 1; }), 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const selectPreset = (i) => { setPreset(i); setSecs(PRESETS[i].s); setRunning(false); };
  const timerMins = fmt2(Math.floor(secs / 60));
  const timerSecs = fmt2(secs % 60);

  // Streak dots (last 7 days visual)
  const streak = [1,1,1,0,1,1,1];

  return (
    <div className="page p-in" style={{ paddingBottom: 24 }}>
      {/* Clock */}
      <div style={{ textAlign: "center", padding: "18px 0 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(91,138,248,.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 66, fontFamily: "var(--f)", fontWeight: 900, letterSpacing: -3, lineHeight: 1, color: "var(--t1)" }}>
          {fmt2(h)}<span style={{ color: "var(--acc)", animation: "pulse 1s ease-in-out infinite", display: "inline-block" }}>:</span>{fmt2(time.getMinutes())}
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", fontFamily: "var(--f)", fontWeight: 400, marginTop: 8, letterSpacing: .3 }}>
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][time.getDay()]} · {MONTHS[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{ fontSize: 15, fontFamily: "var(--f)", fontWeight: 600 }}>{greeting}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", marginTop: 8, fontStyle: "italic", padding: "0 28px", lineHeight: 1.5 }}>"{quote}"</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 16 }}>
        {[
          { l: "Today",  v: total,        c: "#60A5FA", icon: <Target size={15}/> },
          { l: "Done",   v: done,         c: "#34D399", icon: <Check size={15}/> },
          { l: "Pending",v: total - done, c: "#FB923C", icon: <Clock size={15}/> },
        ].map((s) => (
          <div key={s.l} className="sc" style={{ animation: "slideInUp .3s ease" }}>
            <div style={{ color: s.c }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontFamily: "var(--f)", fontWeight: 800, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="card" style={{ padding: "13px 15px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--f)" }}>Daily Progress</span>
            <span style={{ fontSize: 13, color: "var(--acc)", fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: "var(--bdr)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--acc),#34D399)", borderRadius: 99, transition: "width .6s ease", boxShadow: "0 0 8px var(--acc-g)" }} />
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="card" style={{ padding: "12px 15px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <Flame size={20} color="#FB923C" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--f)", color: "var(--t2)", marginBottom: 6 }}>WEEKLY STREAK</div>
          <div style={{ display: "flex", gap: 5 }}>
            {streak.map((on, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: on ? "linear-gradient(135deg,#FB923C,#FBBF24)" : "var(--bdr)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "var(--f)", fontWeight: 700, color: on ? "#fff" : "var(--t3)" }}>
                {["M","T","W","T","F","S","S"][i]}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontFamily: "var(--f)", fontWeight: 800, color: "#FB923C" }}>6</div>
          <div style={{ fontSize: 10, color: "var(--t2)" }}>days</div>
        </div>
      </div>

      {/* Focus Timer */}
      <div className="card" style={{ padding: "16px 15px", marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>⚡ Focus Timer</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => selectPreset(i)} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${preset === i ? "var(--acc)" : "var(--bdr)"}`,
              background: preset === i ? "var(--acc-g)" : "transparent",
              color: preset === i ? "var(--acc)" : "var(--t2)", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--f)", cursor: "pointer", transition: "all .15s"
            }}>{p.l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="timer-ring">
            <svg width={100} height={100} className="timer-svg">
              <defs>
                <linearGradient id="tgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--acc)"/><stop offset="100%" stopColor="#f472b6"/>
                </linearGradient>
              </defs>
              <circle cx={50} cy={50} r={R} className="timer-track"/>
              <circle cx={50} cy={50} r={R} className="timer-prog" strokeDasharray={C} strokeDashoffset={offset}/>
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "var(--f)", fontWeight: 800 }}>{timerMins}:{timerSecs}</div>
              <div style={{ fontSize: 9, color: "var(--t2)", fontWeight: 600, letterSpacing: .5 }}>FOCUS</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn bp" onClick={() => setRunning((r) => !r)} style={{ width: "100%", height: 40 }}>
              {running ? <><Pause size={14}/> Pause</> : <><Play size={14}/> {secs < total_s && secs > 0 ? "Resume" : "Start"}</>}
            </button>
            <button className="btn bg" onClick={() => { setSecs(PRESETS[preset].s); setRunning(false); }} style={{ width: "100%", height: 36 }}>
              <RotateCcw size={13}/> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Priority Focus */}
      {top && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title">🔥 Priority Focus</div>
          <div className="card" style={{ padding: 14, borderLeft: `3px solid ${TYPES[top.type].color}` }}>
            <div style={{ fontFamily: "var(--f)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{top.title}</div>
            {top.desc && <div style={{ fontSize: 12, color: "var(--t2)" }}>{top.desc}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <span className="chip" style={{ background: TYPES[top.type].bg, color: TYPES[top.type].color }}>{TYPES[top.type].label}</span>
              <span className="chip" style={{ background: "rgba(239,68,68,.12)", color: "#ef4444" }}>High Priority</span>
            </div>
          </div>
        </div>
      )}

      {/* Today tasks */}
      <div className="section-title">📋 Today's Tasks</div>
      {todayT.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 13, color: "var(--t2)" }}>All clear! Enjoy your day.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {todayT.map((t) => (
            <div key={t.id} className="tc" style={{ opacity: t.done ? .5 : 1, borderLeft: `2.5px solid ${TYPES[t.type].color}` }}>
              <div className={`chk ${t.done ? "on" : ""}`} style={{ borderColor: t.done ? "#10b981" : TYPES[t.type].color }}>
                {t.done && <Check size={12} color="#fff"/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: "var(--f)", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--t2)" : "var(--t1)" }}>{t.title}</div>
                {t.desc && <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2 }}>{t.desc}</div>}
              </div>
              <span className="chip" style={{ background: TYPES[t.type].bg, color: TYPES[t.type].color, fontSize: 10 }}>{TYPES[t.type].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TASKS PAGE ─────────────────────────────────────────────────────
function TasksPage({ tasks, setTasks, openModal }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showDone, setShowDone] = useState(true);

  const filtered = tasks.filter((t) => {
    const mT = filter === "all" || t.type === filter;
    const mS = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return mT && mS;
  });
  const active = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  const toggle = (id) => setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const del = (id) => setTasks((p) => p.filter((t) => t.id !== id));

  return (
    <div className="page p-in" style={{ paddingBottom: 24 }}>
      <div style={{ position: "relative", marginBottom: 13 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }}/>
        <input className="inp" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34 }}/>
      </div>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
        {["all", ...Object.keys(TYPES)].map((k) => {
          const T = TYPES[k];
          const on = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              flexShrink: 0, padding: "5px 13px", borderRadius: 99, cursor: "pointer", transition: "all .15s",
              border: `1.5px solid ${on ? (k === "all" ? "var(--acc)" : T.color) : "var(--bdr)"}`,
              background: on ? (k === "all" ? "var(--acc-g)" : T.bg) : "transparent",
              color: on ? (k === "all" ? "var(--acc)" : T.color) : "var(--t2)",
              fontSize: 12, fontWeight: 600, fontFamily: "var(--f)",
            }}>{k === "all" ? "All" : T.label}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 11, fontWeight: 500 }}>
        {active.length} pending · {done.length} completed
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {active.length === 0 && done.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--t2)" }}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14 }}>No tasks found</div>
          </div>
        ) : null}
        {active.map((t) => <TaskRow key={t.id} task={t} onToggle={toggle} onDelete={del} onEdit={() => openModal("task", t)}/>)}
        {done.length > 0 && (
          <>
            <button onClick={() => setShowDone((v) => !v)} style={{ background: "none", border: "none", color: "var(--t2)", fontSize: 12, fontFamily: "var(--f)", fontWeight: 600, cursor: "pointer", textAlign: "left", padding: "4px 2px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10 }}>{showDone ? "▼" : "▶"}</span> Completed ({done.length})
            </button>
            {showDone && done.map((t) => <TaskRow key={t.id} task={t} onToggle={toggle} onDelete={del} onEdit={() => openModal("task", t)}/>)}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task: t, onToggle, onDelete, onEdit }) {
  const T = TYPES[t.type] || TYPES.other;
  const P = PRIORITIES[t.priority];
  return (
    <div className="tc" style={{ borderLeft: `3px solid ${T.color}`, opacity: t.done ? .55 : 1 }}>
      <button className={`chk ${t.done ? "on" : ""}`} onClick={() => onToggle(t.id)} style={{ borderColor: t.done ? "#10b981" : T.color }}>
        {t.done && <Check size={12} color="#fff"/>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--f)", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--t2)" : "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
        {t.desc && <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>}
        <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
          <span className="chip" style={{ background: T.bg, color: T.color }}>{T.label}</span>
          <span className="chip" style={{ background: `${P.color}18`, color: P.color }}>{P.label}</span>
          {t.due && <span className="chip" style={{ background: "var(--card)", color: "var(--t2)", border: "1px solid var(--bdr)", fontSize: 10 }}>{t.due === toDay() ? "📅 Today" : `📅 ${t.due}`}</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button className="btn bg icon-btn" onClick={onEdit}><Edit2 size={12}/></button>
        <button className="btn bd icon-btn" onClick={() => onDelete(t.id)}><Trash2 size={12}/></button>
      </div>
    </div>
  );
}

// ─── CALENDAR PAGE ───────────────────────────────────────────────────
function CalendarPage({ events, setEvents, openModal }) {
  const [view, setView] = useState(new Date());
  const [sel, setSel] = useState(toDay());

  const yr = view.getFullYear(), mo = view.getMonth();
  const first = new Date(yr, mo, 1).getDay();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const pDim = new Date(yr, mo, 0).getDate();
  const off = (first + 6) % 7;

  const cells = [];
  for (let i = 0; i < off; i++) cells.push({ d: pDim - off + i + 1, dt: null, other: true });
  for (let i = 1; i <= dim; i++) cells.push({ d: i, dt: `${yr}-${fmt2(mo + 1)}-${fmt2(i)}`, other: false });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - dim - off + 1, dt: null, other: true });

  const evFor = (dt) => events.filter((e) => e.date === dt);
  const selEv = events.filter((e) => e.date === sel).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="page p-in" style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button className="btn bg icon-btn" style={{ width: 36, height: 36, borderRadius: 10 }} onClick={() => setView(new Date(yr, mo - 1, 1))}><ChevronLeft size={17}/></button>
        <div style={{ fontFamily: "var(--f)", fontWeight: 800, fontSize: 17 }}>{MONTHS[mo]} {yr}</div>
        <button className="btn bg icon-btn" style={{ width: 36, height: 36, borderRadius: 10 }} onClick={() => setView(new Date(yr, mo + 1, 1))}><ChevronRight size={17}/></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: i >= 5 ? "#f472b6" : "var(--t2)", paddingBottom: 6, fontFamily: "var(--f)" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 20 }}>
        {cells.map((c, i) => {
          const iT = c.dt === toDay(), iS = c.dt === sel, hasEv = c.dt && evFor(c.dt).length > 0;
          return (
            <div key={i} className={`cd ${iT ? "tod" : ""} ${iS && !iT ? "sel" : ""} ${c.other ? "dim" : ""}`} onClick={() => c.dt && setSel(c.dt)}>
              {c.d}{hasEv && !iT && <div className="e-dot"/>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--f)", fontWeight: 700, fontSize: 14 }}>{sel === toDay() ? "Today" : sel}</div>
        <button className="btn bp" onClick={() => openModal("event", { date: sel })} style={{ height: 30, fontSize: 12, padding: "0 13px" }}>+ Event</button>
      </div>
      {selEv.length === 0 ? (
        <div className="card" style={{ padding: 22, textAlign: "center", color: "var(--t2)", fontSize: 13 }}>No events on this day</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selEv.map((ev) => {
            const T = TYPES[ev.type] || TYPES.other;
            return (
              <div key={ev.id} className="card" style={{ padding: "13px 14px", display: "flex", gap: 12, borderLeft: `3px solid ${T.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f)", fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
                  {ev.desc && <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{ev.desc}</div>}
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                    <span className="chip" style={{ background: T.bg, color: T.color }}>{T.label}</span>
                    <span className="chip" style={{ background: "rgba(255,255,255,.06)", color: "var(--t2)", border: "1px solid var(--bdr)" }}>🕐 {ev.time}</span>
                  </div>
                </div>
                <button className="btn bd icon-btn" onClick={() => setEvents((p) => p.filter((e) => e.id !== ev.id))}><Trash2 size={12}/></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TIMETABLE PAGE ──────────────────────────────────────────────────
const TT_START = 7;   // 7 AM
const TT_END   = 21;  // 9 PM
const TT_HOURS = Array.from({ length: TT_END - TT_START }, (_, i) => i + TT_START);
const CELL_W   = 72;  // px per hour column
const DAY_W    = 46;  // px for the day-label column

function TimetablePage({ timetable, setTimetable, openModal }) {
  const todayIdx = new Date().getDay();
  const todayDay = WEEK[todayIdx === 0 ? 6 : todayIdx - 1];
  const [selSlot, setSelSlot] = useState(null); // id of slot showing action menu

  const toggle = (id) => setTimetable((p) => p.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  const del    = (id) => { setTimetable((p) => p.filter((s) => s.id !== id)); setSelSlot(null); };

  // Stats
  const total = timetable.length;
  const done  = timetable.filter((s) => s.done).length;

  const nowH = new Date().getHours();
  const nowPct = ((nowH - TT_START) / (TT_END - TT_START)) * 100;

  return (
    <div className="page" style={{ paddingBottom: 24 }}>

      {/* Top bar */}
      <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontFamily: "var(--f)", fontWeight: 900, color: "var(--acc)", lineHeight: 1 }}>{done}</div>
            <div style={{ fontSize: 10, color: "var(--t2)", fontWeight: 600, letterSpacing: .5 }}>DONE</div>
          </div>
          <div style={{ width: 1, background: "var(--bdr)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontFamily: "var(--f)", fontWeight: 900, color: "var(--t1)", lineHeight: 1 }}>{total - done}</div>
            <div style={{ fontSize: 10, color: "var(--t2)", fontWeight: 600, letterSpacing: .5 }}>LEFT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--t2)", fontStyle: "italic" }}>Tap cell to complete</div>
          <button className="btn bp" onClick={() => openModal("timetable", {})} style={{ height: 32, fontSize: 12, padding: "0 13px" }}>+ Class</button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ height: 4, background: "var(--bdr)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((done / total) * 100)}%`, background: "linear-gradient(90deg,var(--acc),#10b981)", borderRadius: 99, transition: "width .5s ease" }} />
          </div>
        </div>
      )}

      {/* ── GRID ── */}
      <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 6 }}>
        <div style={{ minWidth: DAY_W + TT_HOURS.length * CELL_W + 32, padding: "0 16px" }}>

          {/* Time header */}
          <div style={{ display: "flex", marginBottom: 4, paddingLeft: DAY_W }}>
            {TT_HOURS.map((h) => (
              <div key={h} style={{
                width: CELL_W, flexShrink: 0, textAlign: "center",
                fontSize: 9.5, color: h === nowH ? "var(--acc)" : "var(--t3)",
                fontFamily: "var(--f)", fontWeight: h === nowH ? 800 : 600,
                letterSpacing: .3,
              }}>
                {fmtH(h)}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {WEEK.map((day) => {
            const isToday = day === todayDay;
            const daySlots = timetable.filter((s) => s.day === day);
            const allDone  = daySlots.length > 0 && daySlots.every((s) => s.done);

            return (
              <div key={day} style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
                {/* Day label */}
                <div style={{
                  width: DAY_W, flexShrink: 0, height: 52,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: isToday ? "var(--acc)" : allDone ? "rgba(16,185,129,.15)" : "var(--card)",
                    border: `1.5px solid ${isToday ? "var(--acc)" : allDone ? "#10b981" : "var(--bdr)"}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f)", fontWeight: 800, fontSize: 11,
                    color: isToday ? "#fff" : allDone ? "#10b981" : "var(--t2)",
                    transition: "all .3s",
                  }}>
                    {day}
                    {allDone && <Check size={9} color="#10b981" style={{ marginTop: 1 }}/>}
                  </div>
                </div>

                {/* Hour cells + slot blocks */}
                <div style={{ position: "relative", height: 52, flex: 1 }}>

                  {/* Grid lines */}
                  <div style={{ position: "absolute", inset: 0, display: "flex" }}>
                    {TT_HOURS.map((h, i) => (
                      <div key={h} style={{
                        width: CELL_W, flexShrink: 0, height: "100%",
                        borderLeft:   `1px solid ${h === nowH && isToday ? "rgba(91,138,248,.35)" : "var(--bdr)"}`,
                        borderTop:    "1px solid var(--bdr)",
                        borderBottom: "1px solid var(--bdr)",
                        background:   h === nowH && isToday ? "rgba(91,138,248,.04)" : "transparent",
                        ...(i === TT_HOURS.length - 1 ? { borderRight: "1px solid var(--bdr)" } : {}),
                      }} />
                    ))}
                  </div>

                  {/* Now line */}
                  {isToday && nowH >= TT_START && nowH < TT_END && (
                    <div style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: (nowH - TT_START) * CELL_W,
                      width: 2, background: "var(--acc)",
                      boxShadow: "0 0 6px var(--acc-g)", zIndex: 5,
                      borderRadius: 99,
                    }} />
                  )}

                  {/* Timetable slot blocks */}
                  {daySlots.map((slot) => {
                    const T = TYPES[slot.type] || TYPES.other;
                    const left  = (slot.start - TT_START) * CELL_W;
                    const width = (slot.end - slot.start) * CELL_W - 4;
                    if (slot.start < TT_START || slot.end > TT_END) return null;
                    const isActive = selSlot === slot.id;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => { toggle(slot.id); }}
                        onContextMenu={(e) => { e.preventDefault(); setSelSlot(isActive ? null : slot.id); }}
                        style={{
                          position: "absolute", left: left + 2, top: 4, bottom: 4,
                          width, borderRadius: 9, overflow: "hidden",
                          background: slot.done
                            ? "rgba(16,185,129,0.15)"
                            : isActive ? T.bg : `${T.color}18`,
                          border: `1.5px solid ${slot.done ? "#10b981" : isActive ? T.color : `${T.color}60`}`,
                          cursor: "pointer",
                          transition: "all .2s",
                          transform: isActive ? "translateY(-1px)" : "none",
                          boxShadow: isActive ? `0 4px 14px ${T.color}30` : "none",
                          zIndex: isActive ? 10 : 1,
                          display: "flex", flexDirection: "column", justifyContent: "center",
                          padding: "0 7px",
                          userSelect: "none",
                        }}
                      >
                        {/* Done overlay stripe */}
                        {slot.done && (
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(16,185,129,.06) 4px,rgba(16,185,129,.06) 8px)",
                            borderRadius: 7,
                          }} />
                        )}
                        <div style={{
                          fontSize: width > 80 ? 11 : 9, fontWeight: 800,
                          fontFamily: "var(--f)",
                          color: slot.done ? "#10b981" : T.color,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          textDecoration: slot.done ? "line-through" : "none",
                          position: "relative",
                        }}>
                          {slot.done ? "✓ " : ""}{slot.subject}
                        </div>
                        {slot.room && width > 88 && (
                          <div style={{ fontSize: 9, color: "var(--t2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1, position: "relative" }}>
                            {slot.room}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {Object.entries(TYPES).slice(0,4).map(([k, v]) => (
            <span key={k} className="chip" style={{ background: v.bg, color: v.color, fontSize: 10 }}>{v.label}</span>
          ))}
          <span style={{ fontSize: 10, color: "var(--t3)" }}>· tap to complete</span>
        </div>

        <div className="section-title" style={{ marginBottom: 10 }}>All Classes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[...timetable]
            .sort((a, b) => WEEK.indexOf(a.day) - WEEK.indexOf(b.day) || a.start - b.start)
            .map((s) => {
              const T = TYPES[s.type] || TYPES.other;
              return (
                <div key={s.id} className="card" style={{
                  padding: "10px 13px", display: "flex", alignItems: "center", gap: 11,
                  borderLeft: `3px solid ${s.done ? "#10b981" : T.color}`,
                  opacity: s.done ? .6 : 1, transition: "all .2s",
                }}>
                  {/* Done toggle */}
                  <button
                    onClick={() => toggle(s.id)}
                    style={{
                      width: 22, height: 22, borderRadius: 7, border: `2px solid ${s.done ? "#10b981" : T.color}`,
                      background: s.done ? "#10b981" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, transition: "all .2s",
                    }}
                  >
                    {s.done && <Check size={11} color="#fff"/>}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--f)", fontWeight: 700, fontSize: 13,
                      textDecoration: s.done ? "line-through" : "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{s.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
                      <span style={{ fontWeight: 700, color: s.day === todayDay ? "var(--acc)" : "var(--t2)" }}>{s.day}</span>
                      {" · "}{fmtH(s.start)}–{fmtH(s.end)}{s.room ? ` · ${s.room}` : ""}
                    </div>
                  </div>
                  <span className="chip" style={{ background: T.bg, color: T.color, fontSize: 10 }}>{T.label}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn bg icon-btn" onClick={() => openModal("timetable", s)}><Edit2 size={11}/></button>
                    <button className="btn bd icon-btn" onClick={() => { setTimetable((p) => p.filter((x) => x.id !== s.id)); }}><Trash2 size={11}/></button>
                  </div>
                </div>
              );
          })}
          {timetable.length === 0 && (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 14 }}>No classes added yet</div>
              <button className="btn bp" onClick={() => openModal("timetable", {})}>+ Add First Class</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NOTES PAGE ──────────────────────────────────────────────────────
function NotesPage({ notes, setNotes, openModal }) {
  const del = (id) => setNotes((p) => p.filter((n) => n.id !== id));
  const left = notes.filter((_, i) => i % 2 === 0);
  const right = notes.filter((_, i) => i % 2 === 1);

  const NoteCard = ({ n }) => {
    const P = NOTE_PALS[n.pal % NOTE_PALS.length];
    return (
      <div onClick={() => openModal("note", n)} style={{
        background: P.bg, border: `1px solid ${P.accent}28`, borderRadius: 16, padding: 15,
        marginBottom: 9, cursor: "pointer", transition: "all .2s", display: "block"
      }} onMouseDown={(e) => e.currentTarget.style.transform = "scale(.96)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onTouchStart={(e) => e.currentTarget.style.transform = "scale(.96)"}
        onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <div style={{ fontFamily: "var(--f)", fontWeight: 800, fontSize: 13.5, color: "var(--t1)", flex: 1, lineHeight: 1.3 }}>{n.title}</div>
          <button onClick={(e) => { e.stopPropagation(); del(n.id); }} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", padding: 0, flexShrink: 0 }}>
            <X size={13}/>
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 7, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</div>
        <div style={{ marginTop: 12, width: 22, height: 3, background: P.accent, borderRadius: 99, opacity: .8 }}/>
      </div>
    );
  };

  return (
    <div className="page p-in" style={{ paddingBottom: 24 }}>
      {notes.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
          <div style={{ fontSize: 14, color: "var(--t2)" }}>No notes yet. Tap + to add one!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <div>{left.map((n) => <NoteCard key={n.id} n={n}/>)}</div>
          <div>{right.map((n) => <NoteCard key={n.id} n={n}/>)}</div>
        </div>
      )}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────
function Modal({ modal, onClose, onSave }) {
  const { type, data } = modal;
  const isEdit = !!(data && data.id);

  const [form, setForm] = useState(() => {
    if (type === "task")      return { title: data?.title||"", desc: data?.desc||"", type: data?.type||"study", priority: data?.priority||"medium", due: data?.due||toDay() };
    if (type === "event")     return { title: data?.title||"", desc: data?.desc||"", type: data?.type||"work", date: data?.date||toDay(), time: data?.time||"09:00" };
    if (type === "timetable") return { day: data?.day||"Mon", subject: data?.subject||"", type: data?.type||"study", start: data?.start||9, end: data?.end||10, room: data?.room||"" };
    if (type === "note")      return { title: data?.title||"", body: data?.body||"", pal: data?.pal??0 };
    return {};
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (type === "task" && !form.title.trim()) return;
    if (type === "event" && !form.title.trim()) return;
    if (type === "timetable" && !form.subject.trim()) return;
    if (type === "note" && !form.title.trim()) return;
    onSave(type, { ...form, ...(isEdit ? { id: data.id } : { id: uid() }) });
    onClose();
  };

  const heading = { task: isEdit?"Edit Task":"New Task", event: isEdit?"Edit Event":"New Event", timetable: isEdit?"Edit Class":"New Class", note: isEdit?"Edit Note":"New Note" };
  const endHours = HOURS.filter((h) => h > (form.start || 9));

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="handle"/>
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--f)", fontWeight: 900, fontSize: 20 }}>{heading[type]}</div>
            <button className="btn bg" onClick={onClose} style={{ width: 32, height: 32, padding: 0, borderRadius: 9 }}><X size={15}/></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

            {type === "task" && <>
              <div><label className="label">Task Title *</label><input className="inp" placeholder="What needs to be done?" value={form.title} onChange={(e) => set("title", e.target.value)}/></div>
              <div><label className="label">Description</label><input className="inp" placeholder="Optional details…" value={form.desc} onChange={(e) => set("desc", e.target.value)}/></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Type</label>
                  <select className="inp" value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div><label className="label">Priority</label>
                  <select className="inp" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                    {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Due Date</label><input className="inp" type="date" value={form.due} onChange={(e) => set("due", e.target.value)}/></div>
            </>}

            {type === "event" && <>
              <div><label className="label">Event Title *</label><input className="inp" placeholder="Event name…" value={form.title} onChange={(e) => set("title", e.target.value)}/></div>
              <div><label className="label">Description</label><input className="inp" placeholder="Details…" value={form.desc} onChange={(e) => set("desc", e.target.value)}/></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Date</label><input className="inp" type="date" value={form.date} onChange={(e) => set("date", e.target.value)}/></div>
                <div><label className="label">Time</label><input className="inp" type="time" value={form.time} onChange={(e) => set("time", e.target.value)}/></div>
              </div>
              <div><label className="label">Type</label>
                <select className="inp" value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </>}

            {type === "timetable" && <>
              <div><label className="label">Subject / Class *</label><input className="inp" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => set("subject", e.target.value)}/></div>
              <div><label className="label">Day</label>
                <select className="inp" value={form.day} onChange={(e) => set("day", e.target.value)}>
                  {WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Start Time</label>
                  <select className="inp" value={form.start} onChange={(e) => { const v = Number(e.target.value); set("start", v); if (form.end <= v) set("end", v + 1); }}>
                    {HOURS.map((h) => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
                <div><label className="label">End Time</label>
                  <select className="inp" value={form.end} onChange={(e) => set("end", Number(e.target.value))}>
                    {endHours.map((h) => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Type</label>
                  <select className="inp" value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div><label className="label">Room</label><input className="inp" placeholder="Room 101" value={form.room} onChange={(e) => set("room", e.target.value)}/></div>
              </div>
            </>}

            {type === "note" && <>
              <div><label className="label">Title *</label><input className="inp" placeholder="Note title…" value={form.title} onChange={(e) => set("title", e.target.value)}/></div>
              <div><label className="label">Content</label><textarea className="inp" placeholder="Write your note…" value={form.body} onChange={(e) => set("body", e.target.value)} rows={5} style={{ resize: "none" }}/></div>
              <div>
                <label className="label">Color Theme</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {NOTE_PALS.map((P, i) => (
                    <button key={i} onClick={() => set("pal", i)} style={{ width: 34, height: 34, borderRadius: 9, background: P.bg, border: `2.5px solid ${form.pal === i ? P.accent : "transparent"}`, cursor: "pointer", transition: "all .15s", transform: form.pal === i ? "scale(1.15)" : "scale(1)" }}/>
                  ))}
                </div>
              </div>
            </>}

            <button className="btn bp" onClick={save} style={{ width: "100%", height: 48, fontSize: 15, fontFamily: "var(--f)", fontWeight: 800, borderRadius: 13, marginTop: 4 }}>
              {isEdit ? "Save Changes" : "✦ Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────
const PAGE_TITLES = { home: null, tasks: "My Tasks", calendar: "Calendar", timetable: "Timetable", notes: "Notes" };
const PAGE_ICONS  = { home: Home, tasks: CheckSquare, calendar: Calendar, timetable: LayoutGrid, notes: FileText };

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [prog, setProg] = useState(0);
  const [page, setPage] = useState("home");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [events, setEvents] = useState(INIT_EVENTS);
  const [timetable, setTimetable] = useState(INIT_TT);
  const [notes, setNotes] = useState(INIT_NOTES);
  const [time, setTime] = useState(new Date());
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 22 + 8;
      if (p >= 100) { clearInterval(iv); setProg(100); setTimeout(() => setLoading(false), 450); }
      else setProg(Math.min(p, 92));
    }, 180);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const openModal = (type, data = {}) => setModal({ type, data });

  const handleSave = (type, data) => {
    const upsert = (arr, item) => item.id && arr.find((x) => x.id === item.id) ? arr.map((x) => x.id === item.id ? { ...x, ...item } : x) : [...arr, item];
    if (type === "task")      setTasks((p)     => upsert(p, { ...data, done: data.done ?? false }));
    if (type === "event")     setEvents((p)    => upsert(p, data));
    if (type === "timetable") setTimetable((p) => upsert(p, { done: false, ...data }));
    if (type === "note")      setNotes((p)     => upsert(p, data));
  };

  const FAB_TYPE = { home: "task", tasks: "task", calendar: "event", timetable: "timetable", notes: "note" };
  const navItems = [
    { id: "home",      label: "Home",     Icon: Home         },
    { id: "tasks",     label: "Tasks",    Icon: CheckSquare  },
    { id: "calendar",  label: "Calendar", Icon: Calendar     },
    { id: "timetable", label: "Schedule", Icon: LayoutGrid   },
    { id: "notes",     label: "Notes",    Icon: FileText     },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* Loading Screen */}
      {loading && (
        <div className="load">
          <div className="load-ring-wrap">
            <div className="lr1"/><div className="lr2"/><div className="lr3"/>
            <div className="load-icon">
              <Zap size={26} color="#5b8af8" strokeWidth={2.5}/>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="load-name">Chronos</div>
            <div className="load-sub">Productivity Suite</div>
          </div>
          <div className="load-track"><div className="load-fill" style={{ width: `${prog}%` }}/></div>
          <div style={{ fontSize: 11, color: "var(--t3)", letterSpacing: 1 }}>{Math.round(prog)}%</div>
        </div>
      )}

      {/* App */}
      {!loading && (
        <div className="shell">
          {/* Header for non-home pages */}
          {page !== "home" && (
            <div style={{ padding: "14px 20px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--f)", fontWeight: 900, fontSize: 22, letterSpacing: -.5 }}>{PAGE_TITLES[page]}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn bg" style={{ width: 34, height: 34, padding: 0, borderRadius: 9 }}><Bell size={15}/></button>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="scroll">
            {page === "home"      && <HomePage     tasks={tasks}       time={time}                        />}
            {page === "tasks"     && <TasksPage    tasks={tasks}       setTasks={setTasks}     openModal={openModal}/>}
            {page === "calendar"  && <CalendarPage events={events}     setEvents={setEvents}   openModal={openModal}/>}
            {page === "timetable" && <TimetablePage timetable={timetable} setTimetable={setTimetable} openModal={openModal}/>}
            {page === "notes"     && <NotesPage    notes={notes}       setNotes={setNotes}     openModal={openModal}/>}
          </div>

          {/* FAB */}
          <button className="fab" onClick={() => openModal(FAB_TYPE[page])}>
            <Plus size={23} color="#fff" strokeWidth={2.5}/>
          </button>

          {/* Bottom Nav */}
          <div className="bnav">
            {navItems.map(({ id, label, Icon }) => {
              const on = page === id;
              return (
                <button key={id} className={`ni ${on ? "act" : ""}`} onClick={() => setPage(id)}>
                  <div className="ni-iw"><Icon size={19} color={on ? "var(--acc)" : "var(--t3)"} strokeWidth={on ? 2.2 : 1.8}/></div>
                  <span className="ni-lbl" style={{ color: on ? "var(--acc)" : "var(--t3)" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal */}
          {modal && <Modal modal={modal} onClose={() => setModal(null)} onSave={handleSave}/>}
        </div>
      )}
    </>
  );
}
