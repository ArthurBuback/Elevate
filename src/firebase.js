import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtrLGOYKzpsA6kiL54U_o3WGb8F4KJdd4",
  authDomain: "elevate-atb.firebaseapp.com",
  projectId: "elevate-atb",
  storageBucket: "elevate-atb.firebasestorage.app",
  messagingSenderId: "757930294878",
  appId: "1:757930294878:web:c749c89470b0236255fecf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);