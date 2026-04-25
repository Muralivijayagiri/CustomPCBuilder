import fetch from 'node-fetch';

async function run() {
  const r1 = await fetch('http://localhost:3001/api/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'INVALID' })
  });
  console.log('Test 1 status:', r1.status);
  console.log('Test 1 body:', await r1.text());

  // We are using a dummy key, so SerpAPI will fail and return [], which will result in total: 0
  const r2 = await fetch('http://localhost:3001/api/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'RAM' })
  });
  console.log('Test 2 status:', r2.status);
  console.log('Test 2 body:', await r2.text());
}

run();
