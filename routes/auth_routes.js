//import express, express router as shown in lecture code


import { checkUser, createUser, updateUser , getallusers , getUserById} from "../data/users.js";
import validation from '../helpers.js';
import Handlebars from 'handlebars';
import xss from 'xss';
import { addFeedback } from "../data/feedback.js";
import { sendRegistrationEmail} from './emailNotifications.js';
import { Router } from "express";
const router = Router();
Handlebars.registerHelper('sanitize', function (content) {
  const safeContent = xss(content);
  return new Handlebars.SafeString(safeContent);
});

router.route("/").get(
  (req, res, next) => {
    if (req.session.user) {
      if (req.session.user.role == "user") {
        return res.redirect("/protected");
      }
      if (req.session.user.role == "admin") {
        return res.redirect("/admin");
      }
    } else {
      return res.redirect("/login");
    }
    next();
  },
  async (req, res) => {
    //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
    return res.json({ error: "YOU SHOULD NOT BE HERE!" });
  }
);

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register");
  })
  .post(async (req, res) => {
    //code here for POST
    try {
      let firstNameInput;
      let lastNameInput;
      let emailAddressInput;
      let passwordInput;
      let confirmPasswordInput;
      let roleInput;
      
      if(req.body){
      firstNameInput= req.body.firstNameInput;
      lastNameInput= req.body.lastNameInput;
      emailAddressInput= req.body.emailAddressInput;
      passwordInput= req.body.passwordInput;
      confirmPasswordInput= req.body.confirmPasswordInput;
      roleInput= req.body.roleInput;
      }

      if (
        !firstNameInput ||
        !lastNameInput ||
        !emailAddressInput ||
        !passwordInput ||
        !roleInput ||
        !confirmPasswordInput
      ) {
        throw "Error: Must provide all fields";
      }
      firstNameInput = validation.checkString(
        firstNameInput,
        "First name"
      );
      if (firstNameInput.length < 2 || firstNameInput.length > 25) {
        throw "Error: Invalid first name length";
      }
      lastNameInput = validation.checkString(
        lastNameInput,
        "Last name"
      );
      if (lastNameInput.length < 2 || lastNameInput.length > 25) {
        throw "Error: Invalid last name length";
      }
      emailAddressInput = emailAddressInput.toLowerCase();
      if (
        !/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@stevens\.edu$/.test(
          emailAddressInput
        )
      ) {
        throw "Error: Email address must end with stevens.edu";
      }

      passwordInput = validation.checkString(
        passwordInput,
        "Password"
      );
      if (/^(.{0,7}|[^0-9]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(passwordInput)) {
        throw "Your password must at least have one uppercase character, at least one number and at least one special character";
      }
      if (passwordInput.match(/\s/g)) {
        throw "Invalid Passwords";
      }
      if (confirmPasswordInput !== passwordInput) {
        throw "Passwords do not match";
      }
      roleInput = validation.checkString(roleInput, "Role");
      if (!/^(admin|user)$/.test(roleInput)) {
        throw "Error: Invalid role";
      }
    } catch (e) {
      return res.status(400).render("register", { error: `${e}`});
    }
    try {

      const newuser = await createUser(
        req.body.firstNameInput,
        req.body.lastNameInput,
        req.body.emailAddressInput,
        req.body.passwordInput,
        req.body.roleInput
      );

      let out = { insertedUser: true };
      if (
        Object.entries(newuser).toString() == Object.entries(out).toString()
      ) {
        const registrationEmailText = 'You have successfully registered into meetSmart!';
        await sendRegistrationEmail(
        req.body.emailAddressInput,
        'Welcome to meetSmart!', // Email subject
        registrationEmailText     // Email body/content
      ); 
        return res.redirect("/login");
      } else {
        throw "Internal Server Error";
      }
    } catch (e) {
      return res.status(500).render("register", { error: `${e}` });
    }
  });

router.route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login");
  })
  .post(async (req, res) => {
    //code here for POST
    try {
      let {emailAddressInput, passwordInput} = req.body;
      if (!emailAddressInput || !passwordInput) {
        throw "Error: Must provide both email address and password";
      }
      emailAddressInput = emailAddressInput.toLowerCase();
      if (
        !/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          emailAddressInput
        )
      ) {
        throw "Error: Invalid email address";
      }

      passwordInput = validation.checkString(
        passwordInput,
        "Password"
      );
      if (
        /^(.{0,7}|[^0-9]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(passwordInput)
      ) {
        throw "Error: Invalid Password";
      }
      if (passwordInput.match(/\s/g)) {
        throw "Error: Invalid Password";
      }
    } catch (e) {
      return res.status(400).render("login", { error: `${e}`});
    }
    try {
      let auth_user = await checkUser(
        req.body.emailAddressInput,
        req.body.passwordInput
      );
      if (auth_user) {
        req.session.user = auth_user;
      }
      if(req.session.user){
        if (req.session.user.role == "admin") {
        return res.redirect("/admin");
      }
        if (req.session.user.role == "user") {
        return res.redirect("/protected");
      }
    }
    } catch (e) {
      return res.status(400).render("login", { error:`${e}`});
    }
  });

