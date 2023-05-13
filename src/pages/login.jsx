import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword} from "../../firebase";
// import { db, logout} from "../../firebase";
// import { doc, getDocs, updateDoc, collection } from 'firebase/firestore'
import { useAuthState } from "react-firebase-hooks/auth";
import '../styles/login.css'
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import ncsLogo from '../assets/ncs-logo.png'

export default function Login(){
    const [formData, setFormData] = React.useState({
        "email" : "",
        "password" : ""
    })
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (loading) {
            console.log("loading")
            return
        }
        if (user){
            navigate("/dashboard");
            alertify.set('notifier','position', 'top-center');
            alertify.notify('Login Successful', 'success', 2, function(){  console.log('dismissed'); });
        }
    }, [user, loading]);

    function handleChange(event) {
        const {name, value} = event.target
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        })
    }

    async function handleSubmit(e){
        alertify.set('notifier','position', 'top-center');
        e.preventDefault()
        if(formData.email === ""){
            alertify.notify('Empty Email field', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }
        if(formData.password === ""){
            alertify.notify('Empty password field', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }
        logInWithEmailAndPassword(formData.email, formData.password)
        // logInWithEmailAndPassword(email, password)
    }
    
    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/

        <div className='formContainer'>
            <form className="loginForm" onSubmit={handleSubmit}>
                <img className="ncsLogo" src={ncsLogo} alt="Nibble Computer Society Logo"/>
                <h1 className='loginWelcome'>Welcome</h1>
                <div className='inputContainer'>
                    <input 
                        id = "email"
                        className='inputField'
                        type = "email"
                        name = "email"
                        value = {formData.email}
                        placeholder='Email'
                        onChange = {handleChange}
                    />
                    <input 
                        id = "password"
                        className='inputField'
                        type = "password"
                        name = "password"
                        value = {formData.password}
                        placeholder='Password'
                        onChange = {handleChange}
                    />
                </div>
                <button className='loginButton'>Login</button>
            </form>
        </div>
    )
}