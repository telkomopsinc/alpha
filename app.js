'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var JSONbig = require('json-bigint');
var async = require('async');
var log4js = require('log4js');
var fs = require('fs');
var util = require('util');
//const vz_proxy = config.vz_proxy;
var REST_PORT = (process.env.PORT || process.env.port || process.env.OPENSHIFT_NODEJS_PORT || 8080);
var FB_VERIFY_TOKEN = "CAA30DE7-CC67-4CBA-AF93-2B1C5C4C19D4";
var FB_PAGE_ACCESS_TOKEN = "EAAU6CRuhSXkBABZAO2nGyJRHQgA6mOVgWSY3ACispPG3CCzJtLsNmzBH2GpjUvX8OGZBuscxjzKjD1DEGVfJhQUGxhZC3kFbgASjez7Ld10BgqefftTARaG6neLnjdTOm9sCuF2CTdDSrCMTt8BkD1SK0fN3sa0vDYlYL6K1gZDZD";
var sessionIds = new Map();

log4js.configure({
    appenders:
    [
        {
            type: 'console'
        },
        {
            type: 'dateFile', filename: 'botws.log', category: 'botws', "pattern": "-yyyy-MM-dd", "alwaysIncludePattern": false
        },
        {
            type: 'logLevelFilter',

            level: 'Debug',
            appender: {
                type: "dateFile",

                filename: 'history.log',

                category: 'Historylog',
                "pattern": "-yyyy-MM-dd",
                "alwaysIncludePattern": false
            }
        }
    ]
});

var logger = log4js.getLogger("ws");
var ChatHistoryLog = log4js.getLogger('Historylog');

var app = express();
app.use(bodyParser.text({ type: 'application/json' }));
app.set('view engine', 'ejs');

app.listen(REST_PORT,  function () {
    logger.debug('Rest service ready on port ' + REST_PORT);
});

app.get('/webhook/', function (req, res) {
    logger.debug("inside webhook get");
    if (req.query['hub.verify_token'] == FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);

        setTimeout(function () {
            doSubscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong FB validation token');
    }
});

app.get('/speedtest/', function (req, res) {
        res.render('pages/speedtest');
});

app.post('/webhook/', function (req, res) {
    try {
        var data = JSONbig.parse(req.body);
        console.log(JSON.stringify(data));
        if (data.entry) {
            setTimeout(function () {
            var entries = data.entry;
            entries.forEach(function (entry) {
                var messaging_events = entry.messaging;
                if (messaging_events) {
                    messaging_events.forEach(function (event) {
                        var SenderID;
                        var RecipientID;
                        if (event  && event.sender) {
                            SenderID = event.sender.id;
                        }
                        if (event  && event.recipient) {
                            RecipientID = event.recipient.id;
                        }
                        if (event.message) {
                            //Customer Query
                            var TimeStamp = event.timestamp;
                            var MessageID = event.message.mid;
                            var MessageText = event.message.text;
                            if (event.message && !event.message.is_echo ||
                                event.postback && event.postback.payload ||
                                event.account_linking) {
                                if (MessageText.toLowerCase() == "get started") {
                                    //var respobj = { "facebook": { "attachment": { "type": "template", "payload": { "template_type": "generic", "elements": [{ "title": "Welcome to Verizon", "image_url": "https://www98.verizon.com/vzssobot/content/verizon-logo-200.png", "subtitle": "Entertainment", "default_action": { "type": "web_url", "url": "https://webvwtrl.herokuapp.com/speedtest", "messenger_extensions": true, "webview_height_ratio": "tall", "fallback_url": "https://www98.verizon.com/SpeedTest/learnspeedtest.aspx#repair" }, "buttons": [{ "type": "web_url", "url": "https://www.verizon.com/", "title": "View Website" }, { "type": "postback", "title": "Start Chatting", "payload": "Start Conversation" }] }] } } } };
                                    var respobj = {"facebook":{"attachment":{"type":"template","payload":{"template_type":"generic","elements":[{"title":"Welcome to Verizon (iFrame)","image_url":"https://www98.verizon.com/vzssobot/content/verizon-logo-200.png","subtitle":"Entertainment","default_action":{"type":"web_url","url":"https://webvwtrl.herokuapp.com/speedtest?ref=speed_test","messenger_extensions":true,"webview_height_ratio":"tall","fallback_url":"https://www98.verizon.com/SpeedTest/fb.html"},"buttons":[{"type":"web_url","url":"https://webvwtrl.herokuapp.com/speedtest?ref=speed_test","title":"Speed Test Tall","messenger_extensions":true,"webview_height_ratio":"tall"},{"type":"web_url","url":"https://webvwtrl.herokuapp.com/speedtest?ref=speed_test","title":"Speed Test Compact","messenger_extensions":true,"webview_height_ratio":"compact"},{"type":"web_url","url":"https://webvwtrl.herokuapp.com/speedtest?ref=speed_test","title":"Speed Test Full","messenger_extensions":true,"webview_height_ratio":"Full"}]}]}}}};
                                    var resobj2 = {"facebook":{"attachment":{"type":"template","payload":{"template_type":"generic","elements":[{"title":"Welcome to Verizon","image_url":"https://www98.verizon.com/vzssobot/content/verizon-logo-200.png","subtitle":"Entertainment","buttons":[{"type":"web_url","url":"https://www98.verizon.com/SpeedTest/fb2.html","title":"Speed Test Tall","webview_height_ratio":"tall","messenger_extensions":true,"fallback_url":"https://www98.verizon.com/SpeedTest/fb2.html"},{"type":"web_url","url":"https://www98.verizon.com/SpeedTest/fb2.html","title":"Speed Test Compact","webview_height_ratio":"compact","messenger_extensions":true,"fallback_url":"https://www98.verizon.com/SpeedTest/fb2.html"},{"type":"web_url","url":"https://www98.verizon.com/SpeedTest/fb2.html","title":"Speed Test Full","webview_height_ratio":"full","messenger_extensions":true,"fallback_url":"https://www98.verizon.com/SpeedTest/fb2.html"}]}]}}}};
                                    respobj = {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":"I hope so! If you ask me… Fios is pretty great! But either way, we’ll have a great TV, internet and phone option for you. Let’s check what’s available in your area. ","buttons":[{"type":"web_url","url":"https://www98.verizon.com/vzbot/vzbotproxy/deeplink?scn=FiosQualify","title":"Check for FIOS"}]}}}};
                                    sendFBMessage(SenderID, respobj.facebook, null);
                                    sendFBMessage(SenderID, resobj2.facebook, null);
                                }
                            }
                        }
                    });
                }
            })
          }, 250);
        }
        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        logger.debug("Error in post api.ai " + err);
        res.status(200).json({
            status: "ok"
        });
    }
});
doSubscribeRequest();
function sendFBMessage(sender, messageData, userCoversationArr) {
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        proxy: null,
        qs: { access_token: FB_PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function (error, response, body) {
         logger.debug('Error while sendFBMessage: ', error);
    });
}

function doSubscribeRequest() {
    request({
        method: 'POST',
        uri: "https://graph.facebook.com/v2.8/me/subscribed_apps?access_token=" + FB_PAGE_ACCESS_TOKEN,
        proxy: null
    },
        function (error, response, body) {
            if (error) {
                logger.debug('Error while subscription: ', error);
            } else {
                logger.debug('Subscription result: ', response.body);
            }
        });
}
