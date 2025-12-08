// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";
const { Pool } = pkg;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 10,
  ssl: { rejectUnauthorized: false } // needed for Render Postgres
});

// Connect to PostgreSQL
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the database successfully");
    release();
  }
});

//------------------------Endpoints-----------------------

// Get all students
app.get("/students", (req, res) => {
  pool.query("SELECT * FROM student", (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result.rows);
  });
});

// Get a particular student
app.get("/students/:studentId", (req, res) => {
  const stdId = Number(req.params.studentId);
  pool.query(
    `SELECT * FROM student WHERE "studentId" = $1`,
    [stdId],
    (err, result) => {
      if (err) return res.json(err);
      return res.status(200).json(result.rows[0]);
    }
  );
});

// Add a student
app.post("/students", (req, res) => {
  const { name, email, password } = req.body;
  pool.query(
    "INSERT INTO student(name,email,password) VALUES($1,$2,$3) RETURNING *",
    [name, email, password],
    (err, result) => {
      if (err) return res.json(err);
      return res.status(201).json(result.rows[0]);
    }
  );
});

// Update a student
app.patch("/students/:studentId", (req, res) => {
  const stdId = Number(req.params.studentId);
  const { name, email } = req.body;
  pool.query(
    `UPDATE student SET name=$1,email=$2 WHERE "studentId" = $3`,
    [name, email, stdId],
    (err, result) => {
      if (err) return res.json(err);
      return res
        .status(200)
        .send(`The student with ID ${stdId} has been updated successfully`);
    }
  );
});

// Delete a student
app.delete("/students/:studentId", (req, res) => {
  const stdId = Number(req.params.studentId);
  pool.query(`DELETE FROM student WHERE "studentId"=$1`, [stdId], (err, result) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .send(`The student with ID ${stdId} has been deleted successfully`);
  });
});

// Register a student
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  pool.query(
    "INSERT INTO student(name, email, password) VALUES($1, $2, $3) RETURNING *",
    [name, email, password],
    (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(201).json(result.rows[0]);
    }
  );
});

// Login student
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  pool.query(
    "SELECT * FROM student WHERE email = $1 AND password = $2",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      return res.status(200).json({ user: result.rows[0] });
    }
  );
});


app.use(express.static(path.join(__dirname, "../student-web/dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../student-web/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
