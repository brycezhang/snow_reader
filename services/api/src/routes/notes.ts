import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/error-handler.js'

export const notesRouter = Router()

const createNoteSchema = z.object({
  highlightId: z.string(),
  text: z.string(),
  tags: z.array(z.string()).default([]),
})

const updateNoteSchema = z.object({
  text: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

notesRouter.use(authenticate)

notesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { highlight: true },
    })

    res.json({ success: true, data: notes })
  } catch (err) {
    next(err)
  }
})

notesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { highlightId, text, tags } = createNoteSchema.parse(req.body)

    const highlight = await prisma.highlight.findFirst({
      where: { id: highlightId, userId: req.userId },
    })

    if (!highlight) {
      throw new AppError(404, 'Highlight not found')
    }

    const note = await prisma.note.create({
      data: {
        highlightId,
        userId: req.userId!,
        text,
        tags,
      },
    })

    res.json({ success: true, data: note })
  } catch (err) {
    next(err)
  }
})

notesRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateNoteSchema.parse(req.body)

    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!note) {
      throw new AppError(404, 'Note not found')
    }

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

notesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })

    if (!note) {
      throw new AppError(404, 'Note not found')
    }

    await prisma.note.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
