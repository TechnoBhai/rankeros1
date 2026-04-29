import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── IDENTITY ─────────────────────────────────────────────────────────────────
const USER = { name: "Aaryan", target: "JEE 2027", role: "Drop Year", storagePrefix: "aaryan" };

// ─── EBBINGHAUS ───────────────────────────────────────────────────────────────
const EBBINGHAUS_DAYS = [1, 3, 7, 14, 30, 60];

// ─── SYLLABUS ────────────────────────────────────────────────────────────────
const CHAPTERS = {
  Mathematics: ["Basic Mathematics","Quadratic Equations","Sequence & Series","Trigonometric Functions","Trigonometric Equations","Permutations & Combinations","Binomial Theorem","Straight Lines","Circles","Conic - Parabola","Conic - Ellipse","Conic - Hyperbola","Determinants","Matrices","Sets","Relations & Functions","Inverse Trigonometric Functions","Limits, Continuity & Differentiability","Method of Differentiation","Application of Derivatives","Indefinite Integration","Definite Integration","Application of Integrals","Differential Equations","Vector Algebra","3D Geometry","Complex Numbers","Probability","Statistics","Solution of Triangle"],
  Physics: ["Mathematical Tools","Error in Measurements","Motion in Straight Line","Motion in a Plane","Relative Motion","Laws of Motion","Work, Energy & Power","Circular Motion","Centre of Mass & Collisions","Rotational Motion","Oscillations (SHM)","Ray Optics","Dual Nature","Atoms","Nuclei","Thermal Properties of Matter","Kinetic Theory of Gases","Thermodynamics","Mechanical Properties of Solids","Mechanical Properties of Fluids","Electric Charges & Fields","Electrostatic Potential & Capacitance","Gravitation","Current Electricity","Moving Charges & Magnetism","Magnetism & Matter","Electromagnetic Induction","Alternating Current","Waves","Electromagnetic Waves","Wave Optics","Semiconductors"],
  "Physical Chemistry": ["Mole Concept","Redox Reactions","Solutions","Chemical Kinetics","Thermodynamics","Chemical Equilibrium","Ionic Equilibrium","Atomic Structure","Electrochemistry","States of Matter","Solid State","Surface Chemistry"],
  "Organic Chemistry": ["IUPAC Nomenclature","General Organic Chemistry (GOC)","Isomerism","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols & Ethers","Aldehydes, Ketones & Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Environmental Chemistry"],
  "Inorganic Chemistry": ["Periodic Table & Properties","Chemical Bonding","Coordination Compounds","Salt Analysis","P-block Elements","d & f Block Elements","Metallurgy","s-block Elements","Hydrogen & its Compounds"]
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const stor = {
  set: async (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
  },
  get: async (k, fb) => {
    try {
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : fb;
    } catch(e) {
      return fb;
    }
  }
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const tod = () => new Date().toISOString().split("T")[0];
const fmt = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
const dAgo = d => Math.ceil((new Date(tod()) - new Date(d + "T00:00:00")) / 864e5);
const ck = (s, c) => `${s}|||${c}`;
const mkRev = (d) => EBBINGHAUS_DAYS.map(n => {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
});
const rid = () => Math.random().toString(36).slice(2, 8);
const P = USER.storagePrefix;

// ─── THEME: REGAIN GREEN ──────────────────────────────────────────────────────
const G1 = "#5cd62c";   // bright Regain green
const G2 = "#3aad0f";   // mid green
const G3 = "#1e6b04";   // deep green
const GGLOW = "#5cd62c22";
const GRAD = `linear-gradient(135deg, ${G2}, ${G1})`;

const T = {
  bg: "#000000",
  s1: "#0a0a0a",
  s2: "#111111",
  s3: "#181818",
  bd: "#222222",
  bd2: "#2e2e2e",
  grn: G1,
  grnd: G2,
  text: "#edf5e8",
  text2: "#b8d4a8",
  mut: "#5a7a4a",
  dim: "#333333",
  red: "#ff5252",
  yel: "#ffd166",
  blu: "#64b5f6",
  pur: "#ce93d8",
  org: "#ffb74d",
  pk: "#f48fb1",
};

const SC = {
  Mathematics: G1,
  Physics: "#64b5f6",
  "Physical Chemistry": "#ffb74d",
  "Organic Chemistry": "#ce93d8",
  "Inorganic Chemistry": "#f48fb1"
};

const LVL = {
  0: { label: "Not Started", c: "#111111", t: "#333333" },
  1: { label: "Level 1", c: "#0d1a00", t: G2 },
  2: { label: "Level 2", c: "#0d2000", t: "#4ab81e" },
  3: { label: "Level 3", c: "#0f2800", t: G1 }
};

const PRACTICE_TYPES = ["DPP","Module Qs","PYQs (Mains)","PYQs (Advanced)","Revision Qs","Level 3 Book","Chapter Test","Back Exercise"];

const css = {
  card: { background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: "18px 20px", marginBottom: 14 },
  lbl: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: T.mut, textTransform: "uppercase", marginBottom: 5, display: "block" },
  inp: { background: T.s1, border: `1px solid ${T.bd2}`, borderRadius: 8, color: T.text, padding: "9px 12px", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.15s" },
  btn: { background: GRAD, color: "#000000", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" },
  gst: { background: "transparent", color: T.mut, border: `1px solid ${T.bd2}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" },
  h1: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: T.text, margin: "0 0 4px", letterSpacing: "-0.02em" },
  h3: { fontSize: 10, fontWeight: 700, color: T.mut, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" },
  mut: { color: T.mut, fontSize: 12 },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  stat: { background: T.s1, border: `1px solid ${T.bd}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" },
  bdg: (c) => ({ background: c + "18", color: c, border: `1px solid ${c}40`, borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700, display: "inline-block", lineHeight: "1.5" }),
};

const defData = () => ({
  foundation: { confession: "", strategy: "", weakAreas: "" },
  logs: [],
  chapterData: {},
  tests: [],
  target: { dailyHours: 10, dailyLectures: 5, dailyQuestions: 50 }
});

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defData());

  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(lk);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const keys = ["foundation", "logs", "chapterData", "tests", "target"];
      const vals = await Promise.all(keys.map(k => stor.get(`${k}_${P}`, defData()[k])));
      const d = {};
      keys.forEach((k, i) => d[k] = vals[i]);
      setData(d);
      setLoading(false);
    })();
  }, []);

  const upd = useCallback(async (key, val) => {
    setData(prev => ({ ...prev, [key]: val }));
    await stor.set(`${key}_${P}`, val);
  }, []);

  const ctx = { tab, setTab, data, upd };

  const TABS = [
    { id: "dashboard", ic: "⬡", l: "DASH" },
    { id: "log", ic: "✎", l: "LOG" },
    { id: "syllabus", ic: "⊞", l: "SYLLABUS" },
    { id: "revisions", ic: "↻", l: "REVISIONS" },
    { id: "tests", ic: "◎", l: "TESTS" },
    { id: "analytics", ic: "▲", l: "STATS" },
    { id: "foundation", ic: "⚑", l: "BASE" }
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.bg, minHeight: "100vh", color: T.text }}>
      {/* HEADER */}
      <div style={{ background: T.s1, borderBottom: `1px solid ${T.bd}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: GRAD, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#000000", fontFamily: "monospace" }}>R</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "0.02em" }}>RANKER<span style={{ color: G1 }}>_OS</span></span>
          <span style={{ fontSize: 9, color: T.mut, background: T.s2, padding: "2px 7px", borderRadius: 4, border: `1px solid ${T.bd}`, letterSpacing: "0.08em" }}>AARYAN · JEE 2027</span>
        </div>
        <div style={{ fontSize: 11, color: T.mut, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(tod())}</div>
      </div>

      <div style={{ display: "flex" }}>
        {/* SIDEBAR */}
        <div style={{ width: 54, background: T.s1, borderRight: `1px solid ${T.bd}`, minHeight: "calc(100vh - 48px)", padding: "8px 0", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 48, height: "calc(100vh - 48px)", alignSelf: "flex-start", overflowY: "auto" }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              style={{ width: "100%", padding: "10px 0", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: tab === tb.id ? T.s2 : "transparent",
                color: tab === tb.id ? G1 : T.mut,
                borderLeft: tab === tb.id ? `2px solid ${G1}` : "2px solid transparent",
                transition: "all 0.15s"
              }}>
              <span style={{ fontSize: 13 }}>{tb.ic}</span>
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>{tb.l}</span>
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: "22px 24px", minWidth: 0 }}>
          {loading ? (
            <div style={{ padding: 80, textAlign: "center" }}>
              <div style={{ fontSize: 32, color: G1, fontFamily: "monospace", animation: "spin 1s linear infinite" }}>◌</div>
              <div style={{ marginTop: 10, fontSize: 13, color: T.mut }}>Loading data...</div>
            </div>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard ctx={ctx} />}
              {tab === "log" && <LogTab ctx={ctx} />}
              {tab === "syllabus" && <SyllabusTab ctx={ctx} />}
              {tab === "revisions" && <RevisionsTab ctx={ctx} />}
              {tab === "tests" && <TestsTab ctx={ctx} />}
              {tab === "analytics" && <AnalyticsTab ctx={ctx} />}
              {tab === "foundation" && <FoundationTab ctx={ctx} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══ DASHBOARD ════════════════════════════════════════════════════════════════
function Dashboard({ ctx }) {
  const { data, setTab } = ctx;
  const { logs, chapterData, tests, target } = data;
  const td = tod();
  const todayLog = logs.find(l => l.date === td);
  const last7 = logs.filter(l => dAgo(l.date) <= 7);
  const avgH = last7.length ? (last7.reduce((a, l) => a + (l.totalHours || 0), 0) / last7.length).toFixed(1) : "0";
  const totalCh = Object.values(CHAPTERS).reduce((a, v) => a + v.length, 0);
  const activeCh = Object.keys(chapterData).filter(k => (chapterData[k]?.level || 0) > 0).length;
  const l1ch = Object.values(chapterData).filter(c => c.level >= 1 && c.level < 2).length;
  const l2ch = Object.values(chapterData).filter(c => c.level >= 2 && c.level < 3).length;
  const l3ch = Object.values(chapterData).filter(c => c.level >= 3).length;

  const dueToday = useMemo(() => {
    const out = [];
    Object.entries(chapterData).forEach(([key, cd]) => {
      const pending = (cd.revisionSchedule || []).filter(r => r.date === td && !r.done);
      if (pending.length) { const [s, c] = key.split("|||"); out.push({ s, c, key, date: pending[0].date }); }
    });
    return out;
  }, [chapterData, td]);

  // Overdue (past dates not done)
  const overdue = useMemo(() => {
    const out = [];
    Object.entries(chapterData).forEach(([key, cd]) => {
      const od = (cd.revisionSchedule || []).filter(r => r.date < td && !r.done);
      if (od.length) { const [s, c] = key.split("|||"); out.push({ s, c, key, date: od[od.length - 1].date, count: od.length }); }
    });
    return out;
  }, [chapterData, td]);

  const markRevDone = async (key, date) => {
    const nc = { ...data.chapterData };
    nc[key] = { ...nc[key], revisionSchedule: (nc[key].revisionSchedule || []).map(r => r.date === date ? { ...r, done: true } : r) };
    await ctx.upd("chapterData", nc);
  };

  const todayLecs = (todayLog?.sessions || []).filter(s => s.type === "lecture").length;
  const todayQs = (todayLog?.sessions || []).filter(s => s.type === "practice").reduce((a, s) => a + (parseInt(s.questions) || 0), 0);
  const lastTest = tests.length ? tests[tests.length - 1] : null;
  const wkH = last7.reduce((a, l) => a + (l.totalHours || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={css.h1}>{USER.name}'s War Room</h1>
        <div style={{ fontSize: 12, color: T.mut, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(td)} · {USER.role} · {USER.target}</div>
      </div>

      {/* LEVEL COUNTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { l: "Active Chapters", v: `${activeCh}/${totalCh}`, c: G1 },
          { l: "Level 1", v: l1ch, c: G2 },
          { l: "Level 2", v: l2ch, c: T.blu },
          { l: "Level 3", v: l3ch, c: T.pur },
        ].map(s => (
          <div key={s.l} style={css.stat}>
            <div style={css.lbl}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* TODAY PROGRESS */}
      <div style={{ ...css.card, borderLeft: `2px solid ${G1}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={css.h3}>Today's Progress vs Target</span>
          <button onClick={() => setTab("log")} style={{ ...css.btn, padding: "5px 14px", fontSize: 11 }}>{todayLog ? "Edit Log →" : "+ Log Today"}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { l: "Study Hours", v: todayLog?.totalHours || 0, tgt: target?.dailyHours || 10, unit: "h", c: G1, grad: GRAD },
            { l: "Lectures Done", v: todayLecs, tgt: target?.dailyLectures || 5, unit: "", c: T.blu, grad: "linear-gradient(90deg,#1565c0,#64b5f6)" },
            { l: "Questions Solved", v: todayQs, tgt: target?.dailyQuestions || 50, unit: "", c: T.org, grad: "linear-gradient(90deg,#e65100,#ffb74d)" },
          ].map(s => (
            <div key={s.l}>
              <span style={css.lbl}>{s.l}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}{s.unit}</span>
                <span style={{ fontSize: 12, color: T.mut }}>/ {s.tgt}{s.unit}</span>
              </div>
              <div style={{ height: 5, background: T.s3, borderRadius: 3, marginTop: 6 }}>
                <div style={{ width: `${Math.min(100, (s.v / s.tgt) * 100)}%`, height: "100%", background: s.grad, borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>
        {todayLog?.notes && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: T.s1, borderRadius: 8, borderLeft: `2px solid ${T.mut}` }}>
            <div style={{ fontSize: 10, color: T.mut, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 700 }}>TODAY'S NOTES</div>
            <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{todayLog.notes}</div>
          </div>
        )}
        {wkH < (target?.dailyHours || 10) * 7 * 0.7 && (
          <div style={{ marginTop: 12, fontSize: 12, color: T.yel, background: T.yel + "10", padding: "8px 12px", borderRadius: 7, borderLeft: `2px solid ${T.yel}` }}>
            ⚡ Week: {wkH.toFixed(1)}h / {((target?.dailyHours || 10) * 7).toFixed(0)}h target — {(((target?.dailyHours || 10) * 7) - wkH).toFixed(1)}h behind.
          </div>
        )}
      </div>

      {/* REVISIONS DUE + LAST TEST */}
      <div style={css.g2}>
        <div style={css.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={css.h3}>Revisions Due Today</span>
            <span style={{ ...css.bdg(dueToday.length ? T.red : G1) }}>{dueToday.length}</span>
          </div>
          {overdue.length > 0 && (
            <div style={{ marginBottom: 10, padding: "7px 10px", background: T.red + "10", borderRadius: 7, border: `1px solid ${T.red}30` }}>
              <div style={{ fontSize: 10, color: T.red, fontWeight: 700, marginBottom: 4 }}>⚠ OVERDUE ({overdue.length} chapters)</div>
              {overdue.slice(0, 3).map(({ s, c, key, date }) => (
                <div key={key} style={{ fontSize: 11, color: T.red + "cc", marginBottom: 2 }}>{c} — {fmt(date)}</div>
              ))}
            </div>
          )}
          {dueToday.length === 0
            ? <p style={css.mut}>No spaced revisions due today. ✓</p>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {dueToday.map(({ s, c, key, date }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: T.s1, borderRadius: 7, border: `1px solid ${T.bd}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c}</div>
                      <div style={{ fontSize: 10, color: SC[s] || G1 }}>{s}</div>
                    </div>
                    <button onClick={() => markRevDone(key, date)} style={{ ...css.btn, padding: "4px 10px", fontSize: 10 }}>✓ Done</button>
                  </div>
                ))}
              </div>
            )}
          <button onClick={() => ctx.setTab("revisions")} style={{ ...css.gst, width: "100%", marginTop: 10, fontSize: 11, textAlign: "center" }}>View Full Revision Schedule →</button>
        </div>

        <div style={css.card}>
          <span style={css.h3}>Last Test Result</span>
          {lastTest ? (() => {
            const pct = Math.round((lastTest.score / lastTest.max) * 100);
            const col = pct >= 70 ? G1 : pct >= 50 ? T.yel : T.red;
            return (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{lastTest.name}</div>
                <div style={{ fontSize: 11, color: T.mut, marginBottom: 8 }}>{fmt(lastTest.date)} · {lastTest.type}</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: col }}>{lastTest.score}<span style={{ fontSize: 16, color: T.mut }}>/{lastTest.max}</span></div>
                <div style={{ height: 5, background: T.s3, borderRadius: 3, marginTop: 6, marginBottom: 8 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: T.mut }}>{pct}%</div>
                {lastTest.physics != null && (
                  <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
                    <span style={css.bdg(T.blu)}>P: {lastTest.physics}</span>
                    <span style={css.bdg(T.org)}>C: {lastTest.chemistry}</span>
                    <span style={css.bdg(G1)}>M: {lastTest.maths}</span>
                  </div>
                )}
              </div>
            );
          })() : <p style={css.mut}>No tests logged yet.</p>}
        </div>
      </div>

      {/* TODAY'S SESSIONS */}
      {todayLog && (todayLog.sessions || []).length > 0 && (
        <div style={css.card}>
          <span style={css.h3}>Today's Sessions ({(todayLog.sessions || []).length})</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(todayLog.sessions || []).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", background: T.s1, borderRadius: 7, border: `1px solid ${T.bd}` }}>
                <span style={css.bdg(s.type === "lecture" ? G1 : s.type === "practice" ? T.blu : T.org)}>
                  {s.type === "lecture" ? "LEC" : "QS"}
                </span>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {s.type === "lecture"
                    ? <><span style={{ fontWeight: 600, fontFamily: "monospace" }}>L{String(s.lectureNo).padStart(2, "0")}</span><span style={{ color: T.mut }}> · </span><span style={{ color: SC[s.subject] || G1 }}>{s.chapter}</span>{s.topic && <span style={{ color: T.mut }}> — {s.topic}</span>}</>
                    : <><span style={{ fontWeight: 600, color: T.blu }}>{s.practiceType}</span><span style={{ color: T.mut }}> · </span><span style={{ color: SC[s.subject] || G1 }}>{s.chapter}</span>
                      {s.questions && <span style={{ color: T.mut }}> — {s.questions} Qs</span>}
                      {s.illustrations && <span style={{ color: T.org }}> · {s.illustrations} Ill</span>}
                      {s.classHW && <span style={{ color: T.pur }}> · HW ✓</span>}
                    </>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEVEL BREAKDOWN per subject */}
      <div style={css.card}>
        <span style={css.h3}>Chapter Level Breakdown</span>
        {Object.keys(CHAPTERS).map(subj => {
          const chs = CHAPTERS[subj];
          const byLevel = [0,1,2,3].map(l => chs.filter(c => {
            const lv = (chapterData[ck(subj,c)] || {}).level || 0;
            return l === 3 ? lv >= 3 : lv === l;
          }).length);
          return (
            <div key={subj} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: SC[subj] }}>{subj}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["—","L1","L2","L3"].map((l,i) => (
                    <span key={l} style={{ fontSize: 10, color: i===0?T.dim:i===1?G2:i===2?T.blu:T.pur }}>
                      {l}:{byLevel[i]}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: T.s3, gap: 1 }}>
                <div style={{ width: `${(byLevel[1]/chs.length)*100}%`, background: G2, transition: "width 0.4s" }} />
                <div style={{ width: `${(byLevel[2]/chs.length)*100}%`, background: T.blu, transition: "width 0.4s" }} />
                <div style={{ width: `${(byLevel[3]/chs.length)*100}%`, background: T.pur, transition: "width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ LOG TAB ════════════════════════════════════════════════════════════════
function LogTab({ ctx }) {
  const { data, upd } = ctx;
  const td = tod();
  const existing = data.logs.find(l => l.date === td);
  const blank = { date: td, sleep: "", energy: 3, totalHours: "", notes: "", sessions: [] };
  const [form, setForm] = useState(existing || blank);
  const [adding, setAdding] = useState(false);
  const [stype, setStype] = useState("lecture");
  const [sess, setSess] = useState({ subject: Object.keys(CHAPTERS)[0], chapter: Object.values(CHAPTERS)[0][0], lectureNo: "", topic: "", practiceType: "DPP", questions: "", illustrations: "", classHW: false });
  const [saved, setSaved] = useState(false);
  const [viewDate, setViewDate] = useState(tod());

  // When switching date, load that day's log
  useEffect(() => {
    const e = data.logs.find(l => l.date === viewDate);
    setForm(e || { ...blank, date: viewDate });
  }, [viewDate, data.logs]);

  useEffect(() => {
    setSess(s => ({ ...s, chapter: CHAPTERS[s.subject]?.[0] || "" }));
  }, []);

  const addSess = () => {
    if (stype === "lecture" && !sess.lectureNo) return;
    const ns = { ...sess, type: stype, id: rid() };
    setForm(f => ({ ...f, sessions: [...(f.sessions || []), ns] }));
    setSess(s => ({ ...s, lectureNo: "", topic: "", questions: "", illustrations: "", classHW: false }));
    setAdding(false);
  };

  const remSess = (id) => setForm(f => ({ ...f, sessions: (f.sessions || []).filter(s => s.id !== id) }));

  const saveLog = async () => {
    const logEntry = { ...form, totalHours: parseFloat(form.totalHours) || 0, date: viewDate };
    
    // Auto-update chapter data based on lecture sessions
    const newChapterData = { ...data.chapterData };
    (form.sessions || []).forEach(s => {
      if (s.type === "lecture") {
        const key = ck(s.subject, s.chapter);
        const existing = newChapterData[key] || { level: 0, topics: [], revisions: [], revisionSchedule: [], l1: {}, l2: {} };
        const currLecs = parseInt(existing.l1?.lecsDone || 0);
        const newLecs = Math.max(currLecs, parseInt(s.lectureNo) || currLecs);
        // Auto-set to at least level 1 if a lecture is logged
        const newLevel = existing.level === 0 ? 1 : existing.level;
        const revSched = newLevel >= 1 && !(existing.revisionSchedule || []).length
          ? mkRev(viewDate).map(d => ({ date: d, done: false }))
          : (existing.revisionSchedule || []);
        newChapterData[key] = { ...existing, level: newLevel, l1: { ...existing.l1, lecsDone: newLecs }, revisionSchedule: revSched };
      }
    });

    const newLogs = [...data.logs.filter(l => l.date !== viewDate), logEntry].sort((a, b) => b.date.localeCompare(a.date));
    await upd("logs", newLogs);
    await upd("chapterData", newChapterData);
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const chapsForSubj = CHAPTERS[sess.subject] || [];
  const lecCount = (form.sessions || []).filter(s => s.type === "lecture").length;
  const qsTotal = (form.sessions || []).filter(s => s.type === "practice").reduce((a, s) => a + (parseInt(s.questions) || 0), 0);

  // Recent dates for quick navigation
  const recentDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split("T")[0];
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={css.h1}>Daily Log</h1>
          <div style={{ fontSize: 12, color: T.mut }}>Log lectures, practice & reflections</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" style={{ ...css.inp, width: "auto", padding: "7px 10px" }} value={viewDate} onChange={e => setViewDate(e.target.value)} />
        </div>
      </div>

      {/* DATE QUICK SWITCH */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, overflowX: "auto" }}>
        {recentDates.map(d => (
          <button key={d} onClick={() => setViewDate(d)}
            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${viewDate === d ? G1 : T.bd}`, background: viewDate === d ? G1 + "18" : "transparent",
              color: viewDate === d ? G1 : T.mut, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
              fontWeight: data.logs.find(l => l.date === d) ? 700 : 400 }}>
            {d === tod() ? "Today" : fmt(d)}
            {data.logs.find(l => l.date === d) && <span style={{ color: G1, marginLeft: 4 }}>●</span>}
          </button>
        ))}
      </div>

      {/* TOP FIELDS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <span style={css.lbl}>Total Hours</span>
          <input type="number" min="0" max="18" step="0.5" style={css.inp} placeholder={`Target: ${data.target?.dailyHours || 10}h`} value={form.totalHours} onChange={e => setForm(f => ({ ...f, totalHours: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <span style={css.lbl}>Sleep (hrs)</span>
          <input type="number" min="0" max="12" step="0.5" style={css.inp} placeholder="7" value={form.sleep} onChange={e => setForm(f => ({ ...f, sleep: e.target.value }))} />
        </div>
        <div style={{ flex: 2, minWidth: 180 }}>
          <span style={css.lbl}>Energy 1–5</span>
          <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, energy: n }))}
                style={{ flex: 1, padding: "8px 0", border: `1px solid ${form.energy === n ? G1 : T.bd}`, borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "monospace",
                  background: form.energy === n ? G1 + "22" : T.s1, color: form.energy === n ? G1 : T.mut }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SESSIONS */}
      <div style={css.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={css.h3}>Sessions — {lecCount} lectures · {qsTotal} questions</span>
          <button onClick={() => setAdding(!adding)} style={{ ...css.btn, padding: "6px 14px", fontSize: 11 }}>+ Add Session</button>
        </div>

        {adding && (
          <div style={{ background: T.s1, border: `1px solid ${T.bd2}`, borderRadius: 9, padding: "14px 15px", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["lecture", "practice"].map(t => (
                <button key={t} onClick={() => setStype(t)}
                  style={{ padding: "6px 14px", border: `1px solid ${stype === t ? G1 : T.bd}`, borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: stype === t ? G1 + "18" : "transparent", color: stype === t ? G1 : T.mut }}>
                  {t === "lecture" ? "📖 Lecture" : "⚡ Practice / Questions"}
                </button>
              ))}
            </div>
            <div style={{ ...css.g2, marginBottom: 10 }}>
              <div>
                <span style={css.lbl}>Subject</span>
                <select style={css.inp} value={sess.subject} onChange={e => setSess(s => ({ ...s, subject: e.target.value, chapter: CHAPTERS[e.target.value]?.[0] || "" }))}>
                  {Object.keys(CHAPTERS).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span style={css.lbl}>Chapter</span>
                <select style={css.inp} value={sess.chapter} onChange={e => setSess(s => ({ ...s, chapter: e.target.value }))}>
                  {chapsForSubj.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {stype === "lecture" ? (
              <div style={{ ...css.g2, marginBottom: 10 }}>
                <div>
                  <span style={css.lbl}>Lecture No.</span>
                  <input type="number" min="1" style={css.inp} placeholder="e.g. 03" value={sess.lectureNo} onChange={e => setSess(s => ({ ...s, lectureNo: e.target.value }))} />
                </div>
                <div>
                  <span style={css.lbl}>Topic (optional)</span>
                  <input style={css.inp} placeholder="e.g. Properties of Def. Integrals" value={sess.topic} onChange={e => setSess(s => ({ ...s, topic: e.target.value }))} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ ...css.g2, marginBottom: 10 }}>
                  <div>
                    <span style={css.lbl}>Practice Type</span>
                    <select style={css.inp} value={sess.practiceType} onChange={e => setSess(s => ({ ...s, practiceType: e.target.value }))}>
                      {PRACTICE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <span style={css.lbl}>Questions Solved</span>
                    <input type="number" min="0" style={css.inp} placeholder="e.g. 25" value={sess.questions} onChange={e => setSess(s => ({ ...s, questions: e.target.value }))} />
                  </div>
                </div>
                <div style={{ ...css.g2, marginBottom: 10 }}>
                  <div>
                    <span style={css.lbl}>Class Illustrations Retried</span>
                    <input type="number" min="0" style={css.inp} placeholder="0" value={sess.illustrations} onChange={e => setSess(s => ({ ...s, illustrations: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
                    <input type="checkbox" id="chw" style={{ accentColor: G1, width: 16, height: 16, cursor: "pointer" }} checked={!!sess.classHW} onChange={e => setSess(s => ({ ...s, classHW: e.target.checked }))} />
                    <label htmlFor="chw" style={{ fontSize: 13, color: T.text2, cursor: "pointer" }}>Class HW Done ✓</label>
                  </div>
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addSess} style={{ ...css.btn, fontSize: 12 }}>Add Session</button>
              <button onClick={() => setAdding(false)} style={{ ...css.gst, fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        )}

        {(form.sessions || []).length === 0
          ? <p style={css.mut}>No sessions yet. Add lectures and practice above.</p>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {(form.sessions || []).map((s, i) => (
                <div key={s.id || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.bd}` }}>
                  <span style={css.bdg(s.type === "lecture" ? G1 : T.blu)}>{s.type === "lecture" ? "LEC" : "QS"}</span>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {s.type === "lecture"
                      ? <><b style={{ fontFamily: "monospace" }}>L{String(s.lectureNo).padStart(2, "0")}</b><span style={{ color: T.mut }}> · </span><span style={{ color: SC[s.subject] || G1 }}>{s.chapter}</span>{s.topic && <span style={{ color: T.mut }}> — {s.topic}</span>}<span style={{ fontSize: 10, color: T.dim, marginLeft: 6 }}>{s.subject}</span></>
                      : <><span style={{ fontWeight: 600, color: T.blu }}>{s.practiceType}</span><span style={{ color: T.mut }}> · </span><span style={{ color: SC[s.subject] || G1 }}>{s.chapter}</span>
                        {s.questions && <span style={{ color: T.mut }}> — {s.questions} Qs</span>}
                        {s.illustrations && <span style={{ color: T.org }}> · {s.illustrations} Ill</span>}
                        {s.classHW && <span style={{ color: T.pur }}> · HW✓</span>}
                      </>
                    }
                  </div>
                  <button onClick={() => remSess(s.id || i)} style={{ ...css.gst, padding: "2px 8px", color: T.red, borderColor: T.red + "44", fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* NOTES */}
      <div style={css.card}>
        <span style={css.lbl}>Notes / Reflections</span>
        <textarea rows={4} style={{ ...css.inp, resize: "vertical", lineHeight: 1.7 }}
          placeholder="What went well? What was hard? Key observations, doubts, or breakthroughs today..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <button onClick={saveLog} style={{ ...css.btn, width: "100%", padding: "13px", fontSize: 14, background: saved ? "linear-gradient(135deg,#0a3d0a,#22cc44)" : GRAD }}>
        {saved ? "✓ Saved" : `Save Log for ${viewDate === tod() ? "Today" : fmt(viewDate)}`}
      </button>

      {/* PAST LOGS */}
      <div style={{ ...css.card, marginTop: 14 }}>
        <span style={css.h3}>Recent Log History</span>
        {data.logs.slice(0, 7).map(l => (
          <div key={l.date} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.s1, borderRadius: 7, marginBottom: 6, cursor: "pointer", border: `1px solid ${T.bd}` }}
            onClick={() => setViewDate(l.date)}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{fmt(l.date)} {l.date === tod() && <span style={css.bdg(G1)}>TODAY</span>}</div>
              <div style={{ fontSize: 11, color: T.mut, marginTop: 2 }}>
                {l.totalHours}h · {(l.sessions||[]).filter(s=>s.type==="lecture").length} lecs · {(l.sessions||[]).filter(s=>s.type==="practice").reduce((a,s)=>a+(parseInt(s.questions)||0),0)} Qs
                {l.notes && <span style={{ color: T.text2 }}> · "{l.notes.slice(0,40)}{l.notes.length>40?"…":""}"</span>}
              </div>
            </div>
            <div style={{ fontSize: 10, color: T.mut }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ SYLLABUS TAB ════════════════════════════════════════════════════════════
function SyllabusTab({ ctx }) {
  const { data, upd } = ctx;
  const [subj, setSubj] = useState(Object.keys(CHAPTERS)[0]);
  const [open, setOpen] = useState(null);
  const [newTopic, setNewTopic] = useState({});
  const [filter, setFilter] = useState("all");

  const cd = data.chapterData;
  const gcd = (s, c) => cd[ck(s, c)] || { level: 0, topics: [], revisions: [], revisionSchedule: [], l1: { lecsDone: 0, hwDone: false, illDone: false, dppDone: false, moduleQsDone: false, illCount: 0 }, l2: { mainsDone: 0, advDone: 0 } };

  const setCD = async (s, c, patch) => {
    const nc = { ...cd, [ck(s, c)]: { ...gcd(s, c), ...patch } };
    await upd("chapterData", nc);
  };

  const setLevel = async (s, c, lv) => {
    const curr = gcd(s, c);
    const revSched = lv >= 1 && !(curr.revisionSchedule || []).length
      ? mkRev(tod()).map(d => ({ date: d, done: false }))
      : (curr.revisionSchedule || []);
    await setCD(s, c, { level: lv, revisionSchedule: revSched });
  };

  const addRev = async (s, c) => {
    const curr = gcd(s, c);
    const revisions = [...(curr.revisions || []), { date: tod() }];
    // Reset ebbinghaus schedule from today
    const revisionSchedule = mkRev(tod()).map(d => ({ date: d, done: false }));
    await setCD(s, c, { revisions, revisionSchedule });
  };

  const addTopic = async (s, c) => {
    const text = (newTopic[ck(s, c)] || "").trim(); if (!text) return;
    const curr = gcd(s, c);
    await setCD(s, c, { topics: [...(curr.topics || []), { id: rid(), name: text, done: false, dateAdded: tod() }] });
    setNewTopic(p => ({ ...p, [ck(s, c)]: "" }));
  };

  const toggleTopic = async (s, c, tid) => {
    const curr = gcd(s, c);
    await setCD(s, c, { topics: (curr.topics || []).map(t => t.id === tid ? { ...t, done: !t.done } : t) });
  };

  const removeTopic = async (s, c, tid) => {
    const curr = gcd(s, c); await setCD(s, c, { topics: (curr.topics || []).filter(t => t.id !== tid) });
  };

  const updL1 = async (s, c, field, val) => {
    const curr = gcd(s, c); await setCD(s, c, { l1: { ...(curr.l1 || {}), [field]: val } });
  };

  const chs = CHAPTERS[subj] || [];
  const filtered = filter === "all" ? chs : filter === "active" ? chs.filter(c => gcd(subj, c).level > 0) : filter === "l3" ? chs.filter(c => gcd(subj, c).level >= 3) : chs.filter(c => gcd(subj, c).level === 0);

  // Compute chapter progress score (0-100)
  const chProgress = (s, c) => {
    const d = gcd(s, c);
    if (!d.level) return 0;
    const l1 = d.l1 || {};
    let score = 0;
    if (d.level >= 1) score += 20;
    if (l1.lecsDone > 0) score += 15;
    if (l1.hwDone) score += 10;
    if (l1.illDone) score += 10;
    if (l1.dppDone) score += 10;
    if (l1.moduleQsDone) score += 10;
    if (d.level >= 2) score += 10;
    if ((d.l2?.mainsDone || 0) > 0) score += 7;
    if ((d.l2?.advDone || 0) > 0) score += 5;
    if (d.level >= 3) score += 3;
    return Math.min(100, score);
  };

  return (
    <div>
      <h1 style={css.h1}>Syllabus Tracker</h1>
      <div style={{ fontSize: 12, color: T.mut, marginBottom: 18 }}>Set levels per chapter. Track progress. Log revisions. Ebbinghaus auto-schedules on Level 1+.</div>

      {/* SUBJECT TABS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.keys(CHAPTERS).map(s => {
          const tot = CHAPTERS[s].length, act = CHAPTERS[s].filter(c => gcd(s, c).level > 0).length;
          return (
            <button key={s} onClick={() => { setSubj(s); setOpen(null); }}
              style={{ padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                border: `1px solid ${subj === s ? SC[s] : T.bd}`,
                background: subj === s ? SC[s] + "18" : "transparent",
                color: subj === s ? SC[s] : T.mut }}>
              {s.split(" ").slice(0, 2).join(" ")} <span style={{ fontSize: 9, opacity: 0.6 }}>{act}/{tot}</span>
            </button>
          );
        })}
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {[["all", "All"], ["active", "Active"], ["none", "Not Started"], ["l3", "Level 3"]].map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...css.gst, padding: "4px 12px", fontSize: 11, background: filter === f ? T.s2 : "transparent", color: filter === f ? G1 : T.mut, borderColor: filter === f ? G1 : T.bd }}>
            {l}
          </button>
        ))}
      </div>

      {/* CHAPTER LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {filtered.map(chapter => {
          const c = gcd(subj, chapter);
          const lv = c.level || 0; const li = LVL[lv];
          const isOpen = open === chapter;
          const topics = c.topics || [];
          const doneTops = topics.filter(t => t.done).length;
          const revCnt = (c.revisions || []).length;
          const dueRev = (c.revisionSchedule || []).filter(r => r.date <= tod() && !r.done).length;
          const progress = chProgress(subj, chapter);

          return (
            <div key={chapter} style={{ background: T.s2, border: `1px solid ${isOpen ? SC[subj] + "66" : T.bd}`, borderRadius: 10, overflow: "hidden", transition: "border 0.15s" }}>
              <div style={{ cursor: "pointer" }} onClick={() => setOpen(isOpen ? null : chapter)}>
                {/* Progress bar strip at top */}
                <div style={{ height: 3, background: T.s3 }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: progress >= 80 ? G1 : progress >= 50 ? T.blu : G2, transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{chapter}</div>
                    <div style={{ fontSize: 11, color: T.mut, marginTop: 2 }}>
                      {topics.length > 0 && <span>{doneTops}/{topics.length} topics · </span>}
                      {revCnt > 0 && <span style={{ color: T.blu }}>Rev ×{revCnt} · </span>}
                      {dueRev > 0 && <span style={{ color: T.red }}>⚡ {dueRev} overdue · </span>}
                      <span style={{ color: T.mut }}>{progress}% done</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {[1, 2, 3].map(l => (
                      <button key={l} onClick={e => { e.stopPropagation(); setLevel(subj, chapter, lv === l ? 0 : l); }}
                        style={{ padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "monospace",
                          background: lv >= l ? GRAD : T.s3, color: lv >= l ? "#000000" : T.mut }}>
                        L{l}
                      </button>
                    ))}
                    <span style={{ background: li.c, color: li.t, border: `1px solid ${li.t}44`, borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700, marginLeft: 3 }}>{li.label}</span>
                    <span style={{ fontSize: 11, color: T.mut }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${T.bd}`, padding: "14px 15px" }}>
                  <div style={css.g2}>
                    {/* L1 CHECKLIST */}
                    <div>
                      <span style={css.h3}>Level 1 Checklist</span>
                      {[
                        { k: "lecsDone", l: "Lectures Completed", type: "num" },
                        { k: "illCount", l: "Illustrations Retried", type: "num" },
                        { k: "hwDone", l: "Homework Done", type: "chk" },
                        { k: "illDone", l: "All Illustrations ✓", type: "chk" },
                        { k: "dppDone", l: "DPP Completed", type: "chk" },
                        { k: "moduleQsDone", l: "Module Qs Done", type: "chk" },
                      ].map(f => (
                        <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                          {f.type === "chk"
                            ? <input type="checkbox" style={{ accentColor: G1, width: 14, height: 14, cursor: "pointer" }} checked={!!(c.l1 || {})[f.k]} onChange={e => updL1(subj, chapter, f.k, e.target.checked)} />
                            : <input type="number" min="0" style={{ ...css.inp, width: 64, padding: "4px 8px" }} value={(c.l1 || {})[f.k] || ""} onChange={e => updL1(subj, chapter, f.k, parseInt(e.target.value) || 0)} />
                          }
                          <span style={{ fontSize: 12, color: T.text2 }}>{f.l}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 6 }}>
                        <span style={css.h3}>Level 2 Progress</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div>
                            <span style={{ ...css.lbl, marginBottom: 3 }}>Mains PYQs done</span>
                            <input type="number" min="0" style={{ ...css.inp, width: 80, padding: "5px 9px" }}
                              value={(c.l2 || {}).mainsDone || ""} onChange={e => setCD(subj, chapter, { l2: { ...(c.l2 || {}), mainsDone: parseInt(e.target.value) || 0 } })} />
                          </div>
                          <div>
                            <span style={{ ...css.lbl, marginBottom: 3 }}>Adv PYQs done</span>
                            <input type="number" min="0" style={{ ...css.inp, width: 80, padding: "5px 9px" }}
                              value={(c.l2 || {}).advDone || ""} onChange={e => setCD(subj, chapter, { l2: { ...(c.l2 || {}), advDone: parseInt(e.target.value) || 0 } })} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOPICS & REVISION */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={css.h3}>Weak Topics {topics.length > 0 && `(${doneTops}/${topics.length})`}</span>
                      </div>
                      {topics.length === 0 && <p style={{ ...css.mut, marginBottom: 8 }}>No topics added. Track weak areas.</p>}
                      {topics.map(t => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 9px", background: T.s1, borderRadius: 7 }}>
                          <input type="checkbox" style={{ accentColor: G1, width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} checked={t.done} onChange={() => toggleTopic(subj, chapter, t.id)} />
                          <span style={{ flex: 1, fontSize: 12, color: t.done ? T.mut : T.text2, textDecoration: t.done ? "line-through" : "none" }}>{t.name}</span>
                          <button onClick={() => removeTopic(subj, chapter, t.id)} style={{ ...css.gst, padding: "1px 6px", fontSize: 10, color: T.red, borderColor: T.red + "33" }}>✕</button>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <input style={{ ...css.inp, flex: 1, padding: "6px 10px", fontSize: 12 }} placeholder="Add weak topic..."
                          value={newTopic[ck(subj, chapter)] || ""} onChange={e => setNewTopic(p => ({ ...p, [ck(subj, chapter)]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && addTopic(subj, chapter)} />
                        <button onClick={() => addTopic(subj, chapter)} style={{ ...css.btn, padding: "6px 12px", fontSize: 11 }}>Add</button>
                      </div>

                      {/* REVISION */}
                      <div style={{ marginTop: 14, borderTop: `1px solid ${T.bd}`, paddingTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={css.h3}>Revision Log ({revCnt} total)</span>
                          <button onClick={() => addRev(subj, chapter)} style={{ ...css.btn, padding: "5px 12px", fontSize: 11 }}>+ Log Revision</button>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                          {(c.revisions || []).map((r, i) => (
                            <span key={i} style={css.bdg(T.blu)}>Rev {i + 1} · {fmt(r.date)}</span>
                          ))}
                        </div>
                        {(c.revisionSchedule || []).some(r => !r.done && r.date >= tod()) && (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: T.mut }}>Upcoming Ebbinghaus:</span>
                            {(c.revisionSchedule || []).filter(r => !r.done && r.date >= tod()).slice(0, 6).map((r, i) => (
                              <span key={i} style={css.bdg(r.date === tod() ? T.yel : T.mut)}>{fmt(r.date)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ REVISIONS TAB (new dedicated tab) ═══════════════════════════════════════
function RevisionsTab({ ctx }) {
  const { data, upd } = ctx;
  const { chapterData, logs } = data;
  const td = tod();
  const [viewMode, setViewMode] = useState("schedule"); // "schedule" | "byLecture"

  // EBBINGHAUS: collect all pending/done revisions
  const allRevisions = useMemo(() => {
    const out = [];
    Object.entries(chapterData).forEach(([key, cd]) => {
      const [s, c] = key.split("|||");
      (cd.revisionSchedule || []).forEach((r, idx) => {
        const dayOffset = EBBINGHAUS_DAYS[idx] || EBBINGHAUS_DAYS[EBBINGHAUS_DAYS.length - 1];
        out.push({ s, c, key, date: r.date, done: r.done, dayOffset, idx });
      });
    });
    return out;
  }, [chapterData]);

  const markRevDone = async (key, date) => {
    const nc = { ...chapterData };
    nc[key] = { ...nc[key], revisionSchedule: (nc[key].revisionSchedule || []).map(r => r.date === date ? { ...r, done: true } : r) };
    await upd("chapterData", nc);
  };

  // Group by date
  const grouped = useMemo(() => {
    const g = {};
    allRevisions.filter(r => !r.done).forEach(r => {
      if (!g[r.date]) g[r.date] = [];
      g[r.date].push(r);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [allRevisions]);

  const past = grouped.filter(([d]) => d < td);
  const today = grouped.filter(([d]) => d === td);
  const future = grouped.filter(([d]) => d > td);

  // By-lecture view: get all lecture sessions from logs, show their Ebbinghaus chain
  const lectureChains = useMemo(() => {
    const chains = [];
    [...logs].sort((a,b) => a.date.localeCompare(b.date)).forEach(log => {
      (log.sessions || []).filter(s => s.type === "lecture").forEach(s => {
        const key = ck(s.subject, s.chapter);
        const cd = chapterData[key] || {};
        chains.push({
          date: log.date,
          subject: s.subject,
          chapter: s.chapter,
          lectureNo: s.lectureNo,
          topic: s.topic,
          key,
          schedule: cd.revisionSchedule || []
        });
      });
    });
    // Deduplicate by key (show latest lecture per chapter)
    const seen = new Set();
    return chains.filter(c => { if (seen.has(c.key)) return false; seen.add(c.key); return true; });
  }, [logs, chapterData]);

  return (
    <div>
      <h1 style={css.h1}>Revision Schedule</h1>
      <div style={{ fontSize: 12, color: T.mut, marginBottom: 18 }}>Ebbinghaus spaced repetition — 1, 3, 7, 14, 30, 60 days after first study.</div>

      {/* MODE SWITCH */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["schedule", "By Date"], ["byLecture", "By Lecture"]].map(([m, l]) => (
          <button key={m} onClick={() => setViewMode(m)}
            style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${viewMode === m ? G1 : T.bd}`,
              background: viewMode === m ? G1 + "18" : "transparent", color: viewMode === m ? G1 : T.mut, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {l}
          </button>
        ))}
      </div>

      {viewMode === "schedule" && (
        <div>
          {/* OVERDUE */}
          {past.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: "0.1em", marginBottom: 10 }}>⚠ OVERDUE ({past.reduce((a,[,rs])=>a+rs.length,0)} sessions)</div>
              {past.map(([date, revs]) => (
                <div key={date} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: T.red, fontWeight: 700, marginBottom: 5, fontFamily: "monospace" }}>{fmt(date)} — {Math.abs(dAgo(date) * -1 - Math.ceil((new Date(date)-new Date(td+"T00:00:00"))/864e5))} days ago</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {revs.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.red + "08", borderRadius: 8, border: `1px solid ${T.red}22` }}>
                        <div>
                          <div style={{ fontSize: 13 }}>{r.c}</div>
                          <div style={{ fontSize: 10, color: SC[r.s] || G1 }}>{r.s} · Day +{r.dayOffset}</div>
                        </div>
                        <button onClick={() => markRevDone(r.key, r.date)} style={{ ...css.btn, padding: "4px 10px", fontSize: 10 }}>✓ Done</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TODAY */}
          {today.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G1, letterSpacing: "0.1em", marginBottom: 10 }}>TODAY ({today[0][1].length} sessions)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {today[0][1].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: G1 + "08", borderRadius: 9, border: `1px solid ${G1}33` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{r.c}</div>
                      <div style={{ fontSize: 10, color: SC[r.s] || G1 }}>{r.s} · Ebbinghaus Day +{r.dayOffset}</div>
                    </div>
                    <button onClick={() => markRevDone(r.key, r.date)} style={{ ...css.btn, padding: "5px 12px", fontSize: 11 }}>✓ Done</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {today.length === 0 && past.length === 0 && (
            <div style={{ padding: "20px 0", color: T.mut, fontSize: 13 }}>No revisions due today. ✓</div>
          )}

          {/* FUTURE */}
          {future.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.mut, letterSpacing: "0.1em", marginBottom: 10 }}>UPCOMING</div>
              {future.slice(0, 14).map(([date, revs]) => {
                const daysFrom = Math.ceil((new Date(date + "T00:00:00") - new Date(td + "T00:00:00")) / 864e5);
                const label = daysFrom === 1 ? "Tomorrow" : `In ${daysFrom} days`;
                return (
                  <div key={date} style={{ marginBottom: 10, padding: "12px 14px", background: T.s2, borderRadius: 9, border: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{fmt(date)}</span>
                      <span style={{ fontSize: 11, color: T.mut }}>{label} · {revs.length} sessions</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {revs.map((r, i) => (
                        <span key={i} style={{ ...css.bdg(SC[r.s] || G1), fontSize: 11 }}>{r.c}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === "byLecture" && (
        <div>
          <div style={{ fontSize: 12, color: T.mut, marginBottom: 14 }}>Each chapter's Ebbinghaus revision chain, tied to its first logged lecture.</div>
          {lectureChains.length === 0 && <p style={css.mut}>No lectures logged yet. Log lectures in the daily log to auto-generate revision schedules.</p>}
          {lectureChains.map((chain, i) => {
            const pending = chain.schedule.filter(r => !r.done);
            const done = chain.schedule.filter(r => r.done);
            return (
              <div key={i} style={{ ...css.card, borderLeft: `2px solid ${SC[chain.subject] || G1}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{chain.chapter}</div>
                    <div style={{ fontSize: 11, color: SC[chain.subject] || G1, marginTop: 2 }}>{chain.subject}</div>
                    <div style={{ fontSize: 10, color: T.mut, marginTop: 2 }}>
                      First logged: {fmt(chain.date)} · L{chain.lectureNo}{chain.topic && ` — ${chain.topic}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: T.grn }}>{done.length}/{chain.schedule.length} done</div>
                    <div style={{ width: 80, height: 4, background: T.s3, borderRadius: 2, marginTop: 4 }}>
                      <div style={{ width: `${chain.schedule.length ? (done.length/chain.schedule.length)*100 : 0}%`, height: "100%", background: G1, borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {chain.schedule.map((r, j) => {
                    const isPast = r.date < td;
                    const isToday = r.date === td;
                    const dayN = EBBINGHAUS_DAYS[j] || "?";
                    return (
                      <div key={j} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontFamily: "monospace",
                        background: r.done ? G1 + "15" : isToday ? T.yel + "15" : isPast ? T.red + "10" : T.s3,
                        border: `1px solid ${r.done ? G1 + "44" : isToday ? T.yel + "66" : isPast ? T.red + "33" : T.bd}`,
                        color: r.done ? G1 : isToday ? T.yel : isPast ? T.red : T.mut,
                        textDecoration: r.done ? "line-through" : "none" }}>
                        +{dayN}d · {fmt(r.date)}{r.done ? " ✓" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══ TESTS TAB ═══════════════════════════════════════════════════════════════
function TestsTab({ ctx }) {
  const { data, upd } = ctx;
  const [form, setForm] = useState({ date: tod(), name: "", type: "JEE Mains Mock", score: "", max: 300, physics: "", chemistry: "", maths: "", notes: "" });
  const [saved, setSaved] = useState(false);

  const autoTotal = (parseFloat(form.physics) || 0) + (parseFloat(form.chemistry) || 0) + (parseFloat(form.maths) || 0);

  const saveTest = async () => {
    if (!form.name || (!form.score && !autoTotal)) return;
    const t = { ...form, score: parseFloat(form.score) || autoTotal, max: parseFloat(form.max) || 300, physics: parseFloat(form.physics) || null, chemistry: parseFloat(form.chemistry) || null, maths: parseFloat(form.maths) || null };
    await upd("tests", [...data.tests, t].sort((a, b) => a.date.localeCompare(b.date)));
    setSaved(true);
    setForm({ date: tod(), name: "", type: "JEE Mains Mock", score: "", max: 300, physics: "", chemistry: "", maths: "", notes: "" });
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteTest = async (idx) => {
    const ts = [...data.tests]; ts.splice(idx, 1);
    await upd("tests", ts);
  };

  const chartData = data.tests.slice(-14).map(t => ({
    name: t.name.slice(0, 10),
    pct: Math.round((t.score / t.max) * 100),
    phy: t.physics ? Math.round((t.physics / 120) * 100) : null,
    che: t.chemistry ? Math.round((t.chemistry / 120) * 100) : null,
    mat: t.maths ? Math.round((t.maths / 120) * 100) : null
  }));

  const best = data.tests.length ? Math.max(...data.tests.map(t => Math.round((t.score / t.max) * 100))) : null;
  const avg = data.tests.length ? Math.round(data.tests.reduce((a, t) => a + (t.score / t.max) * 100, 0) / data.tests.length) : null;
  const last3 = data.tests.slice(-3), prev3 = data.tests.slice(-6, -3);
  const trend = last3.length && prev3.length ? Math.round(last3.reduce((a, t) => a + (t.score / t.max) * 100, 0) / last3.length - prev3.reduce((a, t) => a + (t.score / t.max) * 100, 0) / prev3.length) : null;

  return (
    <div>
      <h1 style={css.h1}>Test Scores</h1>
      <div style={{ fontSize: 12, color: T.mut, marginBottom: 18 }}>Every mock, DPP, chapter test. Patterns reveal what your brain hides.</div>

      {data.tests.length > 0 && (
        <>
          <div style={{ ...css.g3, marginBottom: 14 }}>
            <div style={css.stat}><div style={css.lbl}>Best</div><div style={{ fontSize: 26, fontWeight: 700, color: G1, fontFamily: "'JetBrains Mono', monospace" }}>{best}%</div></div>
            <div style={css.stat}><div style={css.lbl}>Average</div><div style={{ fontSize: 26, fontWeight: 700, color: avg >= 60 ? G1 : avg >= 40 ? T.yel : T.red, fontFamily: "'JetBrains Mono', monospace" }}>{avg}%</div></div>
            <div style={css.stat}><div style={css.lbl}>Trend (last 3)</div><div style={{ fontSize: 26, fontWeight: 700, color: trend > 0 ? G1 : trend < 0 ? T.red : T.yel, fontFamily: "'JetBrains Mono', monospace" }}>{trend != null ? `${trend > 0 ? "+" : ""}${trend}%` : "—"}</div></div>
          </div>
          {chartData.length > 1 && (
            <div style={{ ...css.card, marginBottom: 14 }}>
              <span style={css.h3}>Score Trend (%)</span>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
                  <XAxis dataKey="name" tick={{ fill: T.mut, fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: T.mut, fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 8, color: T.text, fontSize: 11 }} />
                  <Line type="monotone" dataKey="pct" stroke={G1} strokeWidth={2} dot={{ r: 3, fill: G1 }} name="Overall" />
                  {chartData.some(d => d.phy) && <Line type="monotone" dataKey="phy" stroke={T.blu} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Physics" />}
                  {chartData.some(d => d.che) && <Line type="monotone" dataKey="che" stroke={T.org} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Chem" />}
                  {chartData.some(d => d.mat) && <Line type="monotone" dataKey="mat" stroke={T.pur} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Maths" />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <div style={css.card}>
        <span style={css.h3}>Log New Test</span>
        <div style={{ ...css.g2, marginBottom: 10 }}>
          <div><span style={css.lbl}>Test Name</span><input style={css.inp} placeholder="e.g. PW Full Mock #3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><span style={css.lbl}>Date</span><input type="date" style={css.inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div><span style={css.lbl}>Type</span>
            <select style={css.inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {["JEE Mains Mock", "JEE Advanced Mock", "Chapter Test", "DPP", "PYQ Attempt", "Minor Test"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><span style={css.lbl}>Max Marks</span><input type="number" style={css.inp} value={form.max} onChange={e => setForm(f => ({ ...f, max: e.target.value }))} /></div>
        </div>
        <div style={{ ...css.g3, marginBottom: 10 }}>
          <div><span style={css.lbl}>Physics</span><input type="number" style={css.inp} placeholder="/120" value={form.physics} onChange={e => setForm(f => ({ ...f, physics: e.target.value }))} /></div>
          <div><span style={css.lbl}>Chemistry</span><input type="number" style={css.inp} placeholder="/120" value={form.chemistry} onChange={e => setForm(f => ({ ...f, chemistry: e.target.value }))} /></div>
          <div><span style={css.lbl}>Maths</span><input type="number" style={css.inp} placeholder="/120" value={form.maths} onChange={e => setForm(f => ({ ...f, maths: e.target.value }))} /></div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <span style={css.lbl}>Total Score {autoTotal > 0 && <span style={{ color: T.mut, textTransform: "none", fontWeight: 400 }}>(auto: {autoTotal})</span>}</span>
          <input type="number" style={css.inp} placeholder="Total score (or leave blank to use sum above)" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={css.lbl}>Analysis Notes</span>
          <textarea rows={2} style={{ ...css.inp, resize: "vertical" }} placeholder="Where did marks go? Biggest mistake?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <button onClick={saveTest} style={{ ...css.btn, width: "100%", padding: "11px", background: saved ? "linear-gradient(135deg,#0a3d0a,#22cc44)" : GRAD }}>{saved ? "✓ Saved" : "Log Test"}</button>
      </div>

      {data.tests.length > 0 && (
        <div style={css.card}>
          <span style={css.h3}>History ({data.tests.length} tests)</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...data.tests].reverse().slice(0, 20).map((t, i) => {
              const pct = Math.round((t.score / t.max) * 100);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: T.s1, borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name} <span style={css.bdg(T.mut)}>{t.type}</span></div>
                    <div style={{ fontSize: 11, color: T.mut, marginTop: 2 }}>
                      {fmt(t.date)}
                      {t.physics != null && <> · P:{t.physics} C:{t.chemistry} M:{t.maths}</>}
                      {t.notes && <> · {t.notes.slice(0, 50)}{t.notes.length > 50 ? "…" : ""}</>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: pct >= 70 ? G1 : pct >= 50 ? T.yel : T.red }}>{t.score}/{t.max}</div>
                    <div style={{ fontSize: 10, color: T.mut }}>{pct}%</div>
                  </div>
                  <button onClick={() => deleteTest([...data.tests].length - 1 - i)} style={{ ...css.gst, padding: "3px 8px", fontSize: 10, color: T.red, borderColor: T.red + "33" }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══ ANALYTICS TAB ═══════════════════════════════════════════════════════════
function AnalyticsTab({ ctx }) {
  const { data } = ctx;
  const { logs, chapterData, tests, target } = data;

  const last30 = logs.filter(l => dAgo(l.date) <= 30).sort((a, b) => a.date.localeCompare(b.date));
  const last7 = logs.filter(l => dAgo(l.date) <= 7);
  const totalH = logs.reduce((a, l) => a + (l.totalHours || 0), 0);
  const studyDays = new Set(logs.map(l => l.date)).size;
  const avgH7 = last7.length ? (last7.reduce((a, l) => a + (l.totalHours || 0), 0) / last7.length).toFixed(1) : 0;
  const totalLecs = logs.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "lecture").length, 0);
  const totalQs = logs.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "practice").reduce((b, s) => b + (parseInt(s.questions) || 0), 0), 0);
  const totalIlls = logs.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "practice").reduce((b, s) => b + (parseInt(s.illustrations) || 0), 0), 0);

  const hoursChart = last30.map(l => ({ date: fmt(l.date).slice(0, 5), h: parseFloat(l.totalHours) || 0 }));

  const subjChart = Object.keys(CHAPTERS).map(s => {
    const tot = CHAPTERS[s].length;
    const act = CHAPTERS[s].filter(c => (chapterData[ck(s, c)] || {}).level > 0).length;
    const l3 = CHAPTERS[s].filter(c => (chapterData[ck(s, c)] || {}).level >= 3).length;
    return { name: s.split(" ")[0], tot, act, l3, pct: Math.round((act / tot) * 100), color: SC[s] };
  });

  const weekMap = {};
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => { weekMap[d] = { h: 0, n: 0 }; });
  logs.forEach(l => {
    const d = new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
    if (weekMap[d]) { weekMap[d].h += parseFloat(l.totalHours) || 0; weekMap[d].n++; }
  });
  const weekChart = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => ({ day: d, avg: weekMap[d].n ? +(weekMap[d].h / weekMap[d].n).toFixed(1) : 0 }));

  const wkH = last7.reduce((a, l) => a + (l.totalHours || 0), 0);
  const targetWk = (target?.dailyHours || 10) * 7;
  const gap = targetWk - wkH;

  return (
    <div>
      <h1 style={css.h1}>{USER.name}'s Analytics</h1>
      <div style={{ fontSize: 12, color: T.mut, marginBottom: 18 }}>Data doesn't lie. Your memory does.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
        {[
          { l: "Total Hours", v: Math.round(totalH) + "h", c: G1 },
          { l: "Days Logged", v: studyDays, c: T.blu },
          { l: "7d Avg", v: avgH7 + "h", c: T.yel },
          { l: "Lectures Done", v: totalLecs, c: T.pur },
          { l: "Questions Solved", v: totalQs, c: T.org },
          { l: "Illustrations Retried", v: totalIlls, c: T.pk },
        ].map(s => (
          <div key={s.l} style={css.stat}>
            <div style={css.lbl}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {last7.length > 0 && (
        <div style={{ ...css.card, borderLeft: `2px solid ${gap > targetWk * 0.3 ? T.red : gap > 0 ? T.yel : G1}`, marginBottom: 14 }}>
          <span style={css.h3}>Honest Weekly Verdict</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: gap > targetWk * 0.3 ? T.red : gap > 0 ? T.yel : G1 }}>{wkH.toFixed(1)}h</span>
            <span style={{ fontSize: 13, color: T.mut }}>/ {targetWk}h target ({last7.length} days logged)</span>
          </div>
          <div style={{ height: 6, background: T.s3, borderRadius: 3, marginBottom: 10 }}>
            <div style={{ width: `${Math.min(100,(wkH/targetWk)*100)}%`, height: "100%", background: gap > targetWk * 0.3 ? T.red : gap > 0 ? T.yel : G1, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.7 }}>
            {gap <= 0 ? "Target met. Now: are the hours quality hours? Check your question count and illustration retry count."
              : gap <= targetWk * 0.2 ? `${gap.toFixed(1)}h behind. Close. In a drop year, close is not good enough.`
                : gap <= targetWk * 0.4 ? `${gap.toFixed(1)}h behind. Significant gap. The syllabus doesn't shrink because your hours did.`
                  : `${gap.toFixed(1)}h behind. This is not preparation. At this pace you are attending JEE — not attempting it.`}
          </div>
        </div>
      )}

      {hoursChart.length > 1 && (
        <div style={{ ...css.card, marginBottom: 14 }}>
          <span style={css.h3}>Daily Hours — Last 30 Days</span>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hoursChart} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="date" tick={{ fill: T.mut, fontSize: 8 }} />
              <YAxis tick={{ fill: T.mut, fontSize: 9 }} />
              <Tooltip contentStyle={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 8, color: T.text, fontSize: 11 }} formatter={v => [v + "h", "Hours"]} />
              <Bar dataKey="h" radius={[4, 4, 0, 0]} fill={G2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={css.g2}>
        <div style={css.card}>
          <span style={css.h3}>Chapter Coverage</span>
          {subjChart.map(s => (
            <div key={s.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: s.color }}>{s.name}</span>
                <span style={{ fontSize: 10, color: T.mut }}>{s.act}/{s.tot} · L3:{s.l3}</span>
              </div>
              <div style={{ height: 5, background: T.s1, borderRadius: 3 }}>
                <div style={{ width: `${s.pct}%`, height: "100%", background: s.color + "99", borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={css.card}>
          <span style={css.h3}>Avg Hours by Weekday</span>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={weekChart} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="day" tick={{ fill: T.mut, fontSize: 10 }} />
              <YAxis tick={{ fill: T.mut, fontSize: 9 }} />
              <Tooltip contentStyle={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 8, color: T.text, fontSize: 11 }} formatter={v => [v + "h", "Avg"]} />
              <Bar dataKey="avg" fill={G2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {logs.filter(l => l.sleep && l.energy).length > 3 && (() => {
        const avgSlp = (logs.filter(l => l.sleep).reduce((a, l) => a + parseFloat(l.sleep || 0), 0) / logs.filter(l => l.sleep).length).toFixed(1);
        const avgEng = (logs.filter(l => l.energy).reduce((a, l) => a + l.energy, 0) / logs.filter(l => l.energy).length).toFixed(1);
        return (
          <div style={{ ...css.card, marginTop: 0 }}>
            <span style={css.h3}>Sleep & Energy Averages</span>
            <div style={css.g2}>
              <div style={css.stat}><div style={css.lbl}>Avg Sleep</div><div style={{ fontSize: 24, fontWeight: 700, color: parseFloat(avgSlp) >= 7 ? G1 : parseFloat(avgSlp) >= 6 ? T.yel : T.red, fontFamily: "monospace" }}>{avgSlp}h</div><div style={{ fontSize: 10, color: T.mut }}>Target: 7–8h</div></div>
              <div style={css.stat}><div style={css.lbl}>Avg Energy</div><div style={{ fontSize: 24, fontWeight: 700, color: parseFloat(avgEng) >= 4 ? G1 : parseFloat(avgEng) >= 3 ? T.yel : T.red, fontFamily: "monospace" }}>{avgEng}/5</div><div style={{ fontSize: 10, color: T.mut }}>Logged days only</div></div>
            </div>
            {parseFloat(avgSlp) < 6.5 && <div style={{ marginTop: 10, fontSize: 12, color: T.red, background: T.red + "10", padding: "8px 12px", borderRadius: 7, borderLeft: `2px solid ${T.red}` }}>⚠ Avg sleep {avgSlp}h. Below 6.5h impairs memory consolidation. Your study hours don't count as much as you think.</div>}
          </div>
        );
      })()}

      <FeedbackBrief ctx={ctx} />
    </div>
  );
}

function FeedbackBrief({ ctx }) {
  const { data } = ctx;
  const { logs, chapterData, tests, foundation, target } = data;
  const td = tod();
  const last7 = logs.filter(l => dAgo(l.date) <= 7);
  const wkH = last7.reduce((a, l) => a + (l.totalHours || 0), 0).toFixed(1);
  const weakCh = Object.entries(chapterData).filter(([, d]) => d.level <= 1).map(([k]) => k.split("|||")[1]).slice(0, 8).join(", ");
  const recTests = tests.slice(-4).map(t => `${t.name}: ${t.score}/${t.max}`).join(" | ");
  const lecsDone = last7.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "lecture").length, 0);
  const qsDone = last7.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "practice").reduce((b, s) => b + (parseInt(s.questions) || 0), 0), 0);
  const illsDone = last7.reduce((a, l) => a + (l.sessions || []).filter(s => s.type === "practice").reduce((b, s) => b + (parseInt(s.illustrations) || 0), 0), 0);
  const brief = `=== RANKER OS FEEDBACK REQUEST ===\nStudent: ${USER.name} | ${USER.target} | ${USER.role}\nDate: ${td}\n\nWEEK: ${wkH}h across ${last7.length} days | ${lecsDone} lectures | ${qsDone} questions | ${illsDone} illustrations retried\nTARGET: ${target?.dailyHours || 10}h/day | ${target?.dailyLectures || 5} lecs/day | ${target?.dailyQuestions || 50} Qs/day\nDAILY: ${last7.map(l => `${fmt(l.date)}: ${l.totalHours}h, sleep ${l.sleep}h, energy ${l.energy}/5${l.notes ? ', note: '+l.notes.slice(0,60) : ''}`).join(" | ")}\nWEAK CHAPTERS: ${weakCh || "None logged"}\nRECENT TESTS: ${recTests || "None"}\nCONFESSION: ${(foundation?.confession || "Not filled").slice(0, 300)}\n\nGive a completely honest, unsparing assessment. No encouragement unless data strictly warrants it. Identify patterns, what is critically broken, and exact priorities for the coming week.`;

  const [copied, setCopied] = useState(false);
  return (
    <div style={{ ...css.card, marginTop: 14, borderLeft: `2px solid ${G1}` }}>
      <span style={css.h3}>📋 Get Honest AI Feedback</span>
      <div style={{ fontSize: 12, color: T.mut, marginBottom: 10, lineHeight: 1.6 }}>Copy this brief → paste into this chat. Fully personalised feedback calibrated to your numbers and confession.</div>
      <pre style={{ background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 8, padding: 12, fontSize: 10, color: T.mut, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 160, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>{brief}</pre>
      <button onClick={() => { try { navigator.clipboard.writeText(brief); } catch(e) {} setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ ...css.btn, marginTop: 10, background: copied ? "linear-gradient(135deg,#0a3d0a,#22cc44)" : GRAD }}>
        {copied ? "✓ Copied!" : "Copy Brief"}
      </button>
    </div>
  );
}

// ══ FOUNDATION TAB ══════════════════════════════════════════════════════════
function FoundationTab({ ctx }) {
  const { data, upd } = ctx;
  const [form, setForm] = useState(data.foundation || {});
  const [tgt, setTgt] = useState(data.target || { dailyHours: 10, dailyLectures: 5, dailyQuestions: 50 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(data.foundation || {});
    setTgt(data.target || { dailyHours: 10, dailyLectures: 5, dailyQuestions: 50 });
  }, [data.foundation, data.target]);

  const saveAll = async () => {
    await Promise.all([upd("foundation", form), upd("target", tgt)]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={css.h1}>Foundation & Targets</h1>
      <div style={{ background: T.red + "10", border: `1px solid ${T.red}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: T.red, lineHeight: 1.6 }}>
        ⚠ This section is the permanent bedrock. Every feedback response is calibrated against what you write here. A vague confession produces generic feedback. Write precisely.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={css.card}>
          <span style={css.lbl}>Daily Hour Target</span>
          <input type="number" min="1" max="18" style={css.inp} value={tgt.dailyHours} onChange={e => setTgt(t => ({ ...t, dailyHours: parseFloat(e.target.value) || 10 }))} />
          <div style={{ fontSize: 10, color: T.mut, marginTop: 5 }}>Drop year minimum: 8–10h.</div>
        </div>
        <div style={css.card}>
          <span style={css.lbl}>Daily Lecture Target</span>
          <input type="number" min="1" max="20" style={css.inp} value={tgt.dailyLectures} onChange={e => setTgt(t => ({ ...t, dailyLectures: parseInt(e.target.value) || 5 }))} />
          <div style={{ fontSize: 10, color: T.mut, marginTop: 5 }}>Batch runs ~4–6 lectures/day.</div>
        </div>
        <div style={css.card}>
          <span style={css.lbl}>Daily Questions Target</span>
          <input type="number" min="1" max="500" style={css.inp} value={tgt.dailyQuestions} onChange={e => setTgt(t => ({ ...t, dailyQuestions: parseInt(e.target.value) || 50 }))} />
          <div style={{ fontSize: 10, color: T.mut, marginTop: 5 }}>DPP + Module + PYQ combined.</div>
        </div>
      </div>

      <div style={css.card}>
        <span style={css.h3}>The Honest Confession</span>
        <div style={{ fontSize: 12, color: T.mut, marginBottom: 10, lineHeight: 1.6 }}>JEE 2025 scores. Months wasted. Topics avoided. Real habits. What actually broke your preparation. This stays permanently and all feedback references it.</div>
        <textarea rows={12} style={{ ...css.inp, resize: "vertical", lineHeight: 1.7, borderColor: (form.confession?.length || 0) < 80 ? T.red + "66" : T.bd2 }}
          placeholder="My JEE Mains 2025 score was ___. Physics was worst — specifically ___. From [month] to [month] I wasted time on ___. The real reason was ___, not what I told people..."
          value={form.confession || ""} onChange={e => setForm(f => ({ ...f, confession: e.target.value }))} />
        {(form.confession?.length || 0) < 80 && <div style={{ fontSize: 11, color: T.yel, marginTop: 5 }}>Too short. Push through the discomfort.</div>}
      </div>

      <div style={css.card}>
        <span style={css.h3}>Strategy Document</span>
        <textarea rows={14} style={{ ...css.inp, resize: "vertical", lineHeight: 1.7 }}
          placeholder={"LEVEL 1 — 7 steps per lecture\nLEVEL 2 — PYQs (Mains 2019–2026 + Adv 20yr)\nLEVEL 3 — N Awasthi, MS Chouhan, HC Verma, Irodov, Black Book..."}
          value={form.strategy || ""} onChange={e => setForm(f => ({ ...f, strategy: e.target.value }))} />
      </div>

      <div style={css.card}>
        <span style={css.h3}>Known Weak Areas</span>
        <textarea rows={5} style={{ ...css.inp, resize: "vertical", lineHeight: 1.7 }}
          placeholder={"Physics: Rotational Motion, EMI, Modern Physics\nMaths: 3D Geometry, Differential Equations\nChemistry: Organic named reactions, d-block, Salt Analysis..."}
          value={form.weakAreas || ""} onChange={e => setForm(f => ({ ...f, weakAreas: e.target.value }))} />
      </div>

      <button onClick={saveAll} style={{ ...css.btn, width: "100%", padding: "13px", fontSize: 14, background: saved ? "linear-gradient(135deg,#0a3d0a,#22cc44)" : GRAD }}>
        {saved ? "✓ Foundation Saved" : "Save Foundation & Targets"}
      </button>

      <div style={{ ...css.card, marginTop: 14, borderLeft: `2px solid ${G1}` }}>
        <span style={css.h3}>Your Level System (Reference)</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 4 }}>
          {[
            { l: "Level 1", c: G1, items: ["Attend lecture", "Quickly revise notes", "Solve doubt HW from prev lec", "Retry all class illustrations", "Start class HW, mark doubts", "DPP (if available)", "Module Questions (PW's)"] },
            { l: "Level 2", c: T.blu, items: ["Only after L1 complete", "JEE Mains PYQs 2019–2026", "JEE Advanced last 20 years", "Chapterwise + multichapter", "Practice & revision both"] },
            { l: "Level 3", c: T.pur, items: ["N Awasthi [PC]", "MS Chouhan [OC]", "VK Jaiswal [IOC]", "HC Verma Vol 1 & 2", "Irodov [Physics]", "Black Book [Maths]", "HOT Sheets"] }
          ].map(lv => (
            <div key={lv.l} style={{ background: T.s1, borderRadius: 9, padding: "12px 13px", border: `1px solid ${lv.c}22` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: lv.c, letterSpacing: "0.1em", marginBottom: 8 }}>{lv.l}</div>
              {lv.items.map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: T.mut, padding: "3px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <span style={{ color: lv.c + "77", marginRight: 5 }}>{i + 1}.</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
