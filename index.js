//import express
const express = require('express');
const app = express();
const authRoutes = require('./Routes/Auth');
const userRoutes = require('./Routes/User');



//import body parser
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// //authRoutes 
// app.use('/api/auth', authRoutes);
// //user router
// app.use('/api/user', userRoutes);





//listen on port 5000 for requests
app.listen(6000, () => {
    console.log('listening on port 6000');
});