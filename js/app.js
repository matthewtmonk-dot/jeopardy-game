
/* ============================================================
   1) EDIT ONLY THIS BANK TO SWAP OUT YOUR GAME CONTENT
   - image: optional. Use a URL OR a data URL (base64) if you want it truly offline.
     Example data URL starter: "data:image/png;base64,iVBORw0KGgoAAA..."
   ============================================================ */
const BANK = {
  title: "Smarty Party",
  subtitle: "Think first. Compute second.",
  values: [100, 200, 300, 400, 500],
  categories: [

    {
      name: "Fractions & Decimals",
      clues: [
        { 
          q: "What is 3/4 + 5/8 ?", 
          a: "11/8 or 1 3/8" 
        },
        { 
          q: "A recipe uses 2 1/3 cups of flour. You make half the recipe. How much flour do you need?", 
          a: "1 1/6 cups" 
        },
        { 
          q: "0.375 as a fraction in simplest form.", 
          a: "3/8" 
        },
        { 
          q: "Which is greater: 5/6 or 7/9 ?", 
          a: "5/6 (because 5×9 = 45 and 7×6 = 42)" 
        },
        { 
          q: "A tank is 3/5 full. After adding 1/4 of the tank’s capacity, how full is it?", 
          a: "17/20 full" 
        }
      ]
    },

    {
      name: "Ratios & Rates",
      clues: [
        { 
          q: "Write the ratio 12 boys to 18 girls in simplest form.", 
          a: "2:3" 
        },
        { 
          q: "A car travels 180 miles in 3 hours. What is the unit rate?", 
          a: "60 miles per hour" 
        },
        { 
          q: "The ratio of red to blue marbles is 3:5. There are 40 marbles total. How many are red?", 
          a: "15 red marbles" 
        },
        { 
          q: "If 4 notebooks cost $10, how much do 6 notebooks cost at the same rate?", 
          a: "$15" 
        },
        { 
          q: "A map scale is 1 inch : 50 miles. Two cities are 3.5 inches apart on the map. How far apart are they in real life?", 
          a: "175 miles" 
        }
      ]
    },

    {
      name: "Expressions & Equations",
      clues: [
        { 
          q: "Evaluate 3x + 7 when x = 4.", 
          a: "19" 
        },
        { 
          q: "Solve: x + 15 = 42", 
          a: "x = 27" 
        },
        { 
          q: "Simplify: 5a + 3a − 2a", 
          a: "6a" 
        },
        { 
          q: "Solve: 6x = 54", 
          a: "x = 9" 
        },
        { 
          q: "A number decreased by 8 is 23. What is the number?", 
          a: "31" 
        }
      ]
    },

    {
      name: "Geometry",
      clues: [
        { 
          q: "Find the area of a rectangle with length 9 cm and width 5 cm.", 
          a: "45 square cm" 
        },
        { 
          q: "Find the area of a triangle with base 10 cm and height 6 cm.", 
          a: "30 square cm" 
        },
        { 
          q: "Find the volume of a rectangular prism 8 × 4 × 3.", 
          a: "96 cubic units" 
        },
        { 
          q: "The sum of interior angles of a quadrilateral is ?", 
          a: "360 degrees" 
        },
        { 
          q: "A cube has side length 5 cm. What is its volume?", 
          a: "125 cubic cm" 
        }
      ]
    },

    {
      name: "Statistics",
      clues: [
        { 
          q: "Find the mean of: 4, 6, 8, 10, 12", 
          a: "8" 
        },
        { 
          q: "The range of: 15, 22, 19, 30, 18", 
          a: "15" 
        },
        { 
          q: "A data set has a mean of 20. The sum of the data is 100. How many numbers are in the set?", 
          a: "5 numbers" 
        },
        { 
          q: "If the mean of 4 numbers is 12, what is their total sum?", 
          a: "48" 
        },
        { 
          q: "The median of 3, 7, 9, 12, 14 is ?", 
          a: "9" 
        }
      ]
    }

  ]
};

/* ============================================================
   AUDIO (Firefox-friendly SFX)
   ============================================================ */
const SFX = {
  correct: new Audio("assets/audio/correct.mp3"),
  incorrect: new Audio("assets/audio/incorrect.mp3"),
  alarm: new Audio("assets/audio/alarm.mp3"),
};

SFX.correct.preload = "auto";
SFX.incorrect.preload = "auto";
SFX.alarm.preload = "auto";
SFX.correct.volume = 0.9;
SFX.incorrect.volume = 0.9;
SFX.alarm.volume = 0.9;

let audioUnlocked = false;

async function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  for (const a of Object.values(SFX)) {
    try {
      a.muted = true;
      await a.play();    // must happen during a user gesture
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    } catch (err) {
      console.warn("Audio unlock failed:", err);
    }
  }
}

window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
window.addEventListener("keydown", unlockAudioOnce, { once: true });

function playSfx(name) {
  const a = SFX[name];
  if (!a) return;

  try {
    a.pause();
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(err => console.warn("SFX blocked:", err));
    }
  } catch (err) {
    console.warn("SFX error:", err);
  }
}

/* ============================================================
   BACKGROUND MUSIC (loop) — modal header controls
   ============================================================ */
const BGM = {
  enabled: true,
  volume: 0.35,
};

