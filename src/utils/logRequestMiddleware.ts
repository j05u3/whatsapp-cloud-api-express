import { RequestHandler } from 'express';

export const logRequest: RequestHandler = (req, res, next) => {
  console.log(req.url);
  if (req.body != null) {
    console.log(JSON.stringify(req.body));
  }
  next();
};
