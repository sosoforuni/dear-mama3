import { saveMoodCheckin, listenMoodCheckins, saveFeeding, saveSleep } from "./src/data.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./src/firebase.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =========================
   Tabs
   ========================= */
function hideAllTabs() {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.style.display = "none";
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
}

function showTab(tabName) {
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) selectedTab.style.display = "block";
}

function activateTabButton(fromEvent) {
  const btn = fromEvent?.target?.closest?.(".tab-btn");
  if (btn) btn.classList.add("active");
}

window.switchTab = function switchTab(tabName, evt) {
  hideAllTabs();
  showTab(tabName);
  activateTabButton(evt);
};

window.switchWellnessTab = function switchWellnessTab(tabName, evt) {
  hideAllTabs();
  showTab(tabName);
  activateTabButton(evt);
};

/* =========================
   Helpers
   ========================= */
function getActivePillText(scopeSelector) {
  return document.querySelector(`${scopeSelector} .pill.active`)?.innerText || "";
}

function clampNumber(n, fallback = null) {
  const num = Number(n);
  if (Number.isNaN(num)) return fallback;
  return num;
}

/* =========================
   Main
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    const welcomeEl = document.getElementById("welcome-text");
    if (!welcomeEl) return;

    if (!user) {
      welcomeEl.textContent = "";
      return;
    }

    // 🔧 AUTO-FIX: set name if missing
    if (!user.displayName) {
      const fallbackName = user.email?.split("@")[0] || "Mama";
      await updateProfile(user, { displayName: fallbackName });
    }

    // ✅ Show welcome message
    welcomeEl.textContent = `Welcome, ${user.displayName} 💗`;
  });
});


  /* ---------- Mood button selection (UI) ---------- */
  document.querySelectorAll(".mood-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentElement;
      parent?.querySelectorAll(".mood-btn")?.forEach((sib) => sib.classList.remove("active"));
      button.classList.add("active");
    });
  });

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Card hover effects ---------- */
  document.querySelectorAll(".dashboard-card, .feature-card, .testimonial-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-4px)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });
  });

  /* ---------- Quick question hover effects ---------- */
  document.querySelectorAll('button[onclick^="sendQuickQuestion"]').forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.borderColor = "var(--pink-400)";
      button.style.background = "var(--pink-50)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.borderColor = "var(--gray-200)";
      button.style.background = "white";
    });
  });

  /* =========================
     BABY: Feeding (UI + Firebase)
     ========================= */
  const saveFeedingBtn = document.getElementById("save-feeding");
  if (saveFeedingBtn) {
    saveFeedingBtn.addEventListener("click", async () => {
      try {
        const duration = clampNumber(document.getElementById("feed-duration")?.value, null);
        if (!duration || duration <= 0) return;

        const type =
          document.querySelector("#feeding-tab .pill-group[aria-label='Feeding type'] .pill.active")
            ?.innerText || "Breastfeeding";

        const side =
          document.querySelector("#feeding-tab .pill-group[aria-label='Side'] .pill.active")?.innerText ||
          "Left";

        await saveFeeding({
          type,
          durationMinutes: duration,
          side,
          amountMl: null,
          note: null
        });

        const entry = `
          <article class="entry">
            <div class="entry-left">
              <div class="entry-badge badge-blue">🍼</div>
              <div>
                <p class="entry-title">${type} • ${side}</p>
                <p class="entry-sub">${duration} minutes</p>
              </div>
            </div>
            <div class="entry-right">
              <p class="entry-time">Just now</p>
              <span class="entry-chip">Saved</span>
            </div>
          </article>
        `;
        document.getElementById("feeding-list")?.insertAdjacentHTML("afterbegin", entry);

        const durationInput = document.getElementById("feed-duration");
        if (durationInput) durationInput.value = 15;
      } catch (err) {
        alert(err?.message || "Could not save feeding. Please sign in and try again.");
      }
    });
  }

  /* =========================
     BABY: Sleep (UI + Firebase)
     ========================= */
  const saveSleepBtn = document.getElementById("save-sleep");
  if (saveSleepBtn) {
    saveSleepBtn.addEventListener("click", async () => {
      try {
        const duration = clampNumber(document.getElementById("sleep-duration")?.value, null);
        if (!duration || duration <= 0) return;

        const sleepType =
          document.querySelector("#sleep-tab .pill-group[aria-label='Sleep type'] .pill.active")?.innerText ||
          "Nap";

        const quality =
          document.querySelector("#sleep-tab .pill-group[aria-label='Sleep quality'] .pill.active")?.innerText ||
          "Fair";

        await saveSleep({
          sleepType,
          durationMinutes: duration,
          quality
        });

        const entry = `
          <article class="entry">
            <div class="entry-left">
              <div class="entry-badge badge-purple">🌙</div>
              <div>
                <p class="entry-title">${sleepType}</p>
                <p class="entry-sub">${duration} minutes • Quality: ${quality}</p>
              </div>
            </div>
            <div class="entry-right">
              <p class="entry-time">Just now</p>
              <span class="entry-chip">Saved</span>
            </div>
          </article>
        `;
        document.getElementById("sleep-list")?.insertAdjacentHTML("afterbegin", entry);

        const durationInput = document.getElementById("sleep-duration");
        if (durationInput) durationInput.value = 30;
      } catch (err) {
        alert(err?.message || "Could not save sleep. Please sign in and try again.");
      }
    });
  }

  /* =========================
     MOTHER: Mood (Firebase)
     ========================= */
  const saveMoodBtn = document.getElementById("save-mood");
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener("click", async () => {
      try {
        const mood = document.querySelector(".mood-btn.active")?.innerText || "";

        // These IDs are optional; if you don’t have them, it still saves the mood.
        const hardest = document.getElementById("hardest")?.value || null;
        const notes = document.getElementById("notes")?.value || null;

        if (!mood) {
          alert("Please select your mood first.");
          return;
        }

        await saveMood({ mood, hardest, notes });
        alert("Mood saved ✅");
      } catch (err) {
        alert(err?.message || "Could not save mood. Please sign in and try again.");
      }
    });
  }

  /* =========================
     MOTHER: EPDS mini reflection (UI + Firebase)
     ========================= */
  const epdsBtn = document.getElementById("epds-eval");
  if (epdsBtn) {
    epdsBtn.addEventListener("click", async () => {
      const summaryEl = document.getElementById("epds-summary");
      const scoreLineEl = document.getElementById("epds-scoreline");
      if (!summaryEl || !scoreLineEl) return;

      let totalScore = 0;
      const answers = {};

      document.querySelectorAll(".epds-group").forEach((group, idx) => {
        const active = group.querySelector(".pill.active");
        const score = clampNumber(active?.dataset?.score, 0);
        totalScore += score;
        answers[`q${idx + 1}`] = score;
      });

      if (totalScore <= 3) {
        summaryEl.textContent =
          "Your check-in suggests you’ve been coping overall this week. Keep prioritizing rest and small moments of care.";
      } else if (totalScore <= 7) {
        summaryEl.textContent =
          "Your check-in suggests you may be carrying some emotional strain. Consider reaching out to someone you trust or taking a small self-care step today.";
      } else {
        summaryEl.textContent =
          "Your check-in suggests you may be feeling quite overwhelmed. You deserve support — consider speaking to a healthcare professional or a trusted person.";
      }

      scoreLineEl.textContent = `Prototype score: ${totalScore} • Reflective only (not a diagnosis).`;

      try {
        await saveEPDS({ answers, totalScore });
      } catch (err) {
        // Don’t block the UI reflection if saving fails
        console.warn(err);
      }
    });
    
  }

