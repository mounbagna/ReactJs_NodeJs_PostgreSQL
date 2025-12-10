import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Registration from "./Components/Registration";
import Dashboard from "./Components/Dashboard";
import { useState, useEffect } from 'react';
import EmailVerify from "./EmailVerify";

function App() {

  const [loggedInUser, setLoggedInUser] = useState(null);

  // Load user from localStorage when page loads
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser}/>}></Route>
        <Route path="/register" element={<Registration/>}></Route>
        <Route path="/dashboard" element={<Dashboard user={loggedInUser}/>}></Route>
        <Route path="/students/:studentId/verify/:token" element={<EmailVerify />} />
      </Routes>
    </Router>
  );
}

export default App;
