// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDC9RyPfonU5jruTwjWj0jJNukVfsIQTk",
  authDomain: "ai-notes-app-6b727.firebaseapp.com",
  projectId: "ai-notes-app-6b727",
  storageBucket: "ai-notes-app-6b727.firebasestorage.app",
  messagingSenderId: "289616182561",
  appId: "1:289616182561:web:38af16c09a14102b0e5260",
  measurementId: "G-66Y2R82NSB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);