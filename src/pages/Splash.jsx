import React from 'react'
import { useNavigate } from "react-router-dom";
import '../styles/splash.css'

export default function Splash(){
    const navigate = useNavigate();
    function handleClick(){
        navigate("/login");
    }
    return(
        <div className = "splashContainer">
            <h1>Splash Screen</h1>
            <button onClick={handleClick}>Click to go to login screen</button>
        </div>
    )
}