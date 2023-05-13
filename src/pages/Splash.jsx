import React from 'react'
import { useNavigate } from "react-router-dom";
import '../styles/splash.css'
import ncsLogo from '../assets/ncs-logo.png'
import alertify from 'alertifyjs'; 
import 'alertifyjs/build/css/alertify.css';

export default function Splash(){
    const navigate = useNavigate();
    React.useEffect(() => {
        console.log("Finisged Loading page")
        alertify.set('notifier','position', 'bottom-center');
        alertify.notify('Click anywhere to continue', 'success', 5, function(){  console.log('dismissed'); });
    }, [])
    function handleClick(){
        alertify.dismissAll();
        navigate("/login"); 
    }
    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/

        <div className = "splashContainer" onClick={handleClick}>
            <div className='upperHalf'>
                <img className="ncsLogo" src={ncsLogo} alt="Nibble Computer Society Logo"/>
                <div className='greetings-container'>
                    <h1 className='welcomeText'>Welcome</h1>
                    <h2 className='farewellText'>Farewell 2k23</h2>
                </div>
            </div>
        </div>
    )
}