import { Router } from 'express'
import { z } from 'zod'
import { TranslationService } from '../services/translation.js'
import { optionalAuth } from '../middleware/auth.js'

export const translateRouter = Router()

const translationService = new TranslationService()

const translateSchema = z.object({
  text: z.string().max(5000),
  targetLang: z.string().default('zh'),
  sourceLang: z.string().optional(),
})

translateRouter.use(optionalAuth)

translateRouter.post('/', async (req, res, next) => {
  try {
    const { text, targetLang, sourceLang } = translateSchema.parse(req.body)

    const result = await translationService.translate(text, targetLang, sourceLang)

    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})
