import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const highlightsRouter = Router()

const createHighlightSchema = z.object({
  bookId: z.string().optional(),
  articleId: z.string().optional(),
  cfi: z.string().optional(),
  xpath: z.string().optional(),
  offset: z.number().optional(),
  text: z.string(),
  color: z.string().default('#ffeb3b'),
  tags: z.array(z.string()).default([]),
})

highlightsRouter.use(authenticate)

highlightsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { bookId, articleId } = req.query

    const where: Record<string, unknown> = { userId: req.userId }
    if (bookId) where.bookId = bookId
    if (articleId) where.articleId = articleId

    const highlights = await prisma.highlight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { notes: true },
    })

    res.json({ success: true, data: highlights })
  } catch (err) {
    next(err)
  }
})

highlightsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createHighlightSchema.parse(req.body)

    if (!data.bookId && !data.articleId) {
      throw new AppError(400, 'Either bookId or articleId is required')
    }

    const highlight = await prisma.highlight.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    })

    res.json({ success: true, data: highlight })
  } catch (err) {
    next(err)
  }
})

highlightsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const highlight = await prisma.highlight.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!highlight) {
      throw new AppError(404, 'Highlight not found')
    }

    await prisma.highlight.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
