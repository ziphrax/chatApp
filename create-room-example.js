// Example: How to create a new room/lobby programmatically

const mongoose = require('mongoose');
const Room = require('./model/room');

// Connect to your database first
mongoose.connect('mongodb://localhost/chatApp');

async function createNewLobby(roomName, password = '', requiresPassword = false) {
    try {
        const newRoom = new Room({
            name: roomName,
            createdDate: new Date(),
            requiresPassword: requiresPassword,
            password: password,
            displayOrder: await Room.countDocuments() + 1
        });
        
        await newRoom.save();
        console.log(`Room "${roomName}" created successfully!`);
        
        // You would also need to add it to the rooms object in server.js
        // This could be done by restarting the server or adding it dynamically
        
        return newRoom;
    } catch (error) {
        console.error('Error creating room:', error);
    }
}

// Example usage:
// createNewLobby('Gaming Lobby');
// createNewLobby('Private Room', 'secret123', true);
