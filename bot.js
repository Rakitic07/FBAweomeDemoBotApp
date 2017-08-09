var express = require('express');
var app = express();
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var path = require('path');
var cloudant = require('cloudant');
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv(); 
app.use(bodyParser.urlencoded({ extended: false }));


app.listen(appEnv.port, '0.0.0.0', function() { 
    console.log("server starting on " + appEnv.url);
});

var cloudant = require('cloudant');
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv(); 

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials;
        }
    }
}

var dbCredentials;
function initDBConnection() {
    if (process.env.VCAP_SERVICES) {
        dbCredentials = getDBCredentialsUrl(process.env.VCAP_SERVICES);
        return dbCredentials;
    } else { 
        dbCredentials = getDBCredentialsUrl(fs.readFileSync("myJASON.json", "utf-8")); 
        return dbCredentials;
    }
};

var cred = initDBConnection();
var uname = cred.username;
var pwd = cred.password;
var cloudant = cloudant({account:uname , password:pwd});


app.get('/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});


//app.get('/', function(req, res) {
//  res.writeHead(200, {'Content-Type': 'text/html'});
//  res.write(messengerButton);
//  res.end();
//});

//app.post('/', function(req, res){
//    
//    res.write("<b>Hello</b>");
//    res.end();
//})