// 🌬️ Cute breathing circle + timer + END button
const breathingBtn = document.getElementById("breathing-btn");
const endBtn = document.getElementById("breathing-end-btn");
const breathingText = document.getElementById("breathing-text");
const breathingTimer = document.getElementById("breathing-timer");
const breathingPhase = document.getElementById("breathing-phase");
const progressCircle = document.querySelector(".breath-progress");

// Circle math (r=46 => circumference ≈ 289)
const CIRC = 289;

if (breathingBtn && breathingText && breathingTimer && endBtn && breathingPhase && progressCircle) {
  let breathingRunning = false;
  let stepIndex = 0;

  let timerInterval = null;
  let elapsedSeconds = 0;

  let stepTimeout = null;
  let rafId = null;

  const steps = [
    { label: "Inhale", duration: 4000 },
    { label: "Hold", duration: 4000 },
    { label: "Exhale", duration: 6000 }
  ];

  function formatMMSS(sec) {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function setProgress(p) {
    // p in [0..1], 0 = empty, 1 = full
    const clamped = Math.max(0, Math.min(1, p));
    progressCircle.style.strokeDasharray = String(CIRC);
    progressCircle.style.strokeDashoffset = String(CIRC * (1 - clamped));
  }

  function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
      elapsedSeconds += 1;
      breathingTimer.textContent = formatMMSS(elapsedSeconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function stopBreathingCycle() {
    if (stepTimeout) clearTimeout(stepTimeout);
    stepTimeout = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function animateStep(stepDurationMs) {
    const start = performance.now();

    function tick(now) {
      if (!breathingRunning) return;

      const t = (now - start) / stepDurationMs;
      setProgress(t);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function runBreathing() {
    if (!breathingRunning) return;

    const step = steps[stepIndex];

    breathingPhase.textContent = step.label;
    breathingText.textContent =
      step.label === "Inhale" ? "Breathe in slowly…" :
      step.label === "Hold" ? "Hold gently…" :
      "Breathe out slowly…";

    setProgress(0);
    animateStep(step.duration);

    stepTimeout = setTimeout(() => {
      if (!breathingRunning) return;
      stepIndex = (stepIndex + 1) % steps.length;
      runBreathing();
    }, step.duration);
  }

  // ✅ Initial UI state
  breathingTimer.textContent = "00:00";
  breathingPhase.textContent = "Ready";
  breathingText.textContent = "Press start and breathe slowly with me.";
  setProgress(0);
  endBtn.style.display = "none";

  breathingBtn.addEventListener("click", () => {
    breathingRunning = !breathingRunning;

    if (breathingRunning) {
      breathingBtn.textContent = "Pause";
      endBtn.style.display = "inline-block";

      startTimer();
      runBreathing();
    } else {
      breathingBtn.textContent = "Start breathing";
      breathingPhase.textContent = "Paused";
      breathingText.textContent = "Take a moment. You’re doing great 💛";

      stopTimer();
      stopBreathingCycle();
    }
  });

  endBtn.addEventListener("click", () => {
    breathingRunning = false;

    stopTimer();
    stopBreathingCycle();

    elapsedSeconds = 0;
    stepIndex = 0;

    breathingTimer.textContent = "00:00";
    breathingPhase.textContent = "Ready";
    breathingText.textContent = "Press start and breathe slowly with me.";
    setProgress(0);

    breathingBtn.textContent = "Start breathing";
    endBtn.style.display = "none";
  });
}
 // =========================
// BABY: Feeding - Hide Side when Bottle is selected
// =========================
const sideGroup = document.getElementById("sideGroup");
const feedingTypeButtons = document.querySelectorAll(
  "#feeding-tab .pill-group[aria-label='Feeding type'] .pill"
);

function updateSideVisibility() {
  const activeType =
    document.querySelector("#feeding-tab .pill-group[aria-label='Feeding type'] .pill.active")
      ?.innerText || "Breastfeeding";

  const isBottle = activeType.trim().toLowerCase() === "bottle";
  if (sideGroup) sideGroup.style.display = isBottle ? "none" : "block";
}

feedingTypeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    feedingTypeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateSideVisibility();
  });
});
// run once on load
updateSideVisibility();
async function hideAllFeedings(uid) {
  const snap = await get(ref(db, `users/${uid}/feedings`)); // ✅ no query, no limit
  if (!snap.exists()) return;

  const data = snap.val();
  const updatesObj = {};

  Object.keys(data).forEach((id) => {
    updatesObj[`users/${uid}/feedings/${id}/isHidden`] = true;
  });

  await update(ref(db), updatesObj);
}

document.getElementById("clearFeedingsBtn")?.addEventListener("click", async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return alert("Please sign in");

  // ✅ delete from the website instantly
  const list = document.getElementById("feeding-list");
  if (list) list.innerHTML = "";

  // ✅ keep data in Firebase but hide it
  await hideAllFeedings(uid);

  // optional: if you have refresh(), keep it to re-sync UI
  // await refresh();
});
async function hideAllSleeps(uid) {
  const snap = await get(ref(db, `users/${uid}/sleeps`));
  if (!snap.exists()) return;

  const data = snap.val();
  const updatesObj = {};

  Object.keys(data).forEach((id) => {
    updatesObj[`users/${uid}/sleeps/${id}/isHidden`] = true;
  });

  await update(ref(db), updatesObj);
}
document.getElementById("clearsleepBtn")?.addEventListener("click", async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return alert("Please sign in");

  // ✅ clear from website
  const list = document.getElementById("sleep-list");
  if (list) list.innerHTML = "";

  // ✅ hide in Firebase
  await hideAllSleeps(uid);
});
