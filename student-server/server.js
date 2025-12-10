const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser")
const { Pool } = require("pg");
const bcrypt = require("bcrypt")
const crypto  = require("crypto")
const sendEmail = require("./sendEmail")
const path = require("path");
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL pool for Render
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  max: 10
});

// Connect to PostgreSQL
pool.connect((err) => {
  if (err) throw err
  console.log(`The database is connected successfully`);
});



//PostgreSQL pool
/*const pool = new Pool({
  user: "postgres",
  password: "Kamikaze.10",
  database: "student_db",
  host: "localhost",
  port: 5432,
  max: 10,
});*/



//------------------------Endpoints-----------------------

//get all students
app.get("/students",(req,res)=>{
  const sql = "SELECT * FROM student";
  pool.query(sql,(err,result)=>{
    if(err) return res.json(err);
    return res.status(200).json(result.rows);
  })
})

//Get a particular student
app.get("/students/:studentId",(req,res)=>{
  const stdId = Number(req.params.studentId);
  const sql = `SELECT * FROM student WHERE "studentId" = $1`;
  pool.query(sql,[stdId],(err,result)=>{
    if(err) return res.json(err);
    return res.status(200).json(result.rows[0]);
  })
})

//Add a student
app.post("/students",(req,res)=>{
  const {name,email,password} = req.body;
  const sql = "INSERT INTO student(name,email,password) VALUES($1,$2,$3) RETURNING *";
  pool.query(sql,[name,email,password],(err,result)=>{
    if(err) return res.json(err);
    return res.status(201).json(result.rows[0]);
  })
})

//Update a student
app.patch("/students/:studentId",(req,res)=>{
  const stdId = Number(req.params.studentId);
  const {name,email} = req.body;
  const sql = `UPDATE student SET name=$1,email=$2 WHERE "studentId" = $3`;
  pool.query(sql,[name,email,stdId],(err,result)=>{
    if(err) return res.json(err);
    return res.status(200).send(`The student with ID ${stdId} has been updated successfully`);
  })
})

//Delete a student
app.delete("/students/:studentId",(req,res)=>{
  const stdId = Number(req.params.studentId);
  const sql = `DELETE FROM student WHERE "studentId"=$1`;
  pool.query(sql,[stdId],(err,result)=>{
    if(err) return res.json(err);
    return res.status(200).send(`The student with ID ${stdId} has been deleted successfully`);
  })
})

// Register a student
app.post("/register", async(req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password,10)
  try{
    const token = crypto.randomBytes(32).toString("hex");
    const sql = `INSERT INTO student(name, email, password, verified, token, "createdAt")
             VALUES($1, $2, $3, $4, $5, NOW()) RETURNING *`;

    const result = await pool.query(sql, [name, email, hashedPassword, false, token]);
    const user = result.rows[0];
  
  //send verification email
  const verificationUrl = `${import.meta.env.REACT_APP_API_URL}/students/${user.studentId}/verify/${token}`;
  await sendEmail(user.email, "Verification email",`Click to verify: ${verificationUrl}`)

  res.status(201).json({message: "Registration successfully. Check your email to verify"})
} catch(err){
  console.error(err)
  res.status(500).json({message: "Registration failed"})
}
});

//Email Verification
app.get("/students/:studentId/verify/:token", async (req, res) => {
  const { studentId, token } = req.params;

  try {
    // Check if student exists
    const studentResult = await pool.query(
      `SELECT * FROM student WHERE "studentId" = $1`,
      [studentId]
    );

    // ❌ CASE 1: Student does not exist (deleted after 1 min or never existed)
    if (studentResult.rows.length === 0) {
      return res.status(410).json({
        message: "Verification expired or account already deleted."
      });
    }

    const student = studentResult.rows[0];

    // Check expiration
    const createdAt = new Date(student.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);

    // ❌ CASE 3: Token expired → delete account
    if (diffInMinutes > 1) {
      await pool.query(
        `DELETE FROM student WHERE "studentId" = $1`,
        [studentId]
      );
      return res.status(410).json({
        message: "Verification expired. Account deleted. Please register again."
      });
    }

    // ✅ CASE 4: SUCCESS
    await pool.query(
      `UPDATE student SET verified = true, token = NULL WHERE "studentId" = $1`,
      [studentId]
    );

    res.json({ message: "Email verified successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


//Login student
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM student WHERE email = $1";
  const result = await pool.query(sql, [email])

  if(result.rows.length===0) return res.status(400).json({message: "The email does not exist in the database"})

  const user = result.rows[0]
  const isMatch = await bcrypt.compare(password,user.password)
  if(!isMatch) return res.status(400).json({message: "Incorrect Password"})

  delete user.password;
  return res.status(200).json({ message: "Login Successfully", user });
});

// Start server
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`The server is listening on port ${port}`);
});

// Serve static React build
app.use(express.static(path.join(__dirname, "../student-web/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../student-web/dist", "index.html"));
});
