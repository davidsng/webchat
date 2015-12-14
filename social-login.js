var lock = new Auth0Lock('TtKbfNdcsTGsFcFu0aqxxpeCAEML0RRg', 'belgian-chocolates.auth0.com');

document.getElementById('btn-login').addEventListener('click', function() {
  lock.show(function(err, profile, token) {
    if (err) {
      // Error callback
      console.error("Something went wrong: ", err);
      alert("Something went wrong, check the Console errors");
    } else {
      // Success calback

      // Save the JWT token.
      localStorage.setItem('userToken', token);

      // Save the profile
      userProfile = profile;

      document.getElementById('nick').textContent = profile.nickname;
    }
  })
})

var getFoos = fetch('/api/foo', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('userToken')
  },
  method: 'GET',
  cache: false
});

getFoos.then(function (response) {
  response.json().then(function (foos) {
    console.log('the foos:', foos);
  });
});

localStorage.removeItem('userToken');
window.location.href = "/";
