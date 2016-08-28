/// <reference path="../typings/index.d.ts"/>
import 'source-map-support/register';
import express = require('express');
import bluebird = require('bluebird');
import morgan = require('morgan');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');

let app = express();

/** Logger functions */
app.use(morgan('dev'));

/** View engine: Pug */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/** Body parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

/** Cookie parser */
app.use(cookieParser());

/** Static files */
app.use(express.static(path.join(__dirname, 'public')));

/** Local variables */
app.use((req: express.Request, res: express.Response, next: Function) => {
	if (app.get('env') === 'development') res.locals.pretty = true;
	next();
});

/** Routes */
import indexRouter = require('./routes/index');
app.use('/', indexRouter);

/** Catch 404 and server bugs */
app.use((req: express.Request, res: express.Response, next: Function) => {
	let err = new Error('Not found');
	res.status(404);
	next(err);
});

{
	let handler = (err: Error, req: express.Request, res: express.Response, next: Function, includeStackTrace: boolean) => {
    res.status(res.statusCode || 500);
    res.render('error', {
      message: err.message,
      error:   includeStackTrace ? err : {}
    });
  };
	if (app.get('env') === 'development') {
		app.use((err: Error, req: express.Request, res: express.Response, next: Function) => {
			return handler(err, req, res, next, true);
		});
	} else {
		app.use((err: Error, req: express.Request, res: express.Response, next: Function) => {
			return handler(err, req, res, next, false);
		});
	}
}

export = app;