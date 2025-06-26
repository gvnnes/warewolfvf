const { Op } = require('sequelize');
const Equipe = require('../models/Equipe');
const Inscricao = require('../models/Inscricao');
const Campeonato = require('../models/Campeonato');
const Modalidade = require('../models/Modalidade');
const Partida = require('../models/Partida');
const Time = require('../models/Time');

// --- Funções para a Equipe gerenciar a si própria ---

exports.criarOuAtualizar = async (req, res) => {
  try {
    const userId = req.userId;
    const existente = await Equipe.findOne({ where: { userId } });
    const { nome, sigla, cnpj, instituicao, endereco, cep, representanteNome, representanteRG, representanteCPF, representanteOrgaoExp, representanteEndereco, representanteCEP, logo, historia } = req.body;
    const dadosEquipe = { nome, sigla, cnpj, instituicao, endereco, cep, representanteNome, representanteRG, representanteCPF, representanteOrgaoExp, representanteEndereco, representanteCEP, logo, historia, userId };
    let equipe;
    if (existente) {
      await existente.update(dadosEquipe);
      equipe = existente;
    } else {
      equipe = await Equipe.create(dadosEquipe);
    }
    res.status(201).json(equipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obter = async (req, res) => {
  try {
    const equipe = await Equipe.findOne({ where: { userId: req.userId } });
    if (!equipe) {
      return res.json(null);
    }
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.minhasInscricoes = async (req, res) => {
    try {
        const equipe = await Equipe.findOne({ where: { userId: req.userId } });
        if (!equipe) {
            return res.status(403).json({ error: 'Nenhuma equipe encontrada para este usuário.' });
        }
        const inscricoes = await Inscricao.findAll({
            where: { equipeId: equipe.id },
            include: [
                { model: Campeonato, attributes: ['id', 'nome'] },
                { model: Modalidade, attributes: ['id', 'nome', 'minAtletas', 'maxAtletas'] }
            ]
        });
        res.json(inscricoes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo de logo enviado.' });
        }
        const equipe = await Equipe.findOne({ where: { userId: req.userId } });
        if (!equipe) {
            return res.status(404).json({ error: 'Equipe não encontrada para este usuário.' });
        }
        const logoUrl = `/files/${req.file.filename}`;
        await equipe.update({ logo: logoUrl });
        const equipeAtualizada = await Equipe.findByPk(equipe.id);
        res.json({ message: 'Logo atualizado com sucesso!', equipe: equipeAtualizada });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.proximaPartida = async (req, res) => {
    try {
        const equipe = await Equipe.findOne({ where: { userId: req.userId } });
        if (!equipe) return res.json(null);

        const proximaPartida = await Partida.findOne({
            where: {
                [Op.or]: [{ equipe1Id: equipe.id }, { equipe2Id: equipe.id }],
                vencedorId: null
            },
            include: [
                { model: Equipe, as: 'equipe1', attributes: ['nome'] },
                { model: Equipe, as: 'equipe2', attributes: ['nome'] },
                { model: Campeonato, as: 'campeonato', attributes: ['nome'] },
                { model: Modalidade, as: 'modalidade', attributes: ['nome'] }
            ],
            order: [['id', 'ASC']]
        });
        res.json(proximaPartida);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar próxima partida.' });
    }
};

// --- Funções para a Comissão gerenciar TODAS as equipes ---

exports.listarTodas = async (req, res) => {
  try {
    const equipes = await Equipe.findAll({ order: [['nome', 'ASC']] });
    res.json(equipes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar todas as equipes.' });
  }
};

exports.obterPorId = async (req, res) => {
  try {
    const equipe = await Equipe.findByPk(req.params.id);
    if (!equipe) {
      return res.status(404).json({ error: 'Equipe não encontrada.' });
    }
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar equipe por ID.' });
  }
};

exports.atualizarPorId = async (req, res) => {
  try {
    const equipe = await Equipe.findByPk(req.params.id);
    if (!equipe) {
      return res.status(404).json({ error: 'Equipe não encontrada.' });
    }
    await equipe.update(req.body);
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar equipe.' });
  }
};

exports.removerPorId = async (req, res) => {
  try {
    const equipe = await Equipe.findByPk(req.params.id);
    if (!equipe) {
      return res.status(404).json({ error: 'Equipe não encontrada.' });
    }
    await equipe.destroy();
    res.json({ message: 'Equipe removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover equipe.' });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['ativo', 'desclassificado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const equipe = await Equipe.findByPk(req.params.id);
    if (!equipe) {
      return res.status(404).json({ error: 'Equipe não encontrada.' });
    }
    await equipe.update({ status });
    res.json({ message: `Status da equipe atualizado para ${status}.`, equipe });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status da equipe.' });
  }
};