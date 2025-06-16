const { Op } = require('sequelize');
const Campeonato = require('../models/Campeonato');
const Equipe = require('../models/Equipe');
const Inscricao = require('../models/Inscricao');
const Modalidade = require('../models/Modalidade');
const Time = require('../models/Time');
const Partida = require('../models/Partida');

exports.criar = async (req, res) => {
  try {
    const { nome, descricao, dataInicio, dataFim, modalidadeIds } = req.body;
    if (!nome || !dataInicio || !modalidadeIds || modalidadeIds.length === 0) {
      return res.status(400).json({ error: 'Nome, data de início e ao menos uma modalidade são obrigatórios.' });
    }
    const campeonato = await Campeonato.create({
      nome,
      descricao,
      dataInicio,
      dataFim: dataFim || null,
      userId: req.userId
    });
    if (campeonato && modalidadeIds) {
      await campeonato.setModalidades(modalidadeIds);
    }
    res.status(201).json(campeonato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const campeonatos = await Campeonato.findAll({
      order: [['dataInicio', 'DESC']],
      include: {
        model: Modalidade,
        attributes: ['id', 'nome'],
        through: { attributes: [] }
      }
    });
    res.json(campeonatos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.inscrever = async (req, res) => {
  try {
    const userId = req.userId;
    const { campeonatoId, modalidadeId } = req.params;
    if (!campeonatoId || !modalidadeId) {
        return res.status(400).json({ error: 'IDs do campeonato e da modalidade são necessários.' });
    }
    const equipe = await Equipe.findOne({ where: { userId } });
    if (!equipe) return res.status(403).json({ error: 'Equipe não encontrada para este usuário.' });
    const existente = await Inscricao.findOne({
      where: { equipeId: equipe.id, campeonatoId, modalidadeId }
    });
    if (existente) {
      return res.status(400).json({ error: 'Equipe já inscrita nesta modalidade do campeonato.' });
    }
    const nova = await Inscricao.create({ equipeId: equipe.id, campeonatoId, modalidadeId });
    res.status(201).json({ message: 'Inscrição realizada com sucesso!', inscricao: nova });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const partidaAtual = await Partida.findByPk(req.params.id);
    if (!partidaAtual) return res.status(404).json({ error: 'Partida não encontrada' });

    const { placarEquipe1, placarEquipe2 } = req.body;
    const p1 = parseInt(placarEquipe1, 10);
    const p2 = parseInt(placarEquipe2, 10);
    let vencedorId = null;

    if (!isNaN(p1) && !isNaN(p2)) {
        if (p1 > p2) vencedorId = partidaAtual.equipe1Id;
        else if (p2 > p1) vencedorId = partidaAtual.equipe2Id;
    }
    
    await partidaAtual.update({ placarEquipe1: p1, placarEquipe2: p2, vencedorId });

    // LÓGICA DE AVANÇO AUTOMÁTICO - "JUST-IN-TIME"
    if (vencedorId) {
        // Encontra todas as partidas da mesma fase que já terminaram
        const partidasFinalizadasDaRodada = await Partida.findAll({
            where: {
                fase: partidaAtual.fase,
                campeonatoId: partidaAtual.campeonatoId,
                modalidadeId: partidaAtual.modalidadeId,
                vencedorId: { [Op.ne]: null }
            }
        });
        
        // A cada 2 vencedores, cria uma nova partida na próxima fase
        if (partidasFinalizadasDaRodada.length >= 2 && partidasFinalizadasDaRodada.length % 2 === 0) {
            // Pega os dois últimos vencedores que ainda não jogaram na próxima fase
            const ultimoVencedor = partidasFinalizadasDaRodada[partidasFinalizadasDaRodada.length - 1].vencedorId;
            const penultimoVencedor = partidasFinalizadasDaRodada[partidasFinalizadasDaRodada.length - 2].vencedorId;

            // Define o nome da próxima fase
            const numPartidasNaFase = await Partida.count({where: {fase: partidaAtual.fase, campeonatoId: partidaAtual.campeonatoId, modalidadeId: partidaAtual.modalidadeId }});
            let proximaFaseNome = `Rodada de ${numPartidasNaFase / 2}`;
            if(numPartidasNaFase === 2) proximaFaseNome = 'Final';
            if(numPartidasNaFase === 4) proximaFaseNome = 'Semifinal';

            await Partida.create({
                fase: proximaFaseNome,
                campeonatoId: partidaAtual.campeonatoId,
                modalidadeId: partidaAtual.modalidadeId,
                equipe1Id: penultimoVencedor,
                equipe2Id: ultimoVencedor,
            });
        }
    }

    res.json(partidaAtual);
  } catch (err) {
    console.error("ERRO AO ATUALIZAR PARTIDA:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.remover = async (req, res) => {
  try {
    const campeonato = await Campeonato.findByPk(req.params.id);
    if (!campeonato) {
      return res.status(404).json({ error: 'Campeonato não encontrado' });
    }
    await campeonato.destroy();
    res.json({ message: 'Campeonato removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

