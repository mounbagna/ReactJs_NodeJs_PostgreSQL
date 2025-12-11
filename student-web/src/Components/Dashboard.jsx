import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer"
import DashboardHeader from '../Headers/DashboardHeader';

function Dashboard({ user }) {
 const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [studentData, setStudentData] = useState({studentId: null,name: "",email: ""});

  const openPopup = () => setIsModalOpen(true);

  const closePopup = () => {
    setIsModalOpen(false);
    setStudentData({ studentId: null, name: "", email: "" });
    setErrorMsg("");
  };

  const API = process.env.REACT_APP_API_URL || "http://localhost:3005";

  const getAllStudents = () => {
    //axios.get("http://localhost:3005/students")
    axios.get(`${API}/students`)
      .then(res => {
        setStudents(res.data);
        setFilteredStudents(res.data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getAllStudents();
  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredData = students.filter(student =>
      student.name.toLowerCase().includes(searchValue) ||
      student.email.toLowerCase().includes(searchValue)
    );
    setFilteredStudents(filteredData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentData.name || !studentData.email) {
      setErrorMsg("ALL FIELDS ARE REQUIRED");
      return;
    }
    try {
      if (studentData.studentId) {
        //await axios.patch(`http://localhost:3005/students/${studentData.studentId}`, studentData);
        await axios.patch(`${API}/students/${studentData.studentId}`, studentData);
      } else {
        //await axios.post("http://localhost:3005/students", studentData);
        await axios.post(`${API}/students`, studentData);
      }
      getAllStudents(); 
      closePopup();     
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong");
    }
  };

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.id]: e.target.value });
  };

  const handleEdit = (student) => {
  setStudentData({
    studentId: student.studentId,
    name: student.name,
    email: student.email
  });
  openPopup();
};

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm("Do you really want to delete?");
    if (!confirmDelete) return;
    try {
      //await axios.delete(`http://localhost:3005/students/${studentId}`);
      await axios.delete(`${API}/students/${studentId}`);
      getAllStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
  
    <DashboardHeader/>
    <div className='main-content'>
      <h3>Welcome, {user?.name}!</h3>

      <div className='search-bar'>
        <input
          className='searchInput'
          type='search'
          placeholder='Search for a record'
          onChange={handleSearch}
        />
        <button className='addBtn' onClick={openPopup}>Add</button>
      </div>

      <div className='table-box'>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="addEditPopup">
              <span className="closePopup" onClick={closePopup}>&times;</span>
              <h4>Student's Details</h4>
              {errorMsg && <p className="err">{errorMsg}</p>}

              <div className='popupdiv'>
                <label className='popuplabel' htmlFor="name">Name</label>
                <input
                  className="popupinput"
                  type="text"
                  id="name"
                  value={studentData.name}
                  onChange={handleChange}
                />
              </div>

              <div className='popupdiv'>
                <label className='popuplabel' htmlFor="email">Email</label>
                <input
                  className="popupinput"
                  type="text"
                  id="email"
                  value={studentData.email}
                  onChange={handleChange}
                />
              </div>

              <button className="addpopupbtn" onClick={handleSubmit}>
                {studentData.studentId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}

        <table className='table'>
          <thead>
            <tr>
              <th>StudentID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button className='eBtn' onClick={() => handleEdit(student)}>Edit</button>
                </td>
                <td>
                  <button className='dBtn' onClick={() => handleDelete(student.studentId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className='login-link'>Want to navigate to the homepage?{' '}
        <button onClick={() => navigate("/")} className="login-btn">Homepage</button>
      </p>
      
      </div>
     
    </div>
    </>
  );
}

export default Dashboard;