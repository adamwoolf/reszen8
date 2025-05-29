import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyAzTlbqmv1E0lxYqdsc7a7KgLdYmvWUueI",
  authDomain: "reszen8-1d832.firebaseapp.com",
  projectId: "reszen8-1d832",
  //   storageBucket: "reszen8-1d832.appspot.com",
  storageBucket: "reszen8-1d832.firebasestorage.app",
  messagingSenderId: "642611680413",
  appId: "1:642611680413:web:6d0f62ac873a5d914ff074",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
