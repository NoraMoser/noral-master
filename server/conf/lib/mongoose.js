import conf from '../conf'
import chalk from 'chalk'
import path from 'path'
import mongoose from 'mongoose'

function mongooseConf() {}
const MONGO_URI = 'mongodb://NoraMoser:fGUWlPJwU4G8EZPX@cluster0-shard-00-01.kriuc.mongodb.net:27017,cluster0-shard-00-02.kriuc.mongodb.net:27017,cluster0-shard-00-00.kriuc.mongodb.net:27017/nora-dev?authSource=admin&replicaSet=atlas-9biaq2-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true';
/************************************************
 * Load the mongoose models
 ************************************************/
mongooseConf.loadModels = (callback) => {
  conf.assets.models.forEach(modelPath => {
    require(path.join(process.cwd(), modelPath))
  })

  if (callback) { callback() }
}


/************************************************
 * Initialize mongoose
 ************************************************/
mongooseConf.connect = async () => {
  try {
    const db = await mongoose.connect(MONGO_URI, conf.db.options)
    return db
  } 
  catch(err) {
    console.error(chalk.red('Could not connect to MongoDB!'))
    console.log(err)
  }
}


/************************************************
 * Handle mongoose disconnect
 ************************************************/
mongooseConf.disconnect = (cb) => {
  mongoose.disconnect((err) => {
    console.info(chalk.yellow('Disconnected from MongoDB.'))
    cb(err)
  })
}

export default mongooseConf
