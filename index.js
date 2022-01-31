//import express
const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./Routes/Auth');
const userRoutes = require('./Routes/User');
const postRoutes = require('./Routes/Posts');
const commentRoutes = require('./Routes/Comments');
const adminRoutes = require('./Routes/Admin');
const AuthMidleware = require('./Middlewares/middleware');
const bodyParser = require('body-parser');
var log = require('./libs/log')(module);

//import oprations
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env['JWT_SECRET'],
    resave: false,
    saveUninitialized: true
})); // session secret


require('./Utils/passport')(passport);
app.use(passport.session());


//authRoutes 
app.use('/api/auth', authRoutes);
//user router
app.use('/api/user', userRoutes);
//post router
app.use('/api/post', postRoutes);
//comment router
app.use('/api/comment', commentRoutes);
//admin router
app.use('/api/admin', passport.authenticate('bearer', { session: false }), AuthMidleware.isAdmin, adminRoutes);







//listen on port 5000 for requests
app.listen(process.env.PORT, () => {
    console.log('listening on port' + process.env.PORT);
});