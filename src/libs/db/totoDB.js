const { Sequelize } = require('sequelize');
require('dotenv').config();

class TotoDB { 
  constructor() {
    this.sequelize = new Sequelize(
      process.env.TOTORO_DATABASE, // Database name
      process.env.TOTORO_USERNAME, // Username
      process.env.TOTORO_PASSWORD, // Password
      {
        host: process.env.TOTORO_HOST, // Host
        port: process.env.TOTORO_PORT, // Port
        dialect: 'mysql', // Specify the dialect here
        logging: `${process.env.TOTORO_LOGGING}` === 'true' ? console.log : false,
      }
    );
  }

  isConnected() {
    return this.sequelize.authenticate();
  }
}

module.exports = TotoDB;