function initClueMusicControls(){
  const audio = document.getElementById("jeopardyLoop");
  const btn = document.getElementById("clueMusicToggle");
  const vol = document.getElementById("clueMusicVol");

  if(!audio || !btn || !vol){
    console.warn("Missing BGM elements. Check IDs: jeopardyLoop, clueMusicToggle, clueMusicVol");
    return;
  }

  // restore settings
  const savedEnabled = localStorage.getItem("clueMusicEnabled");
  const savedVol = localStorage.getItem("clueMusicVol");

  if(savedEnabled !== null) BGM.enabled = (savedEnabled === "1");
  if(savedVol !== null) BGM.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));

  audio.loop = true;
  audio.volume = BGM.volume;
  vol.value = String(BGM.volume);

  function syncUi(){
    btn.textContent = `Music: ${BGM.enabled ? "On" : "Off"}`;
    btn.setAttribute("aria-pressed", String(BGM.enabled));
  }

  btn.addEventListener("click", () => {
    BGM.enabled = !BGM.enabled;
    localStorage.setItem("clueMusicEnabled", BGM.enabled ? "1" : "0");
    syncUi();

    if(!BGM.enabled){
      audio.pause();
      return;
    }

    // If modal is open, start right now (this click is a user gesture)
    if(els.overlay.classList.contains("show")){
      const p = audio.play();
      if(p && typeof p.catch === "function"){
        p.catch(err => console.warn("BGM play blocked:", err));
      }
    }
  });

  vol.addEventListener("input", () => {
    BGM.volume = Math.max(0, Math.min(1, parseFloat(vol.value)));
    localStorage.setItem("clueMusicVol", String(BGM.volume));
    audio.volume = BGM.volume;
  });

  syncUi();
}

function startBgmOnClueOpen(){
  const audio = document.getElementById("jeopardyLoop");
  if(!audio) return;

  audio.volume = BGM.volume;

  if(!BGM.enabled) return;
  if(!audio.paused) return;

  // openClue is triggered by a click → browser allows play()
  const p = audio.play();
  if(p && typeof p.catch === "function"){
    p.catch(err => console.warn("BGM play blocked:", err));
  }
}

function stopBgm(){
  const audio = document.getElementById("jeopardyLoop");
  if(!audio) return;
  audio.pause();
}

/* ============================================================
   2) GAME ENGINE (state + rendering)
   ============================================================ */
const STORAGE_KEY = "jeopardy_singlefile_v1";
const TEAM_COLORS = ["red", "orange", "yellow", "green", "blue", "purple"];
const SCOREBOARD_BREAKPOINT = 768;

