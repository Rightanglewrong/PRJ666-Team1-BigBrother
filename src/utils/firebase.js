// utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "prj666-611b0.firebaseapp.com",
  projectId: "prj666-611b0",
  storageBucket: "prj666-611b0.appspot.com",
  messagingSenderId: "161693296276",
  appId: "1:161693296276:web:41121b65fb8805d9df3681"
};


// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { auth };