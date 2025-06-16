// src/models/associations.js

// 1. Importar todos os modelos
const User = require('./User');
const Equipe = require('./Equipe');
const Atleta = require('./Atleta');
const Campeonato = require('./Campeonato');
const Inscricao = require('./Inscricao');
const Partida = require('./Partida');
const Modalidade = require('./Modalidade');
const Time = require('./Time');

// 2. Definir todas as associações aqui

Equipe.hasMany(Time, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Time.belongsTo(Equipe, { foreignKey: 'equipeId' });

Campeonato.hasMany(Time, { foreignKey: 'campeonatoId' });
Time.belongsTo(Campeonato, { foreignKey: 'campeonatoId' });

Modalidade.hasMany(Time, { foreignKey: 'modalidadeId' });
Time.belongsTo(Modalidade, { foreignKey: 'modalidadeId' });

const TimeAtletas = 'TimeAtletas';
Time.belongsToMany(Atleta, { through: TimeAtletas });
Atleta.belongsToMany(Time, { through: TimeAtletas });
// User <-> Equipe (Um para Um)
User.hasOne(Equipe, { foreignKey: 'userId' });
Equipe.belongsTo(User, { foreignKey: 'userId' });

// Equipe <-> Atleta (Um para Muitos)
Equipe.hasMany(Atleta, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Atleta.belongsTo(Equipe, { foreignKey: 'equipeId' });

// Campeonato <-> Modalidade (Muitos para Muitos)
const CampeonatoModalidades = 'CampeonatoModalidades';
Campeonato.belongsToMany(Modalidade, { through: CampeonatoModalidades });
Modalidade.belongsToMany(Campeonato, { through: CampeonatoModalidades });

// Relações da Inscrição
Equipe.hasMany(Inscricao, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Inscricao.belongsTo(Equipe, { foreignKey: 'equipeId' });

Campeonato.hasMany(Inscricao, { foreignKey: 'campeonatoId' });
Inscricao.belongsTo(Campeonato, { foreignKey: 'campeonatoId' });

Modalidade.hasMany(Inscricao, { foreignKey: 'modalidadeId' });
Inscricao.belongsTo(Modalidade, { foreignKey: 'modalidadeId' });

// Relações da Partida
Partida.belongsTo(Equipe, { as: 'equipe1', foreignKey: 'equipe1Id' });
Partida.belongsTo(Equipe, { as: 'equipe2', foreignKey: 'equipe2Id' });
Partida.belongsTo(Equipe, { as: 'vencedor', foreignKey: 'vencedorId' });
Partida.belongsTo(Campeonato, { as: 'campeonato', foreignKey: 'campeonatoId' });
Partida.belongsTo(Modalidade, { as: 'modalidade', foreignKey: 'modalidadeId' });

console.log("Associações de modelos carregadas.");