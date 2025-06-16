// src/models/Atleta.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Atleta = db.define('Atleta', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  curso: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  situacao: {
    type: DataTypes.ENUM('acadêmico', 'graduado', 'ed. eternum', 'não vinculado'),
    allowNull: false,
  },
  documentoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statusDocumento: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'reprovado'),
    defaultValue: 'pendente'
  },
  comentarioReprovacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Atleta;