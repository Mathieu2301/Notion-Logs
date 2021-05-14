const https = require('https');

function formatObj(object = {}, i = 0) {
  let rs = '';
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === 'object') {
      rs += `${'\t'.repeat(i)}${key}:\n${formatObj(object[key], i + 1)}`;
    } else rs += `${'\t'.repeat(i)}[${key}]: "${object[key]}"\n`;
  });
  return rs;
}

/**
 * @param {{
 *  secret: string,
 *  database: string,
 * }} config
 */
module.exports = (config) => {
  /**
   * @param {'GET' | 'POST' | 'PATCH'} method
   * @param {string} path
   * @returns {Promise<string>}
   */
  function request(method = 'GET', path, body) {
    return new Promise((cb, err) => {
      const req = https.request({
        method,
        hostname: 'api.notion.com',
        path: `/v1/${path}`,
        headers: {
          Authorization: `Bearer ${config.secret}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2021-05-13',
        },
      }, (res) => {
        let data = '';
        res.on('data', (d) => { data += d; });
        res.on('close', () => {
          cb(JSON.parse(data));
        });
      });

      req.on('error', err);
      req.end(JSON.stringify(body));
    });
  }

  const logTypes = {
    LOG: 'Log',
    INFO: 'Info',
    SUCCESS: 'Success',
    WARNING: 'Warning',
    ERROR: 'Error',
  };

  /**
   * @param {'log' | 'info' | 'success' | 'warning' | 'error' } type
   * @param {string[]} tags
   * @param {string} title
   * @param {any} args
  */
  async function log(type = 'log', tags, title = '', ...args) {
    const logType = logTypes[type.toUpperCase()] || type;
    const pageBlocks = [];
    args.forEach((arg) => {
      if (!arg) return;
      if (typeof arg === 'object') {
        formatObj(arg)
          .match(/[\s\S]{0,2000}/g)
          .filter((m) => m)
          .forEach((m) => { pageBlocks.push(m); });
      } else pageBlocks.push(arg);
    });

    const rs = await request('POST', 'pages', {
      parent: { database_id: config.database },
      properties: {
        Type: { select: { name: logType } },
        Tags: { multi_select: tags.map((name) => ({ name })) },
        Title: { title: [{ text: { content: title } }] },
      },
    });

    if (rs.object === 'error' && rs.message) {
      console.error('Notion API error:', rs.message);
      const errPage = await request('POST', 'pages', {
        parent: { database_id: config.database },
        properties: {
          Type: { select: { name: 'Error' } },
          Title: { title: [{ text: { content: 'NOTION API ERROR !' } }] },
        },
      });

      if (!errPage.id) {
        console.error('Database doesn\'t have required properties.');
        return;
      }

      request('PATCH', `blocks/${errPage.id}/children`, {
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { text: [{ type: 'text', text: { content: rs.message } }] },
          },
        ],
      });

      return;
    }

    request('PATCH', `blocks/${rs.id}/children`, {
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: { text: pageBlocks.map((content) => ({ type: 'text', text: { content } })) },
        },
      ],
    });
  }

  return log;
};
