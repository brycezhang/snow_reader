import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const articlesRouter = Router()

const createArticleSchema = z.object({
  title: z.string(),
  sourceUrl: z.string().url(),
  content: z.string(),
})

articlesRouter.use(authenticate)

articlesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: articles })
  } catch (err) {
    next(err)
  }
})

articlesRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const article = await prisma.article.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!article) {
      throw new AppError(404, 'Article not found')
    }

    res.json({ success: true, data: article })
  } catch (err) {
    next(err)
  }
})

articlesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { title, sourceUrl, content } = createArticleSchema.parse(req.body)

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    const article = await prisma.article.create({
      data: {
        userId: req.userId!,
        title,
        sourceUrl,
        content,
        readingTime,
      },
    })

    res.json({ success: true, data: article })
  } catch (err) {
    next(err)
  }
})

articlesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const article = await prisma.article.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!article) {
      throw new AppError(404, 'Article not found')
    }

    await prisma.article.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
