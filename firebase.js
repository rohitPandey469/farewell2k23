import { initializeApp } from "firebase/app";

import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

import { toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getFirestore } from "firebase/firestore";

import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";

alertify.set("notifier", "position", "top-center");

const firebaseConfig = {
  apiKey: "AIzaSyCTj30aB-zOi4ZB4bggh7uacNj6lD5PH8s",
  authDomain: "codelabz-303fb.firebaseapp.com",
  databaseURL: "https://codelabz-303fb-default-rtdb.firebaseio.com",
  projectId: "codelabz-303fb",
  storageBucket: "codelabz-303fb.appspot.com",
  messagingSenderId: "986277623752",
  appId: "1:986277623752:web:e69a68423e12d0d70ab2fd",
  measurementId: "G-HVPYX6X7NM",
};

const toastif = {
  transition: Slide,
  position: "top-center",
  autoClose: 1000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logInWithEmailAndPassword = async (email, password) => {
  try {
    signInWithEmailAndPassword(auth, email, password)
      .then()
      .catch((error) => {
        switch (error.code) {
          case "auth/user-not-found":
            toast.error("User not found!!", {
              toastif,
            });
            break;
          case "auth/wrong-password":
            toast.error("Wrong passoword!", {
              toastif,
            });
            break;
          default:
            toast.error("No Internet", {
              toastif,
            });
        }
      });
  } catch (err) {
    toast.error("No Internet", {
      toastif,
    });
    console.log("Error : ", err);
  }
};

const logout = () => {
  signOut(auth);
};

export { auth, db, logInWithEmailAndPassword, logout, toastif };
