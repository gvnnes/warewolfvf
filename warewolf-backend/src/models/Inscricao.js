// src/models/Inscricao.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Inscricao = db.define('Inscricao', {
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente'
  }
});

module.exports = Inscricao;