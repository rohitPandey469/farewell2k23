import React from 'react'
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
// database imports
import { auth, db, logout, toastif} from "../../firebase";
import { doc, getDocs, updateDoc, collection } from 'firebase/firestore'
import {names} from "../database/dbOps"
//  Utility Library imports
import {saveAs} from "file-saver";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select'
import JSConfetti from 'js-confetti'
// Assets
import ncsLogo from '../assets/ncs-logo.png'
import '../styles/dashboard.css'

import {reset, addUsers} from '../database/dbOps'

export default function Dashboard(){
    // reset()
    React.useEffect(()=>{
        console.log("finished loading page")
    }, [])
    const [userData, setUserData] = React.useState(
        {
            "username" : "loading...",
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
            "uid" : "",
            "id" : "",
            "guessed1" : false,
            "guessed2" : false,
            "numGuess1" : "",
            "numGuess2" : "",
            "guess1id" : "",
            "localGuess1" : "",
            "localGuess2" : ""
        }
    )

    const [allUsers, setAllUsers] = React.useState([])
    const [inviteVisible, setInviteVisible] = React.useState(true)
    const [inviteCard, setInviteCard] = React.useState(null)
    const navigate = useNavigate();

    //If the user logs out redirect to login page
    const [user, loading] = useAuthState(auth);
    React.useEffect(() => {
        if(loading){
            return;
        }
        if (!user){
            navigate("/login")
            setTimeout(() => {toast.success('Logout Successful!', {
                toastif
                });}, 1)
        }
    }, [user]);

    const fetchImage = async () => {
        try {
            const response = await import(`../assets/invitations/\
${(((userData.username).split(" "))[0]).toLowerCase()}.png`)
            setInviteCard(response.default)
        } catch (err) {
            setInviteCard(err)
        }
    }

    React.useEffect(() => {
        fetchImage()
    }, [userData.username])

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

    // Get data from firebase
    React.useEffect(() => {
        if(loading){
            return;
        }
        if(user){
            getUserData()
        }
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
            toast.warn('Choose a User first!', {
                toastif
                });
            return
        }
        else if(userData.guessMssg1 === ""){
            toast.warn('Write a message!', {
                toastif
                });
            return
        }
        let blunder = false
        const UserRef = collection(db, "userData")
        const uD = await getDocs(UserRef)
        uD.forEach((doc) => {
            if(doc.data().username === userData.username){
                if(doc.data().sentGuess1 && doc.data().guessUser1 != userData.guessUser1){
                    blunder = true
                }
            }
        })
        uD.forEach((doc) => {
            if(doc.data().username === userData.guessUser1 && doc.data().myUser1 != userData.username &&
            doc.data().myUser2 != userData.username){
                if(doc.data().choose === 2){
                    blunder = true
                    toast.error(`${userData.guessUser1} has just recived 2 /
/messages please select a different user`, {
                        toastif
                        });
                    setUserData(prev=>(
                        {...prev, "guessUser1" : ""}
                    ))
                    setAllUsers((prev) => {
                        const temp = [...prev]
                        for(let i=0; i<temp.length; ++i){
                            if(temp[i][0] === doc.data().username)
                                temp[i][1] = true
                        }
                        return [...temp]
                    })
                    return
                }
            }
        })

        if(blunder){
            // document.location.reload()
            return
        }

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
                    reciever.id = doc.id
                    reciever.choose = doc.data().choose
                    reciever.myUser1 = doc.data().myUser1
                    reciever.myUser2 = doc.data().myUser2
                }
            })
        } catch (err) {
            toast.error('No Internet', {
                toastif
            });
            console.log(`Network Error ${err}`);
        }
        const userG = doc(db, "userData", reciever.id);
        if(reciever.myUser1 === userData.username){
            console.log(reciever.id)
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
        toast.success("Message Sent", {
            toastif
        });

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
            toast.error('No Internet', {
                toastif
            });
            console.log(`Network Error ${err}`);
        }
    }

    // Handle submission of second message
    async function handleMsg2(e){
        e.preventDefault()
        if(userData.guessUser2 === ""){
            toast.warn("Choose a User first!", {
                toastif
            });
            return
        }
        else if(userData.guessMssg2 === ""){
            toast.warn("Write a message!", {
                toastif
            });
            return
        }

        let blunder = false
        const UserRef = collection(db, "userData")
        const uD = await getDocs(UserRef)
        uD.forEach((doc) => {
            if(doc.data().username === userData.username){
                if(doc.data().sentGuess2 && doc.data().guessUser2 != userData.guessUser2){
                    blunder = true
                }
            }
        })
        uD.forEach((doc) => {
            if(doc.data().username === userData.guessUser2 && doc.data().myUser1 != userData.username &&
            doc.data().myUser2 != userData.username){
                if(doc.data().choose === 2){
                    blunder = true
                    toast.error(`${userData.guessUser1} has just recived 2 /
/messages please select a different user`, {
                        toastif
                    });
                    setUserData(prev=>(
                        {...prev, "guessUser2" : ""}
                    ))
                    setAllUsers((prev) => {
                        const temp = [...prev]
                        for(let i=0; i<temp.length; ++i){
                            if(temp[i][0] === doc.data().username)
                                temp[i][1] = true
                        }
                        return [...temp]
                    })
                    return
                }
            }
        })

        if(blunder){
            document.location.reload()
            return
        }
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
                    reciever.id = doc.id
                    reciever.choose = doc.data().choose
                    reciever.myUser1 = doc.data().myUser1
                    reciever.myUser2 = doc.data().myUser2
                }
            })
        } catch (err) {
            toast.error('No Internet', {
                toastif
            });
            console.log(`Network Error ${err}`);
        }
        const userG = doc(db, "userData", reciever.id);
        if(reciever.myUser1 === userData.username){
            await updateDoc(userG, {
                "myMssg1" : userData.guessMssg2,
            });
        }
        else if(reciever.myUser2 === userData.username){
            await updateDoc(userG, {
                "myMssg2" : userData.guessMssg2,
            });
        }
        else{
            await updateDoc(userG, {
                [reciever.myUser1?"myMssg2":"myMssg1"] : userData.guessMssg2,
                [reciever.myUser1?"myUser2":"myUser1"] : userData.username,
                "choose" : reciever.choose + 1
            });
        }
        toast.success("Message Sent", {
            toastif
        });
        
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
            toast.error('No Internet', {
                toastif
            });
            console.log(`Network Error ${err}`);
        }
    }
    
    // Handle submission of first guess
    async function handleGuess1(e){
        e.preventDefault()
        if(!userData.localGuess1){
            return
        }
        let blunder = false
        const UserRef = collection(db, "userData")
        const uD = await getDocs(UserRef)
        uD.forEach((doc) => {
            if(doc.data().username === userData.username){
                if(doc.data().numGuess1 != userData.numGuess1 || doc.data().guessed1){
                    blunder = true
                }
            }
        })
        if(blunder){
            window.location.reload()
            return
        }
        if(userData.myUser1 === userData.localGuess1){
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti({
                emojis : ["🌟", "💫"],
                emojiSize : `${(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))?100:150}`,
                confettiNumber : 15
                })
            toast.success("Correct Guess", {
                toastif
            });
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
            toast.error("Wrong Guess", {
                toastif
            });
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
        if(!userData.localGuess2){
            return
        }
        let blunder = false
        const UserRef = collection(db, "userData")
        const uD = await getDocs(UserRef)
        uD.forEach((doc) => {
            if(doc.data().username === userData.username || doc.data().guessed2){
                if(doc.data().numGuess2 != userData.numGuess2){
                    blunder = true
                }
            }
        })
        if(blunder){
            window.location.reload()
            return
        }
        if(userData.myUser2 === userData.localGuess2){
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti({
                emojis : ["🌟", "💫"],
                emojiSize : `${(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))?100:150}`,
                confettiNumber : 15
                })
            // alertify.alert("Congrats", "Correct Guess");
            toast.success("Correct Guess", {
                toastif
            });
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
            toast.error("Wrong Guess", {
                toastif
            });
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
    }

    function viewInvitation(){
        const jsConfetti = new JSConfetti()
        if(!inviteCard)
            fetchImage()
        setInviteVisible(true)
        jsConfetti.addConfetti({
            emojis : ["🌟", "💫"],
            emojiSize : `${(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))?100:150}`,
            confettiNumber : 15
        })
    }

    function getInvitation(){
        if(!inviteCard)
            fetchImage()
        if(userData.guessed1){
            try{
                saveAs(inviteCard, "Farewell2k23");
                toast.info("Invitation card downloaded", {
                    transition : Slide,
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }catch(err){
                console.log(err)
            }
        }
        else{
            window.location.reload();
        }
    }

    function closeInvite(){
        setInviteVisible(false)
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
        <div className='pageContainer'>

            {(userData.guessed1 && userData.guessed2 && inviteVisible) && <div id="myModal" className="modal">
                <span className="close" onClick={closeInvite}>&times;</span>
                <img src = {inviteCard} className="modal-content" id="img01"/>
            </div>}
            
            <ToastContainer
                limit={1}
                transition={Slide}
                position="top-center"
                autoClose={1000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className='logoContainer'>
            <a href="https://hackncs.in/">
                <img className="ncsLogo" src={ncsLogo} alt="Nibble Computer Society Logo"/>
            </a>
            </div>

            <div className='dashboardContainer'>
                <div className='rightContainer'>
                    <div className='container profileContainer'>
                        <img 
                            src= {`/profile/${(((userData.username).split(" "))[0]).toLowerCase()}.\
${  ((userData.username === names[0]) || 
    (userData.username === names[2]) || 
    (userData.username === names[3])) ?"png":"jpg"}`}
                            alt={userData.username}
                            className='avatar'
                        />
                        <p className='username'>{userData.username}</p>
                        <button className="button" onClick={handleLogout}>logout</button>
                        <div className='inviteContainer'>
                            {(userData.guessed1 && userData.guessed2) && <button className="button inviteButton" onClick={viewInvitation}>View Invitation</button>}
                            {(userData.guessed1 && userData.guessed2) && <button className="button inviteButton" onClick={getInvitation}>Download Invitation</button>}
                            {(userData.numGuess1 === 0 || userData.numGuess2 === 0) && 
                            <p className="container notInvited">You failed to guess both the senders</p>}
                        </div>
                    </div>
                    <div className='container recievedContainer'>
                        <h2 className='msginfo'>Recieved Messages</h2>
                        {(!userData.myMssg1 && !userData.myMssg2) && <p>No messages Recieved yet</p>}
                        {userData.myMssg1 && 
                            <textarea readOnly
                                className='textArea readOnlyMssg'
                                value={userData.myMssg1}
                            />}
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
                        {userData.myMssg2 && 
                            <textarea readOnly
                                className='textArea readOnlyMssg'
                                value={userData.myMssg2}
                            />}
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
                </div>
                <div className='leftContainer container'>
                    <form onSubmit={handleMsg1} className='sendMessageContainer'>
                        <div className='selectAnnounce'>
                            <label htmlFor="guessMssg1">
                                {(userData.sentGuess1) ? `Update Message to ${userData.guessUser1}`:
                                (userData.guessUser1 ? `Send message to ${userData.guessUser1}` : "Select a User to send message")}
                            </label>
                        </div>
                        <div className='messageButtonContainer'>
                            <textarea
                                id="guessMssg1" 
                                name="guessMssg1"
                                value={userData.guessMssg1}
                                onChange={handleChange}
                                className="textArea"
                                placeholder={`Write a Message to \
${userData.guessUser1 ? userData.guessUser1 : "unknown"}`}
                            />
                            <div className='selectButtonContainer'>
                                {(!userData.sentGuess1) &&
                                <Select 
                                    placeholder="choose"
                                    id="guessUser1"
                                    value={{label:userData.guessUser1}}
                                    onChange={handleChangeSendSelect}
                                    name="guessUser1"
                                    className='selectReciever'
                                    options = {allOptionUsers1}
                                />}
                                <button className='button'>
                                    {!(userData.sentGuess1)?"Send Message":"Update Message"}
                                </button>
                            </div>
                        </div>
                    </form>
                    <form onSubmit={handleMsg2} className='sendMessageContainer mssgBottom'>
                        <div className='selectAnnounce'>
                            <label htmlFor="guessMssg2">
                                {(userData.sentGuess2) ? `Update Message to ${userData.guessUser2}`:
                                (userData.guessUser2 ? `Send message to ${userData.guessUser2}` : "Select a User to send message")}
                            </label>
                        </div>
                        <div className='messageButtonContainer'>
                            <textarea
                                id="guessMssg2" 
                                name="guessMssg2"
                                value={userData.guessMssg2}
                                onChange={handleChange}
                                className="textArea"
                                placeholder={`Write a Message to \
${userData.guessUser2 ? userData.guessUser2 : "unknown"}`}
                            />
                            <div className='selectButtonContainer'>
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
                                <button className='button'>
                                    {!(userData.sentGuess2)?"Send Message":"Update Message"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}