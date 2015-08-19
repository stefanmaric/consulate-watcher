#!/bin/env node

var TelegramBot = require('node-telegram-bot-api');

var config      = require('./config');

var host        = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port        = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var domain      = process.env.OPENSHIFT_APP_DNS     || 'localhost';

var bot         = new TelegramBot(config.telegram.token, { webHook: { port: port, host: host }});

bot.setWebHook(domain + ':443/bot' + config.telegram.token);

bot.on('message', function (msg) {
  bot.sendMessage(msg.chat.id, "Received!");
});

console.log('Server running at %s:%s', host, port);
console.log('Webhook pointing to %s', domain);
