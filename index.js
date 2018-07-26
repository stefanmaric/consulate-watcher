/**
 * Config object, import as JSON
 * @type {Object}
 *
 * @example
 * {
 *   "consulateUrls": {
 *     "country": "https://sitios.mrree.gub.uy/tramites/seleccionar/LoadPais.php",
 *     "consulate": "https://sitios.mrree.gub.uy/tramites/seleccionar/LoadMision.php",
 *     "agenda": "https://example.com/agenda.xhtml"
 *   },
 *   "telegram": {
 *     "token": "57851515:ADf7DbdQcksIF9D_yiveQFYaedDsEYwbDiC",
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