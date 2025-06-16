require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/config/db');
const Modalidade = require('./src/models/Modalidade');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, 'uploads')));

const routes = require('./src/routes');
app.use('/api', routes);

require('./src/models/associations');

// ❗ FUNÇÃO CORRIGIDA COM OS NOVOS CAMPOS
async function popularModalidades() {
  try {
    const count = await Modalidade.count();
    if (count > 0) {
      console.log('Tabela de modalidades já populada.');
      return;
    }
    const esportes = [
      { nome: 'Basquete', minAtletas: 5, maxAtletas: 14, duracaoMinutos: 40 },
      { nome: 'Vôlei', minAtletas: 6, maxAtletas: 18, duracaoMinutos: 60 },
      { nome: 'Futsal', minAtletas: 5, maxAtletas: 14, duracaoMinutos: 40 },
      { nome: 'Beach Tênis', minAtletas: 2, maxAtletas: 3, duracaoMinutos: 50 },
      { nome: 'Vôlei de Areia', minAtletas: 2, maxAtletas: 3, duracaoMinutos: 50 },
      { nome: 'Handebol', minAtletas: 7, maxAtletas: 18, duracaoMinutos: 60 },
      { nome: 'Futebol', minAtletas: 11, maxAtletas: 24, duracaoMinutos: 40 },
      { nome: 'Tênis de Mesa', minAtletas: 1, maxAtletas: 4, duracaoMinutos: 30 },
    ];
    await Modalidade.bulkCreate(esportes);
    console.log('Tabela de modalidades populada com sucesso!');
  } catch (error) {
    console.error('Erro ao popular modalidades:', error);
  }
}

const PORT = process.env.PORT || 3000;

db.sync().then(async () => {
  console.log('Banco sincronizado');
  await popularModalidades();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}).catch((err) => console.error('Erro ao conectar no banco:', err));