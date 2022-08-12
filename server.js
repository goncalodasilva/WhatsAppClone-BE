// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Chats from './dbChat.js';
import Pusher from 'pusher';
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1297782",
    key: "0b13950db72a15911ff2",
    secret: "2c8c57ccf3c0e8f94031",
    cluster: "eu",
    useTLS: true
});
  

// middleware
app.use(express.json());

app.use(cors());



// DB config
const connection_url = 'mongodb+srv://admin:Jw4ztxRDaD5Digp@cluster0.ajcoh.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(connection_url);

const db = mongoose.connection;

db.once('open', () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('change', change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                message: messageDetails.message,
                senderId: messageDetails.senderId,
                senderName: messageDetails.senderName,
                timestamp: messageDetails.timestamp,
                roomId: messageDetails.roomId,
                receiverId: messageDetails.receiverId,
                receiverName: messageDetails.receiverName
            })
        } else {
            console.log('Error triggering Pusher')
        }
    })
});
// ????

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {

    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    }) 
})

app.get('/messages/sync/:id', (req, res) => {
    const id = req.params.id,
        sort = {timestamp: -1},
        body = {chatKeys: []}
        

    Messages.find({$or: [{senderId: id}, {receiverId: id}]}).sort(sort).exec((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            data.forEach(msg => {
                const chatId = msg.chatId;
                if (!chatId) {
                    return;
                }
                if (!!body[chatId]) {
                    body[chatId].push(msg)
                } else {
                    body[chatId] = [msg]
                    body.chatKeys.push(chatId)
                }
            })
            res.status(200).send(body);
        }
    })
})

app.get('/messages/:chatId', (req, res) => {
    const chatId = req.params.chatId,
        sort = {timestamp: -1}
        

    Messages.find({chatId: chatId}).sort(sort).exec((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})


app.get('/chats/:userId', (req, res) => {
    const userId = req.params.userId

    Chats.find({chatUserIds: userId}, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
    /*const id = req.params.id

    Chats.find({chatId: id}, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data[0]);
        }
    })*/
})

app.post('/chats/', (req, res) => {
    const dbChat = req.body
    console.log(dbChat)

    Chats.create(dbChat, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;
    console.log(dbMessage);

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));