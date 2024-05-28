import { db } from "../../firebase";
import {
  doc,
  addDoc,
  getDocs,
  updateDoc,
  collection,
} from "firebase/firestore";

const names = [
  "Anadee",
  "Anant Mishra",
  "Jayati Dixit",
  "Dev Batra",
  "Hiteshwaram Dubey",
  "Om Kumar",
  "Parth Agarwal",
  "Pavitra Lalwani",
  "Janvi Soni",
  "Aditi Sahu",
];

async function reset() {
  const dbUserRef = collection(db, "userData");
  const uData = await getDocs(dbUserRef);
  let usersId = [];
  uData.forEach((doc) => {
    usersId.push(doc.id);
  });
  usersId.forEach(async (id) => {
    try {
      const userD = doc(db, "userData", id);
      await updateDoc(userD, {
        choose: 0,
        guessMssg1: "",
        guessMssg2: "",
        guessUser1: "",
        guessUser2: "",
        sentGuess1: false,
        sentGuess2: false,
        myMssg1: "",
        myMssg2: "",
        myUser1: "",
        myUser2: "",
        guessed1: false,
        guessed2: false,
        numGuess1: 3,
        numGuess2: 3,
      });
    } catch (err) {
      console.log(err);
    }
    // logout()
  });
}

async function addUsers() {
  const dbUserRef = collection(db, "userData");
  for (let i = 6; i < 12; ++i) {
    try {
      await addDoc(dbUserRef, {
        choose: 0,
        guessMssg1: "",
        guessMssg2: "",
        guessUser1: "",
        guessUser2: "",
        sentGuess1: false,
        sentGuess2: false,
        myMssg1: "",
        myMssg2: "",
        myUser1: "",
        myUser2: "",
        guessed1: false,
        guessed2: false,
        numGuess1: 3,
        numGuess2: 3,
        uid: "",
        username: `${names[i]}`,
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export { reset, addUsers, names };
