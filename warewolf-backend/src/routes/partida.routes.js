const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/partida.controller');
const auth = require('../middleware/auth');

// Middleware para verificar se o usuário é da comissão organizadora
const isComissao = (req, res, next) => {
    if (req.perfil !== 'comissao') {
      return res.status(403).json({ error: 'Acesso negado. Apenas para comissão.' });
    }
    next();
};

// --- ROTAS PÚBLICAS ---

// Rota para listar partidas com filtros (ex: /api/partidas?campeonatoId=1)
router.get('/', ctrl.listar);

// Rota para buscar os detalhes de UMA partida pelo ID (ex: /api/partidas/1)
router.get('/:id', ctrl.obterPorId);


// --- ROTAS PRIVADAS ---

// Rota para a comissão criar partidas
router.post('/', auth, isComissao, ctrl.criar);

// Rota para a comissão atualizar uma partida (definir placar/vencedor)
router.put('/:id', auth, isComissao, ctrl.atualizar);


module.exports = router;