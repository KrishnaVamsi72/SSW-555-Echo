import { feedback } from '../config/mongoCollections.js';

export const addFeedback = async (userId, name, rating, comments) => {
    const feedbackCollection = await feedback();

    const newFeedback = {
        userId,
        name,
        rating,
        comments,
        createdAt: new Date()
    };

    const insertResult = await feedbackCollection.insertOne(newFeedback);
    if (insertResult.insertedCount === 0) {
        throw 'Failed to add feedback comment';
    }

    return { feedbackId: insertResult.insertedId.toString(), ...newFeedback };
};

export const getUserFeedback = async (userId) => {
    const feedbackCollection = await feedback();
    const userFeedback = await feedbackCollection.find({ userId }).toArray();

    if (!userFeedback.length) {
        throw 'No feedback found';
    }

    return userFeedback;
};
