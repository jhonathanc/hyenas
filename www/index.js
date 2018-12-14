const { createServer } = require('http');
const { parse } = require('querystring');
const { parseString } = require('xml2js');

const { ticketGen } = require('./modules/ticketTools.js');
const { profileGen } = require('./modules/profileTools.js');



//console.log("Server started!");

createServer(function (req, res) {

  //console.log(`New request to ${req.url} on ${new Date().toISOString().replace('T', ' ').substr(0, 19)}`)

  switch (req.url) {
    case "/nav/auth":

      if (req.method == "POST") {

        res.writeHead(200, {
          'Content-Type': 'application/x-i-5-ticket',
          'X-I-5-Version': "1.0",
          "X-N": "S",
          "X-I-5-Status": "OK",
        });

        /*res.writeHead(200, {
          'Content-Type': 'text/plain',
          'X-I-5-Version': "1.0",
          "X-N": "S"
        });*/
        collectRequestData(req, result => {


          var ticket = ticketGen(result.loginid, result.password, result.serviceid, result.firmware, result.country, result.platform, result.avatarsize, result.jidsubdomain);

          res.end(ticket);
        });

      } else { // if not a post request

        res.writeHead(400, {
          'Content-Type': 'application/x-i-5-ticket',
          'Filename': 'ticket.dat',
          'X-I-5-Version': "1.0",
          "X-N": "S",
          "X-I-5-Status": "NG",
          "reason": "400"
        }); // likely isn't what its looking for but whatever, its an http response code

        res.end();
      }

      break;

    case "/loginform": // login form, if its not there it shouldn't panic, its just there to make things easier for me

      try {

        var formgen = require('path').resolve(__dirname, 'testingtools', 'loginform.html');

        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(require('fs').readFileSync(formgen, 'utf8'));

      } catch (err) {

        res.writeHead(410);
        res.end();
      }
      break;

    case "/profileform":

      try {

        var formgen = require('path').resolve(__dirname, 'testingtools', 'profileform.html');

        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(require('fs').readFileSync(formgen, 'utf8'));

      } catch (err) {

        res.writeHead(410);
        res.end();
      }
      break;

    case "/basic_view/sec/get_self_profile":

      if (req.method == "POST") {


        collectRequestData(req, result => {

          var profile = profileGen(result.profile.ticket, result.profile.env);

          res.writeHead(200);
          res.end(profile);
        });
      } else {
        res.writeHead(400); // likely isn't what its looking for but whatever, its an http response code

        res.end();
      }
      break;

    default: // if there's nothing made for the url
      res.writeHead(404);
      res.end();
  }



}).listen(80);

// stolen functions

function collectRequestData(request, callback) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';
  const FORM_XML = 'text/xml';

  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  });
  request.on('end', () => {
    switch (request.headers['content-type']) {
      case FORM_URLENCODED:
        callback(parse(body));
        break;
      case FORM_XML:
        parseString(body, (err, xmlResult) => {
          callback(xmlResult)
        });
        break;
      default:
        callback(null);
        break;
    }
  });
}
