const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");

router.get("/", (req, res) => {
  res.send("Rota de usuários funcionando");
});

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter pelo menos 6 caracteres"),
  ],
  userController.createUser
);

router.post("/register", userController.register);

router.post("/login", userController.login);

module.exports = router;