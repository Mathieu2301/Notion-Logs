const fs = require('fs');

if (fs.existsSync('.env')) {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n') // LF
    .forEach((l) => {
      const s = l.split('=');
      // eslint-disable-next-line
      if (s[1]) process.env[s[0]] = s[1];
    });
}

const notionLogs = require('./main')({
  secret: process.env.NOTION_SECRET,
  database: process.env.NOTION_DATABASE,
});

notionLogs('LOG', [], 'Test', {
  Key1: {
    key1: {
      subKey1: 'Sub value 1',
      subKey2: 'Sub value 2',
    },
    key2: 'Value 1',
  },
  Key2: 'Root value 1',
});
