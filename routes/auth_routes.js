import { Router } from 'express';
import { users } from '../config/mongoCollections.js';
import { registerUser, loginUser } from '../data/users.js';
import bcrypt from 'bcrypt';
const router = Router();

router.route('/').get(async (req, res) => {
  return res.json({ error: 'YOU SHOULD NOT BE HERE!' });
});

router.route('/register').get(async (req, res) => {
  try {
    res.status(200).render('register', { title: 'Register' });
  } catch (e) {
    res.status(500).json({ e : 'Internal Server Error' });
  }
}).post(async (req, res) => {
  let { firstName, lastName, username, password, confirmPassword, favoriteQuote, themePreference, role } = req.body;

  try {
    if (!firstName || !lastName || !username || !password || !favoriteQuote || !themePreference || !role || !confirmPassword) {
      throw 'Error: All fields should exist';
    }

    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim();

    function namecheck(name) {
      if (typeof name !== 'string' || /\d/.test(name) || name.length < 2 || name.length > 25) {
        throw 'Error: Name should be a string of 2 to 25 characters (letters only)';
      }
      return name;
    }

    firstName = namecheck(firstName);
    lastName = namecheck(lastName);

    if (typeof username !== 'string' || /\d/.test(username) || username.length < 5 || username.length > 10) {
      throw 'Error: Username should be a string of 5 to 10 characters (letters only)';
    }

    username = username.toLowerCase();
    const userCollection = await users();
    const usernameExists = await userCollection.findOne({ username: username });
    if (usernameExists) {
      throw 'Error: Username already exists';
    }

    password = password.trim();
    if (typeof password !== 'string' || password.length < 8 || password.length === 0) {
      throw 'Error: Password must be a valid string of at least 8 characters';
    }

    const specChar = '!@#$%^&*,:;_"-.?!`\'';
    let countUpper = 0;
    let countDigit = 0;
    let countSpecialChar = 0;

    for (let i of password) {
      if (i >= 'A' && i <= 'Z') {
        countUpper++;
      } else if (i >= '0' && i <= '9') {
        countDigit++;
      } else if (specChar.includes(i)) {
        countSpecialChar++;
      }
    }

    if (countUpper < 1 || countDigit < 1 || countSpecialChar < 1) {
      throw 'Error: Password must contain at least one uppercase letter, one digit, and one special character';
    }

    if (confirmPassword !== password) {
      throw 'Error: Passwords do not match';
    }

    favoriteQuote = favoriteQuote.trim();
    if (typeof favoriteQuote !== 'string' || favoriteQuote.length < 20 || favoriteQuote.length > 255 || favoriteQuote.length === 0) {
      throw 'Error: Quote must be a string of 20 to 255 characters';
    }

    const validThemePreferences = ['light', 'dark'];
    themePreference = themePreference.trim().toLowerCase();
    if (!validThemePreferences.includes(themePreference)) {
      throw 'Error: Invalid theme preference. Choose either "light" or "dark"';
    }

    const validRoles = ['user', 'admin'];
    role = role.trim().toLowerCase();
    if (!validRoles.includes(role)) {
      throw 'Error: Invalid role. Choose either "user" or "admin"';
    }
  }catch(e){
    res.status(400).render('register',{message : e , title : 'Register'})
  }
try{
    const insertUser = await registerUser(firstName, lastName, username, password, favoriteQuote, themePreference, role);

    if (insertUser.signupCompleted) {
      res.status(200).render('login', { message: 'Successfully Registered. You can login now.', title: 'Login' });
    } else {
      res.status(500).json('Internal Server Error');
    }
  } catch (e) {
    res.status(400).render('register', { message: e, title: 'Register' });
  }
});

router.route('/login').get(async (req, res) => {
  try {
    res.status(200).render('login', { title: 'Login' });
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}).post(async (req, res) => {
  let { username, password } = req.body;

  try {
    if (!username || !password) {
      throw 'Error: Username and password are required';
    }
    username = username.trim().toLowerCase();
    if (typeof username !== 'string' || username.length < 5 || username.length > 10 || /\d/.test(username)) {
      throw 'Error: Invalid username format';
    }

    password = password.trim();
    if (typeof password !== 'string' || password.length < 8 || password.length === 0) {
      throw 'Error: Password must be a valid string of at least 8 characters';
    }

    const specChar = '!@#$%^&*,:;_"-.?!`\'';
    let countUpper = 0;
    let countDigit = 0;
    let countSpecialChar = 0;

    for (let char of password) {
      if (char >= 'A' && char <= 'Z') {
        countUpper++;
      } else if (char >= '0' && char <= '9') {
        countDigit++;
      } else if (specChar.includes(char)) {
        countSpecialChar++;
      }
    }

    if (countUpper < 1 || countDigit < 1 || countSpecialChar < 1) {
      throw 'Error: Password must contain at least one uppercase letter, one digit, and one special character';
    }

    const user = await loginUser(username,password);
    if(user){
    req.session.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      favoriteQuote: user.favoriteQuote,
      themePreference: user.themePreference,
      role: user.role
    };}
    else{
      throw 'Either username or password'

    }
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/user');
    }
  } catch (e) {
    res.status(400).render('login', { message: e, title: 'Login' });
  }
  try{

  }catch(e){

  }
});

router.route('/user').get(async (req, res) => {
  try {
    const { firstName, lastName, username, favoriteQuote, role ,themePreference} = req.session.user;
    const now = new Date(); 
    const hours = now.getHours();
    const minutes = now.getMinutes();

    var ampm = ''
    if(hours >= 12){
      ampm ='PM'
    }
    else{
      ampm = 'AM'
    }
    res.status(200).render('user', {
      firstName,
      lastName,
      username,
      favoriteQuote,
      role,
      currentTime : `${hours}:${minutes}:${ampm}`,
      title: 'User',
      admin : req.session.user.role === 'admin',
      themePreference
    });
    
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.route('/admin').get(async (req, res) => {
  try {
    const { firstName, lastName, username, favoriteQuote, role ,themePreference} = req.session.user;

    const now = new Date(); 
    const hours = now.getHours();
    const minutes = now.getMinutes();
    var ampm = ''
    if(hours >= 12){
      ampm ='PM'
    }
    else{
      ampm = 'AM'
    }
    res.status(200).render('admin', {
      firstName,
      lastName,
      username,
      favoriteQuote,
      role,
      themePreference,
      currentTime : `${hours}:${minutes}:${ampm}`,
      title: 'Admin'
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.route('/logout').get(async (req, res) => {
  req.session.destroy();
  res.status(200).render('logout');
});

export default router;
