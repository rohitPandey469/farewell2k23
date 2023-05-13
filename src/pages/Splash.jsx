import React from 'react'
import { useNavigate } from "react-router-dom";
import '../styles/splash.css'
import ncsLogo from '../assets/ncs-logo.png'

export default function Splash(){
    const navigate = useNavigate();
    function handleClick(){
        navigate("/login"); 
    }
    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/

        <div className = "splashContainer" onClick={handleClick}>
            <img className="ncsLogo" src={ncsLogo} alt="Nibble Computer Society Logo"/>
            <div className='greetings-container'>
                <h1 className='welcomeText'>Welcome</h1>
                <h2 className='farewellText'>Farewell 2k23</h2>
            </div>
            <p className='clickText'>Click to go to login Window</p>
        </div>
    )
}