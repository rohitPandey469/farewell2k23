import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, toastif} from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import '../styles/login.css';
import welcome from "../assets/home/welcome.png";

import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export default function Login(){
    React.useEffect(()=>{
        console.log("finished loading page")
    }, [])
    const [formData, setFormData] = React.useState({
        "email" : "",
        "password" : ""
    })
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (loading) {
            return
        }
        if (user){
            navigate("/dashboard");
            setTimeout(() => {toast.success('Login Successful', {
                toastif
            });}, 1)
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
        if(formData.email === ""){
            toast.warn('Empty Email field!', {
                toastif
                });
            return
        }
        if(formData.password === ""){
            toast.warn('Empty Password field!', {
                toastif
                });
            return
        }
        logInWithEmailAndPassword(formData.email, formData.password)
    }
    
    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/

        <div className='formContainer'>
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
            <form className="loginForm" onSubmit={handleSubmit}>
                <img src={welcome} className='loginWelcome' alt="welcome"/>
                <p className='loginp'>Enter your Username and Password</p>
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
                <button className='loginButton'>Log In</button>
            </form>
        </div>
    )
}