const els = {
  title: document.getElementById("gameTitle"),
  subtitle: document.getElementById("gameSubtitle"),
  teamCount: document.getElementById("teamCount"),
  defaultTime: document.getElementById("defaultTime"),
  boardHeader: document.getElementById("boardHeader"),
  boardGrid: document.getElementById("boardGrid"),
  scoreBody: document.getElementById("scoreBody"),
  scorePanel: document.getElementById("scorePanel"),
  scoreHeaderBar: document.getElementById("scoreHeaderBar"),
  scoreToggleBtn: document.getElementById("scoreToggleBtn"),
  statusText: document.getElementById("statusText"),
  modalTimerMinusBtn: document.getElementById("modalTimerMinusBtn"),
  modalTimerStartStopBtn: document.getElementById("modalTimerStartStopBtn"),
  modalTimerPlusBtn: document.getElementById("modalTimerPlusBtn"),
  modalTimerDisplay: document.getElementById("modalTimerDisplay"),
  overlay: document.getElementById("overlay"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  questionText: document.getElementById("questionText"),
  answerBox: document.getElementById("answerBox"),
  answerText: document.getElementById("answerText"),
  toggleAnswerBtn: document.getElementById("toggleAnswerBtn"),
  closeBtn: document.getElementById("closeBtn"),
  markUsedBtn: document.getElementById("markUsedBtn"),
  correctBtn: document.getElementById("correctBtn"),
  incorrectBtn: document.getElementById("incorrectBtn"),
  imgWrap: document.getElementById("imgWrap"),

  resetGameBtn: document.getElementById("resetGameBtn"),
  resetScoresBtn: document.getElementById("resetScoresBtn"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  settingsToggleBtn: document.getElementById("settingsToggleBtn"),
  settingsCloseBtn: document.getElementById("settingsCloseBtn"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  appRoot: document.getElementById("app"),
  activeTeamSelect: null,
  activeTeamWrap: null,
};

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function sanitizeDefaultSeconds(value){
  return clamp(parseInt(value, 10) || 20, 5, 600);
}

function buildDefaultTeams(){
  return TEAM_COLORS.map((color, i) => ({
    name: `Team ${i + 1}`,
    score: 0,
    color,
  }));
}

function pickNextUnusedColor(usedColors, preferredColor){
  if(preferredColor && TEAM_COLORS.includes(preferredColor) && !usedColors.has(preferredColor)){
    return preferredColor;
  }
  for(const color of TEAM_COLORS){
    if(!usedColors.has(color)) return color;
  }
  return TEAM_COLORS[0];
}

function enforceUniqueTeamColors(teamList, count = teamList.length){
  const usedColors = new Set();
  const activeCount = clamp(parseInt(count, 10) || teamList.length, 1, teamList.length);

  for(let i=0; i<activeCount; i++){
    const requestedColor = String(teamList[i]?.color || "").trim().toLowerCase();
    // If color is missing/invalid, fall back to default startup ordering by team slot.
    const preferred = TEAM_COLORS.includes(requestedColor) ? requestedColor : TEAM_COLORS[i];
    const nextColor = pickNextUnusedColor(usedColors, preferred);
    teamList[i].color = nextColor;
    usedColors.add(nextColor);
  }
}

// Single source of truth for team-driven accents across scoreboard and clue modal.
function getTeamColor(teamIndex = state.selectedTeam){
  const safeIndex = clamp(parseInt(teamIndex, 10) || 0, 0, TEAM_COLORS.length - 1);
  const requested = String(state.teams?.[safeIndex]?.color || "").trim().toLowerCase();
  return TEAM_COLORS.includes(requested) ? requested : TEAM_COLORS[safeIndex] || TEAM_COLORS[0];
}

function syncTeamLinkedVisuals(){
  const accent = getTeamColor(state.selectedTeam);
  if(els.activeTeamWrap) els.activeTeamWrap.style.setProperty("--team-accent", accent);
  if(els.overlay) els.overlay.style.setProperty("--team-accent", accent);
}

function closeTeamColorPalettes(){
  document.querySelectorAll(".teamColorPalette.show").forEach((palette) => {
    palette.classList.remove("show");
    palette.closest(".team")?.classList.remove("palette-open");
  });
}

function normalizeTeams(rawTeams){
  const defaults = buildDefaultTeams();
  const list = Array.isArray(rawTeams) ? rawTeams : [];

  const normalized = defaults.map((fallback, i) => {
    const item = list[i] || {};
    const requestedColor = String(item.color || "").trim().toLowerCase();
    const color = TEAM_COLORS.includes(requestedColor) ? requestedColor : fallback.color;
    return {
      name: String(item.name || fallback.name),
      score: Number.isFinite(Number(item.score)) ? Number(item.score) : fallback.score,
      color,
    };
  });

  enforceUniqueTeamColors(normalized);
  return normalized;
}

function defaultState(){
  return {
    teamCount: 3,
    defaultSeconds: 20,
    teams: buildDefaultTeams(),
    selectedTeam: 0,
    used: {}, // key "c-r" => true
    lastClue: null, // {c, r}
    showAnswer: false,
    currentClueKey: null,
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);

    // light validation
    if(typeof parsed.teamCount !== "number") return defaultState();
    parsed.teams = normalizeTeams(parsed.teams);
    if(typeof parsed.used !== "object" || parsed.used === null) parsed.used = {};
    parsed.teamCount = clamp(parsed.teamCount, 1, 6);
    parsed.defaultSeconds = sanitizeDefaultSeconds(parsed.defaultSeconds ?? 20);
    parsed.selectedTeam = clamp(parsed.selectedTeam ?? 0, 0, parsed.teamCount - 1);
    return parsed;
  }catch{
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// Runtime used-clue set (single source of truth while page is open)
const usedClues = new Set(Object.keys(state.used || {}).filter(k => state.used[k]));
let currentClueKey = state.currentClueKey ?? null;

function makeClueKey(c, r){
  return `${c}-${r}`;
}

function markTileUsed(key){
  if(!key) return;
  const selector = `[data-clue-key="${key}"]`;
  const tile = document.querySelector(selector);
  if(tile){
    tile.classList.add("used");
    tile.setAttribute("aria-disabled", "true");
    tile.style.pointerEvents = "none";
  }
}

function markCurrentClueUsed(){
  if(!state.lastClue) return;
  const key = makeClueKey(state.lastClue.c, state.lastClue.r);
  state.used[key] = true;
  usedClues.add(key);
  state.currentClueKey = key;
  currentClueKey = key;
  saveState();
  markTileUsed(key);
  renderBoard();
  setStatus("Clue used");
}

/* ============================================================
   3) Rendering: Board + Scoreboard
   ============================================================ */
function renderHeader(){
  els.title.textContent = BANK.title || "Jeopardy";
  if(els.subtitle) els.subtitle.textContent = BANK.subtitle || "";
  if(els.teamCount) els.teamCount.value = String(clamp(state.teamCount, 1, 6));
  if(els.defaultTime) els.defaultTime.value = String(sanitizeDefaultSeconds(state.defaultSeconds));
}

function renderBoard(){
  // categories header
  els.boardHeader.innerHTML = "";
  BANK.categories.forEach(cat => {
    const d = document.createElement("div");
    d.className = "cat";
    d.textContent = cat.name;
    els.boardHeader.appendChild(d);
  });

  // grid cells
  els.boardGrid.innerHTML = "";
  const values = BANK.values || [100,200,300,400,500];

  for(let r=0; r<values.length; r++){
    for(let c=0; c<BANK.categories.length; c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      const key = `${c}-${r}`;
      const isUsed = !!state.used[key];

      cell.textContent = `$${values[r]}`;
      if(isUsed) cell.classList.add("used");

      cell.addEventListener("click", () => {
        if(isUsed) return;
        openClue(c, r);
      });

      els.boardGrid.appendChild(cell);
    }
  }
}

function renderScoreboard(){
  els.scoreBody.innerHTML = "";

  const activeCount = clamp(state.teamCount, 1, TEAM_COLORS.length);
  const beforeColors = state.teams.map(team => team.color);
  enforceUniqueTeamColors(state.teams, activeCount);
  const colorsChanged = state.teams.some((team, idx) => team.color !== beforeColors[idx]);
  if(colorsChanged) saveState();

  const colorOwners = new Map();
  for(let i=0; i<activeCount; i++){
    const color = String(state.teams[i]?.color || "").trim().toLowerCase();
    if(TEAM_COLORS.includes(color) && !colorOwners.has(color)) colorOwners.set(color, i);
  }

  for(let i=0; i<state.teamCount; i++){
    const t = state.teams[i];

    const wrap = document.createElement("div");
    wrap.className = "team" + (i === state.selectedTeam ? " selected" : "");
    wrap.style.setProperty("--team-accent", getTeamColor(i));
    wrap.addEventListener("click", () => {
      state.selectedTeam = i;
      saveState();
      renderScoreboard();
      updateModalMeta();
    });

    const left = document.createElement("div");
    left.className = "teamTop";

    const nameView = document.createElement("div");
    nameView.className = "teamName teamNameView";
    nameView.tabIndex = 0;
    nameView.textContent = t.name;
    nameView.title = "Click to edit team name";

    const nameEdit = document.createElement("input");
    nameEdit.type = "text";
    nameEdit.className = "teamName teamNameEdit";
    nameEdit.value = t.name;
    nameEdit.style.display = "none";

    const openEdit = () => {
      nameEdit.value = state.teams[i].name;
      nameView.style.display = "none";
      nameEdit.style.display = "block";
      nameEdit.focus();
      nameEdit.select();
    };

    const saveEdit = () => {
      const trimmed = nameEdit.value.trim();
      state.teams[i].name = trimmed || `Team ${i + 1}`;
      saveState();
      nameView.textContent = state.teams[i].name;
      nameEdit.value = state.teams[i].name;
      nameEdit.style.display = "none";
      nameView.style.display = "block";
      renderActiveTeamOptions();
      updateModalMeta();
    };

    nameView.addEventListener("click", (e) => {
      e.stopPropagation();
      openEdit();
    });
    nameView.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openEdit();
      }
    });
    nameEdit.addEventListener("click", e => e.stopPropagation());
    nameEdit.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){
        e.preventDefault();
        saveEdit();
      }else if(e.key === "Escape"){
        nameEdit.value = state.teams[i].name;
        nameEdit.style.display = "none";
        nameView.style.display = "block";
      }
    });
    nameEdit.addEventListener("blur", saveEdit);

    const nameRow = document.createElement("div");
    nameRow.className = "teamNameRow";

    const colorPickerWrap = document.createElement("div");
    colorPickerWrap.className = "teamColorPickerWrap";
    colorPickerWrap.addEventListener("click", (e) => e.stopPropagation());

    const colorTrigger = document.createElement("button");
    colorTrigger.type = "button";
    colorTrigger.className = "teamColorDotBtn";
    colorTrigger.style.setProperty("--swatch-color", getTeamColor(i));
    colorTrigger.setAttribute("aria-label", `Change ${t.name} color`);
    colorTrigger.title = "Change team color";

    const colorPalette = document.createElement("div");
    colorPalette.className = "teamColorPalette";

    for(const colorName of TEAM_COLORS){
      const swatchBtn = document.createElement("button");
      swatchBtn.type = "button";
      swatchBtn.className = "teamColorSwatch";
      swatchBtn.style.setProperty("--swatch-color", colorName);
      swatchBtn.setAttribute("aria-label", `Set color ${colorName}`);
      swatchBtn.title = colorName.charAt(0).toUpperCase() + colorName.slice(1);

      const owner = colorOwners.get(colorName);
      const usedByOtherTeam = owner !== undefined && owner !== i;
      if(usedByOtherTeam){
        swatchBtn.disabled = true;
        swatchBtn.classList.add("is-disabled");
        swatchBtn.title = `${swatchBtn.title} (in use)`;
      }

      if(colorName === getTeamColor(i)){
        swatchBtn.classList.add("is-selected");
      }

      swatchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if(swatchBtn.disabled) return;

        const nextColor = String(colorName || "").trim().toLowerCase();
        const colorTaken = state.teams.some((team, idx) => {
          if(idx === i || idx >= activeCount) return false;
          return String(team?.color || "").trim().toLowerCase() === nextColor;
        });
        if(!TEAM_COLORS.includes(nextColor) || colorTaken) return;

        state.teams[i].color = nextColor;
        saveState();
        closeTeamColorPalettes();
        renderScoreboard();
        updateModalMeta();
      });

      colorPalette.appendChild(swatchBtn);
    }

    colorTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = colorPalette.classList.contains("show");
      closeTeamColorPalettes();
      if(!isOpen){
        colorPalette.classList.add("show");
        wrap.classList.add("palette-open");
      }
    });

    colorPickerWrap.append(colorTrigger, colorPalette);
    nameRow.append(nameView, colorPickerWrap);

    left.append(nameRow, nameEdit);

    const btnRow = document.createElement("div");
    btnRow.className = "teamBtns";

    const minus = document.createElement("button");
    minus.className = "btn mini";
    minus.textContent = "–100";
    minus.title = "Subtract 100 (manual)";
    minus.addEventListener("click", (e) => {
      e.stopPropagation();
      state.teams[i].score -= 100;
      saveState();
      renderScoreboard();
    });

    const plus = document.createElement("button");
    plus.className = "btn mini";
    plus.textContent = "+100";
    plus.title = "Add 100 (manual)";
    plus.addEventListener("click", (e) => {
      e.stopPropagation();
      state.teams[i].score += 100;
      saveState();
      renderScoreboard();
    });

    btnRow.append(minus, plus);
    left.appendChild(btnRow);

    const score = document.createElement("div");
    score.className = "score";
    score.textContent = t.score;

    wrap.append(left, score);
    els.scoreBody.appendChild(wrap);
  }

  renderActiveTeamOptions();
  syncTeamLinkedVisuals();
}

