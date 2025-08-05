import { JwtPayload } from '@src/common/util/auth';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
    export interface Response {}
    export interface NextFunction {}
  }
}