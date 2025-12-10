import { Fragment, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import success from "./images/success.png";
import "./App.css";

const EmailVerify = () => {
  const param = useParams();
  const [loading, setLoading] = useState(true);
  const [validUrl, setValidUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmailUrl = async () => {
      try {
        //const url = `http://localhost:3005/students/${param.studentId}/verify/${param.token}`;
        const url = `${import.meta.env.VITE_API_URL}/students/${param.studentId}/verify/${param.token}`;
        const { data } = await axios.get(url);

        console.log(data);
        setValidUrl(true);
      } catch (error) {
        console.log(error.response.data);
        setValidUrl(false);

        // Show server message (expired, deleted, invalid token, etc.)
        if (error.response && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Verification failed. Invalid or expired link.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmailUrl();
  }, [param]);

  if (loading) {
    return <h2 className="verify-loading">Verifying email...</h2>;
  }

  return (
    <Fragment>
      {validUrl ? (
        <div className="verify-container">
          <img src={success} alt="success" className="success-img" />
          <h1>Email verified successfully!</h1>
          <p>You can now login to your account.</p>
          <Link to="/login">
            <button className="green-btn">Login</button>
          </Link>
        </div>
      ) : (
        <div className="verify-container failed">
          <h1 style={{ color: "red" }}>Verification Failed</h1>
          <p>{errorMessage}</p>

          <Link to="/register">
            <button className="red-btn">Register Again</button>
          </Link>
        </div>
      )}
    </Fragment>
  );
};

export default EmailVerify;
