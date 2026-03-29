/* ─── DATA ─────────────────────────────────────────── */
const KEY = "pankaj_v6";

const DEFAULT_TASKS = [
  // ── Morning ────────────────────────────────────────────
  { id: "s1",  time: "5:30",  name: "Wake up",         dur: 5,   sec: "Morning",   crit: false, skip: true,  desc: "Start of the daily reset cycle." },
  { id: "s2",  time: "5:35",  name: "Drink water",     dur: 5,   sec: "Morning",   crit: false, skip: true,  desc: "Hydration trigger." },
  { id: "s3",  time: "5:40",  name: "Warmup",          dur: 20,  sec: "Morning",   crit: false, skip: true,  desc: "Dynamic warmup." },
  { id: "s4",  time: "6:00",  name: "Workout",         dur: 30,  sec: "Morning",   crit: true,  skip: false, desc: "CRITICAL — 30 exercises daily." },
  { id: "s5",  time: "6:30",  name: "Fresh up",        dur: 30,  sec: "Morning",   crit: false, skip: true,  desc: "Shower and get ready." },
  // ── Study morning ──────────────────────────────────────
  { id: "s6",  time: "7:00",  name: "DSA Problems",   dur: 90,  sec: "Study",     crit: true,  skip: false, desc: "CRITICAL — 1–2 LeetCode problems." },
  { id: "s7",  time: "8:30",  name: "English",         dur: 30,  sec: "Study",     crit: false, skip: true,  desc: "Vocabulary and speaking practice." },
  // ── Morning cont ───────────────────────────────────────
  { id: "s8",  time: "9:00",  name: "Breakfast",       dur: 30,  sec: "Morning",   crit: false, skip: true,  desc: "Fuel after morning study." },
  // ── College ────────────────────────────────────────────
  { id: "s9",  time: "9:30",  name: "College",         dur: 270, sec: "College",   crit: false, skip: false, desc: "College block 9:30 AM – 2:00 PM." },
  // ── Afternoon ──────────────────────────────────────────
  { id: "s10", time: "14:00", name: "Lunch + Power Nap", dur: 90, sec: "Afternoon", crit: false, skip: true,  desc: "Lunch and recovery nap." },
  { id: "s11", time: "15:30", name: "Java Learning",   dur: 120, sec: "Study",     crit: true,  skip: false, desc: "CRITICAL — Java exercises 3:30–5:30 PM." },
  { id: "s12", time: "17:30", name: "DBMS / OS / SE",  dur: 60,  sec: "Afternoon", crit: false, skip: true,  desc: "CS core subjects." },
  // ── Evening ────────────────────────────────────────────
  { id: "s13", time: "18:30", name: "Break / walk",    dur: 60,  sec: "Evening",   crit: false, skip: true,  desc: "Active recovery." },
  { id: "s14", time: "19:30", name: "Prepare Dinner",  dur: 60,  sec: "Evening",   crit: false, skip: true,  desc: "Cook and eat dinner." },
  // ── Night ──────────────────────────────────────────────
  { id: "s15", time: "20:30", name: "Revision",        dur: 30,  sec: "Night",     crit: false, skip: true,  desc: "Revise today's learning." },
  { id: "s16", time: "21:00", name: "Review & Plan",   dur: 30,  sec: "Night",     crit: false, skip: true,  desc: "Daily review and next-day plan." },
  { id: "s17", time: "21:30", name: "English reading", dur: 30,  sec: "Night",     crit: false, skip: true,  desc: "Reading for fluency." },
  { id: "s18", time: "22:00", name: "Sleep",           dur: 450, sec: "Night",     crit: false, skip: false, desc: "7.5-hour sleep (10 PM – 5:30 AM)." },
];

const SECTIONS = ["Morning", "Study", "College", "Afternoon", "Evening", "Night"];
const SEC_COLOR = {
  Morning:   "var(--amber)",
  Study:     "var(--accent-l)",
  College:   "var(--green)",
  Afternoon: "var(--purple)",
  Evening:   "var(--teal)",
  Night:     "var(--text2)",
};

/* ─── STATE INITIALIZATION ──────────────────────────── */
let S = load();
if (!S.tasks || S.tasks.length === 0) {
  S.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  save();
}

let activeId = null;
let timerIv = null;
let timerPaused = false;
let activeTaskStart = null;
let activeTaskElapsed = 0; // seconds accumulated while paused
let hasNotified = false;
const audioAlert = new Audio("tone.mp3");
audioAlert.loop = true;

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }
  return {
    status: {},
    log: [],
    workout: 0,
    java: 0,
    dsa: 0,
    dayNum: 1,
    tasks: [],
  };
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(S));
}

