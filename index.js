const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001, host: '0.0.0.0' });

let isStarted = false;

wss.on('connection', (ws) => {
  console.log('Client verbunden');
  if (isStarted) {
    ws.send('started');
  }

  ws.on('message', (message) => {
    console.log('Empfangen:', message.toString());

    // Wenn vom Admin gesendet wurde:
    if (message.toString() === 'start') {
      // Sende an alle Clients
      isStarted = true;
      console.log('Starte Spiel');
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('start');
        }
      });
    } else if (message.toString() === 'stop') {
      // Sende an alle Clients
      isStarted = false;
      console.log('Stoppe Spiel');
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('stop');
        }
      });
    }
  });
});