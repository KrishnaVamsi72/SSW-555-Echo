import { messages } from '../config/mongoCollections.js';

export const sendMessage = async (senderId, recipientId, messageContent, prediction) => {
    try {
        const newMessage = new Message({
            senderId,
            recipientId,
            message: messageContent,
            prediction,
            sentAt: new Date()
        });

        const savedMessage = await newMessage.save();
        return savedMessage;
    } catch (error) {
        // It's generally a good idea to throw the error further up to the caller
        throw new Error(`Error saving message: ${error.message}`);
    }
};
export const getMessagesForUser = async (recipientId) => {
    const messageCollection = await messages();
    const messages = await messageCollection.find({ recipientId }).toArray();

    if (!messages.length) {
        throw 'No messages found';
    }

    return messages;
};
