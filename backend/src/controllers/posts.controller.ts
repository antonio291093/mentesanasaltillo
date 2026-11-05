import { Request, Response, NextFunction } from 'express';
import * as postsService from '../services/posts.service';
import { CreatePostDto, UpdatePostDto } from '../types';
import { AppError } from '../middlewares/error.middleware';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID inválido', 400);
  return id;
}

// ─── Público ──────────────────────────────────────────────────────────────────

export async function listPublished(req: Request, res: Response, next: NextFunction) {
  try {
    const { posts, pagination } = await postsService.listPublished({
      page:  req.query.page  ? Number(req.query.page)  : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      tag:   typeof req.query.tag === 'string' ? req.query.tag : undefined,
    });
    res.json({ success: true, data: posts, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getPublished(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.getPublishedBySlug(req.params.slug);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

// ─── Gestión ──────────────────────────────────────────────────────────────────

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postsService.listAll({
      estado: typeof req.query.estado === 'string' ? req.query.estado : undefined,
      limit:  req.query.limit ? Number(req.query.limit) : undefined,
      q:      typeof req.query.q === 'string' ? req.query.q : undefined,
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await postsService.getById(parseId(req.params.id)) });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.create(req.body as CreatePostDto);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postsService.update(parseId(req.params.id), req.body as UpdatePostDto);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await postsService.remove(parseId(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
