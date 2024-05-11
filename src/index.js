require('dotenv').config();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const connectDB = require('./config/dbConnection');
const app = require('./app')


connectDB();

// check for database connection
mongoose.connection.once('open', ()=>{
    console.log('Connected to Database');
    app.listen(port, ()=>{
        console.log(`Server running at ${port}`);
    });
})


