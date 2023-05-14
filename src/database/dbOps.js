import { db } from "../../firebase";
import { doc, addDoc, getDocs, updateDoc, collection } from 'firebase/firestore'

const names = [
    "Kalpit Arya",
    "Ayush Kumar",
    "Shruti Agarwal",
    "Anurag Srivastava",
    "Ojuswi Rastogi",
    "Vaibhav Shukla",
    "Aditee Singh",
    "Naved Akhtar",
    "Mihir Sahai",
    "Paarth Agarwal",
    "Shivam Singh",
    "Shrey Jain"
]

async function reset(){
    const dbUserRef = collection(db, "userData")
    const uData = await getDocs(dbUserRef)
    let usersId = []
    // console.log(uData)
    uData.forEach(doc => {
        usersId.push(doc.id)
    })
    usersId.forEach(async (id) => {
        // const [user] = useAuthState(auth);
        // logInWithEmailAndPassword(`user${counter}@gmail.com`, `password${counter}`)
        try {
            const userD = doc(db, "userData", id);
            await updateDoc(userD, {
                "choose" : 0,
                "guessMssg1" : "",
                "guessMssg2" : "",
                "guessUser1" : "",
                "guessUser2" : "",
                'sentGuess1' : false,
                'sentGuess2' : false,
                "myMssg1" : "",
                "myMssg2" : "",
                "myUser1" : "",
                "myUser2" : "",
                "guessed1" : false,
                "guessed2" : false,
                "numGuess1" : 3,
                "numGuess2" : 3,
            });
        } catch (err) {
            console.log(err);
        }
        // logout()
    })
}

async function addUsers(){
    const dbUserRef = collection(db, "userData")
    for(let i=5; i<12; ++i){
        try {
            await addDoc(dbUserRef, {
                "choose" : 0,
                "guessMssg1" : "",
                "guessMssg2" : "",
                "guessUser1" : "",
                "guessUser2" : "",
                'sentGuess1' : false,
                'sentGuess2' : false,
                "myMssg1" : "",
                "myMssg2" : "",
                "myUser1" : "",
                "myUser2" : "",
                "guessed1" : false,
                "guessed2" : false,
                "numGuess1" : 3,
                "numGuess2" : 3,
                "uid":"",
                "username" : `${names[i]}`
            })
            } catch (err) {
            console.log(err);
            }
    }
}

export {
    reset,
    addUsers,
    names
}