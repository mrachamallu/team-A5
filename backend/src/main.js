const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config');
const dotenv = require('dotenv').config({path:__dirname+'/.env'})

const {PostgresDB} = require('./db/postgres');
const {UserRepo} = require('./models/user/postgres');
const {UserModel} = require('./models/user');
const {UserController} = require('./controllers/user');
const {ItemRepo} = require('./models/item/postgres');
const {ItemModel} = require('./models/item');
const {ItemController} = require('./controllers/item');
const {AdminController} = require('./controllers/admin')

const {AuthService} = require('./services/auth')
const {RaffleService} = require('./services/raffle')

function start(port) {
  const postgres = PostgresDB(config.database);

  const userRepo = UserRepo(postgres);
  userRepo.setupRepo();

  const userModel = UserModel(userRepo);

  const authService = AuthService(userModel); 
  const userController = UserController(userModel, authService);
  
  const itemRepo = ItemRepo(postgres);
  itemRepo.setupRepo();
  const itemModel = ItemModel(itemRepo);
  const itemController = ItemController(itemModel, userModel, authService);

  const raffleService = RaffleService(itemModel, userModel);

  const adminController = AdminController(userModel, itemModel, raffleService);


  const app = express();
  app.disable('x-powered-by');
  app.use(compression());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: ['http://localhost:3000'],
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(bodyParser.json());

  const router = express.Router();
  router.use('/users', userController);
  router.use('/items', itemController);
  router.use('/admin', adminController);

  app.use('/api', router);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

start(config.port);
