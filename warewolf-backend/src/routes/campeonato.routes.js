const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campeonato.controller');
const auth = require('../middleware/auth');
const Inscricao = require('../models/Inscricao');
const Equipe = require('../models/Equipe');

const isComissao = (req, res, next) => {
  if (req.perfil !== 'comissao') {
    return res.status(403).json({ error: 'Acesso negado. Apenas para comissão.' });
  }
  next();
};

router.use(auth);

router.post('/', isComissao, ctrl.criar);
router.get('/', ctrl.listar);
router.put('/:id', isComissao, ctrl.atualizar);
router.delete('/:id', isComissao, ctrl.remover);
router.post('/:campeonatoId/modalidades/:modalidadeId/inscrever', ctrl.inscrever);
router.get('/:campeonatoId/modalidades/:modalidadeId/equipes', async (req, res) => {
  const { campeonatoId, modalidadeId } = req.params;
  try {
    const inscricoes = await Inscricao.findAll({
      where: { campeonatoId, modalidadeId },
      include: [{ model: Equipe, attributes: ['id', 'nome'] }]
    });
    const equipes = inscricoes.map(i => i.Equipe);
    res.json(equipes);
  } catch (err) {
    console.error(err); // <-- Veja o erro aqui no terminal!
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;