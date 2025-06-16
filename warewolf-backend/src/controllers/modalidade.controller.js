// src/controllers/modalidade.controller.js

const Modalidade = require('../models/Modalidade'); // CORREÇÃO AQUI

// Criar uma nova modalidade
exports.criar = async (req, res) => {
    try {
        const modalidade = await Modalidade.create(req.body);
        res.status(201).json(modalidade);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Listar todas as modalidades
exports.listar = async (req, res) => {
    try {
        const modalidades = await Modalidade.findAll({ order: [['nome', 'ASC']] });
        res.json(modalidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter uma modalidade por ID
exports.obterPorId = async (req, res) => {
    try {
        const modalidade = await Modalidade.findByPk(req.params.id);
        if (!modalidade) return res.status(404).json({ error: 'Modalidade não encontrada.' });
        res.json(modalidade);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar uma modalidade
exports.atualizar = async (req, res) => {
    try {
        const modalidade = await Modalidade.findByPk(req.params.id);
        if (!modalidade) return res.status(404).json({ error: 'Modalidade não encontrada.' });
        
        await modalidade.update(req.body);
        res.json(modalidade);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Remover uma modalidade
exports.remover = async (req, res) => {
    try {
        const modalidade = await Modalidade.findByPk(req.params.id);
        if (!modalidade) return res.status(404).json({ error: 'Modalidade não encontrada.' });

        await modalidade.destroy();
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};