/**
 * Config object, import as JSON
 * @type {Object}
 *
 * @example
 * {
 *   "consulateUrls": {
 *     "country": "https://example.com/countries.php",
 *     "consulate": "https://example.com/consulates.php",
 *     "agenda": "https://example.com/agenda.xhtml"
 *   },
 *   "telegram": {
 *     "baseUrl": "https://api.telegram.org/bot<bot-token>/"
 *   }
 * }
 */
var config = require('./config');
var fetch  = require('./fetcher');
var notify = require('./notifier');

function error(err) {
  console.error(err);
}

fetch(config.consulateUrls, function callback(err, data) {
  if (err) return error(err);
  console.log(JSON.stringify(data, null, 2));
  return notify('available-dates-summary', data, 7438652);
});