function gst(id) {
  return S.status[id] || "pending";
}

/* ─── IMPROVEMENT: ANIMATION PAUSE ──────────────────── */
document.addEventListener("visibilitychange", () => {
  const bg = document.querySelector(".liquid-bg");
  if (bg) {
    if (document.hidden) bg.classList.add("paused");
    else bg.classList.remove("paused");
  }
});

/* ─── IMPROVEMENT: EXPORT / IMPORT ──────────────────── */
function exportData() {
  const data = JSON.stringify(S, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pankajOS_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (parsed && typeof parsed === "object") {
        S = parsed;
        if (!S.tasks || S.tasks.length === 0)
          S.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
        save();
        window.location.reload();
      }
    } catch (err) {
      alert("Invalid JSON file. Please upload a valid Pankaj OS backup.");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
}

/* ─── IMPROVEMENT: DYNAMIC TASK SETTINGS ────────────── */
function openSettings() {
  const list = document.getElementById("tasks-edit-list");
  list.innerHTML = "";
  S.tasks.forEach((t) => {
    list.appendChild(createTaskEditRow(t));
  });
  document.getElementById("settings-modal").classList.remove("hidden");
}

function createTaskEditRow(t) {
  const div = document.createElement("div");
  div.className = "task-edit-row";
  div.dataset.id =
    t.id || "s_" + Date.now() + Math.random().toString(36).substr(2, 5);
  div.innerHTML = `
        <button class="btn-reset" title="Remove Task" style="padding:4px 8px; color:var(--red); border-color:rgba(255,79,79,0.3)" onclick="this.parentElement.remove()">✕</button>
        <input type="text" class="task-edit-input tei-time" value="${t.time}" placeholder="HH:MM" data-field="time">
        <input type="text" class="task-edit-input tei-name" value="${t.name}" placeholder="Name" data-field="name">
        <input type="number" class="task-edit-input tei-dur" value="${t.dur}" placeholder="Min" data-field="dur">
        <input type="text" class="task-edit-input tei-sec" value="${t.sec}" placeholder="Section" data-field="sec">
        <label class="tei-check" title="Critical Task"><input type="checkbox" ${t.crit ? "checked" : ""} data-field="crit"> Crit</label>
        <label class="tei-check" title="Can be skipped"><input type="checkbox" ${t.skip ? "checked" : ""} data-field="skip"> Skip</label>
    `;
  return div;
}

function addNewTaskRow() {
  const t = {
    time: "00:00",
    name: "New Task",
    dur: 30,
    sec: "Morning",
    crit: false,
    skip: true,
  };
  document.getElementById("tasks-edit-list").appendChild(createTaskEditRow(t));
}

function saveSettings() {
  const rows = document.querySelectorAll(".task-edit-row");
  const newTasks = [];
  rows.forEach((row) => {
    newTasks.push({
      id: row.dataset.id,
      time: row.querySelector('[data-field="time"]').value || "00:00",
      name: row.querySelector('[data-field="name"]').value || "Task",
      dur: parseInt(row.querySelector('[data-field="dur"]').value) || 30,
      sec: row.querySelector('[data-field="sec"]').value || "General",
      crit: row.querySelector('[data-field="crit"]').checked,
      skip: row.querySelector('[data-field="skip"]').checked,
      desc: "Custom task definition.",
    });
  });
  S.tasks = newTasks;
  save();
  document.getElementById("settings-modal").classList.add("hidden");
  window.location.reload();
}

/* ─── DARK / LIGHT MODE ─────────────────────────────── */
let isDark = localStorage.getItem("pankaj_theme") !== "light";
function applyTheme() {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  localStorage.setItem("pankaj_theme", isDark ? "dark" : "light");
  const k = document.getElementById("toggle-knob");
  if (k) k.textContent = isDark ? "🌙" : "☀️";
}
applyTheme();
document.getElementById("mode-toggle").addEventListener("click", () => {
  isDark = !isDark;
  applyTheme();
});

/* ─── ANALOG CLOCK ──────────────────────────────────── */
(function drawTicks() {
  const g = document.getElementById("clock-ticks");
  if (!g) return;
  for (let i = 0; i < 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180,
      r1 = 13.5,
      r2 = i % 3 === 0 ? 11.5 : 12.7;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", 16 + r1 * Math.cos(a));
    l.setAttribute("y1", 16 + r1 * Math.sin(a));
    l.setAttribute("x2", 16 + r2 * Math.cos(a));
    l.setAttribute("y2", 16 + r2 * Math.sin(a));
    l.setAttribute(
      "stroke",
      i % 3 === 0 ? "rgba(200,200,255,0.45)" : "rgba(200,200,255,0.2)",
    );
    l.setAttribute("stroke-width", i % 3 === 0 ? "1.2" : "0.75");
    g.appendChild(l);
  }
})();

function updateClock() {
  const now = new Date(),
    h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds(),
    h12 = h % 12 || 12;
  const hA = ((h12 * 30 + m * 0.5 - 90) * Math.PI) / 180,
    mA = ((m * 6 + s * 0.1 - 90) * Math.PI) / 180,
    sA = ((s * 6 - 90) * Math.PI) / 180;
  const cx = 16,
    cy = 16;
  const setLine = (id, r, rBack) => {
    const el = document.getElementById(id);
    if (!el) return;
    const ang = id === "hand-hour" ? hA : id === "hand-min" ? mA : sA;
    el.setAttribute("x2", cx + r * Math.cos(ang));
    el.setAttribute("y2", cy + r * Math.sin(ang));
    if (rBack !== undefined) {
      el.setAttribute("x1", cx + rBack * Math.cos(ang));
      el.setAttribute("y1", cy + rBack * Math.sin(ang));
    }
  };
  setLine("hand-hour", 7.5);
  setLine("hand-min", 10.5);
  setLine("hand-sec", 11.5, 3);
  const parts = now
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .split(" ");
  const el = document.getElementById("clock-hhmm"),
    amp = document.getElementById("clock-ampm");
  if (el) el.textContent = parts[0] || "";
  if (amp) amp.textContent = parts[1] || "";
}
updateClock();
setInterval(updateClock, 1000);

/* ─── MODAL ─────────────────────────────────────────── */
function showModal(task, phase) {
  const ov = document.getElementById("start-modal");
  document.getElementById("modal-task-name").textContent = task.name;
  document.getElementById("modal-task-desc").textContent = task.desc;
  document.getElementById("modal-crit-badge").style.display = task.crit
    ? "inline-flex"
    : "none";
  ov.classList.remove("hidden");

  const qEl = document.getElementById("modal-question");
  const yBtn = document.getElementById("modal-yes");
  const nBtn = document.getElementById("modal-no");

  if (phase === "start") {
    qEl.textContent = "Start this task now?";
    yBtn.textContent = "Start";
    nBtn.textContent = "No Start";

    // Clear old listeners by cloning
    yBtn.replaceWith(yBtn.cloneNode(true));
    nBtn.replaceWith(nBtn.cloneNode(true));
    const newY = document.getElementById("modal-yes"),
      newN = document.getElementById("modal-no");

    newY.onclick = () => {
      ov.classList.add("hidden");
      startTimer();
      renderTimerHero();
    };
    newN.onclick = () => {
      ov.classList.add("hidden");
    };
  }
}

/* ─── IMPROVEMENT: TIMER LOGIC ──────────────────────── */
// Instead of a dumb seconds counter that gets throttled, use differences in Date.now()
function getTimerSec() {
  if (!activeId) return 0;
  let sec = activeTaskElapsed;
  if (!timerPaused && activeTaskStart) {
    sec += Math.floor((Date.now() - activeTaskStart) / 1000);
  }
  return sec;
}

function startTimer() {
  clearInterval(timerIv);
  timerPaused = false;
  if (!activeTaskStart) activeTaskStart = Date.now();

  // Interval just guarantees visual updates, throttling won't break the actual time calculated
  timerIv = setInterval(() => {
    if (!timerPaused) renderTimerHero();
  }, 1000);
}

function pauseTimer() {
  if (!timerPaused) {
    timerPaused = true;
    if (activeTaskStart) {
      activeTaskElapsed += Math.floor((Date.now() - activeTaskStart) / 1000);
      activeTaskStart = null;
    }
  } else {
    timerPaused = false;
    activeTaskStart = Date.now();
  }
  renderTimerHero();
}

/* ─── ACTIVE TASK LOGIC ──────────────────────────────── */
function updateActiveTask() {
  const next = S.tasks.find((x) => gst(x.id) === "pending");
  const newId = next ? next.id : null;

  if (newId && newId !== activeId) {
    activeId = newId;
    activeTaskElapsed = 0;
    activeTaskStart = null;
    timerPaused = false;
    hasNotified = false;
    clearInterval(timerIv);
    timerIv = null;
    showModal(
      S.tasks.find((x) => x.id === newId),
      "start",
    );
  } else if (!newId && activeId) {
    activeId = null;
    activeTaskElapsed = 0;
    activeTaskStart = null;
    clearInterval(timerIv);
    timerIv = null;
  }
}

/* ─── ACTIONS ────────────────────────────────────────── */
function setSt(id, st) {
  S.status[id] = st;
  const t = S.tasks.find((x) => x.id === id);
  if (!t) return;
  const now = new Date(),
    ts =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");
  S.log.unshift({ name: t.name, st, ts });
  if (S.log.length > 40) S.log = S.log.slice(0, 40);

  if (st === "done") {
    if (t.name.toLowerCase().includes("workout"))
      S.workout = Math.min(S.workout + 1, 30);
    if (t.name.toLowerCase().includes("java"))
      S.java = Math.min(S.java + 1, 30);
    if (t.name.toLowerCase().includes("dsa")) S.dsa++;
  }

  clearInterval(timerIv);
  timerIv = null;
  activeTaskElapsed = 0;
  activeTaskStart = null;
  hasNotified = false;

  updateActiveTask();
  save();
  render();
}

function undoSt(id) {
  const prev = S.status[id];
  delete S.status[id];
  const tname = S.tasks.find((x) => x.id === id)?.name || "Task";
  S.log = S.log.filter((l) => !(l.name === tname && l.st === prev));

  if (prev === "done") {
    if (tname.toLowerCase().includes("workout"))
      S.workout = Math.max(S.workout - 1, 0);
    if (tname.toLowerCase().includes("java")) S.java = Math.max(S.java - 1, 0);
    if (tname.toLowerCase().includes("dsa")) S.dsa = Math.max(S.dsa - 1, 0);
  }

  updateActiveTask();
  save();
  render();
}

function resetDay() {
  if (!confirm("Reset today's progress? This will clear all done tasks!"))
    return;
  S.status = {};
  S.log = [];
  S.dayNum = (S.dayNum || 1) + 1;
  activeId = null;
  activeTaskElapsed = 0;
  activeTaskStart = null;
  clearInterval(timerIv);
  timerIv = null;
  timerPaused = false;

  updateActiveTask();
  save();
  render();
}

/* ─── TIMER HERO RENDER ──────────────────────────────── */
function renderTimerHero() {
  const hero = document.getElementById("timer-hero");
  const inner = document.getElementById("timer-inner");
  if (!activeId) {
    hero.classList.remove("has-task");
    inner.innerHTML = `<div class="timer-empty"><div class="timer-empty-icon">⏱️</div><div class="timer-empty-text">No active task</div><div class="timer-empty-sub">Complete tasks to unlock the next one</div></div>`;
    return;
  }
  const t = S.tasks.find((x) => x.id === activeId);
  const started = activeTaskStart !== null || activeTaskElapsed > 0;
  const timerSec = getTimerSec();
  const tot = t.dur * 60;
  const pct = Math.min(timerSec / tot, 1);
  const isOT = timerSec > tot;

  if (isOT && !hasNotified && started) {
    hasNotified = true;
    audioAlert.play().catch(e => console.warn("Audio play blocked by browser:", e));
    setTimeout(() => {
      alert("Time is Over this task: " + t.name);
      audioAlert.pause();
      audioAlert.currentTime = 0;
    }, 100);
  }

  const R = 66,
    circ = 2 * Math.PI * R;
  const dash = circ * (1 - (started ? pct : 0));
  const col = isOT
    ? "var(--red)"
    : pct > 0.75
      ? "var(--amber)"
      : "var(--accent-l)";
  const glow = started
    ? `drop-shadow(0 0 10px ${isOT ? "#ff4f4f" : "#8c85ff"})`
    : "none";

  const mm = Math.floor(timerSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (timerSec % 60).toString().padStart(2, "0");
  const remSec = Math.max(tot - timerSec, 0);
  const rm = Math.floor(remSec / 60),
    rs = (remSec % 60).toString().padStart(2, "0");
  const remStr = isOT
    ? `+${Math.floor((timerSec - tot) / 60)}m ${((timerSec - tot) % 60).toString().padStart(2, "0")}s overtime`
    : `${rm}m ${rs} remaining`;

  hero.classList.toggle("has-task", started);
  inner.innerHTML = `
    <div class="ring-wrap">
      <svg class="ring-svg" width="100%" height="100%" viewBox="0 0 164 164">
        <circle class="ring-track" cx="82" cy="82" r="${R}" stroke-width="10"/>
        <circle class="ring-progress" cx="82" cy="82" r="${R}" stroke-width="10" stroke="${col}" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${dash.toFixed(2)}" style="filter:${glow}"/>
      </svg>
      <div class="ring-center">
        <div class="ring-time${isOT && started ? " overtime" : ""}" aria-live="polite">${started ? mm + ":" + ss : "--:--"}</div>
        <div class="ring-label">${started ? (timerPaused ? "paused" : "elapsed") : "ready"}</div>
      </div>
    </div>
    <div class="timer-info">
      <div class="timer-tag">
        <span class="timer-dot"></span>
        ${started ? (timerPaused ? "⏸ paused" : "▶ active") : "⏸ waiting to start"}
      </div>
      ${t.crit ? '<div class="timer-crit">● Critical task</div>' : ""}
      <div class="timer-task-name">${t.name}</div>
      <div class="timer-task-desc">${t.desc}</div>
      <div class="timer-remaining">${started ? remStr : "Duration: " + t.dur + " min"}</div>
      <div class="timer-btns">
        ${
          started
            ? `
          <button class="btn-timer-pause" onclick="pauseTimer()">${timerPaused ? "▶ Resume" : "⏸ Pause"}</button>
          <button class="btn-timer-done" onclick="setSt('${t.id}','done')">✓ Complete</button>
          ${t.skip ? `<button class="btn-timer-skip" onclick="setSt('${t.id}','skip')">⏭ Skip</button>` : ""}
        `
            : `
          <button class="btn-timer-done" style="background:linear-gradient(135deg,var(--accent),var(--accent-l));box-shadow:0 4px 16px rgba(108,99,255,0.4)" onclick="startTimer()">▶ Start Now</button>
          ${t.skip ? `<button class="btn-timer-skip" onclick="setSt('${t.id}','skip')">⏭ Skip</button>` : ""}
        `
        }
      </div>
    </div>`;
}

/* ─── MAIN RENDER ────────────────────────────────────── */
function render() {
  const now = new Date();
  document.getElementById("live-date").textContent = now.toLocaleDateString(
    "en-IN",
    { weekday: "short", day: "numeric", month: "short" },
  );
  document.getElementById("day-num").textContent = S.dayNum;

  let done = 0,
    skip = 0,
    critDone = 0;
  S.tasks.forEach((t) => {
    const s = gst(t.id);
    if (s === "done") {
      done++;
      if (t.crit) critDone++;
    }
    if (s === "skip") skip++;
  });

  const total = S.tasks.length;
  const left = total - done - skip;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("hero-pct").textContent = pct + "%";
  document.getElementById("hero-bar").style.width = pct + "%";
  document.getElementById("hero-glow").style.width = pct + "%";
  document.getElementById("hs-done").textContent = done;
  document.getElementById("hs-skip").textContent = skip;
  document.getElementById("hs-left").textContent = left;
  document.getElementById("hs-crit").textContent =
    critDone + "/" + S.tasks.filter((t) => t.crit).length;
  document.getElementById("g-workout").textContent = S.workout;
  document.getElementById("g-java").textContent = S.java;
  document.getElementById("g-dsa").textContent = S.dsa;
  document.getElementById("gb-workout").style.width =
    (S.workout / 30) * 100 + "%";
  document.getElementById("gb-java").style.width = (S.java / 30) * 100 + "%";
  document.getElementById("gb-dsa").style.width =
    Math.min((S.dsa / 30) * 100, 100) + "%";

  const circ = 295.3,
    rf = document.getElementById("ring-fill");
  rf.style.strokeDashoffset = circ * (1 - pct / 100);
  rf.style.stroke =
    pct >= 100
      ? "var(--green)"
      : pct > 60
        ? "var(--accent-l)"
        : "var(--accent)";
  document.getElementById("ring-pct").textContent = pct + "%";
  document.getElementById("done-lbl").textContent = done + " / " + total;

  // Breakdown
  const cats = {};
  S.tasks.forEach((t) => {
    if (!cats[t.sec]) cats[t.sec] = { total: 0, done: 0 };
    cats[t.sec].total++;
    if (gst(t.id) === "done") cats[t.sec].done++;
  });
  const bd = document.getElementById("breakdown");
  bd.innerHTML = "";
  SECTIONS.forEach((sec) => {
    const c = cats[sec];
    if (!c) return;
    const p = Math.round((c.done / c.total) * 100),
      col = SEC_COLOR[sec] || "var(--accent)";
    const div = document.createElement("div");
    div.className = "bl-row";
    div.innerHTML = `<div class="bl-sec">${sec}</div><div class="bl-track"><div class="bl-fill" style="width:${p}%;background:${col}"></div></div><div class="bl-count" style="color:${col}">${c.done}/${c.total}</div><div class="bl-pct" style="color:${col}">${p}%</div>`;
    bd.appendChild(div);
  });

  // Timeline
  const tl = document.getElementById("timeline");
  tl.innerHTML = "";
  let lastSec = "",
    firstPending = false;
  S.tasks.forEach((task, i) => {
    const st = gst(task.id);
    let isActive = false;
    if (st === "pending") {
      if (!firstPending) {
        firstPending = true;
        isActive = true;
      }
    }
    if (task.sec !== lastSec) {
      lastSec = task.sec;
      const sh = document.createElement("div");
      sh.className = "tl-section";
      sh.textContent = task.sec;
      tl.appendChild(sh);
    }

    // Calculate cumulative percentage assuming list order maps roughly to day flow
    const cumDone = S.tasks
      .slice(0, i + 1)
      .filter((x) => gst(x.id) === "done").length;
    const cumPct = Math.round((cumDone / (i + 1)) * 100);
    const barColor = task.crit
      ? "var(--red)"
      : task.sec === "Study"
        ? "var(--accent-l)"
        : SEC_COLOR[task.sec] || "var(--text3)";

    const row = document.createElement("div");
    row.className =
      "task-row" +
      (isActive ? " is-active" : "") +
      (st === "done" ? " is-done" : st === "skip" ? " is-skipped" : "");
    row.style.animationDelay = i * 0.01 + "s";
    row.innerHTML = `
      <div class="tr-time">${task.time}</div>
      <div class="tr-spine"><div class="tr-line"></div><div class="tr-dot ${st === "done" ? "d-done" : st === "skip" ? "d-skip" : isActive ? "d-active" : ""}${task.crit ? " d-crit" : ""}"></div></div>
      <div class="tr-content">
        <div class="tname">${task.name}</div>
        <div class="ttags">
          <span class="tag">${task.dur < 60 ? task.dur + "m" : task.dur / 60 + "h"}</span>
          ${task.crit ? '<span class="tag tag-crit">critical</span>' : ""}
          ${task.skip ? '<span class="tag tag-skip">skippable</span>' : ""}
          ${st === "done" ? '<span class="tag tag-done">done</span>' : ""}
          ${st === "skip" ? '<span class="tag tag-skipped">skipped</span>' : ""}
        </div>
        <div class="task-pct-wrap">
          <div class="task-pct-bar"><div class="task-pct-fill" style="width:${cumPct}%;background:${barColor}"></div></div>
          <div class="task-pct-val">${cumPct}%</div>
        </div>
      </div>
      <div class="tr-actions">
        ${
          st === "pending"
            ? `
          <button class="btn-act b-done" title="Complete" onclick="event.stopPropagation();setSt('${task.id}','done')">✓</button>
          ${task.skip ? `<button class="btn-act b-skip" title="Skip" onclick="event.stopPropagation();setSt('${task.id}','skip')">⏭</button>` : ""}
        `
            : `<button class="btn-act b-undo" title="Undo" onclick="event.stopPropagation();undoSt('${task.id}')">↺</button>`
        }
      </div>`;
    tl.appendChild(row);
  });

  // Log
  const logEl = document.getElementById("log-list");
  logEl.innerHTML =
    S.log.length === 0
      ? '<div class="log-empty">No activity yet</div>'
      : S.log
          .map(
            (l) =>
              `<div class="log-row"><div class="log-icon ${l.st === "done" ? "li-done" : "li-skip"}">${l.st === "done" ? "✓" : "⏭"}</div><div class="log-name">${l.name}</div><div class="log-t">${l.ts}</div></div>`,
          )
          .join("");
  document.getElementById("log-time").textContent = now.toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" },
  );

  renderTimerHero();
}

/* ─── INIT ───────────────────────────────────────────── */
updateActiveTask();
render();
setInterval(() => {
  const now = new Date();
  document.getElementById("live-date").textContent = now.toLocaleDateString(
    "en-IN",
    { weekday: "short", day: "numeric", month: "short" },
  );
  document.getElementById("log-time").textContent = now.toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" },
  );
}, 30000);
