import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, db, logout} from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, addDoc, getDocs, updateDoc, collection } from 'firebase/firestore'
import {reset, addUsers} from '../database/dbOps'
import '../styles/dashboard.css'
import alertify from 'alertifyjs'; 
import 'alertifyjs/build/css/alertify.css';
import Select from 'react-select'
import JSConfetti from 'js-confetti'
// change
export default function Dashboard(){
    // reset()
    alertify.set('notifier','position', 'top-center');
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = React.useState(
        {
            "username" : "loading...",
            "choose" : 0,
            "guessMssg1" : "loading...",
            "guessMssg2" : "loading...",
            "guessUser1" : "loading...",
            "guessUser2" : "loading...",
            'sentGuess1' : false,
            'sentGuess2' : false,
            "myMssg1" : "loading...",
            "myMssg2" : "loading...",
            "myUser1" : "",
            "myUser2" : "",
            "uid" : "",
            "id" : "",
            "guessed1" : false,
            "guessed2" : false,
            "numGuess1" : "loading...",
            "numGuess2" : "loading...",
            "guess1id" : "",
            "localGuess1" : "",
            "localGuess2" : ""
        }
    )

    const [allUsers, setAllUsers] = React.useState([])
    const navigate = useNavigate();

    //If the user logs out redirect to login page
    React.useEffect(() => {
        if(loading){
            alertify.set('notifier','position', 'top-center');
            return;
        }
        if (!user){
            navigate("/login")
            alertify.notify('Logout Successful', 'success', 2, function(){  console.log('dismissed'); });
        }
    }, [user]);

    // Get data from firebase
    React.useEffect(() => {
        if(loading){
            return;
        }
        async function getUserData(){
            const dbUserRef = collection(db, "userData")
            const uData = await getDocs(dbUserRef)
            uData.forEach(doc => {
                if(doc.data().uid === user.uid){
                    setUserData({...doc.data(), "id" : doc.id})
                }
                else{
                    setAllUsers(prev => (
                        [...prev, [doc.data().username, (doc.data().choose === 2)]]
                    ))
                }
            })
        }
        if(user)
            getUserData()
    }, [user])

    function handleLogout(){
        if(!user){
            navigate('/login')
        }
        logout();
    }

    // Handle submission of first message
    async function handleMsg1(e){
        e.preventDefault()
        if(userData.guessUser1 === ""){
            alertify.notify('Choose a User first', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }
        else if(userData.guessMssg1 === ""){
            alertify.notify('Write a message', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }

        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser1 && doc.data().myUser1 != userData.username){
                    if(doc.data().choose === 2){
                        // setUserData(prev=>(
                        //     {...prev, "guessUser1" : ""}
                        // ))
                        // setAllUsers((prev) => {
                        //     const temp = [...prev]
                        //     for(let i=0; i<temp.length; ++i){
                        //         if(temp[i][0] == doc.data().username)
                        //             temp[i][1] = true
                        //     }
                        //     return [...temp]
                        // })
                        alertify.alert('User already selected', `${userData.guessUser1} has just recived 2 
                        messages please select a different user`);
                        window.location.reload();
                    }
                }
            })
        } catch (err) {
            console.log(`Network Error ${err}`);
        }

        // Check if the selected user is already assigned if two people select a user at the same time and one
        // sends the message first
        // Update message of the other user
        let reciever = {
            "id" : "",
            "choose" : 0,
            "myUser1" : "",
            "myUser2" : ""
        }
        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser1){
                    console.log(doc.data().myUser1)
                    reciever.id = doc.id
                    reciever.choose = doc.data().choose
                    reciever.myUser1 = doc.data().myUser1
                    reciever.myUser2 = doc.data().myUser2
                }
            })
        } catch (err) {
            console.log(`Network Error ${err}`);
        }
        const userG = doc(db, "userData", reciever.id);
        console.log(reciever.myUser1)
        console.log(userData.username)
        if(reciever.myUser1 === userData.username){
            await updateDoc(userG, {
                "myMssg1" : userData.guessMssg1,
            });
        }
        else if(reciever.myUser2 === userData.username){
            await updateDoc(userG, {
                "myMssg2" : userData.guessMssg1,
            });
        }
        else{
            await updateDoc(userG, {
                [reciever.myUser1?"myMssg2":"myMssg1"] : userData.guessMssg1,
                [reciever.myUser1?"myUser2":"myUser1"] : userData.username,
                "choose" : reciever.choose + 1
            });
        }
        // window.location.reload();
        alertify.notify('Message Sent', 'success', 2, function(){});

        // update first user assigned and sent message and choice value
        try {
            const userD = doc(db, "userData", userData.id);
            setUserData(prev => (
                {...prev, 
                    "guessMssg1" : userData.guessMssg1,
                    "guessUser1" : userData.guessUser1,
                    'sentGuess1' : true
                }
            ))
            await updateDoc(userD, {
              "guessMssg1" : userData.guessMssg1,
              "guessUser1" : userData.guessUser1,
              'sentGuess1' : true
            });
          } catch (err) {
            console.log(`Network Error ${err}`);
        }
    }

    // Handle submission of second message
    async function handleMsg2(e){
        e.preventDefault()
        if(userData.guessUser2 === ""){
            alertify.notify('Choose a User first', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }
        else if(userData.guessMssg2 === ""){
            alertify.notify('Write a message', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }

        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser2 && doc.data().myUser2 != userData.username){
                    if(doc.data().choose === 2){
                        setUserData(prev=>(
                            {...prev, "guessUser2" : ""}
                        ))
                        setAllUsers((prev) => {
                            const temp = [...prev]
                            for(let i=0; i<temp.length; ++i){
                                if(temp[i][0] == doc.data().username)
                                    temp[i][1] = true
                            }
                            return [...temp]
                        })
                        alertify.alert('User already selected', `${userData.guessUser2} has just recived 2 
                        messages please select a different user`);
                        window.location.reload();
                    }
                }
            })
        } catch (err) {
            console.log(`Network Error ${err}`);
        }

        // Check if the selected user is already assigned if two people select a user at the same time and one
        // sends the message first
        // Update message of the other user
        let reciever = {
            "id" : "",
            "choose" : 0,
            "myUser1" : "",
            "myUser2" : ""
        }
        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser2){
                    console.log(doc.data().myUser1)
                    reciever.id = doc.id
                    reciever.choose = doc.data().choose
                    reciever.myUser1 = doc.data().myUser1
                    reciever.myUser2 = doc.data().myUser2
                }
            })
        } catch (err) {
            console.log(`Network Error ${err}`);
        }
        const userG = doc(db, "userData", reciever.id);
        console.log(reciever.myUser2)
        console.log(userData.username)
        if(reciever.myUser1 === userData.username){
            await updateDoc(userG, {
                "myMssg1" : userData.guessMssg1,
            });
        }
        else if(reciever.myUser2 === userData.username){
            await updateDoc(userG, {
                "myMssg2" : userData.guessMssg1,
            });
        }
        else{
            await updateDoc(userG, {
                [reciever.myUser1?"myMssg2":"myMssg1"] : userData.guessMssg2,
                [reciever.myUser1?"myUser2":"myUser1"] : userData.username,
                "choose" : reciever.choose + 1
            });
        }
        // window.location.reload();
        alertify.notify('Message Sent', 'success', 2, function(){});

        // update first user assigned and sent message and choice value
        try {
            const userD = doc(db, "userData", userData.id);
            setUserData(prev => (
                {...prev, 
                    "guessMssg2" : userData.guessMssg2,
                    "guessUser2" : userData.guessUser2,
                    'sentGuess2' : true
                }
            ))
            await updateDoc(userD, {
              "guessMssg2" : userData.guessMssg2,
              "guessUser2" : userData.guessUser2,
              'sentGuess2' : true
            });
          } catch (err) {
            console.log(`Network Error ${err}`);
        }
    }

    // Handle submission of first guess
    async function handleGuess1(e){
        e.preventDefault()
        if(userData.myUser1 === userData.localGuess1){
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti({
                confettiSize : `${(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))?4:6}`,
                confettiNumber : 500
             })
            alertify.alert("Congrats", "Correct Guess");
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "guessed1" : true
                });
                setUserData(prev => (
                    {...prev, "guessed1" : true}
                ))
              } catch (err) {
                console.log(`Network Error ${err}`);
            }
        }
        else{
            alertify.notify('Wrong Guess', 'error', 2, function(){  console.log('dismissed'); });
            setUserData(prev => (
                {...prev, "numGuess1" : prev.numGuess1 - 1}
            ))
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "numGuess1" : userData.numGuess1 - 1
                });
              } catch (err) {
                console.log(`Network Error ${err}`);
            }
        }
    }

    // Handle submission of second guess
    async function handleGuess2(e){
        e.preventDefault()
        console.log(userData.myUser2)
        console.log(userData.localGuess2)
        if(userData.myUser2 === userData.localGuess2){
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti({
                confettiSize : `${(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))?4:6}`,
                confettiNumber : 500
             })
            alertify.alert("Congrats", "Correct Guess");
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "guessed2" : true
                });
                setUserData(prev => (
                    {...prev, "guessed2" : true}
                ))
              } catch (err) {
                console.log(`Network Error ${err}`);
            }
        }
        else{
            alertify.notify('Wrong Guess', 'error', 2, function(){  console.log('dismissed'); });
            setUserData(prev => (
                {...prev, "numGuess2" : prev.numGuess2 - 1}
            ))
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "numGuess2" : userData.numGuess2 - 1
                });
              } catch (err) {
                console.log(`Network Error ${err}`);
            }
        }
    }

    function handleChange(event) {
        const {name, value} = event.target
        setUserData(prev => ({
            ...prev,
            [name] : value
        }))
    }

    function handleChangeSendSelect(event){
        console.log(event)
        setUserData(prev => ({
            ...prev,
            [event.name] : event.value,
        }))
        console.log(userData)
    }

    function handleChangeRecieveSelect(event){
        setUserData(prev => ({
            ...prev,
            [event.name] : event.value
        }))
        console.log(userData)
    }

    function getInvitation(){
        if(userData.guessed1){
            alertify.alert("invitaion", "you are invited")
        }
        else{
            window.location.reload();
        }
    }

    // map available users to display as a dropdown disable unavailable users
    const allOptionUsers1 = allUsers.map(u => {
        return {
            name : 'guessUser1',
            value : u[0],
            label : u[0],
            key : u[0],
            isDisabled : (u[1] || userData.guessUser2 === u[0])
        }
    })

    const allOptionUsers2 = allUsers.map(u => ({
        name : 'guessUser2',
        value : u[0],
        label : u[0],
        key : u[0],
        isDisabled : (u[1] || userData.guessUser1 === u[0])
    }))

    const allSelectUsers1 = allUsers.map(u => ({
        name : 'localGuess1',
        value : u[0],
        label : u[0],
        key : u[0],
    }))

    const allSelectUsers2 = allUsers.map(u => ({
        name : 'localGuess2',
        value : u[0],
        label : u[0],
        key : u[0],
    }))

    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/
        <div className='dashboardContainer'>
            {/* <h1 className='dashHeading'>Dashboard</h1> */}
            <div className='container userContainer'>
                <img 
                    src="https://vignette.wikia.nocookie.net/roblox-pet-ranch-simulator/images/a/a9/Coinss.png/revision/latest?cb=20190307131955" 
                    alt="champion profile"
                    width="100px"
                    className='avatar'
                />
                <div>
                    <p className='username'>{userData.username}</p>
                    <button className="logoutButton button" onClick={handleLogout}>logout</button>
                </div>

                <form onSubmit={handleMsg1} className='sendMessageContainer'>
                    {(!userData.sentGuess1) &&
                    <Select 
                        placeholder="choose"
                        id="guessUser1"
                        value={{label : userData.guessUser1}}
                        onChange={handleChangeSendSelect}
                        name="guessUser1"
                        className='selectReciever'
                        options = {allOptionUsers1}
                    />}
                    <div>
                        <label htmlFor="guessMssg1">
                            {(userData.sentGuess1) ? `Update Message to ${userData.guessUser1}`:
                            (userData.guessUser1 ? `Send message to ${userData.guessUser1}` : "Select a User")}
                        </label>
                    </div>
                    <div>
                        <textarea
                            id="guessMssg1" 
                            name="guessMssg1"
                            value={userData.guessMssg1}
                            onChange={handleChange}
                            className="textArea"
                            placeholder={`Write a Message to \
${userData.guessUser1 ? userData.guessUser1 : "unknown"} That \
helps him Guess your name and get an Invitation to the farewell, make sure not to reveal too much`}
                        />
                    </div>
                    <button className='button'>Send</button>
                </form>

                <form onSubmit={handleMsg2} className='sendMessageContainer'>
                    {(!userData.sentGuess2) &&
                    <Select 
                        placeholder="choose"
                        id="guessUser2"
                        value={{label : userData.guessUser2}}
                        onChange={handleChangeSendSelect}
                        name="guessUser2"
                        className='selectReciever'
                        options = {allOptionUsers2}
                    />}
                    <div>
                        <label htmlFor="guessMssg2">
                            {(userData.sentGuess2) ? `Update Message to ${userData.guessUser2}`:
                            (userData.guessUser2 ? `Send message to ${userData.guessUser2}` : "Select a User")}
                        </label>
                    </div>
                    <div>
                        <textarea
                            id="guessMssg2" 
                            name="guessMssg2"
                            value={userData.guessMssg2}
                            onChange={handleChange}
                            className="textArea"
                            placeholder={`Write a Message to \
${userData.guessUser2 ? userData.guessUser2 : "unknown"} That \
helps him Guess your name and get an Invitation to the farewell, make sure not to reveal too much`}
                        />
                    </div>
                    <button className='button'>Send</button>
                </form>

            </div>
            <div className='container'>
                <h2>Recieved Messages</h2>
                {(!userData.myMssg1 && !userData.myMssg2) && <p>No messages Recieved yet</p>}
                {userData.myMssg1 && <p className='messageText'>{userData.myMssg1}</p>}
                {(!userData.guessed1 && userData.myMssg1 && userData.numGuess1 != 0)  && 
                <form onSubmit={handleGuess1} className='guessForm'>
                    <div className='guessSelectContainer'>
                        <Select
                            placeholder="guess"
                            id="localGuess1"
                            Value={userData.localGuess1}
                            onChange={handleChangeRecieveSelect}
                            name="localGuess1"
                            options = {allSelectUsers1}
                            className='selectGuess'
                        />
                        <p className='tries'>{userData.numGuess1} tries remaining</p>
                    </div>
                    <button className='button'>Guess</button>
                </form>}
                {userData.myMssg2 && <p className='messageText'>{userData.myMssg2}</p>}
                {(!userData.guessed2 && userData.myMssg2 && userData.numGuess2 != 0)  && 
                <form onSubmit={handleGuess2} className='guessForm'>
                    <div className='guessSelectContainer'>
                        <Select
                            placeholder="guess"
                            id="localGuess2"
                            Value={userData.localGuess2}
                            onChange={handleChangeRecieveSelect}
                            name="localGuess2"
                            options = {allSelectUsers2}
                            className='selectGuess'
                        />
                        <p className='tries'>{userData.numGuess2} tries remaining</p>
                    </div>
                    <button className='button'>Guess</button>
                </form>}
            </div>
            
            <div className='inviteContainer'>
                {(userData.guessed1 && userData.guessed2) && <button className="button inviteButton" onClick={getInvitation}>Invitation</button>}
                {(userData.numGuess1 === 0 || userData.numGuess2 === 0) && 
                <p className="container notInvited">You failed to guess the sender</p>}
            </div>
        </div>
    )
}