const fs = require('fs');
const http = require('http');
const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const { host, port, buttons } = config;

const options = {
  host,
  port,
  method: 'GET'
};

const board = new five.Board({
  io: new Raspi()
});

board.on('ready', function() {
  for (let [pin, path] of Object.entries(buttons)) {
    if (path === '') {
      continue;
    }

    const button = new five.Button(pin);
    console.log('register pin', pin);

    button.on('down', () => {
      console.log(button.pin, path);

      const header = { ...options, path };
      const req = http.get(header, (res) => {
        res.setEncoding('utf8');
        res.on('data', (data) => {
          console.log('response', data);
        });
      });
      
      req.on('error', ({ message }) => {
        console.error('request error', message);
      });

      req.end();      
    });
  }
});
