import mongoose from 'mongoose';
import { UserModel, TextChatModel, FeedbackModel } from './models.js';

await mongoose.connect('mongodb://localhost:27017/agile-team16', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleUserData = [
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' },
];

const sampleTextChatData = [
  { participants: ['user1', 'user2'], messages: ['Hello!', 'Hi there!', 'How are you?'] },
  { participants: ['user1', 'user3'], messages: ['Hey!', 'I am good, thanks!', 'And you?'] },
];

const sampleFeedbackData = [
  { user: 'user1', message: 'Great app!' },
  { user: 'user2', message: 'Very useful features.' },
];

async function seedDatabase() {
  try {
    await UserModel.deleteMany({});
    await TextChatModel.deleteMany({});
    await FeedbackModel.deleteMany({});
    
    await UserModel.insertMany(sampleUserData);
    await TextChatModel.insertMany(sampleTextChatData);
    await FeedbackModel.insertMany(sampleFeedbackData);

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
  }
}

await seedDatabase();
