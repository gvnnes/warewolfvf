const { Op } = require('sequelize');
const Campeonato = require('../models/Campeonato');
const Equipe = require('../models/Equipe');
const Inscricao = require('../models/Inscricao');
const Modalidade = require('../models/Modalidade');
const Time = require('../models/Time');
const Partida = require('../models/Partida');

// Cria um novo campeonato e o associa a múltiplas modalidades
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

// Lista os campeonatos e inclui as modalidades de cada um
exports.listar = async (req, res) => {
  try {
    const campeonatos = await Campeonato.findAll({
      order: [['dataInicio', 'DESC']],
      include: [{
        model: Modalidade,
        attributes: ['id', 'nome'],
        through: { attributes: [] }
      }]
    });
    res.json(campeonatos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar campeonatos: ' + err.message });
  }
};

// Inscreve uma equipe em uma modalidade específica de um campeonato
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

// Atualiza os dados de um campeonato
exports.atualizar = async (req, res) => {
    try {
      const { nome, descricao, dataInicio, dataFim, modalidadeIds } = req.body;
      const campeonato = await Campeonato.findByPk(req.params.id);
      if (!campeonato) {
        return res.status(404).json({ error: 'Campeonato não encontrado' });
      }
      await campeonato.update({ nome, descricao, dataInicio, dataFim });
      if (modalidadeIds) {
          await campeonato.setModalidades(modalidadeIds);
      }
      res.json(campeonato);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Remove um campeonato
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

// Lista os times inscritos em uma modalidade de um campeonato
exports.listarTimesInscritos = async (req, res) => {
    try {
        const { campeonatoId, modalidadeId } = req.params;
        const times = await Time.findAll({
            where: { campeonatoId, modalidadeId },
            include: [{ model: Equipe, attributes: ['nome'] }]
        });
        res.json(times);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar times inscritos.' });
    }
};

// Gera o chaveamento (versão final)
exports.gerarChaveamento = async (req, res) => {
    try {
        const { campeonatoId, modalidadeId } = req.params;
        const partidasExistentes = await Partida.count({ where: { campeonatoId, modalidadeId } });
        if (partidasExistentes > 0) {
            return res.status(400).json({ error: 'O chaveamento para esta modalidade já foi gerado.' });
        }
        let times = await Time.findAll({ where: { campeonatoId, modalidadeId } });
        if (times.length < 2) {
            return res.status(400).json({ error: 'São necessários pelo menos 2 times para gerar um chaveamento.' });
        }
        for (let i = times.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [times[i], times[j]] = [times[j], times[i]];
        }
        let participantes = times.map(t => ({ id: t.equipeId }));
        let proximaRodada = [];
        if (participantes.length % 2 !== 0) {
            proximaRodada.push(participantes.pop());
        }
        let partidasParaCriar = [];
        for(let i = 0; i < participantes.length; i += 2) {
            partidasParaCriar.push({
                fase: 'Rodada 1',
                campeonatoId,
                modalidadeId,
                equipe1Id: participantes[i].id,
                equipe2Id: participantes[i+1].id,
            });
        }
        await Partida.bulkCreate(partidasParaCriar);
        if (proximaRodada.length > 0) {
            await Partida.create({
                fase: 'Quartas de Final',
                campeonatoId,
                modalidadeId,
                equipe1Id: proximaRodada[0].id,
                equipe2Id: null,
            });
        }
        res.status(201).json({ message: 'Chaveamento da primeira rodada gerado com sucesso!' });
    } catch (err) {
        console.error("ERRO AO GERAR CHAVEAMENTO:", err);
        res.status(500).json({ error: 'Erro ao gerar chaveamento: ' + err.message });
    }
};

// Agenda os horários das partidas
exports.agendarPartidas = async (req, res) => {
  try {
      const { campeonatoId, modalidadeId } = req.params;
      const { dataInicioTorneio, duracaoPartida, horarioInicioDiario, horarioFimDiario, intervaloEntrePartidas, horarioInicioAlmoco, horarioFimAlmoco } = req.body;
      if (!dataInicioTorneio || !duracaoPartida || !horarioInicioDiario || !horarioFimDiario) {
          return res.status(400).json({ error: 'Parâmetros de agendamento insuficientes.' });
      }
      const partidasParaAgendar = await Partida.findAll({ where: { campeonatoId, modalidadeId, dataHoraInicio: null }, order: [['id', 'ASC']] });
      if (partidasParaAgendar.length === 0) {
          return res.status(200).json({ message: 'Nenhuma partida nova para agendar.' });
      }
      const [inicioH, inicioM] = horarioInicioDiario.split(':').map(Number);
      const [fimH, fimM] = horarioFimDiario.split(':').map(Number);
      const [almocoInicioH, almocoInicioM] = horarioInicioAlmoco.split(':').map(Number);
      const [almocoFimH, almocoFimM] = horarioFimAlmoco.split(':').map(Number);
      let cursorTempo = new Date(`${dataInicioTorneio}T${horarioInicioDiario}:00`);
      for (const partida of partidasParaAgendar) {
          let proximoHorarioDisponivel = new Date(cursorTempo);
          let fimDaPartidaAtual = new Date(proximoHorarioDisponivel.getTime() + duracaoPartida * 60000);
          if (fimDaPartidaAtual.getHours() > fimH || (fimDaPartidaAtual.getHours() === fimH && fimDaPartidaAtual.getMinutes() > fimM)) {
              proximoHorarioDisponivel.setDate(proximoHorarioDisponivel.getDate() + 1);
              proximoHorarioDisponivel.setHours(inicioH, inicioM, 0, 0);
          }
          let inicioPartidaH = proximoHorarioDisponivel.getHours();
          if (inicioPartidaH >= almocoInicioH && inicioPartidaH < almocoFimH) {
              proximoHorarioDisponivel.setHours(almocoFimH, almocoFimM, 0, 0);
          }
          const dataHoraInicio = new Date(proximoHorarioDisponivel);
          const dataHoraFim = new Date(dataHoraInicio.getTime() + duracaoPartida * 60000);
          await partida.update({ dataHoraInicio, dataHoraFim });
          cursorTempo = new Date(dataHoraFim.getTime() + (parseInt(intervaloEntrePartidas, 10) || 0) * 60000);
      }
      res.json({ message: `${partidasParaAgendar.length} partidas foram agendadas com sucesso.` });
  } catch (err) {
      console.error("ERRO AO AGENDAR PARTIDAS:", err);
      res.status(500).json({ error: 'Erro ao agendar partidas: ' + err.message });
  }
};