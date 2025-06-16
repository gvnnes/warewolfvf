// src/models/Modalidade.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Modalidade = db.define('Modalidade', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  minAtletas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  maxAtletas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  duracaoMinutos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
  }
});

module.exports = Modalidade;