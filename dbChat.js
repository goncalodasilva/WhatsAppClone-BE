import mongoose from 'mongoose';

const ChatSchema = mongoose.Schema({
    chatId: String,
    chatName: String,
    chatUserIds: [String],
    creationDate: String
});

export default mongoose.model('chats', ChatSchema)