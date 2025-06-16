const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const mailer = require('../config/mailer');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, senha: hashedPassword, perfil });
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, perfil: user.perfil }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado com este e-mail.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        await user.update({
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await mailer.sendMail({
            to: email,
            from: 'suporte@warewolf.com',
            subject: 'Recuperação de Senha - WareWolf',
            html: `<p>Você solicitou a redefinição de senha. Por favor, clique no link a seguir para criar uma nova senha:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
                   <p>Este link expirará em 1 hora.</p>`,
        });

        res.json({ message: 'Um e-mail de recuperação foi enviado para ' + email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao processar a solicitação de recuperação de senha.' });
    }
};

// FUNÇÃO QUE FALTAVA
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() },
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token de redefinição de senha é inválido ou expirou.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({
            senha: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        res.json({ message: 'Senha redefinida com sucesso!' });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao redefinir a senha.' });
    }
};