import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { errorHandler } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.js'
import { booksRouter } from './routes/books.js'
import { articlesRouter } from './routes/articles.js'
import { dictionaryRouter } from './routes/dictionary.js'
import { translateRouter } from './routes/translate.js'
import { highlightsRouter } from './routes/highlights.js'
import { notesRouter } from './routes/notes.js'
import { vocabularyRouter } from './routes/vocabulary.js'
import { userRouter } from './routes/user.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/books', booksRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/dictionary', dictionaryRouter)
app.use('/api/translate', translateRouter)
app.use('/api/highlights', highlightsRouter)
app.use('/api/notes', notesRouter)
app.use('/api/vocabulary', vocabularyRouter)
app.use('/api/user', userRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Snow Reader API running on http://localhost:${PORT}`)
})
