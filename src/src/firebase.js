// src/firebase.js (CDN modules only)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpYIIReLZ3OjDQrCrwUFOa-kME9G92e4M",
  authDomain: "dear-mama-fa2a5.firebaseapp.com",
  databaseURL: "https://dear-mama-fa2a5-default-rtdb.firebaseio.com",
  projectId: "dear-mama-fa2a5",
  storageBucket: "dear-mama-fa2a5.firebasestorage.app",
  messagingSenderId: "112482814398",
  appId: "1:112482814398:web:43dbfdba355870f539d1ef",
  measurementId: "G-45BMQ327C0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
