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
export const findUserByUsername = async (username) => {
    if (!username) throw 'Username must be provided';

    const userCollection = await users();
    const user = await userCollection.findOne({ username: username.toLowerCase() });

    if (!user) {
        return null; 
    }

    return user;
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
    const { firstName, lastName, password, AboutMe } = updateFields;
    const userCollection = await users();
    
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (AboutMe) updates.AboutMe = AboutMe;
    if (password) {
        const saltRounds = 10;
        updates.password = await bcrypt.hash(password, saltRounds);
    }

    const updateDoc = {
        $set: updates
    };

    const query = { _id: ObjectId(userId) };
    const updateResult = await userCollection.updateOne(query, updateDoc);

    if (!updateResult.matchedCount && !updateResult.modifiedCount) {
        throw new Error('No updates made. User not found.');
    }

    return { success: true };
};
