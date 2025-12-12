import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const booksRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/epub+zip' || file.originalname.endsWith('.epub')) {
      cb(null, true)
    } else {
      cb(new Error('Only EPUB files are allowed'))
    }
  },
})

booksRouter.use(authenticate)

booksRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ success: true, data: books })
  } catch (err) {
    next(err)
  }
})

booksRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!book) {
      throw new AppError(404, 'Book not found')
    }

    res.json({ success: true, data: book })
  } catch (err) {
    next(err)
  }
})

booksRouter.post('/', upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'EPUB file is required')
    }

    // TODO: Parse EPUB metadata, upload to S3, create book record
    const book = await prisma.book.create({
      data: {
        userId: req.userId!,
        title: req.body.title || 'Untitled',
        author: req.body.author || 'Unknown',
        publicationUrl: '', // TODO: Generate after upload
      },
    })

    res.json({ success: true, data: book })
  } catch (err) {
    next(err)
  }
})

booksRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!book) {
      throw new AppError(404, 'Book not found')
    }

    await prisma.book.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

booksRouter.patch('/:id/position', async (req: AuthRequest, res, next) => {
  try {
    const { cfi, percentage } = req.body

    await prisma.readingPosition.upsert({
      where: {
        userId_bookId: {
          userId: req.userId!,
          bookId: req.params.id,
        },
      },
      create: {
        userId: req.userId!,
        bookId: req.params.id,
        cfi,
        percentage,
      },
      update: { cfi, percentage },
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
