const { Client } = require('dsteem');
const fs = require('fs');

const client = new Client('https://api.steemit.com');

const author = 'good-karma';
const permlink = 'esteem-spotlight-top-users-and-giveaway-16-afff4b320da3best';

const error = msg => {
  console.log('\x1b[31m', msg, '\x1b[0m');
};

client.database
  .call('get_content', [author, permlink])
  .then(resp => {
    if (resp.id === 0) {
      error('Content not found!');
      return;
    }

    const fileName = `${author}____${permlink}.json`;
    const savePath = `${__dirname}/json/${fileName}`;
    if (fs.existsSync(savePath)) {
      error(`${fileName} already exists!`);
      return;
    }

    fs.writeFileSync(savePath, JSON.stringify(resp, 0, 2), 'utf-8');

    return resp;
  })
  .catch(err => {
    error(err);
  });