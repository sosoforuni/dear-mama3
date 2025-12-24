import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
   Navbar auth buttons
   ========================= */
const signInBtn = document.getElementById("nav-signin");
const getStartedBtn = document.getElementById("nav-getstarted");
const logoutBtn = document.getElementById("nav-logout");

onAuthStateChanged(auth, (user) => {
  if (user) {
    signInBtn && (signInBtn.style.display = "none");
    getStartedBtn && (getStartedBtn.style.display = "none");
    logoutBtn && (logoutBtn.style.display = "inline-flex");
  } else {
    signInBtn && (signInBtn.style.display = "inline-flex");
    getStartedBtn && (getStartedBtn.style.display = "inline-flex");
    logoutBtn && (logoutBtn.style.display = "none");
  }
});

logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
});

/* =========================
   SIGN UP (FORM SUBMIT)
   ========================= */
const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const confirm = document.getElementById("signup-confirm").value;

      if (!name) throw new Error("Please enter your name.");
      if (password !== confirm) throw new Error("Passwords do not match.");

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Save name in Firebase Auth (reliable)
      await updateProfile(cred.user, { displayName: name });

      // ✅ Save name in Realtime Database
      await set(ref(db, `users/${cred.user.uid}/profile`), {
        name,
        email,
        createdAt: Date.now(),
      });

      window.location.href = "index.html";
    } catch (err) {
      alert(err.message || "Signup failed");
      console.error(err);
    }
  });
}


