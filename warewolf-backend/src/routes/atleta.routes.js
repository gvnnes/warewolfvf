// src/routes/atleta.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/atleta.controller');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const { isEquipe, isComissao } = require('../middleware/permissions'); // ❗ Importa do novo arquivo

router.use(auth);

// --- ROTAS DA COMISSÃO ---
router.get('/documentos/pendentes', isComissao, ctrl.listarPendentes);
router.put('/:id/documento/status', isComissao, ctrl.gerenciarDocumento);

// --- ROTAS DA EQUIPE ---
router.get('/', isEquipe, ctrl.listar);
router.post('/', isEquipe, ctrl.criar);
router.post('/:id/documento', isEquipe, upload.single('documento'), ctrl.uploadDocumento);
router.put('/:id', isEquipe, ctrl.editar);
router.delete('/:id', isEquipe, ctrl.remover);

module.exports = router;