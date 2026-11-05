import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { authenticateContentClient } from '../middlewares/content-auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { slugify } from '../services/posts.service';

// 8 MB: límite de Instagram para imágenes publicadas vía API
const MAX_BYTES = 8 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
});

// Detecta el tipo real por la firma del archivo (no confiamos en el mimetype del cliente)
function detectImageType(buf: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  return null;
}

async function handleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) throw new AppError("Falta el archivo en el campo 'file'", 400);

    const ext = detectImageType(file.buffer);
    if (!ext) throw new AppError('Formato no soportado. Usa JPG, PNG, WEBP o GIF', 400);

    const now    = new Date();
    const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const base   = slugify(path.parse(file.originalname || '').name).slice(0, 50) || 'imagen';
    const name   = `${base}-${randomBytes(4).toString('hex')}.${ext}`;

    const dir = path.resolve(env.UPLOADS_DIR, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), file.buffer);

    res.status(201).json({
      success: true,
      data: {
        url:   `${env.PUBLIC_UPLOADS_URL.replace(/\/$/, '')}/${folder}/${name}`,
        path:  `${folder}/${name}`,
        bytes: file.size,
        tipo:  ext,
      },
    });
  } catch (err) {
    next(err);
  }
}

const router = Router();

router.post(
  '/',
  authenticateContentClient,
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen excede 8 MB' : err.message;
        next(new AppError(msg, 400));
        return;
      }
      next(err);
    });
  },
  handleUpload,
);

export default router;
