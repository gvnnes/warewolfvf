// src/models/Time.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Time = db.define('Time', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex: Futsal Masculino, Vôlei Feminino A'
  }
});

module.exports = Time;