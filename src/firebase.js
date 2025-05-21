import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7TRkIX3WqxPQpjUdKyvtK_CHUW3Osu9k",
  authDomain: "likert-scale-9d9fc.firebaseapp.com",
  projectId: "likert-scale-9d9fc",
  storageBucket: "likert-scale-9d9fc.appspot.com",
  messagingSenderId: "622362736614",
  appId: "1:622362736614:web:9c3f482817d4e8aeecc827",
  measurementId: "G-T3N4YF0ZG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };