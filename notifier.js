/*
 * Use `watch:false` to ensure process exits correctly.
 * See: https://github.com/mozilla/nunjucks/issues/486
 */
var config = require('./config');
var nunjucks = require('nunjucks').configure('templates', { watch: false });
var request  = require('request').defaults({ baseUrl: config.telegram.baseUrl });

module.exports = notify;

/*
  Load filters
 */
nunjucks.addFilter('limitTo', require('./filters/limit-to'));
nunjucks.addFilter('date', require('nunjucks-date'));

/**
 * Send notifications to a given Telegram user in fire&forget mode;
 * erros will be logged to disk.
 * 
 * @param  {String}     type          Type of notification, matches template filename
 * @param  {Object}     data          Data to be interpolated in template
 * @param  {Number}     receiverId    Telegram chat_id
 * @param  {Number}     [respondTo]   Telegram reply_to_message_id
 * @param  {String[]}   [mentions]    List of usernames to mention at the end of the message
 * @return {undefined}
 *
 * @public
 */
function notify(type, data, receiverId, respondTo, mentions) {

  var templateName = type + '.nunjucks';
  var output = 'No Message';
  
  output = nunjucks.render(templateName, { data: data });

  request.post({
    uri: '/sendMessage',
    form: {
      chat_id: receiverId,
      text: output
    }
  }, function(err, httpResponse, response) {
        if (err) return error(err);
        var status = httpResponse.statusCode;
        if (status !== 200) {
          err = new Error('Telegram API responded a ' + status);
          err.httpResponse = httpResponse;
          return error(err);
        }
        return console.log(response);
  });

}