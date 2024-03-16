const { get } = require('http');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let clients = [];
let highestDecibel = 0; 
let championClient = null; 

function gethigh(client, decibal, client1, client2, clname) {
    if (decibal > highestDecibel) {
      console.log(decibal)
      highestDecibel = decibal;
      championClient = client;
      var tosend = String("new highest score "+decibal + "said by "+clname);
      client1.send(tosend.toString());
      client2.send(tosend.toString());
    } else {
      console.log("nothighest")
    }
}

function matchClients() {
  while (clients.length >= 2) {
    const [client1, client2] = clients.splice(0, 2);
    
    client1.send('matched!');
    client2.send('matched!');
    
    client1.on('message', (message) => {
      client2.send(message.toString());
      var decibal = Number(message.toString());
      gethigh(client2, decibal, client1, client2, 'client1');
      
    });

    client2.on('message', (message) => {
      client1.send(message.toString());
      var decibal = Number(message.toString());
      gethigh(client1, decibal, client1, client2, 'client2')
    });

    // Handle closing connections
    const closeConnection = (other) => {
      return () => {
        console.log('Client disconnected, notifying the partner...');
        other.send('Your partner has disconnected.');
      };
    };

    client1.on('close', closeConnection(client2));
    client2.on('close', closeConnection(client1));
  }
}

wss.on('connection', (ws) => {
  console.log('clicon!');
  clients.push(ws);

  matchClients();

  // ws.on('message', (message) => {
  //   // console.log(`${message}`);
  // });

  ws.on('close', () => {
    console.log('Client has disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

console.log('started on ws://localhost:8080');
