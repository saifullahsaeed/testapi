//import express
const express = require('express');
const app = express();
const authRoutes = require('./Routes/Auth');

//user authRoutes 
app.use('/api/auth', authRoutes);


//listen on port 5000 for requests
app.listen(5000, () => {
    console.log('listening on port 5000');
});