// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== CONEXIÓN A MONGODB ====================

const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/posts-db";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.log("Error conectando a MongoDB:", err));

// ==================== ESQUEMA Y MODELO ====================

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "El título es requerido"],
    trim: true,
    maxlength: [100, "El título no puede exceder 100 caracteres"],
  },
  content: {
    type: String,
    required: [true, "El contenido es requerido"],
    trim: true,
  },
  author: {
    type: String,
    default: "Anónimo",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

// ==================== RUTAS CRUD ====================

// GET - Obtener todos los posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener posts", message: error.message });
  }
});

// GET - Obtener un post por ID
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el post", message: error.message });
  }
});

// POST - Crear un nuevo post
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const newPost = new Post({
      title,
      content,
      author: author || "Anónimo",
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el post", message: error.message });
  }
});

// PUT - Actualizar un post
app.put("/api/posts/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (author) post.author = author;
    post.updatedAt = new Date();

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al actualizar el post", message: error.message });
  }
});

// DELETE - Eliminar un post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ message: "Post eliminado correctamente", post });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar el post", message: error.message });
  }
});

// ==================== SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
