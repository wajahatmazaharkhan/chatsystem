const http = require('http');

const services = [
  { name: 'api-gateway', url: 'http://localhost:5000/' },
  { name: 'auth-service', url: 'http://localhost:5001/' },
  { name: 'user-service', url: 'http://localhost:5002/' },
  { name: 'group-service', url: 'http://localhost:5003/' },
  { name: 'chat-service', url: 'http://localhost:5004/' },
  { name: 'activity-service', url: 'http://localhost:5005/' },
  { name: 'status-service', url: 'http://localhost:5006/' },
  { name: 'analytics-service', url: 'http://localhost:5007/' }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(service.url, (res) => {
      // Even if it returns 404, it means the server is UP and responding
      resolve({ name: service.name, status: 'UP 🟢', code: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ name: service.name, status: 'DOWN 🔴', error: err.code });
    });

    req.end();
  });
}

async function testAll() {
  console.log('Testing all services...\n');
  const results = await Promise.all(services.map(checkService));
  
  results.forEach(res => {
    if (res.status.includes('UP')) {
      console.log(`${res.name.padEnd(18)}: ${res.status} (Responded with HTTP ${res.code})`);
    } else {
      console.log(`${res.name.padEnd(18)}: ${res.status} (Error: ${res.error})`);
    }
  });
}

testAll();
