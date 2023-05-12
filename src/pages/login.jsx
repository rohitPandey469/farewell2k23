import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword} from "../../firebase";
// import { db, logout} from "../../firebase";
// import { doc, getDocs, updateDoc, collection } from 'firebase/firestore'
import { useAuthState } from "react-firebase-hooks/auth";
import '../styles/login.css'
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

alertify.set('notifier','position', 'top-center');

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
        e.preventDefault()
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
                <button className='loginButton'>Login</button>
            </form>
        </div>
    )
}