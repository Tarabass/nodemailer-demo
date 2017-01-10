var express = require('express');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var fileMorgan = require('file-morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var settingsRouter = require('./routes/settings');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(fileMorgan('common', {
	watchFiles: true,
	useStreamRotator: true,
	dateFormat: 'DDMMYYYY',
	fileName: 'errors.log',
	directory: 'logfiles'/*,
	 skip: function(req, res) {
	 return res.statusCode < 200
	 },
	 immediate: true,
	 useStreamRotator: true,
	 dateFormat: 'DDMMYYYY',
	 file: __dirname + '/logs/error-production.log'*/
}));
fileMorgan.on('change', function(path, stats) {
	console.log('File ' + path + ' changed size to ' + stats.size)
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // compress all requests
app.use(require('node-sass-middleware')({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	indentedSyntax: true,
	sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

// flash messages using connect-flash icw express-messages
app.use(cookieSession({
	secret: 'books',
	cookie: {
		maxAge: 3600000,
		httpOnly: true
	}
}));
app.use(flash());
app.use(function(req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});
// eo flash messages using connect-flash icw express-messages

app.use('/', indexRouter);
app.use('/settings', settingsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;