// src/middleware/permissions.js

// Middleware para verificar se o usuário é da comissão organizadora
exports.isComissao = (req, res, next) => {
  if (req.perfil !== 'comissao') {
    return res.status(403).json({ error: 'Acesso negado. Apenas para comissão.' });
  }
  next();
};

// Middleware para verificar se o usuário é de uma equipe
exports.isEquipe = (req, res, next) => {
    if (req.perfil !== 'equipe') {
        return res.status(403).json({ error: 'Acesso negado. Apenas para equipes.' });
    }
    next();
};