const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const socketioJwt = require('socketio-jwt')
const md = require('markdown').markdown

// database connection
const db_user = process.env.CHAT_DB_USER
const db_pwd = process.env.CHAT_DB_PWD
const db_url = 'mongodb://' + db_user + ':' + db_pwd + '@ds027835.mongolab.com:27835/webchat'
mongoose.connect(db_url)
// const db = mongoose.connection

const Message = mongoose.model('Message', {
  'username': String,
  'message': String,
  'timestamp': Object
})

app.use(express.static('public'))

// enable auth0 log in

io.use(socketioJwt.authorize({
  secret: Buffer('0MZUODcfZlmWQr0gtItriIssOQ8Koa5Ppw6irOsuLK8y1PkPjD5fj6ZqgAqi_KV1', 'base64'),
  handshake: true
}))

io.on('connection', function (socket) {
  console.log('A user connected.', socket.decoded_token.name)
  // send chat log on new user connection
  Message.model('Message').find(function (err, messages) {
    if (err) return console.error(err)
    // io.emit('chat log', messages)
    socket.emit('chat log', messages)
  })

  socket.on('chat message', function (msg) {
    // save message to database
    msg.message = md.toHTML(msg.message)
    const message = new Message(msg)
    message.save(function (err) {
      if (err) return console.error(err)
    })
    console.log(`Message: ${msg.message}`)
    // send message to all clients
    io.emit('chat message', msg)
  })
  socket.on('typing', function (input) {
    io.emit('typing', input)
    console.log(input)
  })
  // socket.on('isTyping', input {})
  socket.on('disconnect', function () {
    console.log('User disconnected.')
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`Listening to http://localhost:${PORT}`)
})
