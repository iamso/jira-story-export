const fs = require('fs');
const path = require('path');
const request = require('./request');

const env = require('node-env-file');
const envFile = path.join(path.dirname(require.main.filename),'.env');

if (fs.existsSync(envFile)) {
  env(envFile);
}

const limit = 50;
const url = process.env.JIRA_URL;
const project = process.env.JIRA_PROJECT;
const user = process.env.JIRA_USER;
const pw = process.env.JIRA_PW;
const auth = {
  'Authorization': 'Basic ' + new Buffer(user + ':' + pw).toString('base64')
};


module.exports = () => {
  if (!url || !project || !user || !pw) {
    return Promise.resolve(false);
  }
  return new Promise(async (resolve) => {
    try {
      const total = (await request.get(`${url}/rest/api/2/search?jql=project%3D%22${project}%22&maxResults=0`, null, auth)).total;
      const pages = Math.ceil(total / limit);
      let allIssues = [];

      let count;

      for (let i = 0; i < pages; i++) {
        const start = i * limit;
        const issues = (await request.get(`${url}/rest/api/2/search?jql=project%3D%22${project}%22&startAt=${start}&maxResults=${limit}&fields=%2Aall`, null, auth)).issues;
        allIssues = allIssues.concat(issues);
      }

      resolve(allIssues);
    }
    catch(err) {
      resolve(false);
    }
  });
}
