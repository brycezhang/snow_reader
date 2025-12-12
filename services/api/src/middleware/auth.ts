import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './error-handler.js'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required')
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    throw new AppError(401, 'Invalid token')
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
      req.userId = payload.userId
    } catch {
      // Ignore invalid token for optional auth
    }
  }

  next()
}
