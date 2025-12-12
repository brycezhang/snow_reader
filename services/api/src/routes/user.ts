import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'

export const userRouter = Router()

const updateSettingsSchema = z.object({
  readerPreferences: z
    .object({
      fontSize: z.number().optional(),
      lineHeight: z.number().optional(),
      margin: z.number().optional(),
      theme: z.enum(['light', 'dark', 'sepia']).optional(),
      fontFamily: z.string().optional(),
    })
    .optional(),
  extensionEnabled: z.boolean().optional(),
  annotationEnabled: z.boolean().optional(),
})

userRouter.use(authenticate)

userRouter.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

userRouter.get('/settings', async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.userId },
    })

    res.json({
      success: true,
      data: settings || {
        readerPreferences: {
          fontSize: 16,
          lineHeight: 1.8,
          margin: 20,
          theme: 'light',
          fontFamily: 'serif',
        },
        extensionEnabled: true,
        annotationEnabled: false,
      },
    })
  } catch (err) {
    next(err)
  }
})

userRouter.patch('/settings', async (req: AuthRequest, res, next) => {
  try {
    const data = updateSettingsSchema.parse(req.body)

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId!,
        ...data,
      },
      update: data,
    })

    res.json({ success: true, data: settings })
  } catch (err) {
    next(err)
  }
})

userRouter.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [booksCount, articlesCount, vocabCount, highlightsCount] = await Promise.all([
      prisma.book.count({ where: { userId: req.userId } }),
      prisma.article.count({ where: { userId: req.userId } }),
      prisma.vocabItem.count({ where: { userId: req.userId } }),
      prisma.highlight.count({ where: { userId: req.userId } }),
    ])

    res.json({
      success: true,
      data: {
        booksCount,
        articlesCount,
        vocabCount,
        highlightsCount,
      },
    })
  } catch (err) {
    next(err)
  }
})
