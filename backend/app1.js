
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
const { PassThrough } = require('stream');
// const { bcrypt } = require('bcryptjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("connection estabslished");
  } catch (err) {
    console.error("connection error", err);
    process.exit(1);
  }
}

connectDB();



// courses schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // unique: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price should be gretaer than 0"]
  },
  instructor: {
    type: String,
    required: true
  }
})
const Course = mongoose.model("Course", courseSchema, "Courses");

// user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minength: 8
  },
  role: {
    type: String,
    enum: ['student', 'instructor'],
    default: 'student'
  }
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
})

userSchema.methods.comparePassword = async (userPassword) => {
  return bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema, "Users");

// seed data to database
// const filepath = path.join(__dirname, "./data/data.json")
// const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
// const seedData = async()=>{
//   try{
//     await Course.create(data);
//     console.log("Data imported");
//   }catch(err){
//     console.error("Data not imported", err);
//   }
// }
// seedData();


// ------------------------- User APIs --------------------------------
// CREATE USER
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

// GET ALL USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// GET SINGLE USER 
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Course not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// DELETE USER 
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// UPDATE USER 
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// ------------------------- Courses APIs -----------------------------

// GET ALL COURSES
app.get('/api/courses', async (req, res) => {
  try {
    // const filter = req.query.instructor ? { instructor: req.query.instructor } : {};
    const courses = await Course.find();
    // const courses = await Course.find(filter);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// GET ONE COURSE
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// CREATE COURSE
app.post('/api/courses', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

// DELETE COURSE
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})
// UPDATE COURSE
app.put('/api/courses/:id', async (req, res) => {
  try {
    // findByIdAndUpdate(id, updateData, options)
    const course = await Course.findByIdAndUpdate(req.params.id, req.body,
      {
        new: true,
        runValidators: true
      });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})


// Authentication
const PasswordCompare = async () => {
  const hashedPassword = await bcrypt.hash('Pass@123', 10);

  const isMatch = await bcrypt.compare('Pass@123', hashedPassword);
  console.log('Correct Pwd', isMatch);
  const isMatch2 = await bcrypt.compare('Google@123', hashedPassword);
  console.log('Wrong Pwd', isMatch2);
}

PasswordCompare();

// jwt
// const token = jwt.sign({
//   id: user._id, 
//   role: user.role
// }, process.env.JWT_SECRET, {
//   expiresIn: '1d'
// });


// const decoded = jwt.verify(token, process.env.JWT_SECRET)


app.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({
      id: user._id,
      role: user.role
    }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.status(201).json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role}});

  } catch (err) {
    res.status(500).json(err, { error: "Someting went Wrong" })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid Credentials" });
    const token = jwt.sign({
      id: user._id,
      role: user.role
    }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.status(200).json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role}});
  } catch (err) {
      res.status(500).json({ error: "Someting went Wrong" })
  }
})



const protect = async(req, res, next)=>{
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith('bearer')){
    res.status(401).json({ error: "No bearer token passed" })
  }
  try{
    const token = authHeader.split(' ');
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded;
    next();
  }catch(err){
    res.status(500).json({ error: "Someting went Wrong" })
  }
}

const requireInstructor = async(req, res, next)=>{
  if(req.user.role !== "instructor"){
    res.status(403).json({ error: "Instructor only" })
  }
  next();
}

app.get('/', (req, res) => {
  res.send("Welcome to the study stack api");
})


// async function getUsers(){
//   const data = await axios.get("https://dummyjson.com/users");
//   // console.log(data.users);
//   data.users.forEach(user=>{
//     console.log(user.firstName)
//   })
// }

// getUsers();


// courses db
// const courses = [
//   {"id":1001, "name": "Node.js", "price": 5999},
//   {"id":1002, "name": "C++", "price": 3999},
//   {"id":1003, "name": "Java", "price": 4999},
//   {"id":1004, "name": "Python", "price": 7999},
// ]

// function validateCourse(req, res, next){
//   const {id, title, price} = req.body;
//   if(!id || !title || !price){
//     return res.json({error: "Invalid course details"});
//   }
//   if(price <= 0){
//     return res.json({error: "Invalid course details, price must be > 0"});
//   }
//   next();
// }

// app.get('/api/courses', (req, res)=>{
//   res.json(courses);
// })

// app.get('/api/courses/:id', (req, res)=>{
//   const course = courses.find(c=>c.id == req.params.id);
//   if(!course) return res.status(404).json({error: "Course not found"})
//   res.json(course);
// })

// // TASK - post method implement
// app.post('/api/courses', validateCourse, (req, res)=>{
//   const newCourse = {
//     "id": 1005,
//     "title": "DevOps",
//     "price": 8999
//   }
//   courses.push(newCourse);
//   res.status(201).json({message: "new course created"});
// })

// // Delete
// app.delete('/api/courses/:id', (req, res)=>{
//   const course = courses.find(c=>c.id == req.params.id);
//   if(!course) return res.status(404).json({error: "Course not found"})
//   courses = courses.filter(c=>c.id != req.params.id);
//   res.status(200).json({message: "course deleted"});
// })




let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`express server is live on ${PORT}`)
})