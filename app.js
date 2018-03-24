require('dotenv').config;
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const port = process.env.PORT || 7550;
// const multer = require('multer');
const formidable = require('formidable');
const fs = require('fs');

mongoose.connect(config.database, {
  useMongoClient: true,
});
let db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB!');
});

// Check for DB errors
db.on('error', (err) => {
  console.log(err);
});

// Initialize app
const app = express();

// Bring in Models
let Article = require('./models/article');
let File = require('./models/file');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


// Home Route
app.get('/', function(req, res) {
  res.render('index');
});

// Upload POST Route
app.get('/upload', function(req, res){
  res.render('upload');
});

app.post('/images/upload', function(req, res){
  // Create an incoming form object
  const form = new formidable.IncomingForm();

  // Specify that we want to allow the user to upload multiple files
  form.multiples = true;

  // Store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // Every time a file has been uploaded successfully,
  // rename it to its original name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    let newFile = new File({ filename: file.name });
    newFile.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'You have successfully added your image to the database!');
        res.redirect('/');
      }
    })
  });

  // Log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // Once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // Parse the incoming request containing the form data
  form.parse(req);
});

app.get('/home', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
      res.render('home', {
        title: 'Home | Tension',
        articles:articles
      });
    }
  });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start Server
app.listen(port, function(){
  console.log('Server started at port ' + port + '.');
});