'use strict';

const http = require('http');
const https = require('https');
const {URL} = require('url');
const methods = {};

['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(method => {
  methods[method] = (url, data, headers) => {
    return request(url, method, data, headers);
  };
});

function request(url = '', method = 'get', data = '', headers = {}) {
  return new Promise((resolve, reject) => {

    url = new URL(url);

    const options = {
      host: url.host,
      port: url.port || url.protocol === 'http:' ? 80 : 443,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data = data ? JSON.stringify(data) : ''),
      }, headers),
    };

    const req = (url.protocol === 'http:' ? http : https).request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        let data;
        try {
          data = JSON.parse(body);
        }
        catch(e) {
          data = body;
        };
        resolve(data);
      });
    }).on('error', error => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

module.exports = methods;
