import bcrypt from 'bcrypt';
import { users } from '../config/mongoCollections.js';

export const registerUser = async (firstName, lastName, username, password, AboutMe, themePreference, role) => {
    if (!firstName || !lastName || !username || !password || !AboutMe || !themePreference || !role) {
        throw 'All fields must be provided';
    }

    const userCollection = await users();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        firstName,
        lastName,
        username: username.toLowerCase(),
        password: hashedPassword,
        AboutMe,
        themePreference,
        role
    };

    const insertResult = await userCollection.insertOne(newUser);
    if (!insertResult.acknowledged || !insertResult.insertedId) {
        throw 'Could not register user';
    }

    return { signupCompleted: true };
};

export const loginUser = async (username, password) => {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username.toLowerCase() });

    if (!user) {
        throw 'User not found';
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
        throw 'Invalid password';
    }

    return user;
};

export const updateUser = async (userId, updateFields) => {
    const { firstName, lastName, AboutMe, themePreference } = updateFields;
    const userCollection = await users();

    const updateResult = await userCollection.updateOne(
        { _id: userId },
        { $set: { firstName, lastName, AboutMe, themePreference } }
    );

    if (!updateResult.matchedCount) {
        throw 'User not found';
    }
    if (!updateResult.modifiedCount) {
        throw 'No updates made';
    }

    return { success: true };
};