router.route("/protected").get(async (req, res) => {
  //code here for GET
  let admin = false;
  
  if(req.session.user){
  try{
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    if (req.session.user.role === "admin") {
      admin = true;
      res.render("protected", {
        firstName: req.session.user.firstName,
        currentTime: time,
        role: req.session.user.role,
        admin: admin,
    });
  }
  }catch(e){
    return res.status(500).render('error', {error:`${e}`});
  }
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  res.render("protected", {
    firstName: req.session.user.firstName,
    currentTime: time,
    role: req.session.user.role
  });
  }
});


router.route("/admin").get(async (req, res) => {
  try {
    if (req.session.user && req.session.user.role === "admin") {
      let today = new Date();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

      const organizerId = req.session.user._id;

      if (!organizerId) {
        console.error("OrganizerId is missing in the user session:", req.session.user);
        throw "OrganizerId must be provided!!!";
      }

      
      

      res.render("admin", {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        emailAddress: req.session.user.emailAddress,
        role: req.session.user.role,
        currentTime: time,
        admin: true,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in /admin route:", error);
    res.status(500).render('error', { error: `${error}` });
  }
});






router.route("/error").get(async (req, res) => {
  //code here for GET
  res.status(403).render("error");
});

router.route("/logout").get(async (req, res) => {
  //code here for GET
  req.session.destroy();
  res.render("logout");
});

router
  .route("/edituser")
  .get(async (req, res) => {
    // Code here for GET
    res.render("edituser");
  })
  .post(async (req, res) => {
    try {
      let newfirstNameInput;
      let newlastNameInput;
      let newemailAddressInput;
      let newpasswordInput;
      let newconfirmPasswordInput;
      let newroleInput;

      if (req.body) {
        newfirstNameInput = req.body.newfirstNameInput;
        newlastNameInput = req.body.newlastNameInput;
        newemailAddressInput = req.body.newemailAddressInput;
        newpasswordInput = req.body.newpasswordInput;
        newconfirmPasswordInput = req.body.newconfirmPasswordInput;
        newroleInput = req.body.newroleInput;
      }

      if (
        !newfirstNameInput ||
        !newlastNameInput ||
        !newemailAddressInput ||
        !newpasswordInput ||
        !newroleInput ||
        !newconfirmPasswordInput
      ) {
        throw "Error: Must provide all fields";
      }

      newfirstNameInput = validation.checkString(newfirstNameInput, "First name");
      if (newfirstNameInput.length < 2 || newfirstNameInput.length > 25) {
        throw "Error: Invalid first name length";
      }

      newlastNameInput = validation.checkString(newlastNameInput, "Last name");
      if (newlastNameInput.length < 2 || newlastNameInput.length > 25) {
        throw "Error: Invalid last name length";
      }

      newemailAddressInput = newemailAddressInput.toLowerCase();
      if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@stevens\.edu$/.test(newemailAddressInput)) {
        throw "Error: Email address must end with stevens.edu";
      }

      newpasswordInput = validation.checkString(newpasswordInput, "Password");
      if (/^(.{0,7}|[^0-9]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(newpasswordInput)) {
        throw "Error: Invalid Password";
      }
      if (newpasswordInput.match(/\s/g)) {
        throw "Error: Password cannot contain spaces";
      }
      if (newconfirmPasswordInput !== newpasswordInput) {
        throw "Error: Passwords do not match";
      }

      newroleInput = validation.checkString(newroleInput, "Role");
      if (!/^(admin|user)$/.test(newroleInput)) {
        throw "Error: Invalid role";
      }

      // Update user details
      await updateUser(
        newfirstNameInput,
        newlastNameInput,
        newemailAddressInput,
        newpasswordInput,
        newroleInput
      );

      // Update session variables
      req.session.user.firstName = newfirstNameInput;
      req.session.user.lastName = newlastNameInput;
      req.session.user.emailAddress = newemailAddressInput;
      req.session.user.password = newpasswordInput;
      req.session.user.role = newroleInput;

      // Redirect to login page after successful update
      res.redirect("/login");
    } catch (error) {
      res.status(400).render("edituser", { error: `${error}` });
    }
  });

  

  import { getUserFeedback } from '../data/feedback.js'; // Import the function

  router.get("/myfeedback", async (req, res) => {
    if (!req.session.user) return res.redirect("/login"); // Ensure user is logged in
  
    try {
      const userId = req.session.user._id;
      const feedback = await getUserFeedback(userId); // Fetch user-specific feedback
      res.render("viewMyFeedback", { feedback }); // Use a template for displaying feedback
    } catch (e) {
      res.status(500).render("error", { error: `Error retrieving feedback: ${e}` });
    }
  });



  router.post("/feedback", async (req, res) => {
    if (!req.session.user) return res.redirect("/login"); // Ensure user is logged in
  
    try {
      const { content } = req.body;
      if (!content) throw "Please provide feedback content.";
  
      const userId = req.session.user._id; // Use the user ID from session
      await addFeedback(userId, content); // Add feedback to database
      res.render('addedfeedback', { success: `Feedback successfully added!` }); // Show success message
    } catch (e) {
      res.status(500).render("viewMyFeedback", { error: `Error submitting feedback: ${e}` }); // Render an error message on the feedback form
    }
  });
  




router.route("/viewuser").get(async (req, res) => {
    try {
      let admin = false;
      // let userReview;
  
      // Check if the user is logged in
      if (req.session.user && req.session.user.emailAddress) {
        // Fetch user's review if user is logged in
  
  
        try {
          if (req.session.user.role === "admin") {
            admin = true;
            res.render("viewuser", {
              firstName: req.session.user.firstName,
              lastName: req.session.user.lastName,
              emailAddress: req.session.user.emailAddress,
              role: req.session.user.role,
    
        
            });
          }
        } catch (e) {
          return res.status(500).render('error', { error: `${e}` });
        }
  
        // Render viewuser page for non-admin users
        res.render("viewuser", {
          firstName: req.session.user.firstName,
          lastName: req.session.user.lastName,
          emailAddress: req.session.user.emailAddress,
          role: req.session.user.role,
     
        });
      } else {
        // Handle case where user is not logged in
        res.redirect("/login");
      }
    } catch (error) {
      // Handle the error thrown by getReviewByUser
      res.status(500).render('error', { error: `${error}` });
    }
  });
  

import { getAllFeedback } from "../data/feedback.js";
router.get("/admin/feedback", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    // Redirect non-admins to login page
    return res.redirect("/login");
  }

  try {
    const allFeedback = await getAllFeedback(); // Fetch all feedback
    res.render("adminFeedback", { feedback: allFeedback }); // Render a page to display all feedback
  } catch (e) {
    res.status(500).render("admin", { error: `Error retrieving feedback: ${e}` });
  }
});

export default router;
