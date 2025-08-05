// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDn7ORn1GomuukZ1HWrI7aRIfNrtCWg1oE",
  authDomain: "business-management-v1.firebaseapp.com",
  projectId: "business-management-v1",
  storageBucket: "business-management-v1.firebasestorage.app",
  messagingSenderId: "784501530422",
  appId: "1:784501530422:web:4bfd65f86e1f8f65e69d97",
  measurementId: "G-FJNH674JR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);