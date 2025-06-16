const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classificacao.controller');

// Rota para o ranking geral
router.get('/', ctrl.listarGeral);

// Rota para o ranking de uma modalidade específica
router.get('/:modalidadeId', ctrl.listarPorModalidade);

module.exports = router;