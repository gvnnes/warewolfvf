const express = require('express');
const router = express.Router();
const Equipe = require('../models/Equipe');
const Atleta = require('../models/Atleta');
const Partida = require('../models/Partida');
const { Op } = require('sequelize');

// ✅ Listar todas as equipes públicas (corrigido)
router.get('/equipes', async (req, res) => {
  try {
    const equipes = await Equipe.findAll({
      // A coluna 'modalidades' foi removida da lista de atributos
      attributes: ['id', 'nome', 'sigla', 'logo', 'instituicao', 'representanteNome', 'historia'],
      where: { status: 'ativo' } // Mostra apenas equipes ativas
    });
    res.json(equipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Listar atletas de uma equipe específica
router.get('/equipes/:id/atletas', async (req, res) => {
  try {
    const atletas = await Atleta.findAll({
      where: { equipeId: req.params.id },
      attributes: ['id', 'nome', 'curso', 'situacao'],
    });
    res.json(atletas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obter detalhes de um atleta específico (sem alterações)
router.get('/atleta/:id', async (req, res) => { /* ...código existente... */ });

// ✅ Rota de classificação (sem alterações)
router.get('/classificacao', async (req, res) => { /* ...código existente... */ });


module.exports = router;