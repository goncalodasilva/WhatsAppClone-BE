import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    senderId: String,
    senderName: String,
    timestamp: String,
    chatId: String//,
    //receiverId: String,
    //receiverName: String
});

export default mongoose.model('messagecontents', whatsappSchema)