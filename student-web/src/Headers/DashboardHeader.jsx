import { Link,useNavigate } from "react-router-dom";
import "../App.css"

function DashboardHeader(){
    const navigate = useNavigate()

    const handleLogout = () =>{
        localStorage.removeItem("user")
        navigate("/")
    }

    return (
        <header  className="header">
            <h2>
                <nav>
                    <Link to="/profile" className="nav-link">Profile</Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </nav>
            </h2>
        </header>
    )
}
export default DashboardHeader