function ensureActiveTeamControl(){
  if(els.activeTeamSelect) return;

  const modalTop = els.overlay?.querySelector(".modalTop");
  if(!modalTop) return;

  const wrap = document.createElement("div");
  wrap.className = "pill activeTeamControl";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "8px";

  const label = document.createElement("label");
  label.setAttribute("for", "activeTeamSelect");
  label.textContent = "Active Team";

  const select = document.createElement("select");
  select.id = "activeTeamSelect";
  select.className = "activeTeamSelect";

  wrap.append(label, select);
  modalTop.insertBefore(wrap, els.closeBtn);

  els.activeTeamWrap = wrap;
  els.activeTeamSelect = select;

  select.addEventListener("change", () => {
    const next = clamp(parseInt(select.value, 10) || 0, 0, state.teamCount - 1);
    state.selectedTeam = next;
    applyActiveTeamAccent();
    saveState();
    renderScoreboard();
    updateModalMeta();
  });
}

function applyActiveTeamAccent(){
  syncTeamLinkedVisuals();
}

function renderActiveTeamOptions(){
  ensureActiveTeamControl();
  if(!els.activeTeamSelect) return;

  const active = clamp(state.selectedTeam ?? 0, 0, state.teamCount - 1);
  state.selectedTeam = active;

  els.activeTeamSelect.innerHTML = "";
  for(let i=0; i<state.teamCount; i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    const teamName = String(state.teams[i]?.name || "").trim();
    opt.textContent = teamName || `Team ${i+1}`;
    els.activeTeamSelect.appendChild(opt);
  }

  els.activeTeamSelect.value = String(active);
  applyActiveTeamAccent();
}

function setStatus(msg){
  els.statusText.textContent = msg;
}

function closeSettingsDrawer(){
  if(!els.appRoot) return;
  els.appRoot.dataset.settingsOpen = "false";
  if(els.settingsBackdrop) els.settingsBackdrop.hidden = true;
  if(els.settingsToggleBtn) els.settingsToggleBtn.setAttribute("aria-expanded", "false");
}

function openSettingsDrawer(){
  if(!els.appRoot) return;
  els.appRoot.dataset.settingsOpen = "true";
  if(els.settingsBackdrop) els.settingsBackdrop.hidden = false;
  if(els.settingsToggleBtn) els.settingsToggleBtn.setAttribute("aria-expanded", "true");
}

