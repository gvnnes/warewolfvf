const User = require('./User');
const Equipe = require('./Equipe');
const Atleta = require('./Atleta');
const Campeonato = require('./Campeonato');
const Inscricao = require('./Inscricao');
const Partida = require('./Partida');
const Modalidade = require('./Modalidade');
const Time = require('./Time');

// User <-> Equipe
User.hasOne(Equipe, { foreignKey: 'userId', onDelete: 'CASCADE' });
Equipe.belongsTo(User, { foreignKey: 'userId' });

// Equipe -> Atleta, Inscricao, Time
Equipe.hasMany(Atleta, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Atleta.belongsTo(Equipe, { foreignKey: 'equipeId' });
Equipe.hasMany(Inscricao, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Inscricao.belongsTo(Equipe, { foreignKey: 'equipeId' });
Equipe.hasMany(Time, { foreignKey: 'equipeId', onDelete: 'CASCADE' });
Time.belongsTo(Equipe, { foreignKey: 'equipeId' });

// Campeonato -> Inscricao, Time, Partida
Campeonato.hasMany(Inscricao, { foreignKey: 'campeonatoId', onDelete: 'CASCADE' });
Inscricao.belongsTo(Campeonato, { foreignKey: 'campeonatoId' });
Campeonato.hasMany(Time, { foreignKey: 'campeonatoId', onDelete: 'CASCADE' });
Time.belongsTo(Campeonato, { foreignKey: 'campeonatoId' });
Campeonato.hasMany(Partida, { as: 'partidas', foreignKey: 'campeonatoId', onDelete: 'CASCADE' });
Partida.belongsTo(Campeonato, { as: 'campeonato', foreignKey: 'campeonatoId' });

// Modalidade -> Inscricao, Time, Partida
Modalidade.hasMany(Inscricao, { foreignKey: 'modalidadeId', onDelete: 'CASCADE' });
Inscricao.belongsTo(Modalidade, { foreignKey: 'modalidadeId' });
Modalidade.hasMany(Time, { foreignKey: 'modalidadeId', onDelete: 'CASCADE' });
Time.belongsTo(Modalidade, { foreignKey: 'modalidadeId' });
Modalidade.hasMany(Partida, { as: 'partidas', foreignKey: 'modalidadeId', onDelete: 'CASCADE' });
Partida.belongsTo(Modalidade, { as: 'modalidade', foreignKey: 'modalidadeId' });

// Relações Muitos-para-Muitos
Campeonato.belongsToMany(Modalidade, { through: 'CampeonatoModalidades' });
Modalidade.belongsToMany(Campeonato, { through: 'CampeonatoModalidades' });
Time.belongsToMany(Atleta, { through: 'TimeAtletas' });
Atleta.belongsToMany(Time, { through: 'TimeAtletas' });

// Relações da Partida
Partida.belongsTo(Equipe, { as: 'equipe1', foreignKey: 'equipe1Id' });
Partida.belongsTo(Equipe, { as: 'equipe2', foreignKey: 'equipe2Id' });
Partida.belongsTo(Equipe, { as: 'vencedor', foreignKey: 'vencedorId' });
Partida.belongsTo(Partida, { as: 'proximaPartida', foreignKey: 'proximaPartidaId' });

console.log("Associações de modelos carregadas com sucesso.");