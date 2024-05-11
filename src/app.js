const express = require('express');
const app = express();
const {logger} = require("./middleware/logEvents.middleware");
const path = require('path');
const errorHandler = require('./middleware/errorHandler.middleware');
const cookieParser = require('cookie-parser');


// middlewares
app.use(logger);

app.use(express.static("public"))

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());


app.use('/api/v1/user',require('./routes/user.router'));



app.all('*', (req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'..','views','404.html'));
    }
    else if(res.accepts("json")){
        res.json({message:'404, Not Found'})
    }
    else{
        res.type('txt').send('404, Not Found');
    }
});

app.use(errorHandler);

module.exports = app
