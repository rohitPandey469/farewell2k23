import React from 'react'
import { useNavigate } from "react-router-dom";
import '../styles/splash.css'

export default function Splash(){
    const navigate = useNavigate();
    function handleClick(){
        navigate("/login"); 
    }
    return(
        <div className = "splashContainer" onClick={handleClick}>
            <h1 className='welcomeText'>Welcome</h1>
            <h2 className='farewellText'>Farewell 2k23</h2>
            <p className='clickText'>Click to go to login screen</p>
        </div>
    )
}