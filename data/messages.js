import { messages } from '../config/mongoCollections.js';
import { promises as fsPromises } from 'fs'; // Importing the 'readFile' function from the 'fs' module

const { readFile } = fsPromises;

export const sendMessage = async (senderId, recipientId, eegDataFile) => {
    try {
        // Your existing code to create a new message object
        const newMessage = {
            senderId,
            recipientId,
            eegData: eegDataFile.eeg_data, // Extract EEG data from eegDataFile
            sentAt: new Date()
        };

        // Send EEG data to prediction server
        const predictionResponse = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eeg_data_file_path : eegDataFile }) // Send eegData as a JSON string
        });

        if (!predictionResponse.ok) {
            throw new Error('Failed to get prediction from server');
        }

        const predictionData = await predictionResponse.json();
        newMessage.prediction = predictionData.prediction;

        // Assuming you have a function to insert the new message into your database
        const insertResult = await insertMessage(newMessage);
        if (insertResult.insertedCount === 0) {
            throw new Error('Failed to add message');
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
