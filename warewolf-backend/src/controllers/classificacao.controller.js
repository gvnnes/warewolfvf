const Partida = require('../models/Partida');
const Equipe = require('../models/Equipe');
const sequelize = require('../config/db');
const { Op } = require('sequelize'); // Importe o Op

// Função para calcular a classificação de forma mais segura
const calcularClassificacao = async (filtroPartida = {}) => {
  // 1. Contar as vitórias de cada equipe
  const contagemVitorias = await Partida.findAll({
    where: { ...filtroPartida, vencedorId: { [Op.ne]: null } },
    attributes: [
      'vencedorId',
      [sequelize.fn('COUNT', sequelize.col('vencedorId')), 'totalVitorias'],
    ],
    group: ['vencedorId'],
  });

  if (contagemVitorias.length === 0) {
    return []; // Retorna lista vazia se não houver vencedores
  }
  
  // 2. Buscar os dados das equipes vencedoras
  const equipeIds = contagemVitorias.map(v => v.vencedorId);
  const equipes = await Equipe.findAll({
    where: { id: { [Op.in]: equipeIds } },
    attributes: ['id', 'nome'],
  });
  
  // Mapeia os nomes para os IDs para fácil acesso
  const mapaEquipes = equipes.reduce((map, equipe) => {
    map[equipe.id] = equipe.nome;
    return map;
  }, {});

  // 3. Montar o objeto final da classificação
  const classificacao = contagemVitorias.map(item => ({
    equipeId: item.vencedorId,
    equipeNome: mapaEquipes[item.vencedorId],
    vitorias: parseInt(item.dataValues.totalVitorias, 10),
    pontos: parseInt(item.dataValues.totalVitorias, 10) * 3,
  }));

  // Ordena por pontos e depois por nome
  classificacao.sort((a, b) => {
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos;
    }
    return a.equipeNome.localeCompare(b.equipeNome);
  });
  
  // Adiciona a posição
  return classificacao.map((item, index) => ({ ...item, posicao: index + 1 }));
};

// Retorna o ranking geral
exports.listarGeral = async (req, res) => {
  try {
    const classificacao = await calcularClassificacao();
    res.json(classificacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar classificação geral: ' + err.message });
  }
};

// Retorna o ranking por modalidade específica
exports.listarPorModalidade = async (req, res) => {
  try {
    const { modalidadeId } = req.params;
    const classificacao = await calcularClassificacao({ modalidadeId });
    res.json(classificacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar classificação por modalidade: ' + err.message });
  }
};