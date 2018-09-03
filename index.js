const get = require('./lib/get');
const proc = require('./lib/process');

(async () => {
  const issues = await get();
  if (issues && issues.length) {
    proc(issues);
  }
  else {
    console.error('something went wrong man, check your .env file cabron!');
  }
})();