function toggleSettingsDrawer(){
  if(!els.appRoot) return;
  const isOpen = els.appRoot.dataset.settingsOpen === "true";
  if(isOpen) closeSettingsDrawer();
  else openSettingsDrawer();
}

function syncSettingsDrawerForViewport(){
  if(!els.appRoot) return;
  const isOpen = els.appRoot.dataset.settingsOpen === "true";
  if(els.settingsBackdrop) els.settingsBackdrop.hidden = !isOpen;
  if(els.settingsToggleBtn) els.settingsToggleBtn.setAttribute("aria-expanded", String(isOpen));
  if(!isOpen){
    els.appRoot.dataset.settingsOpen = "false";
  }
}

function isScoreboardCollapsible(){
  return window.matchMedia(`(max-width: ${SCOREBOARD_BREAKPOINT}px)`).matches;
}

function setScoreboardCollapsed(collapsed){
  if(!els.scorePanel || !els.scoreToggleBtn) return;
  const shouldCollapse = !!collapsed && isScoreboardCollapsible();
  els.scorePanel.classList.toggle("is-collapsed", shouldCollapse);
  els.scoreToggleBtn.setAttribute("aria-expanded", String(!shouldCollapse));
  els.scoreToggleBtn.textContent = shouldCollapse ? "▼" : "▲";
}

function toggleScoreboardCollapsed(){
  if(!els.scorePanel || !isScoreboardCollapsible()) return;
  setScoreboardCollapsed(!els.scorePanel.classList.contains("is-collapsed"));
}

function syncScoreboardForViewport(){
  if(!els.scorePanel) return;
  if(isScoreboardCollapsible()){
    if(!els.scorePanel.dataset.scoreboardInit){
      setScoreboardCollapsed(true);
      els.scorePanel.dataset.scoreboardInit = "1";
    }
    return;
  }
  setScoreboardCollapsed(false);
}

function isFullscreenActive(){
  return !!document.fullscreenElement;
}

function syncOverlayHost(){
  if(!els.overlay) return;
  const target = (document.fullscreenElement === els.appRoot && els.appRoot) ? els.appRoot : document.body;
  if(els.overlay.parentElement !== target){
    target.appendChild(els.overlay);
  }
}

