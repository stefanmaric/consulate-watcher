var config = require('./config');
/*
 * Use `watch:false` to ensure process exits correctly.
 * See: https://github.com/mozilla/nunjucks/issues/486
 */
var nunjucks = require('nunjucks').configure('templates', { watch: false });
var TelegramBot = require('node-telegram-bot-api');

var bot         = new TelegramBot(config.telegram.token);

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
 * @param  {Number}     chat_id       Telegram chat_id
 * @param  {Number}     [respondTo]   Telegram reply_to_message_id
 * @param  {String[]}   [mentions]    List of usernames to mention at the end of the message
 * @return {undefined}
 *
 * @public
 */
function notify(type, data, chat_id, respondTo, mentions) {

  var templateName = type + '.nunjucks';
  var output = 'No Message';
  
  output = nunjucks.render(templateName, { data: data });

  bot.sendMessage(chat_id, output).error(function(e) {
    console.error(e);
  });
}