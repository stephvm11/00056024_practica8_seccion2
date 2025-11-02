import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import db from "./controllers/controllers.js";
import verifyToken from "./middleware/verifyToken.js";
import { pool } from "./db/connection.js";

const app = express();
const port = 5000;
const JWT_SECRET = "your_jwt_secret";

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended:true,
  })
);

const users = [{email: "jerry@example.com", password:"$2b$10$XOHI0.vg73ve9Oy73lqU5.W//tVQuqMIAKJn3n25ZA2DUF.YGm6vq"}];

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ token });
});

app.get("/protected", verifyToken, (req, res) => {
    res.json({
        message: "¡Has accedido a la ruta protegida!",
        user: req.user,
    })
})

app.get('/', db.displayHome);
app.get('/users', verifyToken, db.getUsers);
app.get('/users/:id', verifyToken, db.getUserById);
app.post('/users', verifyToken, db.createUser);
app.put('/users/:id', verifyToken, db.updateUser);
app.delete('/users/:id', verifyToken, db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
