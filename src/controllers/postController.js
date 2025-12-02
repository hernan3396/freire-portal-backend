const Post = require("../models/Post");
const logger = require("../utils/logger");

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    logger.error("Error al obtener posts:", error.message);
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, error: "Post no encontrado" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    logger.error("Error al obtener el post:", error.message);
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, description, image, link, date, alt, cta } = req.body;

    const newPost = new Post({
      title,
      description,
      image,
      link,
      date,
      alt,
      cta: cta || "Click",
    });

    const savedPost = await newPost.save();
    logger.info(`Post creado: ${savedPost._id}`);

    res.status(201).json({ success: true, data: savedPost });
  } catch (error) {
    logger.error("Error al crear el post:", error.message);
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, description, image, link, date, alt, cta } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, error: "Post no encontrado" });
    }

    if (title) post.title = title;
    if (description) post.description = description;
    if (image) post.image = image;
    if (link) post.link = link;
    if (date) post.date = date;
    if (alt) post.alt = alt;
    if (cta) post.cta = cta;
    post.updatedAt = new Date();

    const updatedPost = await post.save();
    logger.info(`Post actualizado: ${updatedPost._id}`);

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    logger.error("Error al actualizar el post:", error.message);
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, error: "Post no encontrado" });
    }

    logger.info(`Post eliminado: ${post._id}`);
    res.json({
      success: true,
      message: "Post eliminado correctamente",
      data: post,
    });
  } catch (error) {
    logger.error("Error al eliminar el post:", error.message);
    next(error);
  }
};

// POST - Reemplazar todos los posts (con actualización inteligente)
const replaceAllPosts = async (req, res, next) => {
  try {
    const { posts } = req.body;

    if (!posts || !Array.isArray(posts)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de posts",
      });
    }

    // Validar campos requeridos
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      if (
        !post.title ||
        !post.description ||
        !post.image ||
        !post.link ||
        !post.date ||
        !post.alt
      ) {
        return res.status(400).json({
          success: false,
          error: `El post ${i + 1} no tiene todos los campos requeridos`,
        });
      }

      // Validar URLs
      if (!/^https?:\/\/.+/.test(post.image)) {
        return res.status(400).json({
          success: false,
          error: `La URL de la imagen del post ${i + 1} es inválida`,
        });
      }
      if (!/^https?:\/\/.+/.test(post.link)) {
        return res.status(400).json({
          success: false,
          error: `La URL del link del post ${i + 1} es inválida`,
        });
      }
    }

    // Obtener posts existentes
    const existingPosts = await Post.find();
    const existingMap = new Map(
      existingPosts.map((post) => [post._id.toString(), post])
    );

    const operations = [];
    const newPostsToCreate = [];
    let hasChanges = false;

    // Procesar cada post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      if (post._id) {
        const existingPost = existingMap.get(post._id);

        if (existingPost) {
          // Verificar cambios
          const hasChanged =
            existingPost.title !== post.title ||
            existingPost.description !== post.description ||
            existingPost.image !== post.image ||
            existingPost.link !== post.link ||
            new Date(existingPost.date).getTime() !==
              new Date(post.date).getTime() ||
            existingPost.alt !== post.alt ||
            existingPost.cta !== (post.cta || "Click") ||
            existingPost.order !== i;

          if (hasChanged) {
            hasChanges = true;
            operations.push({
              updateOne: {
                filter: { _id: post._id },
                update: {
                  title: post.title,
                  description: post.description,
                  image: post.image,
                  link: post.link,
                  date: post.date,
                  alt: post.alt,
                  cta: post.cta || "Click",
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(post._id);
        }
      } else {
        // Nuevo post
        hasChanges = true;
        newPostsToCreate.push({
          title: post.title,
          description: post.description,
          image: post.image,
          link: post.link,
          date: post.date,
          alt: post.alt,
          cta: post.cta || "Click",
          order: i,
        });
      }
    }

    // IDs a eliminar
    const idsToDelete = Array.from(existingMap.keys());
    if (idsToDelete.length > 0) {
      hasChanges = true;
    }

    // Si no hay cambios
    if (!hasChanges) {
      return res.json({
        success: true,
        data: await Post.find().sort({ order: 1, date: -1 }),
        message: "No hay cambios para guardar",
      });
    }

    // Ejecutar operaciones
    let updatedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;

    if (operations.length > 0) {
      const result = await Post.bulkWrite(operations);
      updatedCount = result.modifiedCount;
      logger.info(`${updatedCount} posts actualizados`);
    }

    if (newPostsToCreate.length > 0) {
      const created = await Post.insertMany(newPostsToCreate);
      createdCount = created.length;
      logger.info(`${createdCount} posts creados`);
    }

    if (idsToDelete.length > 0) {
      const result = await Post.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount = result.deletedCount;
      logger.info(`${deletedCount} posts eliminados`);
    }

    // Devolver posts actualizados
    const updatedPosts = await Post.find().sort({ order: 1, date: -1 });

    res.json({
      success: true,
      data: updatedPosts,
      message: `Cambios guardados: ${createdCount} creados, ${updatedCount} actualizados, ${deletedCount} eliminados`,
    });
  } catch (error) {
    logger.error("Error al guardar posts:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    next(error);
  }
};

// Actualiza el module.exports
module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  replaceAllPosts, // <-- AGREGAR ESTO
  updatePost,
  deletePost,
};
