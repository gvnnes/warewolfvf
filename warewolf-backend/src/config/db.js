const { Sequelize } = require('sequelize');

// DEBUG: verifique se a variável está sendo lida corretamente
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

module.exports = sequelize;
