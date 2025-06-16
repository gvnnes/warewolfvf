const Atleta = require('../models/Atleta');
const Equipe = require('../models/Equipe');
const { cpf } = require('cpf-cnpj-validator');

exports.criar = async (req, res) => {
  try {
    const { nome, rg, cpf: cpfAtleta, curso, situacao } = req.body;

    // ❗ INÍCIO DA VALIDAÇÃO
    if (!cpf.isValid(cpfAtleta)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }
    // ❗ FIM DA VALIDAÇÃO

    const equipe = await Equipe.findOne({ where: { userId: req.userId } });
    if (!equipe) {
      return res.status(403).json({ error: 'Equipe não encontrada' });
    }
    const atleta = await Atleta.create({
      nome,
      rg,
      cpf: cpfAtleta, // use a variável renomeada
      curso,
      situacao,
      equipeId: equipe.id
    });
    res.status(201).json(atleta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const equipe = await Equipe.findOne({ where: { userId: req.userId } });
    if (!equipe) return res.status(403).json({ error: 'Equipe não encontrada' });
    const atletas = await Atleta.findAll({ where: { equipeId: equipe.id } });
    res.json(atletas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editar = async (req, res) => {
  try {
    const atleta = await Atleta.findByPk(req.params.id);
    if (!atleta) return res.status(404).json({ error: 'Atleta não encontrado' });
    await atleta.update(req.body);
    res.json(atleta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remover = async (req, res) => {
  try {
    const atleta = await Atleta.findByPk(req.params.id);
    if (!atleta) return res.status(404).json({ error: 'Atleta não encontrado' });
    await atleta.destroy();
    res.json({ message: 'Atleta removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadDocumento = async (req, res) => {
    try {
        const atletaId = req.params.id;
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }
        const atleta = await Atleta.findByPk(atletaId);
        if (!atleta) {
            return res.status(404).json({ error: 'Atleta não encontrado.' });
        }
        const equipe = await Equipe.findOne({ where: { userId: req.userId } });
        if (!equipe || atleta.equipeId !== equipe.id) {
            return res.status(403).json({ error: 'Acesso negado. Este atleta não pertence à sua equipe.' });
        }
        const documentoUrl = `/files/${req.file.filename}`;
        await atleta.update({
            documentoUrl: documentoUrl,
            statusDocumento: 'pendente',
            comentarioReprovacao: null
        });
        res.json({ message: 'Documento enviado com sucesso!', atleta });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FUNÇÃO NOVA: Aprova ou reprova o documento de um atleta.
exports.gerenciarDocumento = async (req, res) => {
    try {
        const atletaId = req.params.id;
        const { status, comentarioReprovacao } = req.body;
        if (!['aprovado', 'reprovado'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Use "aprovado" ou "reprovado".' });
        }
        if (status === 'reprovado' && !comentarioReprovacao) {
            return res.status(400).json({ error: 'O comentário é obrigatório ao reprovar um documento.' });
        }
        const atleta = await Atleta.findByPk(atletaId);
        if (!atleta) {
            return res.status(404).json({ error: 'Atleta não encontrado.' });
        }
        const comentarioFinal = status === 'aprovado' ? null : comentarioReprovacao;
        await atleta.update({
            statusDocumento: status,
            comentarioReprovacao: comentarioFinal
        });
        res.json({ message: `Documento ${status} com sucesso.`, atleta });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FUNÇÃO NOVA: Lista todos os atletas com documentos pendentes para a comissão.
exports.listarPendentes = async (req, res) => {
    try {
        const atletasPendentes = await Atleta.findAll({
            where: {
                statusDocumento: 'pendente'
            },
            include: {
                model: Equipe,
                attributes: ['id', 'nome']
            }
        });
        res.json(atletasPendentes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};