function updateFullscreenButtonLabel(){
  if(!els.fullscreenBtn) return;
  els.fullscreenBtn.textContent = isFullscreenActive() ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleFullscreen(){
  const target = els.appRoot || document.documentElement;
  try{
    if(!document.fullscreenElement){
      if(target?.requestFullscreen) await target.requestFullscreen();
    }else if(document.exitFullscreen){
      await document.exitFullscreen();
    }
  }catch{
    // fail silently
  }
}

/* ============================================================
   4) Clue modal
   ============================================================ */
function clueAt(c, r){
  const cat = BANK.categories[c];
  const clue = cat?.clues?.[r];
  const value = (BANK.values || [100,200,300,400,500])[r] ?? 0;
  return { cat, clue, value };
}

function renderClueImage(imageSrc){
  if(!els.imgWrap) return;

  const src = String(imageSrc ?? "").trim();
  els.imgWrap.replaceChildren();

  // Only create an image node when a clue actually provides a source.
  if(!src){
    els.imgWrap.style.display = "none";
    return;
  }

  const img = document.createElement("img");
  img.alt = "";
  img.src = src;
  img.addEventListener("error", () => {
    els.imgWrap.replaceChildren();
    els.imgWrap.style.display = "none";
  }, { once: true });

  els.imgWrap.appendChild(img);
  els.imgWrap.style.display = "block";
}

function updateClueImageForPhase(){
  if(!state.lastClue) return;
  const { clue } = clueAt(state.lastClue.c, state.lastClue.r);
  if(!clue) return;

  const questionImage = String(clue.image ?? clue.question_image ?? "").trim();
  const answerImage = String(clue.answer_image ?? "").trim();
  const imageToShow = state.showAnswer && answerImage ? answerImage : questionImage;

  renderClueImage(imageToShow);
}

function openClue(c, r){
  const { cat, clue, value } = clueAt(c, r);
  if(!cat || !clue) return;

  state.lastClue = { c, r };
  state.selectedTeam = clamp(state.selectedTeam ?? 0, 0, state.teamCount - 1);
  state.showAnswer = false;
  saveState();

  els.modalTitle.textContent = `${cat.name} • $${value}`;
// Render question/answer with math support (fractions, exponents, roots, etc.)
if (window.MathRender) {
  els.questionText.innerHTML = window.MathRender.renderMathText(clue.q ?? "");
  els.answerText.innerHTML   = window.MathRender.renderMathText(clue.a ?? "");

  // Ask MathJax to typeset just the modal (fast)
 setTimeout(() => {
  if (window.MathRender) {
    window.MathRender.typesetMath(els.overlay);
  }
}, 0);
} else {
  // Fallback if math-render.js didn't load
  els.questionText.textContent = clue.q ?? "";
  els.answerText.textContent   = clue.a ?? "";
}

  els.answerBox.classList.remove("show");
  els.toggleAnswerBtn.textContent = "Show Answer (Space)";
  updateClueImageForPhase();
  renderActiveTeamOptions();
  updateModalMeta();
  TimerManager.reset(sanitizeDefaultSeconds(state.defaultSeconds));
  TimerManager.start();
  els.overlay.classList.add("show");
  startBgmOnClueOpen();
  setStatus(`Clue opened: ${cat.name} $${value}`);
}

function closeClue(){
  TimerManager.stop();
  stopBgm();
  els.overlay.classList.remove("show");
  state.showAnswer = false;
  saveState();
  setStatus("Ready");
}

function toggleAnswer(){
  if(!state.lastClue) return;
  state.showAnswer = !state.showAnswer;
  saveState();

  els.answerBox.classList.toggle("show", state.showAnswer);
  els.toggleAnswerBtn.textContent = state.showAnswer ? "Hide Answer (Space)" : "Show Answer (Space)";
  updateClueImageForPhase();
}

function markUsed(){
  if(!state.lastClue) return;
  const key = `${state.lastClue.c}-${state.lastClue.r}`;
  state.used[key] = true;
  saveState();
  renderBoard();
  setStatus("Marked used");
}

function currentValue(){
  if(!state.lastClue) return 0;
  const { value } = clueAt(state.lastClue.c, state.lastClue.r);
  return value || 0;
}

function updateModalMeta(){
  const v = currentValue();
  state.selectedTeam = clamp(state.selectedTeam ?? 0, 0, state.teamCount - 1);
  syncTeamLinkedVisuals();
  const teamName = state.teams[state.selectedTeam]?.name ?? `Team ${state.selectedTeam+1}`;
  if(state.lastClue){
    els.modalMeta.innerHTML = `Selected team: <span class="warn">${escapeHtml(teamName)}</span> • Correct/Incorrect = ±$${v}`;
    els.correctBtn.textContent = `Correct (+$${v})`;
    els.incorrectBtn.textContent = `Incorrect (-$${v})`;
  }else{
    els.modalMeta.textContent = `Selected team: ${teamName}`;
    els.correctBtn.textContent = `Correct (+$)`;
    els.incorrectBtn.textContent = `Incorrect (-$)`;
  }
}

function scoreTeam(delta){
  if(!state.lastClue){
    setStatus("Open a clue first.");
    return;
  }
  const i = clamp(state.selectedTeam ?? 0, 0, state.teamCount - 1);
  state.selectedTeam = i;
  state.teams[i].score += delta;
  saveState();
  renderScoreboard();
  setStatus(`${delta >= 0 ? "Added" : "Subtracted"} ${Math.abs(delta)} to ${state.teams[i].name}`);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ============================================================
   TIMER (optional countdown)
   ============================================================ */
const TimerManager = (() => {
  const DEFAULT_CLUE_SECONDS = 20;
  let remainingSec = DEFAULT_CLUE_SECONDS;
  let running = false;
  let intervalId = null;

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function render() {
    if (els.modalTimerDisplay) {
      els.modalTimerDisplay.textContent = fmt(remainingSec);
    }
    if (els.modalTimerStartStopBtn) {
      els.modalTimerStartStopBtn.textContent = running ? "STOP" : "START";
      els.modalTimerStartStopBtn.disabled = false;
    }
  }

  function reset(sec = DEFAULT_CLUE_SECONDS) {
    stop();
    remainingSec = Math.max(0, Number(sec) || 0);
    render();
  }

  function adjust(deltaSec) {
    remainingSec = Math.max(0, remainingSec + (Number(deltaSec) || 0));
    render();
  }

  function tick() {
    if (!running) return;
    remainingSec -= 1;
    if (remainingSec <= 0) {
      remainingSec = 0;
      stop();
      playSfx("alarm");
    }
    render();
  }

  function start() {
    if (running) return;
    if (remainingSec <= 0) return;

    running = true;
    intervalId = window.setInterval(tick, 1000);
    render();
  }

  function stop() {
    running = false;
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    render();
  }

  function toggle() {
    if (running) stop();
    else start();
  }

  function isRunning() { return running; }
  function getRemaining() { return remainingSec; }

  return { reset, adjust, start, stop, toggle, isRunning, getRemaining };
})();

/* ============================================================
   5) Wiring events
   ============================================================ */

els.modalTimerStartStopBtn?.addEventListener("click", () => {
  TimerManager.toggle();
});

els.modalTimerMinusBtn?.addEventListener("click", () => {
  TimerManager.adjust(-10);
});

els.modalTimerPlusBtn?.addEventListener("click", () => {
  TimerManager.adjust(10);
});

els.defaultTime?.addEventListener("change", () => {
  state.defaultSeconds = sanitizeDefaultSeconds(els.defaultTime.value);
  els.defaultTime.value = String(state.defaultSeconds);
  saveState();
  setStatus(`Default clue time set to ${state.defaultSeconds}s`);
});

els.teamCount.addEventListener("change", () => {
  state.teamCount = clamp(parseInt(els.teamCount.value, 10) || state.teamCount || 2, 1, 6);
  state.selectedTeam = clamp(state.selectedTeam, 0, state.teamCount - 1);
  enforceUniqueTeamColors(state.teams, state.teamCount);
  saveState();
  renderScoreboard();
  renderActiveTeamOptions();
  updateModalMeta();
  setStatus(`Teams set to ${state.teamCount}`);
});

els.toggleAnswerBtn.addEventListener("click", toggleAnswer);
els.closeBtn.addEventListener("click", closeClue);

els.markUsedBtn.addEventListener("click", () => {
  markUsed();
  closeClue();
});

els.correctBtn.addEventListener("click", () => {
  playSfx("correct");
  markUsed();
  scoreTeam(currentValue());
  closeClue();
});

els.incorrectBtn.addEventListener("click", () => {
  playSfx("incorrect");
  markUsed();
  scoreTeam(-currentValue());
  closeClue();
});

els.resetScoresBtn.addEventListener("click", () => {
  for(let i=0; i<state.teams.length; i++) state.teams[i].score = 0;
  saveState();
  renderScoreboard();
  setStatus("Scores reset");
});

els.resetGameBtn.addEventListener("click", () => {
  const keepTeamCount = state.teamCount;
  const keepNames = state.teams.map(t => t.name);
  const keepColors = state.teams.map(t => t.color);
  state = defaultState();
  state.teamCount = clamp(keepTeamCount, 1, 6);
  for(let i=0; i<state.teams.length; i++) state.teams[i].name = keepNames[i] || state.teams[i].name;
  for(let i=0; i<state.teams.length; i++) state.teams[i].color = TEAM_COLORS.includes(keepColors[i]) ? keepColors[i] : state.teams[i].color;
  saveState();
  renderHeader();
  renderBoard();
  renderScoreboard();
  closeClue();
  setStatus("Game reset");
});

// keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const isModalOpen = els.overlay.classList.contains("show");
  if(e.key === "Escape"){
    if(isModalOpen) closeClue();
    else closeSettingsDrawer();
  }
  if(e.key === " "){
    if(isModalOpen){
      e.preventDefault();
      toggleAnswer();
    }
  }
});

