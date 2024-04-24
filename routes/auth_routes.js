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

router.get("/myfeedback", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const feedback = await getUserFeedback(req.session.user._id);
    res.render("viewMyFeedback", { feedback, title: 'Your Feedback' });
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
