/* eslint-disable @typescript-eslint/naming-convention */
const config = {
  name: 'esv7',
  connector: 'esv6',
  index: 'catalog',
  version: 7,
  debug: process.env.APP_ENV === 'dev',
  //defaultSize: '',  // keep commented
  configuration: {
    node: process.env.ELASTIC_SEARCH_HOST,
    requestTimeout: process.env.ELASTIC_SEARCH_REQUEST_TIMEOUT,
    pingTimeout: process.env.ELASTIC_SEARCH_PING_TIMEOUT
  },
  mappingProperties: {
    "docType": {
      "type": "keyword"
    },
    "id": {
      "type": "keyword"
    },
    "name": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    },
    "description": {
      "type": "text"
    },
    "is_active": {
      "type": "boolean"
    },
    "created_at": {
      "type": "date"
    },
    "updated_at": {
      "type": "date"
    }
  }
};

export default config;
