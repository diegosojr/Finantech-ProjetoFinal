const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "finantech_secret";

const createUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    console.log("ERRO REGISTER:");
    console.log(error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login realizado",
      token,
      name: user.name // 👈 AQUI
    });

  } catch (error) {
    console.log("ERRO LOGIN:");
    console.log(error);
    res.status(500).json({ error: "Erro no login" });
  }
};

module.exports = {
  createUser,
  register,
  login
};