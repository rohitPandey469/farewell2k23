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

export default function Dashboard(){
    // reset()
    alertify.set('notifier','position', 'top-center');
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = React.useState(
        {
            "username" : "loading...",
            "choose" : 0,
            "guessMssg1" : "loading...",
            "guessUser1" : "loading...",
            "myMssg1" : "loading...",
            "myUser1" : "",
            "uid" : "",
            "id" : "",
            "guessed1" : false,
            "numGuess1" : "loading...",
            "guess1id" : "",
            "localGuess1" : "",
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
                        [...prev, [doc.data().username, !doc.data().myUser1]]
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

        // Check if the selected user is already assigned if two people select a user at the same time and one
        // sends the message first
        // Update message of the other user
        let id
        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser1){
                    if(doc.data().myUser1){
                        setUserData(prev=>(
                            {...prev, "guessUser1" : ""}
                        ))
                        setAllUsers((prev) => {
                            const temp = [...prev]
                            for(let i=0; i<temp.length; ++i){
                                if(temp[i][0] == doc.data().username)
                                    temp[i][1] = false
                            }
                            return [...temp]
                        })
                        alertify.alert('User already selected', `Some one just messaged ${userData.guessUser1}
                        while you were busy typing your message please select a different user`);
                        return
                    }
                    id = doc.id
                }
            })
        } catch (err) {
            console.log(`Network Error ${err}`);
        }
        const userG = doc(db, "userData", id);
        await updateDoc(userG, {
            "myMssg1" : userData.guessMssg1,
            "myUser1" : userData.username
        });
        // window.location.reload();
        alertify.notify('Message Sent', 'success', 2, function(){});

        // update first user assigned and sent message and choice value
        try {
            const userD = doc(db, "userData", userData.id);
            setUserData(prev => (
                {...prev, "choose" : userData.choose + 1,
                "guessMssg1" : userData.guessMssg1,
                "guessUser1" : userData.guessUser1}
            ))
            await updateDoc(userD, {
              "choose" : userData.choose + 1,
              "guessMssg1" : userData.guessMssg1,
              "guessUser1" : userData.guessUser1
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
            alertify.alert("Congrats", "Correct Guess You can view your invitation now");
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

    function handleChange(event) {
        const {name, value} = event.target
        setUserData(prev => ({
            ...prev,
            [name] : value
        }))
    }

    function handleChangeSendSelect(event){
        setUserData(prev => ({
            ...prev,
            'guessUser1' : event.value
        }))
        console.log(userData)
    }

    function handleChangeRecieveSelect(event){
        setUserData(prev => ({
            ...prev,
            'localGuess1' : event.value
        }))
        console.log(userData)
    }

    function getInvitation(){
        if(userData.guessed1){
            alert("you are invited")
        }
        else{
            window.location.reload();
        }
    }

    // map available users to display as a dropdown disable unavailable users
    const allOptionUsers = allUsers.map(u => ({
        value : u[0],
        label : u[0],
        key : u[0],
        isDisabled : !(u[1])
    }))

    const allSelectUsers = allUsers.map(u => ({
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
                    {(userData.choose < 1) &&
                    <Select 
                        placeholder="choose"
                        id="guessUser1"
                        value={{label : userData.guessUser1}}
                        onChange={handleChangeSendSelect}
                        name="guessUser1"
                        className='selectReciever'
                        options = {allOptionUsers}
                    />}
                    <div>
                        <label htmlFor="guessMssg1">
                            {(userData.choose >= 1) ? `Update Message to ${userData.guessUser1}`:
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
            </div>
            <div className='container'>
                <h2>Recieved Message</h2>
                {userData.myMssg1 ? <p className='messageText'>{userData.myMssg1}</p> : <p>No messages recieved yet</p>}
                {(!userData.guessed1 && userData.myMssg1 && userData.numGuess1 != 0)  && 
                <form onSubmit={handleGuess1} className='guessForm'>
                    <div className='guessSelectContainer'>
                        <Select
                            placeholder="guess"
                            id="localGuess1"
                            Value={userData.localGuess1}
                            onChange={handleChangeRecieveSelect}
                            name="localGuess1"
                            options = {allSelectUsers}
                            className='selectGuess'
                        />
                        <p className='tries'>{userData.numGuess1} tries remaining</p>
                    </div>
                    <button className='button'>Guess</button>
                </form>}
            </div>
            <div className='inviteContainer'>
                {userData.guessed1 && <button className="button inviteButton" onClick={getInvitation}>Invitation</button>}
                {userData.numGuess1 === 0 && <p className="container notInvited">You are not invited as you failed to guess the sender</p>}
            </div>
        </div>
    )
}