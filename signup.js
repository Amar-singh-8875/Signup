const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exp = require("constants");
const { error } = require("console");
const { type } = require("os");
const e = require("express");
const app = express();
app.use(bodyParser.json());
const mongoURI = "mongodb://localhost:27017/ApiSignupDatabase";
mongoose.connect(mongoURI).then(()=>{
    console.log("Connection Successful");
}).catch(error =>{
    console.log(error);
});

const signupSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,

    },
    hobbies:{
        type:[String],
    }


});

const Signup = mongoose.model('Signup',signupSchema)
app.post('/api/signup',async(req,res)=>{
    try{
        const {name, email, password,gender,status,hobbies} =req.body;
        if(!name || !email || !password ||!status ||!gender){
            return res.status(400).json({message:"Fill correct details"});
        }

        const newSignup = new Signup({
            name,
            email,
            password,
            status,
            gender,
            hobbies:hobbies || []
        });
        await newSignup.save();
        res.status(201).json({message:"User created Successfully",Signup:newSignup})
    }catch(error){
        console.error(error)
        res.status(500).json({message:'Error creating user'});
    }
});
// Login Api
app.post('/api/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'Email and password require'});
        }
        // Find the signup email
        const exitinguser=await Signup.findOne({email});
        if(!exitinguser){
            return res.status(400).json({message:"Invalid email"});
        }
        // data match check
        if(exitinguser.password!=password){
            return res.status(400).json({message:"Invalid Password"});
        }
        res.status(200).json({message:'Login Successfull',user:exitinguser});
    }
    catch(error){
        console.error('Error during Login',error);
        res.status(500).json({message:'Error during login'});

    } 
});
// delete api
app.delete('/api/delete/:id',async(req,res)=>{
    try{
    const {id}=req.params;
    // find user by id 
    const deleteduser=await Signup.findByIdAndDelete(id);
    if(!deleteduser){
        return res.status(400).json({message:'User Not Found'});
    }
    res.status(200).json({message:'User deleted successfully',user:deleteduser});
    }
    catch(error){
        console.error('error deleting user',error);
        res.status(500).json({message:'Ereor deleting user'});
    }
});

// get api
app.get('/api/users/active',async(req,res)=>{
    try{
        const activeusers=await Signup.find({status:'Active'});
        if(activeusers.length===0){
            return res.status(404).json({message:"No active Users"});
        }
        res.status(200).json({users:activeusers});
    }
    catch(error){
        console.error("getting error");
        res.status(500).json({message:"error"});
    }
});

// edit api 
app.put('/api/edit/:id',async(req,res)=>{
    try{
        const {id}=req.params;
        const updatedata=req.body;
 // find id and update 
 const updateUser=await Signup.findByIdAndUpdate(id,updatedata,{new: true,runValidators:true});
 if(!updateUser){
    return res.status(404).json({message:'User not found'});
 }
 res.status(200).json({message:"user Update Successfully",user:updateUser});       
    }
    catch(error){
        console.log("error");
        res.status(500).json({message:'Error during updata'});
    }
});

const PORT = 3001;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});