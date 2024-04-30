import { messages } from '../config/mongoCollections.js';

export const sendMessage = async (senderId, recipientId, messageContent) => {
    try {
        // Your existing code to create a new message object
        const newMessage = {
            senderId,
            recipientId,
            message: messageContent,
            sentAt: new Date()
        };
        const predictionResponse = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eeg_data: messageContent })
        });

        if (!predictionResponse.ok) {
            throw new Error('Failed to get prediction from server');
        }

        const predictionData = await predictionResponse.json();
        newMessage.prediction = predictionData.prediction;
        const messageCollection = await messages();
        const insertResult = await messageCollection.insertOne(newMessage);
        if (insertResult.insertedCount === 0) {
            throw 'Failed to add message';
        }

        return { messageId: insertResult.insertedId.toString(), ...newMessage };
    } catch (error) {
        throw new Error(`Error saving message: ${error.message}`);
    }
};

export const getMessagesForUser = async (recipientId) => {
    try {
        const messageCollection = await messages();
        const userMessages = await messageCollection.find({ recipientId }).toArray();
        return userMessages;
    } catch (error) {
        throw new Error(`Error fetching messages for user: ${error.message}`);
    }
};
