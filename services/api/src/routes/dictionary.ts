import { Router } from 'express'
import { DictionaryService } from '../services/dictionary.js'
import { optionalAuth } from '../middleware/auth.js'

export const dictionaryRouter = Router()

const dictionaryService = new DictionaryService()

dictionaryRouter.use(optionalAuth)

dictionaryRouter.get('/:word', async (req, res, next) => {
  try {
    const word = req.params.word.toLowerCase().trim()

    const entry = await dictionaryService.lookup(word)

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Word not found',
      })
    }

    res.json({ success: true, data: entry })
  } catch (err) {
    next(err)
  }
})

dictionaryRouter.post('/batch', async (req, res, next) => {
  try {
    const { words } = req.body as { words: string[] }

    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Words array is required',
      })
    }

    const uniqueWords = [...new Set(words.map((w) => w.toLowerCase().trim()))]
    const results = await dictionaryService.batchLookup(uniqueWords.slice(0, 50))

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
})
