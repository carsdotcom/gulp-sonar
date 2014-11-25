# gulp-sonar

Sonar for gulp

## Install

```
npm install --save-dev gulp-sonar
```

## Usage Example

```js
gulp.task('sonar', function () {
    var options = {
        sonar: {
            host: {
                url: 'http://localhost:9000'
            },
            jdbc: {
                url: 'jdbc:mysql://localhost:3306/sonar',
                username: 'sonar',
                password: 'sonar'
            },
            projectKey: 'sonar:my-project:1.0.0',
            projectName: 'My Project',
            projectVersion: '1.0.0',
            // comma-delimited string of source directories
            sources: 'src/app/js,src/libs/js',
            language: 'js',
            sourceEncoding: 'UTF-8',
            javascript: {
                lcov: {
                    reportPath: 'test/sonar_report/lcov.info'
                }
            }
        }
    };

    // gulp source doesn't matter, all files are referenced in options object above
    return gulp.src('thisFileDoesNotExist.js', { read: false })
        .pipe(sonar(options))
        .on('error', util.log);
});
```

## Credit

Inspired by [grunt-sonar-runner](https://github.com/skhatri/grunt-sonar-runner) by [Suresh Khatri](https://github.com/skhatri).
