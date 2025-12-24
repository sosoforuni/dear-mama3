import { auth, db } from "./firebase.js";

import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================
   Auth helper
   ========================= */
function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  return user;
}

/* =========================
   BABY: Feeding
   ========================= */
export async function saveFeeding({ type, durationMinutes, side, amountMl, note }) {
  const user = requireUser();
  const newRef = push(ref(db, `users/${user.uid}/feedings`));
  await set(newRef, {
    type: type || null,
    durationMinutes: durationMinutes ?? null,
    side: side || null,
    amountMl: amountMl ?? null,
    note: note || null,
      isHidden: false,          // ✅ ADD THIS

    createdAt: serverTimestamp()
  });
}

export async function getRecentFeedings(n = 10) {
  const user = requireUser();
 const q = query(
  ref(db, `users/${user.uid}/feedings`),
  orderByChild("createdAt")

);

  const snap = await get(q);
  const val = snap.val() || {};
return Object.entries(val)
  .map(([id, item]) => ({ id, ...item }))
  .filter((item) => item.isHidden !== true)
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/* =========================
   BABY: Sleep
   ========================= */
export async function saveSleep({ sleepType, durationMinutes, quality }) {
  const user = requireUser();
  const newRef = push(ref(db, `users/${user.uid}/sleeps`));

  await set(newRef, {
    sleepType: sleepType || null,
    durationMinutes: durationMinutes ?? null,
    quality: quality || null,
    isHidden: false,          // ✅ ADD THIS
    createdAt: serverTimestamp()
  });
}


export async function getRecentSleeps(n = 10) {
  const user = requireUser();
  const q = query(
    ref(db, `users/${user.uid}/sleeps`),
    orderByChild("createdAt"),
    limitToLast(n)
  );
  const snap = await get(q);
  const val = snap.val() || {};
 return Object.entries(val)
  .map(([id, item]) => ({ id, ...item }))
  .filter((item) => item.isHidden !== true)   // ✅ ADD THIS
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));


}

/* =========================
   MOTHER: Mood Check-ins
   ========================= */

// ✅ SAVE mood check-in
export async function saveMoodCheckin(mood, trigger, notes) {
  const user = requireUser();

  const newRef = push(ref(db, `users/${user.uid}/moodCheckins`));

  await set(newRef, {
    mood: mood || "",
    trigger: trigger || "",
    notes: (notes ?? "").trim(),
    createdAt: serverTimestamp(),
  });

  return newRef.key;
}

// ✅ LOAD mood check-ins (listen)
export function listenMoodCheckins(callback, n = 10) {
  const user = requireUser();

  const q = query(
    ref(db, `users/${user.uid}/moodCheckins`),
    orderByChild("createdAt"),
    limitToLast(n)
  );

  return onValue(q, (snap) => {
    if (!snap.exists()) return callback([]);

    const obj = snap.val();
    const list = Object.entries(obj)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    callback(list);
  });
}
// ✅ PERMANENT DELETE: clear all feedings
export async function clearAllFeedings() {
  const user = requireUser();
  await remove(ref(db, `users/${user.uid}/feedings`));
}

// ✅ PERMANENT DELETE: clear all sleeps
export async function clearAllSleeps() {
  const user = requireUser();
  await remove(ref(db, `users/${user.uid}/sleeps`));
}

/* =========================
   MOTHER: Physical Logs
   ========================= */

export async function savePhysicalLog(painLevel, hydration, notes) {
  const user = requireUser();

  const newRef = push(ref(db, `users/${user.uid}/physicalLogs`));

  await set(newRef, {
    painLevel: painLevel || "",
    hydration: hydration || "",
    notes: (notes ?? "").trim(),
    createdAt: serverTimestamp(),
  });

  return newRef.key;
}

export function listenPhysicalLogs(callback, n = 10) {
  const user = requireUser();

  const q = query(
    ref(db, `users/${user.uid}/physicalLogs`),
    orderByChild("createdAt"),
    limitToLast(n)
  );

  return onValue(q, (snap) => {
    if (!snap.exists()) return callback([]);

    const obj = snap.val();
    const list = Object.entries(obj)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    callback(list);
  });
}
