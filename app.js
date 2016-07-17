var express = require('express'),
    requireNew = require('require-new'),
    app = express(),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    basicAuth = require('basic-auth');
server.listen(8080);
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public');
});


function unauthorized(res){
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res.send(401);
};


app.get('/api/profile', function (req, res) {
    var user = basicAuth(req);
    if(!user || !user.name || !user.pass){
      return unauthorized(res);
    }
    var api = requireNew('pokemon-go-node-api');
    api.GetAccessToken(user.name, user.pass, function(err, token) {
        if(err){
          res.send(err);
          return null;
        }
      api.GetApiEndpoint(function(err, api_endpoint) {
          if (err){
            console.log(err);
            res.send({"error": "RPC server offline"})
            return null;
          };

          api.GetProfile(function(err, profile) {
              if (err) console.log(err);
              res.send({"token": token, "endpoint": api_endpoint, "username": profile.username, "storage": profile.poke_storage, "istorage": profile.item_storage, "stardust": profile.currency[1].amount, "pokecoins": profile.currency[0].amount});
              if (profile.currency[0].amount == null) {
                  var poke = 0
              } else {
                  var poke = profile.currency[0].amount
              }
          })
      });
    });
});


app.get('/api/gettoken', function (req, res) {
  var user = basicAuth(req);
  if(!user || !user.name || !user.pass){
    return unauthorized(res);
  }
  var api = requireNew('pokemon-go-node-api');
  api.GetAccessToken(user.name, user.pass, function(err, token) {
    res.send({"token": token});
  });
});
