import { db } from "../../firebase";
import { doc, addDoc, getDocs, updateDoc, collection } from 'firebase/firestore'

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
                "guessUser1" : "",
                "myMssg1" : "",
                "myUser1" : "",
                "guessed1" : false,
                "numGuess1" : 3
            });
        } catch (err) {
            console.log(err);
        }
        // logout()
    })
}

async function addUsers(){
    const dbUserRef = collection(db, "userData")
    for(let i=1; i<=5; ++i){
        try {
            await addDoc(dbUserRef, {
                "choose" : 0,
                "guessMssg1" : "",
                "guessUser1" : "",
                "myMssg1" : "",
                "myUser1" : "",
                "guessed1" : false,
                "numGuess1" : 3,
                "uid":"",
                "username" : `user ${i}`
            })
            } catch (err) {
            console.log(err);
            }
    }
}

export {
    reset,
    addUsers
}