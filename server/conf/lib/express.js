import conf from '../conf';
import express from 'express';
import morgan from 'morgan';
import logger from './logger';
import bodyParser from 'body-parser';
import session from 'express-session';
import compress from 'compression';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import flash from 'connect-flash';
import path from 'path';
import _ from 'lodash';
import socketio from './socket.io';
import lusca from 'lusca';
import fs from 'fs';
import chalk from 'chalk';
import cors from 'cors';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import multer from 'multer';
import FileController from '../../modules/file/controller'

// Initialize GridFS
const conn = mongoose.connection;
let gfs;

const MongoStore = require('connect-mongo')(session);
const isProduction = process.env.NODE_ENV === 'production';

// Initialize multer upload settings
const upload = multer({
  dest: 'uploads/', // specify destination folder
  limits: { fileSize: 10000000 }, // 10MB size limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// Middleware to enable CORS
const allowCrossDomain = cors({
  origin: ['https://moser-family.onrender.com', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
});

// Initialize Express App
const app = express();

/*********************************************
 * Validate certs exit (if secure.ssl)
 *********************************************/
function initSSLValidation() {
  if (!conf.secure.ssl) return true;

  const privateKey = fs.existsSync(path.resolve(conf.secure.privateKey));
  const certificate = fs.existsSync(path.resolve(conf.secure.certificate));

  if (!privateKey || !certificate) {
    console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
    console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
    console.log();
    conf.secure.ssl = false;
  }
}

/*********************************************
 * Initialize session
 *********************************************/
function initSession(app, db) {
  const sessionConfig = session({
    saveUninitialized: true,
    resave: true,
    secret: conf.sessionSecret,
    cookie: {
      maxAge: conf.sessionCookie.maxAge,
      httpOnly: conf.sessionCookie.httpOnly,
      secure: conf.sessionCookie.secure
    },
    name: conf.sessionKey,
    store: new MongoStore({
      mongooseConnection: db.connection,
      collection: conf.sessionCollection
    })
  });
  app.use(sessionConfig);
  app.use(lusca(conf.csrf));

  return sessionConfig;
}

/*********************************************
 * Initialize local variables
 *********************************************/
function initLocalVariables(app) {
  const { title, description } = conf.app;
  const { secure, livereload } = conf;

  // Setting application local variables
  app.locals = {
    title,
    description,
    secure: secure && secure.ssl,
    livereload,
    env: process.env.NODE_ENV
  };

  // Passing the request url to environment locals
  app.use((req, res, next) => {
    res.locals.host = `${req.protocol}://${req.hostname}`;
    res.locals.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    next();
  });
}

/*********************************************
 * Initialize application middleware
 *********************************************/
function initMiddleware(app) {
  app.use(allowCrossDomain);
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.send();
  });

  conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('fs'); // Default GridFS collection name
  });

  app.use(compress({
    filter: (req, res) => (/json|text|javascript|typescript|css|font|svg/).test(res.getHeader('Content-Type')),
    level: 9
  }));

  // Enable logger (morgan) if enabled in the configuration file
  app.use(morgan(logger.getLogFormat(), logger.getMorganOptions()));

  // Body parsers
  app.use(bodyParser.json({ limit: '150mb' }));
  app.use(bodyParser.urlencoded({ limit: '150mb', extended: true, parameterLimit: 50000 }));

  app.use(methodOverride());
  app.use(cookieParser(conf.sessionSecret));
  app.use(flash());
}

/*********************************************
 * Initialize express routes for media
 *********************************************/
app.get('/api/media/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.contentType.startsWith('image') || file.contentType.startsWith('video')) {
      res.set('Content-Type', file.contentType);
      const readStream = gfs.createReadStream({ _id: file._id });
      readStream.pipe(res);
    } else {
      res.status(400).json({ error: 'Not a media file' });
    }
  });
});

// Route for file upload
app.post('/api/file/upload', upload.single('file'), async (req, res) => {
  try {
    const results = await FileController.upload(req);
    res.status(200).send(results);
  } catch (e) {
    console.error('Error uploading file:', e);
    res.status(400).json({ error: 'File upload failed', message: e.message });
  }
});

// Route to delete file by ID
app.delete('/api/file/delete/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.session;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await FileController.delete(id, token);
    res.status(200).send(results);
  } catch (e) {
    console.error(`Error deleting file with ID ${id}:`, e);
    res.status(400).json({ error: 'Failed to delete file', message: e.message });
  }
});

// Initialize Helmet headers for security
function initHelmetHeaders(app) {
  const SIX_MONTHS = 15778476000;
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
}

/*********************************************
 * Initialize the Express application
 *********************************************/
export default (db) => {
  const sessionConfig = initSession(app, db);
  initSSLValidation();
  initLocalVariables(app);
  initMiddleware(app);
  initHelmetHeaders(app);

  return socketio(app, sessionConfig);
};
