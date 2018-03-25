const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Bring in User Model
let User = require('../models/user');

let Token = require('../models/token');

// Registration Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Process
router.post('/register', function(req, res){
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const fullname = req.body.firstname + ' ' + req.body.lastname;
  const email = req.body.email;
  const username = req.body.username;
  const usertype = req.body.usertype;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;

  req.checkBody('firstname', 'Your first name is required').notEmpty();
  req.checkBody('lastname', 'Your last name is required').notEmpty();
  req.checkBody('email', 'Your e-mail address is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Please create a username').notEmpty();
  req.checkBody('usertype', 'Please select a user type.').notEmpty();
  req.checkBody('password', 'Please create a password').notEmpty();
  req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      firstname:firstname,
      lastname:lastname,
      fullname:fullname,
      email:email,
      username:username,
      usertype:usertype,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function (err) {
          if(err) {
            return res.status(500).send({ msg: err.message });
          }

          // Create verification token for this user
          const token = new Token({ userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });

          // Save the verification token
          token.save(function (err) {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }

            // Send the mail
            const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_PASSWORD } });
            const mailOptions = { from: 'noreply.kidzgaming@gmail.com', to: newUser.email, subject: 'Verify your Tension Account', text: 'Hello, ' + newUser.firstname + ' ' + newUser.lastname + '\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation?email=' + newUser.email + '?token=' + token.token + '.\n'};
            transporter.sendMail(mailOptions, function (err) {
              if (err) {
                return res.status(500).send({ msg: err.message });
              }
              res.status(200).send('A verification mail has been sent to ' + newUser.email + '.');
            });
          });

          // Redirect the user to the email confirmation link page
          res.redirect('/email-verify');
        });
      });
    });
  }
});

router.post('/confirmation', function(req, res, next){
  req.checkBody('email', 'Email is not valid.').isEmail();
  req.checkBody('email', 'Email cannot be blank.').notEmpty();
  req.checkBody('token', 'Token cannot be blank.').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

  // Find a matching token
  Token.findOne({ token: req.body.token }, function(err, token){
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token may have expired.' });

    // If a token is found, find amatching user
    User.findOne({ _id: token.userId }, function(err, user){
      if(!user) {
        return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
      }
      if(user.isVerified){
        return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
      }

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        res.status(200).send('The account has been verified. Please log in.');
      });
    });
  });
});

// Resend token (if expired)
router.post('/resend', function (req, res, next) {
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check for validation errors    
  let errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
    if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

    // Create a verification token, save it, and send email
    const token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });

    // Save the token
    token.save(function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }

      // Send the email
      const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'games360blog@gmail.com', pass: 'Korede12' } });
      const mailOptions = { from: 'games360blog@gmail.com', to: user.email, subject: 'Verify your Tension account', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation?email=' + user.email + '?token=' + token.token + '.\n' };
      transporter.sendMail(mailOptions, function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }
          res.status(200).send('A verification email has been sent to ' + user.email + '.');
      });
    });
  });
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
