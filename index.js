var fs = require('fs'),
    path = require('path'),
    through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    exec = require('child_process').exec,
    os = require('os'),
    format = require('util').format;

module.exports = function (options) {
    var SONAR_VERSION,
        SONAR_RUNNER_HOME,
        SONAR_RUNNER_JAR,
        SONAR_RUNNER_COMMAND,
        write,
        flush;

    SONAR_VERSION = "2.4";
    SONAR_RUNNER_HOME = path.join(__dirname, format('/sonar-runner-%s', SONAR_VERSION));
    SONAR_RUNNER_JAR = format('/lib/sonar-runner-dist-%s.jar', SONAR_VERSION);
    SONAR_RUNNER_COMMAND = 'java -jar ' + path.join(SONAR_RUNNER_HOME, SONAR_RUNNER_JAR) + ' -X -Drunner.home=' + SONAR_RUNNER_HOME;

    write = function (file, enc, cb) {
        // do nothing with source ... not needed
        cb();
    };

    flush = function (cb) {
        var props,
            process;

        options = (typeof options === 'object') ? options : { sonar: {} };
        options.sonar.language = options.sonar.language;
        options.sonar.sourceEncoding = options.sonar.sourceEncoding || 'UTF-8';
        options.sonar.host = options.sonar.host || { url: 'http://localhost:9000' };
        options_exec = options.sonar.exec;
        // This property is not for the sonar runner, but for the nodejs exec method, so we remove it after copied it
        delete options.sonar.exec;

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

        props = objectToProps(options);

        fs.writeFile(path.join(SONAR_RUNNER_HOME, '/conf/sonar-runner.properties'), props.join(os.EOL), function (err) {
            if (err) {
                throw new PluginError('gulp-sonar', format('Error writing properties file: %d.', err));
            } else {
                process = exec(SONAR_RUNNER_COMMAND, options_exec, function () {});
                process.stdout.on('data', function (c) {
                    gutil.log(c);
                });
                process.stderr.on('data', function (c) {
                    gutil.log(c);
                });
                process.on('exit', function (code) {
                    if (code !== 0) {
                        gutil.log(format('Return code: %d.', code));
                        throw new PluginError('gulp-sonar', format('Return code: %d.', code));
                    }
                    gutil.log(format('Return code: %d.', code));
                    cb();
                });
            }
        });

    };

    return through.obj(write, flush);

};
