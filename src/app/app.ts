/// <reference path="../typings/globals/node/index.d.ts"/>
/// <reference path="../typings/modules/express/index.d.ts"/>
/// <reference path="../typings/modules/bluebird/index.d.ts"/>
import 'source-map-support/register';
import express = require('express');
import bluebird = require('bluebird');

global.Promise = bluebird;

let app = express();