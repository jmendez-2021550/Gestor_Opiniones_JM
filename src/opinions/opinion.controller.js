import { Opinion } from './opinion.model.js';
import User from '../users/user.model.js';
import Comment from './comment.model.js';
import Like from './like.model.js';
import Category from './category.model.js';
import Favorite from './favorite.model.js';
import { verifyJWT } from '../../helpers/generate-jwt.js';
import { findUserById } from '../../helpers/user-db.js';

export const createOpinion = async (req, res) => {
  try {
    // Allow creating opinions either authenticated (JWT) or by providing author info in body
    const userId = req.userId || req.body.userId || null;
    const { title, content, rating, isPublic, creatorName, categoryId } = req.body;

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }
    }

    const newOpinion = await Opinion.create({
      UserId: userId,
      CreatorName: creatorName || null,
      Title: title,
      Content: content,
      Rating: rating || null,
      Public: typeof isPublic === 'boolean' ? isPublic : true,
      CategoryId: categoryId || null,
    });

    // Reload with author info
    const created = await Opinion.findByPk(newOpinion.Id, {
      include: [
        { model: User, as: 'Author', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] },
        { model: Category, as: 'Category', attributes: ['Id', 'Name', 'Description'] },
        { model: Comment, as: 'Comments', include: [{ model: User, as: 'Author', attributes: ['Id','Name','Username'] }] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Opinion creada exitosamente',
      data: created,
    });
  } catch (error) {
    console.error('Error creating opinion:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOpinions = async (req, res) => {
  try {
    const opinions = await Opinion.findAll({
      where: { Public: true },
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'],
        },
        {
          model: Category,
          as: 'Category',
          attributes: ['Id', 'Name', 'Description'],
        },
        {
          model: Comment,
          as: 'Comments',
          include: [{ model: User, as: 'Author', attributes: ['Id', 'Name', 'Username'] }],
        },
        {
          model: Like,
          as: 'Likes',
          include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Username'] }],
        },
        {
          model: Favorite,
          as: 'Favorites',
          include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
        },
      ],
      order: [['CreatedAt', 'DESC']],
    });

    return res.status(200).json({ success: true, data: opinions });
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOpinionById = async (req, res) => {
  try {
    const { id } = req.params;
    const opinion = await Opinion.findByPk(id, {
      include: [
        { model: User, as: 'Author', attributes: ['Id', 'Name', 'Username'] },
        { model: Category, as: 'Category', attributes: ['Id', 'Name', 'Description'] },
        { model: Comment, as: 'Comments', include: [{ model: User, as: 'Author', attributes: ['Id','Name','Username'] }] },
        { model: Like, as: 'Likes', include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Username', 'Email'] }] },
        { model: Favorite, as: 'Favorites', include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }] },
      ],
    });

    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion no encontrada' });
    }

    // Si no es pública, solo el autor o admin puede verla
    if (!opinion.Public) {
      const requesterId = req.userId || null;
      const isAuthor = requesterId && requesterId === opinion.UserId;
      const isAdmin = req.user && req.user.UserRoles && req.user.UserRoles[0] && req.user.UserRoles[0].Role && req.user.UserRoles[0].Role.Name === 'ADMIN_ROLE';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
    }

    return res.status(200).json({ success: true, data: opinion });
  } catch (error) {
    console.error('Error fetching opinion by id:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOpinion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating, isPublic, categoryId } = req.body;

    const opinion = await Opinion.findByPk(id);
    if (!opinion) return res.status(404).json({ success: false, message: 'Opinion no encontrada' });

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }
    }

    // Permission: only author or admin
    const requesterId = req.userId;
    const isAuthor = requesterId === opinion.UserId;
    const isAdmin = req.user && req.user.UserRoles && req.user.UserRoles[0] && req.user.UserRoles[0].Role && req.user.UserRoles[0].Role.Name === 'ADMIN_ROLE';

    if (!isAuthor && !isAdmin) return res.status(403).json({ success: false, message: 'No autorizado' });

    opinion.Title = title ?? opinion.Title;
    opinion.Content = content ?? opinion.Content;
    opinion.Rating = rating ?? opinion.Rating;
    opinion.CategoryId = categoryId ?? opinion.CategoryId;
    if (typeof isPublic === 'boolean') opinion.Public = isPublic;

    await opinion.save();

    return res.status(200).json({ success: true, message: 'Opinion actualizada', data: opinion });
  } catch (error) {
    console.error('Error updating opinion:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOpinion = async (req, res) => {
  try {
    const { id } = req.params;
    const opinion = await Opinion.findByPk(id);
    if (!opinion) return res.status(404).json({ success: false, message: 'Opinion no encontrada' });

    const requesterId = req.userId;
    const isAuthor = requesterId === opinion.UserId;
    const isAdmin = req.user && req.user.UserRoles && req.user.UserRoles[0] && req.user.UserRoles[0].Role && req.user.UserRoles[0].Role.Name === 'ADMIN_ROLE';

    if (!isAuthor && !isAdmin) return res.status(403).json({ success: false, message: 'No autorizado' });

    await opinion.destroy();

    return res.status(200).json({ success: true, message: 'Opinion eliminada' });
  } catch (error) {
    console.error('Error deleting opinion:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {

    const { id } = req.params; // opinion id
    // Allow commenter by JWT or by supplying commenter info in body
    const userId = req.userId || req.body.userId || null;
    const { content, commenterName } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'El contenido del comentario es obligatorio' });
    }

    if (!userId && !commenterName) {
      return res.status(400).json({ success: false, message: 'Debes proporcionar tu nombre o estar autenticado' });
    }

    const opinion = await Opinion.findByPk(id);
    if (!opinion) return res.status(404).json({ success: false, message: 'Opinion no encontrada' });

    const newComment = await Comment.create({
      OpinionId: opinion.Id,
      UserId: userId,
      CommenterName: commenterName || null,
      Content: content,
    });

    const created = await Comment.findByPk(newComment.Id, {
      include: [{ model: User, as: 'Author', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Comentario agregado',
      data: {
        Id: created.Id,
        OpinionId: created.OpinionId,
        Content: created.Content,
        CreatedAt: created.CreatedAt,
        Author: created.Author || { Id: created.UserId, Name: created.CommenterName }
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const comments = await Comment.findAll({
      where: { OpinionId: id },
      include: [{ model: User, as: 'Author', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
      order: [['CreatedAt', 'ASC']],
    });

    const formattedComments = comments.map(comment => ({
      Id: comment.Id,
      OpinionId: comment.OpinionId,
      Content: comment.Content,
      CreatedAt: comment.CreatedAt,
      Author: comment.Author || { Id: comment.UserId, Name: comment.CommenterName }
    }));

    return res.status(200).json({ success: true, data: formattedComments, count: formattedComments.length });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // opinion id, comment id
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ success: false, message: 'El contenido del comentario es obligatorio' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    // Verificar que el comentario pertenecha a la opinión
    if (comment.OpinionId !== id) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado en esta opinión' });
    }

    // Permission: only author or admin
    const isAuthor = userId === comment.UserId;
    const isAdmin = req.user && req.user.UserRoles && req.user.UserRoles[0] && req.user.UserRoles[0].Role && req.user.UserRoles[0].Role.Name === 'ADMIN_ROLE';

    if (!isAuthor && !isAdmin && userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para editar este comentario' });
    }

    comment.Content = content;
    await comment.save();

    const updated = await Comment.findByPk(commentId, {
      include: [{ model: User, as: 'Author', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
    });

    return res.status(200).json({
      success: true,
      message: 'Comentario actualizado',
      data: {
        Id: updated.Id,
        OpinionId: updated.OpinionId,
        Content: updated.Content,
        UpdatedAt: updated.UpdatedAt,
        Author: updated.Author || { Id: updated.UserId, Name: updated.CommenterName }
      }
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // opinion id, comment id
    const userId = req.userId;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    // Verificar que el comentario pertenecha a la opinión
    if (comment.OpinionId !== id) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado en esta opinión' });
    }

    // Permission: only author or admin
    const isAuthor = userId === comment.UserId;
    const isAdmin = req.user && req.user.UserRoles && req.user.UserRoles[0] && req.user.UserRoles[0].Role && req.user.UserRoles[0].Role.Name === 'ADMIN_ROLE';

    if (!isAuthor && !isAdmin && userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este comentario' });
    }

    await comment.destroy();

    return res.status(200).json({ success: true, message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addLike = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const userId = req.userId || null; // Opcional

    const opinion = await Opinion.findByPk(id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion no encontrada' });
    }

    // Si el usuario está autenticado, verificar que no haya dado like previamente
    if (userId) {
      const existingLike = await Like.findOne({
        where: { OpinionId: id, UserId: userId },
      });

      if (existingLike) {
        return res.status(400).json({ success: false, message: 'Ya has dado like a esta opinión' });
      }
    }

    const newLike = await Like.create({
      OpinionId: id,
      UserId: userId,
    });

    const created = await Like.findByPk(newLike.Id, {
      include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Like agregado',
      data: {
        Id: created.Id,
        OpinionId: created.OpinionId,
        CreatedAt: created.CreatedAt,
        User: created.User
      }
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeLike = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Debes estar autenticado' });
    }

    const opinion = await Opinion.findByPk(id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion no encontrada' });
    }

    const like = await Like.findOne({
      where: { OpinionId: id, UserId: userId },
    });

    if (!like) {
      return res.status(404).json({ success: false, message: 'No has dado like a esta opinión' });
    }

    await like.destroy();

    return res.status(200).json({ success: true, message: 'Like removido' });
  } catch (error) {
    console.error('Error removing like:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLikes = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const likes = await Like.findAll({
      where: { OpinionId: id },
      include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
      order: [['CreatedAt', 'DESC']],
    });

    const formattedLikes = likes.map(like => ({
      Id: like.Id,
      OpinionId: like.OpinionId,
      CreatedAt: like.CreatedAt,
      User: like.User
    }));

    return res.status(200).json({ success: true, data: formattedLikes, count: formattedLikes.length });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    let userId = req.userId || req.body?.userId || null; // Opcional (soporte body.userId when no token)

    // If no userId yet but a token was provided in headers/body/query, try to verify it
    if (!userId) {
      const tokenHeader =
        req.header('x-token') || req.header('authorization') || req.body?.token || req.query?.token || null;

      if (tokenHeader) {
        const rawToken = tokenHeader.replace(/^Bearer\s+/i, '');
        try {
          const decoded = await verifyJWT(rawToken);
          const user = await findUserById(decoded.sub);
          if (user) {
            userId = user.Id || user.id || null;
            // also attach to req for consistency
            req.user = user;
            req.userId = userId?.toString();
          }
        } catch (err) {
          return res.status(401).json({ ok: false, message: 'Token inválido' });
        }
      }
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Debes proporcionar userId en el body o autenticarte para agregar a favoritos' });
    }

    const opinion = await Opinion.findByPk(id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion no encontrada' });
    }

    // Verificar si ya está en favoritos
    const existingFavorite = await Favorite.findOne({
      where: { OpinionId: id, UserId: userId },
    });

    if (existingFavorite) {
      return res.status(400).json({ success: false, message: 'Esta opinión ya está en tus favoritos' });
    }

    const newFavorite = await Favorite.create({
      OpinionId: id,
      UserId: userId,
    });

    const created = await Favorite.findByPk(newFavorite.Id, {
      include: [
        { model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] },
        {
          model: Opinion,
          as: 'Opinion',
          attributes: ['Id', 'Title', 'Content', 'Rating', 'CreatorName', 'CreatedAt'],
          include: [
            { model: User, as: 'Author', attributes: ['Id', 'Name', 'Username'] },
            { model: Category, as: 'Category', attributes: ['Id', 'Name'] },
          ],
        },
      ],
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Agregado a favoritos',
      data: {
        Id: created.Id,
        OpinionId: created.OpinionId,
        CreatedAt: created.CreatedAt,
        User: created.User,
        Opinion: created.Opinion
      }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Debes estar autenticado' });
    }

    const opinion = await Opinion.findByPk(id);
    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion no encontrada' });
    }

    const favorite = await Favorite.findOne({
      where: { OpinionId: id, UserId: userId },
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Esta opinión no está en tus favoritos' });
    }

    await favorite.destroy();

    return res.status(200).json({ success: true, message: 'Removido de favoritos' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { id } = req.params; // opinion id
    const favorites = await Favorite.findAll({
      where: { OpinionId: id },
      include: [{ model: User, as: 'User', attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] }],
      order: [['CreatedAt', 'DESC']],
    });

    const formattedFavorites = favorites.map(favorite => ({
      Id: favorite.Id,
      OpinionId: favorite.OpinionId,
      CreatedAt: favorite.CreatedAt,
      User: favorite.User
    }));

    return res.status(200).json({ success: true, data: formattedFavorites, count: formattedFavorites.length });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
