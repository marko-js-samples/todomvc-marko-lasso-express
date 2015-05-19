

var fs = require('fs');
var path = require('path');



// process.chdir(path.join(__dirname, '../'));

var spawn = require('child_process').spawn;

require('app-module-path').addPath(path.join(__dirname, '../../'));

require('marko/hot-reload').enable();

var lasso = require('lasso');

var outputDir = path.join(__dirname, 'generated');
var cacheDir = path.join(__dirname, '../.cache');
var rootDir = path.join(__dirname, '../../');

try {
    fs.mkdirSync(outputDir);
} catch(e) {
    // Ignore the error if the directory already exists
}

var args = require('raptor-args').createParser({
        '--watch': 'boolean'
    })
    .parse();

require('lasso').configure({
    outputDir: path.join(outputDir, 'static'),
    plugins: [
        'lasso-marko',
        'lasso-less'
    ],
    urlPrefix: './static',
    fingerprintsEnabled: false,
    bundlingEnabled: false
});

var running = false;
var fileModified = false;

function run() {
    console.log('Preparing client-side tests...');

    running = true;
    fileModified = false;

    var pageTemplate;
    try {
        pageTemplate = require('marko').load(require.resolve('./test-page.marko'));
    } catch(e) {
        console.error(e);
        throw e;
    }

    var pageHtmlFile = path.join(outputDir, 'test-page.html');

    console.log('Output HTML file: ' + path.relative(process.cwd(), pageHtmlFile));

    var out = fs.createWriteStream(pageHtmlFile, 'utf8');
    pageTemplate.render({
        }, out)
        .on('finish', function() {
            console.log('Running client tests using mocha-phantomjs...');
            spawn(
                'npm',
                ['run', 'mocha-phantomjs', '--loglevel=silent'],
                {
                    cwd: rootDir,
                    stdio: 'inherit'
                })
                .on('close', function (code) {
                    running = false;

                    if (args.watch === true) {
                        if (fileModified) {
                            run();
                        }
                    } else {
                        console.log('Exit code: ' + code);
                        process.exit(code);
                    }
                });
        });
}

run();

if (args.watch === true) {
    require('ignoring-watcher').createWatcher({
            // Directory to watch. Defaults to process.cwd()
            dir: rootDir,

            // One or more ignore patterns
            ignorePatterns: [
                'node_modules',
                '.cache',
                '.*',
                '*.marko.js',
                'npm-debug.log',
                'generated'
            ]
        })
        .on('ready', function(eventArgs) {
            // console.log('Watching: ' + eventArgs.dirs.join(', '));
            // console.log('Ignore patterns:\n  ' + eventArgs.ignorePatterns.join('  \n'));
        })
        .on('modified', function(eventArgs) {
            var path = eventArgs.path;

            if (path.startsWith(outputDir)) {
                return;
            } else if (path.startsWith(cacheDir)) {
                return;
            } else if (path.endsWith('.log')) {
                return;
            }


            require('marko/hot-reload').handleFileModified(eventArgs.path);
            lasso.handleWatchedFileChanged(eventArgs.path);
            console.log('[todomvc-marko] File modified: ' + eventArgs.path);

            if (running) {
                fileModified = true;
            } else {
                run();
            }
        })
        .startWatching();

}