import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import '../App.css';

function Registration() {
  const navigate = useNavigate(); 
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API = (process.env.REACT_APP_API_URL || "http://localhost:3005").replace(/\/+$/, '');
  
  const handleChange = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.password) {
      setErrorMsg("All fields are required");
      return;
    }

    try {
      //await axios.post("http://localhost:3005/register", user);
      await axios.post(`${API}/register`, user);
      setSuccessMsg("Successfully registered");
      setUser({ name: "", email: "", password: "" });
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className='form-container'>
      <h1>REGISTRATION FORM</h1>

      {errorMsg && <p className="err">{errorMsg}</p>}
      {successMsg && <p className="succ">{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id='name' value={user.name} onChange={handleChange} />

        <label htmlFor="email">Email</label>
        <input type="email" id='email' value={user.email} onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" id='password' value={user.password} onChange={handleChange} />

        <button type='submit'>Register</button>
      </form>

      <p className='login-link'>
        Already have an account?{' '}
        <button 
          onClick={() => navigate("/login")} 
          className="login-btn"
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Registration;
