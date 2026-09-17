import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT=process.env.PORT;

//one test route
app.get("/",(req,res)=>{
    res.send("HomelyHub srever is running")
})

app.listen(PORT,()=>{
    console.log(`App is running on port no1 ${PORT}`);
})