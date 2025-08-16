// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with the firebaseConfig object you copied from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyBdvhTgxWq8KF8rpi67FNHlwSF6N4g14eo",
  authDomain: "agri-hackathon-app.firebaseapp.com",
  projectId: "agri-hackathon-app",
  storageBucket: "agri-hackathon-app.firebasestorage.app",
  messagingSenderId: "443432270076",
  appId: "1:443432270076:web:72a72e03385d1cc0717f79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services so we can use them anywhere in our app
export const auth = getAuth(app);
export const db = getFirestore(app);
