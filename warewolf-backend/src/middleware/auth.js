const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ❗ LINHA DE DEPURAÇÃO ADICIONADA AQUI ❗
    // Vamos ver o que realmente está dentro do token.
    console.log('--- DADOS DO TOKEN DECODIFICADO ---');
    console.log(decoded);
    console.log('-----------------------------------');
    
    req.userId = decoded.id;
    req.perfil = decoded.perfil;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;