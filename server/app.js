import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URI:", process.env.DATABASE_URI);

import conf from './conf/conf'
import express from './conf/lib/express'
import mongoose from './conf/lib/mongoose'
import chalk from 'chalk'

const SERVER_URI = `${conf.app.protocol}://${conf.app.host}:${conf.app.port}`

/************************************************
 * Connect mongoose
 ************************************************/
mongoose.loadModels()
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false, // Disable auto index creation
})
.then(db => {
  console.log("MongoDB Connected Successfully");
  initApp(express(db));
})
.catch(err => {
  console.error("MongoDB Connection Error:", err.message);
  process.exit(1);
});

/************************************************
 * Init application
 ************************************************/
function initApp(app) {
  app.listen(conf.app.port, conf.app.host)
  console.log('--')
  console.log(chalk.green(conf.app.title))
  console.log(chalk.green(`Environment:         ${process.env.NODE_ENV}`))
  console.log(chalk.green(`Server:              ${SERVER_URI}`))
  console.log(chalk.green(`Database:            ${conf.db.uri}`))
  console.log(chalk.green(`App version:         ${conf.app.version}`))
  console.log('--')
}