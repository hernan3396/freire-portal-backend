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

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
