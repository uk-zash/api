const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv/config")
const cors = require("cors")
const authJwt = require("./helper/jwt")
const errorHandler = require("./helper/errorHandler")



app.use(cors())
app.options("*" , cors())

//Middleware
app.use(bodyParser.json())
app.use(morgan("tiny"))
app.use(authJwt())
app.use(errorHandler)





const api = process.env.API_URL
const db = process.env.MONGO_URI

const categoriesRoutes = require("./routes/categories");
const productRouter = require("./routes/products");
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');





app.use(`${api}/products` , productRouter)
app.use(`${api}/categories` ,categoriesRoutes)
app.use(`${api}/users` , usersRoutes)
app.use(`${api}/orders` , ordersRoutes)





mongoose.connect(db,{
    dbName:"ecommerceAPI"
})
.then(()=>{
    console.log("Connected to MongoDB")

})
.catch((error) =>{
    console.error("Error connecting to MongoDB" , error)
})



app.listen(3000 , ()=>{
    console.log("Server is running on http://localhost:3000")
})