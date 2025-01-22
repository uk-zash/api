const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path")
require("dotenv/config");
const cors = require("cors");
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/errorHandler");

// Middleware Setup
app.use(cors());  
// app.options("*", cors());  
app.use(morgan("tiny"));  
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))


// Static file serving for images or other public resources
app.set("view engine" , "ejs")
app.set("views" , path.join(__dirname , "views"))
app.use("/public", express.static(__dirname + "/public"));

// Auth middleware for protected routes
app.use(authJwt());

// Custom error handler
app.use(errorHandler);


// API Routes
const api = process.env.API_URL;
const categoriesRoutes = require("./routes/categories");
const productRouter = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
// Database connection
const db = process.env.MONGO_URI;
mongoose.connect(db, { dbName: "ecommerceAPI" })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
