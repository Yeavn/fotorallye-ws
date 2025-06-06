const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001, host: '0.0.0.0' });
let time = 0;

let isStarted = false;
let timerInterval = null;

function startTimer(duration) {
  time = duration;
  timerInterval = setInterval(() => {
    if (isStarted && time > 0) {
      time--;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'time', value: time }));
        }
      });
      if (time === 0) {
        isStarted = false;
        clearInterval(timerInterval);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('stop');
          }
        });
      }
    }
  }, 1000*60);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

wss.on('connection', (ws) => {
  console.log('Client verbunden');
  if (isStarted) {
    ws.send('started');
    ws.send(JSON.stringify({ type: 'time', value: time }));

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
          ws.send(JSON.stringify({ type: 'time', value: time }));
        }
      });
      if(!timerInterval) {
        startTimer(60)
      }
    } else if (message.toString() === 'stop') {
      // Sende an alle Clients
      isStarted = false;
      console.log('Stoppe Spiel');
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('stop');
        }
      });
      stopTimer();
    }
  });
});