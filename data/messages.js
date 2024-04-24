import { messages } from '../config/mongoCollections.js';

export const sendMessage = async (senderId, recipientId, message, prediction) => {
    const messageCollection = await messages();

    const newMessage = {
        senderId,
        recipientId,
        message,
        prediction,
        sentAt: new Date()
    };

    const insertResult = await messageCollection.insertOne(newMessage);
    if (insertResult.insertedCount === 0) {
        throw 'Failed to send message';
    }

    return { messageId: insertResult.insertedId.toString(), ...newMessage };
};

export const getMessagesForUser = async (recipientId) => {
    const messageCollection = await messages();
    const messages = await messageCollection.find({ recipientId }).toArray();

    if (!messages.length) {
        throw 'No messages found';
    }

    return messages;
};
