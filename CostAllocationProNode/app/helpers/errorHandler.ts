/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../models/customError';

// Custom Error Object
export const customError = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = new CustomError(err.status, err.message, err.additionalInfo);
	if (error.status == 500) {
		console.log('Error: ', err);
		return res.status(error.status).json({
			error: err,
			message: 'Something went wrong',
			responseStatus: error.status,
		});
	} else {
		return res.status(error.status).json({
			error: err,
			message: error.message,
			responseStatus: error.status,
		});
	}
};

// 404 Not Found Error
export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new CustomError(404, `Path not found`);
	next(error);
};
