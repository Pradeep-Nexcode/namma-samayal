import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const catchAsync = <TReq extends Request = Request>(
  fn: AsyncRequestHandler<TReq>,
) => {
  return (req: TReq, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
};
