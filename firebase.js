import { initializeApp } from "firebase/app";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getFirestore,
} from "firebase/firestore";

import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

alertify.set('notifier','position', 'top-center');

const firebaseConfig = {
    apiKey: "AIzaSyDTzAIC5axUGofr_z8LIvmtzOvWHd_ZTO0",
    authDomain: "farewell2k23-89220.firebaseapp.com",
    projectId: "farewell2k23-89220",
    storageBucket: "farewell2k23-89220.appspot.com",
    messagingSenderId: "517078897756",
    appId: "1:517078897756:web:866f5b88e9f975b570c299",
    measurementId: "G-MWXDJQ0MKV"
};

const toastif = {
  transition : Slide,
  position: "top-center",
  autoClose: 1000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logInWithEmailAndPassword = async (email, password) => {
  try{
    signInWithEmailAndPassword(auth, email, password)
      .then()
      .catch(error => {
        switch(error.code) {
          case 'auth/user-not-found':
            toast.error('User not found!!', {
              toastif
              });
            break;
          case 'auth/wrong-password':
            toast.error('Wrong passoword!', {
              toastif
              });
            break;
          default: 
            toast.error('No Internet', {
              toastif
            });
       }
     })
   }catch(err){
      toast.error('No Internet', {
        toastif
      });
      console.log("Error : ", err);
   }
};

const logout = () => {
  signOut(auth);
};

export {
  auth,
  db,
  logInWithEmailAndPassword,
  logout,
  toastif
};