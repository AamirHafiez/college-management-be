const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport-jwt-strategy');

const app = express();
const db = require('./config/mongoose');
app.use(cors());

const port = 8000;

app.use(express.urlencoded());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));

app.listen(port, (error) => {
    if(error){
        console.log(`Error in starting the server at port: ${port}`);
        return;
    }
    console.log(`Server is up and running on port: ${port}`);
});
