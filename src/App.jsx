// import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Splash from './pages/Splash'
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import './styles/App.css'

function App() {
  return (
    <>
      <div className="app">
        <Router>
          <Routes>
            <Route exact path="/" element={<Splash />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
