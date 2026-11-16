async function test() {
  const res = await fetch('https://google.com');
  console.log('google:', res.status, await res.text());
}
test();
