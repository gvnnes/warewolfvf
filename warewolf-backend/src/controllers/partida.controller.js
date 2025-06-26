const { Op } = require('sequelize');
const Partida = require('../models/partida');
const Equipe = require('../models/equipe');
const Campeonato = require('../models/campeonato');
const Modalidade = require('../models/modalidade');
const Time = require('../models/time');

// Esta função pode ser útil para debug ou futuras implementações manuais
exports.criar = async (req, res) => {
  try {
    const { equipe1Id, equipe2Id, fase, campeonatoId, modalidadeId } = req.body;
    if (!campeonatoId || !equipe1Id || !equipe2Id || !fase || !modalidadeId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const partida = await Partida.create({ equipe1Id, equipe2Id, fase, campeonatoId, modalidadeId });
    res.status(201).json(partida);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lista as partidas de um chaveamento para o frontend
exports.listar = async (req, res) => {
  try {
    const { campeonatoId, modalidadeId } = req.query;
    const whereClause = {};
    if (campeonatoId) whereClause.campeonatoId = campeonatoId;
    if (modalidadeId) whereClause.modalidadeId = modalidadeId;
    const partidas = await Partida.findAll({
      where: whereClause,
      include: [
        { model: Equipe, as: 'equipe1', attributes: ['id', 'nome', 'logo'] },
        { model: Equipe, as: 'equipe2', attributes: ['id', 'nome', 'logo'] },
        { model: Equipe, as: 'vencedor', attributes: ['id', 'nome'] },
        { model: Campeonato, as: 'campeonato', attributes: ['nome'] },
        { model: Modalidade, as: 'modalidade', attributes: ['nome'] }
      ],
      order: [['id', 'ASC']]
    });
    res.json(partidas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualiza o placar e avança o vencedor para a próxima fase
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

    if (vencedorId) {
      // Encontra partidas da mesma fase com vencedor, que ainda não "avançaram" um vencedor
      const partidasProntasParaAvancar = await Partida.findAll({
          where: {
              fase: partidaAtual.fase,
              campeonatoId: partidaAtual.campeonatoId,
              modalidadeId: partidaAtual.modalidadeId,
              vencedorId: { [Op.ne]: null },
          }
      });

      const vencedores = partidasProntasParaAvancar.map(p => p.vencedorId);
      
      // Procura por um time com bye que ainda não foi pareado
      const todosOsTimesDoCamp = await Time.findAll({where: {campeonatoId: partidaAtual.campeonatoId, modalidadeId: partidaAtual.modalidadeId}});
      const vencedoresUnicos = [...new Set(vencedores)];
      const timesComByeNaoPareados = todosOsTimesDoCamp.filter(t => !vencedoresUnicos.includes(t.equipeId));

      let participantesProximaRodada = [...vencedores];
      if(timesComByeNaoPareados.length > 0 && partidaAtual.fase === 'Rodada 1') {
        participantesProximaRodada.push(...timesComByeNaoPareados.map(t => t.equipeId));
      }
      
      if (participantesProximaRodada.length >= 2) {
          for(let i = 0; i < participantesProximaRodada.length; i+=2) {
              const equipe1 = participantesProximaRodada[i];
              const equipe2 = participantesProximaRodada[i+1];
              if(!equipe2) continue;

              const proximaFaseNome = `Rodada de ${participantesProximaRodada.length / 2}`;
              
              const partidaJaExiste = await Partida.findOne({ where: {
                  [Op.or]: [{equipe1Id: equipe1, equipe2Id: equipe2}, {equipe1Id: equipe2, equipe2Id: equipe1}],
                  fase: proximaFaseNome, campeonatoId: partidaAtual.campeonatoId, modalidadeId: partidaAtual.modalidadeId
              }});

              if(!partidaJaExiste) {
                  await Partida.create({
                      fase: proximaFaseNome,
                      campeonatoId: partidaAtual.campeonatoId,
                      modalidadeId: partidaAtual.modalidadeId,
                      equipe1Id: equipe1,
                      equipe2Id: equipe2,
                  });
              }
          }
      }
    }

    res.json(partidaAtual);
  } catch (err) {
    console.error("ERRO AO ATUALIZAR PARTIDA:", err);
    res.status(500).json({ error: err.message });
  }
};

// Busca os detalhes de uma partida
exports.obterPorId = async (req, res) => {
    try {
        const partida = await Partida.findByPk(req.params.id, {
            include: [
                { model: Equipe, as: 'equipe1', attributes: ['id', 'nome', 'logo'] },
                { model: Equipe, as: 'equipe2', attributes: ['id', 'nome', 'logo'] },
                { model: Equipe, as: 'vencedor', attributes: ['id', 'nome'] },
                { model: Campeonato, as: 'campeonato', attributes: ['nome'] },
                { model: Modalidade, as: 'modalidade', attributes: ['nome'] }
            ]
        });
        if (!partida) {
            return res.status(404).json({ error: 'Partida não encontrada.' });
        }
        res.json(partida);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar detalhes da partida.' });
    }
};