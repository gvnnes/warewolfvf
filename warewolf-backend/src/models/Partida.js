const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Partida = db.define('Partida', {
  fase: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  placarEquipe1: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  placarEquipe2: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  proximaPartidaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: 'Partidas',
        key: 'id'
    }
  },
  // CAMPOS QUE FALTAVAM
  dataHoraInicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dataHoraFim: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

module.exports = Partida;