// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAldxld0UsbeknRhV6cYOy2Cr5S4MCB5e4",
  authDomain: "auracare-67e81.firebaseapp.com",
  projectId: "auracare-67e81",
  storageBucket: "auracare-67e81.firebasestorage.app",
  messagingSenderId: "171664908397",
  appId: "1:171664908397:web:668c3440ac790842295f64",
  measurementId: "G-LVWDD2HE39",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
