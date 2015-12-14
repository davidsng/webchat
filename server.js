const app = require('./index')
const http = require('http').createServer(app)
const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`)
})
