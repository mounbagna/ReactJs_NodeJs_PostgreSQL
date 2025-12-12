import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setLoggedInUser }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setErrorMsg("All fields are required");
      return;
    }
    try {
      const res = await axios.post(`${API}/login`, credentials);
      setLoggedInUser(res.data.user);
      setErrorMsg("");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className='form-container'>
      <h1>LOGIN FORM</h1>
      {errorMsg && <p className="err">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id='email' value={credentials.email} onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" id='password' value={credentials.password} onChange={handleChange} />

        <button type='submit'>Login</button>
      </form>
    </div>
  );
}

export default Login;
