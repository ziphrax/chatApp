// Quick script to add a new room to your chat app
// Run this with: node add-room.js

const mongoose = require('mongoose');
const Room = require('./model/room');

const mongooseURI = process.env.MONGODB_URI || 'mongodb://localhost/chatApp';

async function addRoom() {
    try {
        await mongoose.connect(mongooseURI);
        console.log('Connected to database');
        
        const roomName = process.argv[2] || 'General Chat';
        const password = process.argv[3] || '';
        const requiresPassword = password.length > 0;
        
        // Check if room already exists
        const existingRoom = await Room.findOne({ name: roomName });
        if (existingRoom) {
            console.log(`Room "${roomName}" already exists!`);
            process.exit(1);
        }
        
        const roomCount = await Room.countDocuments();
        
        const newRoom = new Room({
            name: roomName,
            createdDate: new Date(),
            requiresPassword: requiresPassword,
            password: password,
            displayOrder: roomCount + 1
        });
        
        await newRoom.save();
        console.log(`✅ Room "${roomName}" created successfully!`);
        
        if (requiresPassword) {
            console.log(`🔒 Password protected with: "${password}"`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Usage examples:
// node add-room.js "Gaming Lobby"
// node add-room.js "VIP Room" "secret123"

addRoom();
