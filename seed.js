import * as usersData from './data/users.js';
let user1 = 0
try{

    user1 = await usersData.createUser("Krishna","Vamsi", "krishna@stevens.edu", "password@123","user");
    console.log(user1);
}catch(e){
    console.log(e);
}

try{
    console.log(await usersData.createUser("Sanjana","Kantiredi", "sanjanak@stevens.edu", "password@12345","admin"));
}catch(e){
    console.log(e);
}

try{
    console.log(await usersData.checkUser("krishna@stevens.edu","password@123"));
}catch(e){
    console.log(e);
}
try{
    console.log(await usersData.getallusers());
}catch(e){
    console.log(e);
}
try{
    console.log(await usersData.getUserById(user1._id));
}catch(e){
    console.log(e);
}

try{
    console.log(await usersData.updateUser("Sanjana","Kantiredi","sanjanak@stevens.edu","Password@123","admin"));
}catch(e){
    console.log(e);
}

