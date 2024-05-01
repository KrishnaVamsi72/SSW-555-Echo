import { Router } from 'express';
import bcrypt from 'bcrypt';
import { users, messages } from '../config/mongoCollections.js';
import { registerUser, loginUser, updateUser } from '../data/users.js';
import { addFeedback, getUserFeedback } from '../data/feedback.js'; // Assuming sendMessage and getMessagesForUser are in feedback.js or another suitable file.
import { getMessagesForUser } from '../data/messages.js';
const router = Router();

router.route('/')
  .get(async (req, res) => {
    res.json({ error: 'YOU SHOULD NOT BE HERE!' });
  });

router.route('/register')
  .get(async (req, res) => {
    res.render('register', { title: 'Register' });
  })
  .post(async (req, res) => {
    const { firstName, lastName, username, password, confirmPassword, AboutMe, themePreference, role } = req.body;
    try {
      if (!firstName || !lastName || !username || !password || !AboutMe || !themePreference || !role || !confirmPassword) {
        throw 'All fields must be filled.';
      }
      const userRegistered = await registerUser(firstName, lastName, username, password, AboutMe, themePreference, role);
      if (userRegistered.signupCompleted) {
        res.render('login', { message: 'Successfully Registered. You can now login.', title: 'Login' });
      } else {
        throw 'Registration failed.';
      }
    } catch (e) {
      res.status(400).render('register', { message: e, title: 'Register' });
    }
  });

router.route('/login')
  .get(async (req, res) => {
    res.render('login', { title: 'Login' });
  })
  .post(async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await loginUser(username, password);
      req.session.user = { ...user };
      if (user.role === 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/user');
      }
    } catch (e) {
      res.status(400).render('login', { message: e, title: 'Login' });
    }
  });

router.route('/user')
  .get(async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render('user', { ...req.session.user, title: 'User Profile' });
  });

router.route('/admin')
  .get(async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect("/login");
    res.render('admin', { ...req.session.user, title: 'Admin Dashboard' });
  });

router.route('/logout')
  .get(async (req, res) => {
    req.session.destroy();
    res.render('logout', { title: 'Logged Out' });
  });

router.get("/viewfeedback", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const feedback = await getUserFeedback(req.session.user._id);
    res.render("viewMyFeedback", { feedback, title: 'Your Feedback' });
  });
  router.get("/edituser", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("edituser", {firstName : req.session.user.firstName});
  });
  router.post("/edituser", async (req, res) => {
    if (!req.session.user) return res.redirect("/login"); // Ensure the user is logged in

    const { newfirstNameInput, newlastNameInput, newpasswordInput, newconfirmPasswordInput, AboutMe } = req.body;

    try {
        // Input validation
        if (!newfirstNameInput || !newlastNameInput || !newpasswordInput || newpasswordInput !== newconfirmPasswordInput) {
            throw 'Validation failed: Please ensure all fields are filled correctly and passwords match.';
        }

        // Update user information, consider hashing the password if it's a new one
        const updatedUser = await updateUser(req.session.user._id, {
            firstName: newfirstNameInput,
            lastName: newlastNameInput,
            password: newpasswordInput, // Make sure to hash the password if it's changed
            AboutMe: AboutMe
        });
        if(updateUser.success){
            // Reflect updated user details in the session
        req.session.user = {
          ...req.session.user,
          firstName: newfirstNameInput,
          lastName: newlastNameInput,
          AboutMe: AboutMe
      };

      // Notify the user of successful update
      res.render("edituser", {
          firstName: newfirstNameInput,
          success: "Profile updated successfully!"
      });

        }else{
          res.status(500).json({e : 'Internal Server Error'})
        }

      
    } catch (e) {
        // Handle errors and show them on the edit form
        res.render("edituser", {
            firstName: req.session.user.firstName,
            error: e.message
        });
    }
});


router.get("/sendfeedback", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render('feedback', { title: 'Send Feedback' });
  });

router.post("/sendfeedback", async (req, res) => {
    const { name, rating, comments } = req.body;
    try {
      const feedbackSent = await addFeedback(req.session.user._id, name, parseInt(rating), comments);
      res.render('addedfeedback', { success: "Feedback successfully added!", title: 'Feedback Sent' });
    } catch (e) {
      res.status(500).render('feedback', { error: `Error submitting feedback: ${e}`, title: 'Send Feedback' });
    }
  });
  router.get('/sendmessage', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');  // Ensure the user is logged in
    res.render('sendmessage', { title: 'Send Message' }); // Render the message sending page
});
import { sendMessage } from '../data/messages.js';
import { findUserByUsername } from '../data/users.js';
import fs from 'fs';


import multer from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files should be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for storing the file
  }
});
const upload = multer({ storage: storage });
router.post('/sendmessage', upload.single('eegDataFile'), async (req, res) => {
  try {
    const { receiverUsername } = req.body;

    // Assuming req.session.user contains the sender's ID
    const senderId = req.session.user._id;
    
    // Find the recipient by username
    const recipient = await findUserByUsername(receiverUsername);
    const recipientId = recipient._id;

    // Assuming req.file.path contains the path to the uploaded file
    const eegDataFilePath = req.file.path;

    // Read the content of the file
    const eegData = fs.readFileSync(eegDataFilePath, 'utf8');

    // Call sendMessage function with senderId, recipientId, and file content
    const message = await sendMessage(senderId, recipientId, eegData);

    // Respond with a success message and render the 'sendmessage' template
    res.status(200).render('sendmessage', { message });
  } catch (error) {
    // If an error occurs, respond with a 500 status and the error message
    res.status(500).json({ error: error.message });
  }
});



router.get('/viewmessage', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');  // Ensure the user is logged in

  try {
      const messagesReceived = await getMessagesForUser(req.session.user._id); // Fetch messages for the logged-in user
      res.render('viewmessage', { messages: messagesReceived, title: 'Your Messages' }); // Render the page to view messages
  } catch (e) {
      res.status(500).render('error', { error: e.message, title: 'View Messages' });
  }
});

export default router;
