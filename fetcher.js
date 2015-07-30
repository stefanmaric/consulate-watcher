var request = require('request').defaults({ jar: true, strictSSL: false });
var cheerio = require('cheerio');
var moment  = require('moment');
var async   = require('async');
var vm      = require('vm');

module.exports = fetch;

function fetch(urls, cb) {
  fetchCountries(urls.country, function(err, data) {
    if (err) return cb(err);
    fetchConsulates(urls.consulate, data, function(err, data) {
      if (err) return cb(err);
      fetchAvailableDates(urls.agenda, data, function(err, data) {
        if (err) return cb(err);
        cb(null, data);
      });
    });
  });
}

function fetchCountries(url, cb) {
  request.post({
    url: url,
    form: { untramite: 'RES' }
  },  function(err, httpResponse, bodyString) {
        if (err) return cb(err);

        var $;
        var countryOptions = [];

        try {
          $ = cheerio.load(bodyString, { xmlMode: true });
        } catch (error) {
          err.bodyString = bodyString;
          return cb(error);
        }

        $('option').each(function (i, el) {
          el = $(el);
          /*
          Intentional use of coercion, for values like `'0'`
           */
          if (el.val() != false) {
            countryOptions.push({
              countryCode: el.val(),
              countryName: el.text()
            });
          }
        });

        return cb(null, countryOptions);
  });
}

function fetchConsulates(url, countries, cb) {
  async.map(countries, bridge, function(err, consulates) {
    if (err) return cb(err);
    return cb(null, [].concat.apply([], consulates));
  });

  function bridge(country, cb) {
    getCountryCounsulates(url, country, cb);
  }
}

function getCountryCounsulates(url, country, cb) {
  request.post({
    url: url,
    form: { untramite: 'RES', unpais: country.countryCode }
  },  function(err, httpResponse, bodyString) {
        if (err) return cb(err);

        var $;
        var consulateOptions = [];

        try {
          $ = cheerio.load(bodyString, { xmlMode: true });
        } catch (error) {
          err.bodyString = bodyString;
          return cb(error);
        }

        $('option').each(function (i, el) {
          el = $(el);
          /*
          Intentional use of coercion, for values like `'0'`
           */
          if (el.val() != false) {
            consulateOptions.push({
              consulateCode: el.val(),
              consulateName: el.text(),
              countryCode: country.countryCode,
              countryName: country.countryName
            });
          }
        });
        return cb(null, consulateOptions);
  });
}

function fetchAvailableDates(url, consulates, cb) {
  async.map(consulates, bridge, function(err, dates) {
    if (err) return cb(err);
    return cb(null, dates);
  });


  function bridge(consulate, cb) {
    getConsulateAvailableDates(url, consulate, cb);
  }
}

function getConsulateAvailableDates(url, consulate, cb) {
  /*
  Isolated cookies for each consulate request
   */
  var jar = request.jar();
  /*
  Start today
   */
  var currentDate = moment();

  request.get({
    url: url,
    qs: { recurso: 'RES', agenda: consulate.consulateCode },
    jar: jar
  },  function(err, httpResponse, bodyString) {
        if (err) return cb(err);
        paginateCalendar(url, consulate, currentDate, jar, 3, cb);
  });
}

function paginateCalendar(url, consulate, currentDate, jar, maxEmptyMonths, cb) {
  consulate.freeDays = consulate.freeDays || [];
  consulate.busyDays = consulate.busyDays || [];

  request.post({
    url: url,
    form: {
      AJAXREQUEST: '_viewRoot',
      form: 'form',
      j_id42: 'RES',
      calendarioInputDate: '',
      calendarioInputCurrentDate: currentDate.format('MM/YYYY'),
      'javax.faces.ViewState': 'j_id1',
      form_link_hidden_:"calendario",
      calendario:"calendario",
      ajaxSingle:"calendario",
      calendarioPreloadCurrentDate:"true"
    },
    jar: jar
  },  function(err, httpResponse, bodyString) {
        if (err) return cb(err);

        var $;
        var jsString;
        var monthData;
        var freeDays;
        var busyDays;

        try {
          $ = cheerio.load(bodyString, { xmlMode: true });
        } catch (error) {
          err.bodyString = bodyString;
          return cb(error);
        }

        jsString = $('#_ajax\\:data').html().replace(/<\!\[CDATA\[(.*?)\]\]>/, '$1');

        try {
          monthData = vm.runInThisContext('localVar = ' + jsString +';');
        } catch (error) {
          err.bodyString = bodyString;
          return cb(error);
        }

        monthData.days.forEach(function(el, i) {
          el.date = moment([currentDate.year(), currentDate.month(), i + 1]);
        });

        freeDays = monthData.days.filter(function (el) { return el.styleClass === 'diaConCupo'; });
        busyDays = monthData.days.filter(function (el) { return el.styleClass === 'diaSinCupo'; });

        consulate.freeDays = consulate.freeDays.concat(freeDays);
        consulate.busyDays = consulate.busyDays.concat(busyDays);

        if (freeDays.length + busyDays.length === 0) { maxEmptyMonths--; }

        if (!maxEmptyMonths) {
          return cb(null, consulate);
        } else {
          paginateCalendar(url, consulate, currentDate.add(1, 'months'), jar, maxEmptyMonths, cb);
        }
  });
}
