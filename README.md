# Notion Logs
Notion API for application logging

## Requirements

You need a Notion bot and a Notion database with following properties :
 - "Type": select (Log | Info | Success | Warning | Error)
 - "Tags": multi-select (as you want)
 - "Title": title / text

This API allows you to add lines to this database.

___
## Installation

```
npm i notion-logs
```

## Example (test.js)

```javascript
// Init notion-logs
const notionLogs = require('notion-logs')({
  secret: process.env.NOTION_SECRET, // Notion bot secret
  database: process.env.NOTION_DATABASE, // Notion database ID
});

// Example of log
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

```

___
## Problems

 If you have errors in console or unwanted behavior, just reload the page.
 If the problem persists, please create an issue [here](https://github.com/Mathieu2301/Notion-Logs/issues).
