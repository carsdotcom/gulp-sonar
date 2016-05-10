var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var exec = require('child_process').exec;
var os = require('os');
var format = require('util').format;
var properties = require('properties');

module.exports = function(opts) {
  // Constants
  var SONAR_VERSION = '2.6';
  var SONAR_SCANNER_HOME = path.join(__dirname, format('/sonar-scanner-%s', SONAR_VERSION));
  var SONAR_SCANNER_PROPERTIES_FILE = path.join(SONAR_SCANNER_HOME, '/conf/sonar-scanner.properties');
  var SONAR_SCANNER_COMMAND = 'sh ' + SONAR_SCANNER_HOME + '/bin/sonar-scanner' + ' -Dproject.settings=' + SONAR_SCANNER_PROPERTIES_FILE;

  // Combine with default options
  opts = _.extend({
    sonar: {
      sourceEncoding: 'UTF-8',
      host: {
        url: 'http://localhost:9000'
      }
    }
  }, opts ||  {});

  // Convert object to JAVA properties array
  function objectToProps(obj, result, prefix, o, prop) {
    obj = (typeof obj === 'object') ? obj : {};
    result = (typeof result === 'object' && typeof result.length === 'number') ? result : [];
    prefix = (typeof prefix === 'string' && prefix.length) ? prefix + '.' : '';

    for (o in obj) {
      if (obj.hasOwnProperty(o)) {
        prop = prefix + o;
        if (typeof obj[o] === 'string') {
          result.push(prop + '=' + obj[o]);
        } else if (typeof obj[o] === 'object') {
          result = objectToProps(obj[o], result, prop);
        }
      }
    }

    return result;
  }

  function write(file, encoding, callback) {
    // Do nothing with source ... not needed
    callback();
  }

  function flush(callback) {
    var props;
    var process;
    var execProps;

    execProps = opts.sonar.exec;

    // This property is not for the sonar runner, but for the nodejs exec method, so we remove it after copied it
    delete opts.sonar.exec;

    // Convert options to array of properties
    props = objectToProps(opts);

    fs.writeFile(SONAR_SCANNER_PROPERTIES_FILE, props.join(os.EOL), function(err) {
      if (err) {
        throw new PluginError('gulp-sonar', format('Error writing properties file: %d.', err));
      } else {
        process = exec(SONAR_SCANNER_COMMAND, execProps, function() {});

        process.stdout.on('data', function(c) {
          gutil.log(c);
        });

        process.stderr.on('data', function(c) {
          gutil.log(c);
        });

        process.on('exit', function(code) {
          if (code !== 0) {
            gutil.log(format('Return code: %d.', code));
            throw new PluginError('gulp-sonar', format('Return code: %d.', code));
          }

          gutil.log(format('Return code: %d.', code));
          callback();
        });
      }
    });
  }

  return through.obj(write, flush);
};
