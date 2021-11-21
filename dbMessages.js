import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
    roomId: String,
    roomName: String    
});

export default mongoose.model('messagecontents', whatsappSchema)