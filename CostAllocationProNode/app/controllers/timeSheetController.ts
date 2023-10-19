import { NextFunction, Response } from 'express';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { RequestExtended } from '../interfaces/global';
import { CustomError } from '../models/customError';
import { companyRepository } from '../repositories';
import timeSheetServices from '../services/timeSheetServices';
import timeSheetRepository from '../repositories/timeSheetRepository';

class TimeSheetController {
	async getAllTimeSheets(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const {
				companyId,
				page = 1,
				limit = 10,
				search = '',
				createdBy = '',
				type = '',
				sort = '',
				payPeriodId = '',
			} = req.query;

			const data = {
				companyId: companyId as string,
				payPeriodId: payPeriodId as string,
				page: Number(page),
				limit: Number(limit),
				search: String(search),
				createdBy: String(createdBy),
				type: String(type),
				sort: String(sort),
			};

			const timeSheets = await timeSheetServices.getAllTimeSheets(data);
			return DefaultResponse(
				res,
				200,
				'Time Sheets fetched successfully',
				timeSheets
			);
		} catch (err) {
			next(err);
		}
	}

	async createTimeSheetByDate(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const {
				companyId,
				name,
				startDate = '',
				endDate = '',
				notes,
				status,
			} = req.body;

			checkValidation(req);

			const companyDetails = await companyRepository.getDetails(
				companyId as string
			);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found.');
			}

			let formattedStartDate = '';
			let formattedEndDate = '';

			if (startDate && endDate) {
				// Format start date
				const newStart: any = new Date(startDate as string);
				newStart.setUTCHours(0, 0, 0, 0);
				console.log('New start date: ' + newStart);
				formattedStartDate = newStart.toISOString();

				// Format end date
				const newEnd: any = new Date(endDate as string);
				newEnd.setUTCHours(0, 0, 0, 0);
				formattedEndDate = newEnd.toISOString();
			}

			const user = req.user;

			const data = {
				companyId: companyId,
				name: name,
				startDate: formattedStartDate,
				endDate: formattedEndDate,
				notes: notes,
				status: status,
				user: user,
			};

			const timeSheet = await timeSheetServices.createTimeSheetByDate(data);

			return DefaultResponse(
				res,
				200,
				'Time sheet created successfully',
				timeSheet
			);
		} catch (err) {
			next(err);
		}
	}

	async getTimeSheetDetails(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const { id } = req.params;
			const timeSheetDetails = await timeSheetRepository.getTimeSheetDetails(
				id
			);

			if (!timeSheetDetails) {
				throw new CustomError(400, 'Time sheet not found');
			}

			return DefaultResponse(
				res,
				200,
				'Time Sheet fetched successfully',
				timeSheetDetails
			);
		} catch (err) {
			next(err);
		}
	}

	async createTimeSheet(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			checkValidation(req);
			const { name, notes, status, companyId, payPeriodId } = req.body;

			const data = {
				name: name,
				notes: notes,
				status: status,
				companyId: companyId,
				payPeriodId: payPeriodId,
				userId: req.user.id,
			};
			const createdTimeSheet = await timeSheetServices.createTimeSheet(data);
			return DefaultResponse(
				res,
				201,
				'Time sheet created successfully',
				createdTimeSheet
			);
		} catch (err) {
			next(err);
		}
	}

	async getAllTimeSheetLogs(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const { companyId, timeSheetId } = req.query;

			if (!companyId) {
				throw new CustomError(404, 'Company id is required');
			}

			if (!timeSheetId) {
				throw new CustomError(404, 'Time sheet id is required');
			}

			const companyDetails = await companyRepository.getDetails(
				companyId as string
			);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const timeSheetLogs = await timeSheetServices.getTimeSheetLogs(
				timeSheetId as string
			);
			return DefaultResponse(
				res,
				200,
				'Time sheet employee logs successfully',
				timeSheetLogs
			);
		} catch (err) {
			next(err);
		}
	}

	async emailTimeSheet(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const { companyId, timeSheetId } = req.body;
			const employeeList: any = req.body.employeeList;

			if (!companyId) {
				throw new CustomError(404, 'Company id is required');
			}
			if (!employeeList) {
				throw new CustomError(404, 'Employee List array is required');
			}
			if (!timeSheetId) {
				throw new CustomError(404, 'Time sheet id is required');
			}
			if (employeeList.length == 0) {
				throw new CustomError(404, 'Employee List array is required');
			}

			const companyDetails = await companyRepository.getDetails(
				companyId as string
			);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const timeSheetData = {
				timeSheetId: timeSheetId,
				employeeList: employeeList,
				companyId: companyId,
			};

			await timeSheetServices.emailTimeSheet(timeSheetData);
			return DefaultResponse(res, 200, 'Email sent successfully');
		} catch (err) {
			next(err);
		}
	}

	async getTimeSheetByPayPeriod(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const data = await timeSheetServices.getTimeSheetByPayPeriod(
				req.query.payPeriodId as string,
				req.query.companyId as string
			);

			return DefaultResponse(res, 200, 'Timesheet found', data);
		} catch (error) {
			next(error);
		}
	}

	async getTimeSheetWiseEmployees(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const { timeSheetId, companyId } = req.query;

			const employees = await timeSheetServices.getTimeSheetWiseEmployees(
				timeSheetId as string,
				companyId as string
			);

			return DefaultResponse(
				res,
				200,
				'Employees fetched successfully',
				employees
			);
		} catch (err) {
			next(err);
		}
	}
}

export default new TimeSheetController();
