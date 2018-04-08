# Tension
Tension is a production-ready publication app; which makes making articles easier and faster. It is also very easy on the eyes, with its great UI.

## Introduction
### Who this app is for
If you own a blog, a press or media outfit or a publication-based project, Tension makes your web app lightweight, fast and user-firendly; while keeping the clutter away.
### Getting Started
To get started simply run: ```git clone https://github.com/KidzGaming/Tension.git```
Then, you need to set up a MongoDB database (I recommend mlab.com)
To complete the config, you will need to create a .env file in the root of the project, and populate it with the following data:
```
PORT=7550
DB_URI='mongodb://your_db_url'
SECRET='yourappsecret'
GMAIL_ADDRESS='my_gmail_address@gmail.com'
GMAIL_PASSWORD='my_secure_gmail_password'
```
Please note that all data supplied in the example above are all placeholders, and should be replaced with the actual values.
### Starting the app
To start the app, simply run:
```sh
npm start
```
## Useful information
### Technologies
This app is a simple MongoDB, Node and Express example; using PUG (Jade) as a templating engine. All CSS in this project are custom and animations are handled using jQuery.
### Development disclaimer
It is noteworthy that as of today, 25th March, 2018; this app is still in development; and as such, you may encounter bugs from time to time. Stick around for v1!
## Features
### User signup, login & email verification
This app makes use of the Passport.js module to enable user signup and login. Email verification is done using Nodemailer and Crypto.
### ensureAuthenticated Function
Auth-protected pages will not open if user is not authenticated. This protects non-authenticated users from viewing certain pages.
## License
MIT Lisence
## Author
Oluwakorede Fashokun, the talkative owner of JoyStick Gaming.
