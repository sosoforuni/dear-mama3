// src/auth.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ----------------------------
   SIGN UP
---------------------------- */
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Signed up:", userCred.user.email);
      window.location.href = "index.html";
    } catch (err) {
      console.error("❌ Signup error:", err);
      alert(err.message);
    }
  });
}

/* ----------------------------
   SIGN IN
---------------------------- */
const signinForm = document.getElementById("signin-form");
if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Signed in:", userCred.user.email);
      window.location.href = "index.html";
    } catch (err) {
      console.error("❌ Signin error:", err);
      alert(err.message);
    }
  });
}