document.addEventListener("click", closeTeamColorPalettes);

// click outside modal to close
els.overlay.addEventListener("click", (e) => {
  if(e.target === els.overlay) closeClue();
});

els.settingsToggleBtn?.addEventListener("click", toggleSettingsDrawer);
els.settingsCloseBtn?.addEventListener("click", closeSettingsDrawer);
els.settingsBackdrop?.addEventListener("click", closeSettingsDrawer);
window.addEventListener("resize", syncSettingsDrawerForViewport);
els.fullscreenBtn?.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  updateFullscreenButtonLabel();
  syncOverlayHost();
});

els.scoreHeaderBar?.addEventListener("click", toggleScoreboardCollapsed);
els.scoreToggleBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleScoreboardCollapsed();
});
window.addEventListener("resize", syncScoreboardForViewport);


/* ============================================================
  5.5) CSV Bank Loader (no server; FileReader; localStorage)
  CSV columns: category,value,question,answer,image,question_image,answer_image
  ============================================================ */
const BANK_CSV_KEY = "jeopardy_bank_csv";
const BANK_FILE_KEY = "jeopardy_bank_filename";
const BUILT_IN_BANK_PATH_KEY = "jeopardy_built_in_bank_path";
const CSV_MANIFEST_PATH = "./csv-manifest.json";
let builtInCsvs = [];

function normalizeImageField(raw){
  const value = String(raw ?? "").trim();
  if(!value) return "";
  const normalized = value.replaceAll("\\", "/");
  if(/^(https?:|data:|blob:)/i.test(normalized)) return normalized;
  if(normalized.includes("/")) return normalized;
  return `assets/images/${normalized}`;
}

