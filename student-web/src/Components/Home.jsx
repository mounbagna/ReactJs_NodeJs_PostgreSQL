import landingImage from '../assets/img.jpg'
import { useNavigate } from 'react-router-dom';
import '../App.css'

function Home(){
    const navigate = useNavigate()
    return (
        <div className='home-page'>
            <img src={landingImage} alt="Landing" className='main-img' />
            <h1>Welcome to a Full Stack Application Using ReactJs, NodeJs & PostgreSQL</h1>

            <div className="home-buttons">
                <button onClick={()=>navigate("/login")}>Login</button>
                <button onClick={()=>navigate("/register")}>Register</button>
            </div>
        </div>
    )
}

export default Home;