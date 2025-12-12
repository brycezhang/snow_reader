import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const vocabularyRouter = Router()

const addVocabSchema = z.object({
  lemma: z.string(),
  displayWord: z.string(),
  bookId: z.string().optional(),
  articleId: z.string().optional(),
  contextSnippet: z.string().optional(),
})

const updateVocabSchema = z.object({
  masteryLevel: z.number().min(0).max(3),
})

vocabularyRouter.use(authenticate)

vocabularyRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { masteryLevel } = req.query

    const where: Record<string, unknown> = { userId: req.userId }
    if (masteryLevel !== undefined) {
      where.masteryLevel = Number(masteryLevel)
    }

    const items = await prisma.vocabItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
})

vocabularyRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = addVocabSchema.parse(req.body)

    const existing = await prisma.vocabItem.findFirst({
      where: { userId: req.userId, lemma: data.lemma },
    })

    if (existing) {
      return res.json({ success: true, data: existing })
    }

    const item = await prisma.vocabItem.create({
      data: {
        ...data,
        userId: req.userId!,
        masteryLevel: 0,
      },
    })

    res.json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
})

vocabularyRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { masteryLevel } = updateVocabSchema.parse(req.body)

    const item = await prisma.vocabItem.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!item) {
      throw new AppError(404, 'Vocabulary item not found')
    }

    const updated = await prisma.vocabItem.update({
      where: { id: req.params.id },
      data: { masteryLevel },
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

vocabularyRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const item = await prisma.vocabItem.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!item) {
      throw new AppError(404, 'Vocabulary item not found')
    }

    await prisma.vocabItem.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
