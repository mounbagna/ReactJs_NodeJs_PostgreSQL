import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from "./Components/Home"
import Login from "./Components/Login"
import Registration from "./Components/Registration"
import Dashboard from "./Components/Dashboard"
import { useState } from 'react'


function App() {

  const [loggedInUser, setLoggedInUser] = useState(null)

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser}/>}></Route>
        <Route path="/register" element={<Registration/>}></Route>
        <Route path="/dashboard" element={<Dashboard user={loggedInUser}/>}></Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
