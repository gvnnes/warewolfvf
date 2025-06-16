// src/routes/time.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/time.controller');
const auth = require('../middleware/auth');

// Todas as rotas de time são protegidas e exigem perfil de 'equipe'
router.use(auth, (req, res, next) => {
  if (req.perfil !== 'equipe') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
});

// Criar um novo time
router.post('/', ctrl.criar);

// Listar os times da equipe logada
router.get('/', ctrl.listarPorEquipe);

// ❗ NOVA ROTA: Adicionar um atleta a um time específico
// Ex: POST /api/times/15/atletas  (Body: { "atletaId": 1 })
router.post('/:timeId/atletas', ctrl.adicionarAtleta);

// ❗ NOVA ROTA: Remover um atleta de um time específico
// Ex: DELETE /api/times/15/atletas/1
router.delete('/:timeId/atletas/:atletaId', ctrl.removerAtleta);


module.exports = router;