import { Router } from 'express';
import { authenticateContentClient } from '../middlewares/content-auth.middleware';
import {
  listPublished,
  getPublished,
  listAll,
  getById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/posts.controller';

const router = Router();

// Gestión (API key del MCP o admin) — van antes de /:slug para no chocar
router.get('/manage',        authenticateContentClient, listAll);
router.get('/manage/:id',    authenticateContentClient, getById);
router.post('/',             authenticateContentClient, createPost);
router.patch('/:id',         authenticateContentClient, updatePost);
router.delete('/:id',        authenticateContentClient, deletePost);

// Público: solo publicados con fecha <= ahora (soporta ?page=&limit=&tag=)
router.get('/',              listPublished);
router.get('/:slug',         getPublished);

export default router;
