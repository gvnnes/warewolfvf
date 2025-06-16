const Partida = require('../models/Partida');
const Equipe = require('../models/Equipe');
const Campeonato = require('../models/Campeonato');
const Modalidade = require('../models/Modalidade');
const sequelize = require('../config/db');

exports.criar = async (req, res) => {
  try {
    const { equipe1Id, equipe2Id, fase, campeonatoId, modalidadeId } = req.body;
    if (!campeonatoId || !equipe1Id || !equipe2Id || !fase || !modalidadeId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const partida = await Partida.create({ equipe1Id, equipe2Id, fase, campeonatoId, modalidadeId });
    res.status(201).json(partida);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listar = async (req, res) => {
  try {
    // Linha de depuração para vermos o que chega
    console.log('Filtros recebidos no backend:', req.query);

    const { campeonatoId, modalidadeId } = req.query;
    const whereClause = {};
    if (campeonatoId) whereClause.campeonatoId = campeonatoId;
    if (modalidadeId) whereClause.modalidadeId = modalidadeId;

    const partidas = await Partida.findAll({
      where: whereClause,
      include: [
        { model: Equipe, as: 'equipe1', attributes: ['id', 'nome', 'logo'] },
        { model: Equipe, as: 'equipe2', attributes: ['id', 'nome', 'logo'] },
        { model: Equipe, as: 'vencedor', attributes: ['id', 'nome'] },
        { model: Campeonato, as: 'campeonato', attributes: ['nome'] },
        { model: Modalidade, as: 'modalidade', attributes: ['nome'] }
      ],
      order: [['id', 'ASC']]
    });
    res.json(partidas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Em src/controllers/partida.controller.js
exports.atualizar = async (req, res) => {
  try {
    const partida = await Partida.findByPk(req.params.id);
    if (!partida) return res.status(404).json({ error: 'Partida não encontrada' });

    const { placarEquipe1, placarEquipe2 } = req.body;
    const p1 = parseInt(placarEquipe1, 10);
    const p2 = parseInt(placarEquipe2, 10);
    let vencedorId = null;

    if (!isNaN(p1) && !isNaN(p2)) {
        if (p1 > p2) vencedorId = partida.equipe1Id;
        else if (p2 > p1) vencedorId = partida.equipe2Id;
    }
    
    await partida.update({ placarEquipe1: p1, placarEquipe2: p2, vencedorId });

    // LÓGICA DE AVANÇO AUTOMÁTICO
    if (vencedorId && partida.proximaPartidaId) {
        const proximaPartida = await Partida.findByPk(partida.proximaPartidaId);
        if (proximaPartida) {
            // Verifica se a vaga de equipe1 está livre para inserir o vencedor
            if (!proximaPartida.equipe1Id) {
                await proximaPartida.update({ equipe1Id: vencedorId });
            } else { // Se não, insere na vaga de equipe2
                await proximaPartida.update({ equipe2Id: vencedorId });
            }
        }
    }

    res.json(partida);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obterPorId = async (req, res) => {
    try {
        const partida = await Partida.findByPk(req.params.id, {
            include: [
                { model: Equipe, as: 'equipe1', attributes: ['id', 'nome', 'logo'] },
                { model: Equipe, as: 'equipe2', attributes: ['id', 'nome', 'logo'] },
                { model: Equipe, as: 'vencedor', attributes: ['id', 'nome'] },
                { model: Campeonato, as: 'campeonato', attributes: ['nome'] },
                { model: Modalidade, as: 'modalidade', attributes: ['nome'] }
            ]
        });
        if (!partida) {
            return res.status(404).json({ error: 'Partida não encontrada.' });
        }
        res.json(partida);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar detalhes da partida.' });
    }
};