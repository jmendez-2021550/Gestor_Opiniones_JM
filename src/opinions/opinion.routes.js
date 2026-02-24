import { Router } from 'express';
import * as opinionController from './opinion.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validation.js';

const router = Router();

const validateCreateOpinion = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio'),
  body('content').trim().notEmpty().withMessage('El contenido es obligatorio'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un entero entre 1 y 5'),
  handleValidationErrors,
];

const validateUpdateOpinion = [
  body('title').optional().isString(),
  body('content').optional().isString(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  handleValidationErrors,
];

router.post('/', validateJWT, validateCreateOpinion, opinionController.createOpinion);
router.get('/', opinionController.getOpinions);
router.get('/:id', opinionController.getOpinionById);
router.put('/:id', validateJWT, validateUpdateOpinion, opinionController.updateOpinion);
router.delete('/:id', validateJWT, opinionController.deleteOpinion);

// Comments (público para crear, protegido para editar y eliminar)
router.post('/:id/comments', opinionController.addComment);
router.get('/:id/comments', opinionController.getComments);
router.put('/:id/comments/:commentId', validateJWT, opinionController.updateComment);
router.delete('/:id/comments/:commentId', validateJWT, opinionController.deleteComment);

// Likes (público)
router.post('/:id/likes', opinionController.addLike);
router.delete('/:id/likes', validateJWT, opinionController.removeLike);
router.get('/:id/likes', opinionController.getLikes);

// Favorites (público)
router.post('/:id/favorites', opinionController.addFavorite);
router.delete('/:id/favorites', validateJWT, opinionController.removeFavorite);
router.get('/:id/favorites', opinionController.getFavorites);;

export default router;
