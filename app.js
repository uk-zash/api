const express = require("express")
const app = express();

require("dotenv/config")

const api = process.env.API_URL



app.get("/" , (req , res) =>{
    console.log(api)
    res.send("hellow api");
})














app.listen(3000 , ()=>{
    console.log("Server is running on http://localhost:3000")
})