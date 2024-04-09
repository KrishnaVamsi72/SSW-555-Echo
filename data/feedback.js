import { feedback } from '../config/mongoCollections.js';

async function addFeedback(userId, content) {
    if (!userId || !content) throw 'You must provide both a userId and feedback content';

    const feedbackCollection = await feedback();
    const newFeedback = {
        userId,
        content,
        createdAt: new Date()
    };

    const insertInfo = await feedbackCollection.insertOne(newFeedback);
    if (insertInfo.insertedCount === 0) throw 'Could not add feedback';

    return { feedbackId: insertInfo.insertedId.toString(), ...newFeedback };
}
async function getAllFeedback() {
    const feedbackCollection = await feedback(); // Get the feedback collection
    const allFeedback = await feedbackCollection.find({}).toArray(); // Fetch all feedback documents
    
    return allFeedback;
}

async function getUserFeedback(userId) {
    if (!userId) throw 'User ID must be provided';
  
    const feedbackCollection = await feedback(); // Assuming feedbacks() gets the feedback collection
    const userFeedback = await feedbackCollection.find({ userId }).toArray();
  
    return userFeedback;
  }

export { addFeedback };
export {getUserFeedback};
export {getAllFeedback};