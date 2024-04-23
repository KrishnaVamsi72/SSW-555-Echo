//import mongo collections, bcrypt and implement the following data functions } from "bcryptjs";
import bcrypt, { hash } from 'bcrypt';
import { users } from '../config/mongoCollections.js';
export const registerUser = async (
  firstName,
  lastName,
  username,
  password,
  favoriteQuote,
  themePreference,
  role
) => {
  if(!firstName || !lastName || !username || !password || !favoriteQuote || !themePreference || !role){
    throw 'Data Error : All fields should exist'
  }
  firstName = firstName.trim();
  lastName = lastName.trim();
  username =  username.trim();
  function namecheck(name){
    if(typeof name !== 'string'|| /\d/.test(name)){
      throw 'Data Error : Name should be of type string with no numbers'
    }
    if(name.length < 2 || name.length > 25){
      throw 'Data Error : Name  should be at least 2 characters long with a max of 25 characters'
    }
    return name
    
  }
  firstName = namecheck(firstName)
  lastName = namecheck(lastName)
  if(typeof username !== 'string' || /\d/.test(username)){
    throw 'Error : username should be of type string'
  }
  if(username.length < 5 || username.length > 10){
    throw 'Error : username should be at least 5 characters long with a max of 10 characters'
  }
  username = username.toLowerCase();
  const usercoll = await users();
  const checker = await usercoll.findOne({username : username});
  if(checker){
    throw 'Error : username already exists'
  }
  password = password.trim()
  if(typeof password !== 'string' || password.length === 0 || password.length < 8){
    throw 'Error : password must be a valid string and 8 characters long '
  }
  var spec_char = '!@#$%^&*,:;_"-.?!`\''
  var count_upper = 0
  var count_digit = 0
  var count_specialchar = 0
  for (let i of password){
    if(i >= 'A' && i <= 'Z'){
      count_upper += 1   
    }
    else if(i >= '0' && i <= '9'){
      count_digit += 1
    }
    else if(spec_char.includes(i)){
      count_specialchar += 1
    }

  }
  if(count_digit < 1 || count_specialchar < 1 || count_upper < 1){
    throw 'Error : password should contain at least one uppercase character, there has to be at least one number and there has to be at least one special character'
  }
  favoriteQuote = favoriteQuote.trim()
  if(typeof favoriteQuote !== 'string' || favoriteQuote.length === 0 || favoriteQuote.length < 20 || favoriteQuote.length > 255){
    throw 'Error : quote should be a valid string (no strings with just spaces) and should be at least 20 characters long with a max of 255 characters'
  }
  var validthemedPrefences = ["light", "dark"]
  themePreference = themePreference.trim().toLowerCase();
  if(themePreference !== validthemedPrefences[0] && themePreference !== validthemedPrefences[1]){
    throw "Error : themePreference valid values are light or dark only"
  }
  
  var roles = ["user","admin"]
  role = role.trim().toLowerCase();
  if(role !== roles[0] && role !== roles[1]){
    throw "Error : role valid values are admin or user only"
  }
  const saltRounds = 16;
  const hashpassword = await bcrypt.hash(password ,saltRounds);
  const newuser = {
    firstName : firstName,
    lastName : lastName,
    username : username,
    password : hashpassword,
    favoriteQuote : favoriteQuote,
    themePreference : themePreference,
    role : role
  }
  const insertInfo = await usercoll.insertOne(newuser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw 'Error : could not add user';
  
  
  return {signupCompleted: true};

};

export const loginUser = async (username, password) => {
  if(!username || !password){
    throw "Error : username and password must be supplied"
  }
  username = username.trim();
  password = password.trim();
  if(typeof username !== 'string' || username.length === 0 || username.length < 5 || username.length > 10 || /\d/.test(username)){
    throw "Error : should be a valid string (no strings with just spaces, should not contain numbers) and should be at least 5 characters long with a max of 10 character"
  }
  username = username.toLowerCase();
   password = password.trim()
  if(typeof password !== 'string' || password.length === 0 || password.length < 8){
    throw 'Error : password must be a valid string and 8 characters long '
  }
  var spec_char = '!@#$%^&*,:;_"-.?!`\''
  var count_upper = 0
  var count_digit = 0
  var count_specialchar = 0
  for (let i of password){
    if(i >= 'A' && i <= 'Z'){
      count_upper += 1   
    }
    else if(i >= '0' && i <= '9'){
      count_digit += 1
    }
    else if(spec_char.includes(i)){
      count_specialchar += 1
    }

  }
  if(count_digit < 1 || count_specialchar < 1 || count_upper < 1){
    throw 'Error : password should contain at least one uppercase character, there has to be at least one number and there has to be at least one special character'
  }
  username = username.toLowerCase();
  const usercoll = await users();
  const checker = await usercoll.findOne({username : username});
  if(!checker){
    throw 'Either the username or password is invalid'
  }
  let comparepassword = false;
  comparepassword = await bcrypt.compare(password,checker.password)
  if(comparepassword){
    const {firstName , lastName , username , favoriteQuote , themePreference ,role} = checker;
    return {firstName , lastName , username , favoriteQuote , themePreference , role}
  }
  if(!comparepassword){
    throw 'Either the username or password is invalid'
  }

};
