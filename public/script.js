/* global $ Auth0Lock */
document.querySelector('#login').addEventListener('click', function () {
  var lock = new Auth0Lock('liTBz70OsVI5NDT8S6OmYzyrjwv0soN7', 'davidsng.auth0.com')
  lock.show(function (err, profile, token) {
    if (err) {
      console.error('Something went wrong: ', err)
    } else {
      window.localStorage.setItem('userToken', token)
      window.localStorage.setItem('profile', JSON.stringify(profile))
      startChat()
    }
  })
})

document.querySelector('#logout').addEventListener('click', function () {
  window.localStorage.removeItem('userToken')
  window.localStorage.removeItem('profile')
  window.location.reload()
})

function isLoggedIn () {
  return !!window.localStorage.getItem('userToken')
}

function toggleLogin (showLogin) {
  if (showLogin) {
    document.querySelector('#login').removeAttribute('hidden')
    document.querySelector('#logout').setAttribute('hidden', 'hidden')
  } else {
    document.querySelector('#login').setAttribute('hidden', 'hidden')
    document.querySelector('#logout').removeAttribute('hidden')
  }
}

if (isLoggedIn()) {
  startChat()
} else {
  toggleLogin(true)
}

function startChat () {
  toggleLogin(false)
  var socket = window.io.connect(window.location.origin, {
    'query': 'token=' + window.localStorage.getItem('userToken')
  })
  var profile = JSON.parse(window.localStorage.getItem('profile'))
  var username = profile.nickname
  var msg = document.querySelector('#msg')

  if (!username) {
    var ran = Math.floor((Math.random() * 999) + 100)
    username = 'user' + ran
  }

  document.querySelector('#username').textContent = username

  function getElapsedTime (timestamp) {
    var ms = Date.now() - timestamp.getTime()
    var min = ms / 60000
    var time = ''
    if (min > 1439) {
      time = `${Math.round(min / 1440)}d`
    } else if (min > 59) {
      time = `${Math.round(min / 60)}h`
    } else if (min >= 1) {
      time = `${Math.round(min)}m`
    } else if (min > 0) {
      var sec = Math.round(min * 60)
      if (sec === 0) time = 'just now'
      else time = `${sec}s`
    }
    return time
  }

  function addMessageToList (message) {
    var chat = document.querySelector('.chat')
    var section = document.createElement('section')

    var timestamp = new Date(message.timestamp)
    var time = getElapsedTime(timestamp)

    section.innerHTML = `
    <p>${message.username}</p>
    <div>${message.message}</div>
    <p class="timestamp">${time}</p>`

    chat.appendChild(section)
    section.scrollIntoView()
  }

  // function checkMessage () {
  //   if (event.keyCode !== 13) return
  //   if (event.)
  // }

  function sendMessageToServer (event) {
    console.log(event)
    if (event.type === 'keydown' && event.keyCode !== 13) return
    if (msg.value === '') return
    var timestamp = new Date()
    var message = {
      username: username,
      message: msg.value,
      timestamp: timestamp.toISOString()
    }
    socket.emit('chat message', message)
    msg.value = ''
  }

  var btn = document.querySelector('#btn')
  btn.addEventListener('click', sendMessageToServer, false)

  msg.addEventListener('keydown', sendMessageToServer, false)

  socket.on('chat message', function (message) {
    addMessageToList(message)
    $('.typingNotification').remove()
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 0)
  })

  socket.on('chat log', function (messages) {
    messages.forEach(addMessageToList)
  })

  // NEW FEATURE: TYPING NOTIFICATION
  var timeout
  var typing = false

  function timeoutFunction () {
    typing = false
    socket.emit('typing', { 'isTyping': false, 'username': '' })
    // socket.emit('isTyping', { 'isTyping': false, 'username': '' })
    removeTypingAlert()
    var pageHeader = document.querySelector('#pageHeader')
    pageHeader.textContent = 'Web Chat 1.0'
  }

  function addTypingNotification (name) {
    var chat = document.querySelector('.chat')
    var section = document.createElement('section')
    section.innerHTML = `<p class="typingNotification">${name} is typing...</p>`
    chat.appendChild(section)
    section.scrollIntoView()

    var pageHeader = document.querySelector('#pageHeader')
    pageHeader.textContent = `${name} is typing...`
    console.log('addTypingNotification works')
  }

  $('#msg').keypress(function (e) {
    if (e.keyCode !== 13) {
      if (typing === false) {
        console.log('detected typing')
        typing = true
        socket.emit('typing', {'isTyping': true, 'username': username})
        console.log("emitted 'typing' to socket")
        clearTimeout(timeout)
        timeout = setTimeout(timeoutFunction, 5000)
      } else {
      }
    } })

  function removeTypingAlert () {
    $('.typingNotification').remove()
    console.log('removed something')
    var pageHeader = document.querySelector('#pageHeader')
    pageHeader.textContent = 'Web Chat 1.0'
  }

  socket.on('typing', function (data) {
    if (data.isTyping) {
      addTypingNotification(data.username)
      console.log('UL added')
    } else { removeTypingAlert() }
  })
}