// Simple CSV parser that supports quoted fields with commas/newlines
function parseCsv(text){
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for(let i=0; i<text.length; i++){
    const ch = text[i];
    const next = text[i+1];

    if(inQuotes){
      if(ch === '"' && next === '"'){ cur += '"'; i++; continue; }
      if(ch === '"'){ inQuotes = false; continue; }
      cur += ch;
      continue;
    }

    if(ch === '"'){ inQuotes = true; continue; }
    if(ch === ","){ row.push(cur); cur = ""; continue; }
    if(ch === "\n"){
      row.push(cur); cur = "";
      // ignore completely empty trailing rows
      if(row.some(v => String(v).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    if(ch === "\r"){ continue; }

    cur += ch;
  }
  // last cell
  row.push(cur);
  if(row.some(v => String(v).trim() !== "")) rows.push(row);

  return rows;
}

function csvToBank(csvText){
  const rows = parseCsv(csvText);
  if(rows.length < 2) throw new Error("CSV has no data rows.");

  const header = rows[0].map(h => String(h).trim().toLowerCase());
  const idx = (name) => header.indexOf(name);

  const iCat = idx("category");
  const iVal = idx("value");
  const iQ   = idx("question");
  const iA   = idx("answer");
  const iImg = idx("image");
  const iQImg = idx("question_image");
  const iAImg = idx("answer_image");

  if([iCat,iVal,iQ,iA].some(i => i === -1)){
    throw new Error('CSV must include headers: category,value,question,answer (optional: image,question_image,answer_image)');
  }

  // collect distinct values and categories
  const valuesSet = new Set();
  const catMap = new Map(); // cat -> Map(value -> clue)

  for(let r=1; r<rows.length; r++){
    const cols = rows[r];
    const category = (cols[iCat] ?? "").trim();
    const valueRaw = (cols[iVal] ?? "").trim();
    const q = (cols[iQ] ?? "").trim();
    const a = (cols[iA] ?? "").trim();
    const questionImage = normalizeImageField((iQImg >= 0 && cols[iQImg]) ? cols[iQImg] : (iImg >= 0 ? cols[iImg] : ""));
    const answerImage = normalizeImageField(iAImg >= 0 ? cols[iAImg] : "");

    if(!category || !valueRaw || !q) continue;

    const value = parseInt(valueRaw, 10);
    if(!Number.isFinite(value)) continue;

    valuesSet.add(value);

    if(!catMap.has(category)) catMap.set(category, new Map());
    catMap.get(category).set(value, { q, a, image: questionImage, answer_image: answerImage });
  }

  const values = Array.from(valuesSet).sort((a,b) => a-b);
  const categories = Array.from(catMap.entries()).map(([name, vmap]) => {
    const clues = values.map(v => {
      const found = vmap.get(v);
      return found ? found : { q:"(missing)", a:"", image:"", answer_image:"" };
    });
    return { name, clues };
  });

  return {
    title: "Smarty Party",
    subtitle: "Load a CSV bank and play",
    values,
    categories
  };
}

function setBankIndicator(label){
  const el = document.getElementById("bankIndicator");
  if(el) el.textContent = label;
}

function getBuiltInCsvByPath(path){
  return builtInCsvs.find(item => item.path === path) || null;
}

function populateBuiltInBankSelect(){
  const select = document.getElementById("builtInBankSelect");
  if(!select) return;

  select.length = 1;

  for(const opt of builtInCsvs){
    const optionEl = document.createElement("option");
    optionEl.value = opt.path;
    optionEl.textContent = opt.label;
    select.appendChild(optionEl);
  }

  const savedPath = localStorage.getItem(BUILT_IN_BANK_PATH_KEY);
  if(savedPath) select.value = savedPath;
}

async function loadBuiltInManifest(){
  const select = document.getElementById("builtInBankSelect");

  // Add new built-in boards by placing CSV files in ./csv/ and listing them in csv-manifest.json.
  // Each manifest entry must be an object with a label and a GitHub Pages-safe relative path.
  try{
    const response = await fetch(CSV_MANIFEST_PATH, { cache: "no-store" });
    if(!response.ok){
      throw new Error(`Fetch failed (${response.status}) for ${CSV_MANIFEST_PATH}`);
    }

    const manifest = await response.json();
    if(!Array.isArray(manifest)){
      throw new Error("csv-manifest.json must contain an array of board entries.");
    }

    builtInCsvs = manifest.filter((item) => {
      return item
        && typeof item.label === "string"
        && item.label.trim()
        && typeof item.path === "string"
        && item.path.trim();
    }).map((item) => ({
      label: item.label.trim(),
      path: item.path.trim(),
    }));
  }catch(err){
    builtInCsvs = [];
    console.warn("Could not load csv-manifest.json. Built-in board list will stay empty.", err);
  }

  if(select) populateBuiltInBankSelect();
}

function applyBank(newBank){
  // mutate existing BANK object so current functions keep working
  BANK.title = newBank.title;
  BANK.subtitle = newBank.subtitle;
  BANK.values = newBank.values;
  BANK.categories = newBank.categories;

  // wipe used clues because the board shape/content changed
  state.used = {};
  state.lastClue = null;
  state.showAnswer = false;
  saveState();

  renderHeader();
  renderBoard();
  renderScoreboard();
  updateModalMeta();
}

function loadCsvBankFromText(rawCsv, sourceLabel){
  const bank = csvToBank(rawCsv);
  applyBank(bank);
  setBankIndicator(`Bank: ${sourceLabel}`);
}

async function loadBuiltInCsvByPath(path, sourceLabel){
  if(!path) return;

  const response = await fetch(path, { cache: "no-store" });
  if(!response.ok){
    throw new Error(`Fetch failed (${response.status}) for ${path}`);
  }

  const rawCsv = await response.text();
  loadCsvBankFromText(rawCsv, sourceLabel);
}

async function loadSavedCsvIfAny(){
  const raw = localStorage.getItem(BANK_CSV_KEY);
  const fname = localStorage.getItem(BANK_FILE_KEY);
  if(raw){
    try{
      loadCsvBankFromText(raw, fname ? `Uploaded (${fname})` : "Uploaded");
      return;
    }catch(err){
      console.warn("Saved uploaded CSV failed to parse. Reverting.", err);
      localStorage.removeItem(BANK_CSV_KEY);
      localStorage.removeItem(BANK_FILE_KEY);
    }
  }

  const builtInPath = localStorage.getItem(BUILT_IN_BANK_PATH_KEY);
  if(!builtInPath) {
    setBankIndicator("Bank: Default");
    return;
  }

  const selected = getBuiltInCsvByPath(builtInPath);
  if(!selected){
    console.warn("Saved built-in board is not present in csv-manifest.json. Reverting to default board.");
    localStorage.removeItem(BUILT_IN_BANK_PATH_KEY);
    setBankIndicator("Bank: Default");
    return;
  }

  const sourceLabel = selected ? `Built-in (${selected.label})` : "Built-in";
  setBankIndicator(`Bank: ${sourceLabel}`);

  try{
    await loadBuiltInCsvByPath(builtInPath, sourceLabel);
  }catch(err){
    console.warn("Saved built-in CSV failed to load. Reverting.", err);
    localStorage.removeItem(BUILT_IN_BANK_PATH_KEY);
    setBankIndicator("Bank: Default");
    setStatus("Could not load saved built-in bank. Using default board.");
  }
}

function wireCsvButtons(){
  const builtInSelect = document.getElementById("builtInBankSelect");
  const loadBuiltInBtn = document.getElementById("loadBuiltInBankBtn");
  const loadBtn = document.getElementById("loadBankBtn");
  const clearBtn = document.getElementById("clearBankBtn");
  const input = document.getElementById("bankFileInput");

  if(loadBuiltInBtn && builtInSelect){
    loadBuiltInBtn.addEventListener("click", async () => {
      const selectedPath = String(builtInSelect.value || "").trim();
      if(!selectedPath){
        localStorage.removeItem(BUILT_IN_BANK_PATH_KEY);
        localStorage.removeItem(BANK_CSV_KEY);
        localStorage.removeItem(BANK_FILE_KEY);
        location.reload();
        return;
      }

      const selected = getBuiltInCsvByPath(selectedPath);
      const sourceLabel = selected ? `Built-in (${selected.label})` : "Built-in";

      try{
        await loadBuiltInCsvByPath(selectedPath, sourceLabel);
        localStorage.setItem(BUILT_IN_BANK_PATH_KEY, selectedPath);
        localStorage.removeItem(BANK_CSV_KEY);
        localStorage.removeItem(BANK_FILE_KEY);
        setStatus(`Loaded ${sourceLabel}`);
      }catch(err){
        console.warn("Unable to load built-in board file.", err);
        alert("Unable to load board file.");
      }
    });
  }

  if(loadBtn && input){
    loadBtn.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try{
          const rawCsv = String(reader.result || "");
          loadCsvBankFromText(rawCsv, `Uploaded (${file.name})`);
          localStorage.setItem(BANK_CSV_KEY, rawCsv);
          localStorage.setItem(BANK_FILE_KEY, file.name);
          localStorage.removeItem(BUILT_IN_BANK_PATH_KEY);
          setStatus(`Loaded bank: ${file.name}`);
        }catch(err){
          alert("Could not load CSV. Check headers and formatting.\n\n" + err.message);
        }finally{
          input.value = ""; // allow re-selecting same file
        }
      };
      reader.readAsText(file);
    });
  }

  if(clearBtn){
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(BANK_CSV_KEY);
      localStorage.removeItem(BANK_FILE_KEY);
      localStorage.removeItem(BUILT_IN_BANK_PATH_KEY);
      // reload default by refreshing the page state
      location.reload();
    });
  }
}
/* ============================================================
   6) Init
   ============================================================ */
async function init(){
  wireCsvButtons();
  await loadBuiltInManifest();
  await loadSavedCsvIfAny();
  initClueMusicControls();   // <-- ADD THIS LINE
  renderHeader();
  renderBoard();
  renderScoreboard();
  updateModalMeta();
  syncSettingsDrawerForViewport();
  syncScoreboardForViewport();
  updateFullscreenButtonLabel();
  syncOverlayHost();

  TimerManager.reset(sanitizeDefaultSeconds(state.defaultSeconds));
}
init();
