// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-2a627.firebaseapp.com",
  projectId: "mern-blog-2a627",
  storageBucket: "mern-blog-2a627.appspot.com",
  messagingSenderId: "376102159334",
  appId: "1:376102159334:web:1c566e57ffd2cae2194c27"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);