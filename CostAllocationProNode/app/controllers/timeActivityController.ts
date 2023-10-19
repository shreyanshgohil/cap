/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-var-requires */
import { NextFunction, Response } from 'express';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { RequestExtended } from '../interfaces/global';
import { CustomError } from '../models/customError';
import { companyRepository } from '../repositories';
import timeActivityServices from '../services/timeActivityServices';
import { checkPermission } from '../middlewares/isAuthorizedUser';
import axios from 'axios';
import moment from 'moment';
import fs from 'fs';

const Excel = require('excel4node');
// import moment from 'moment';
const dataExporter = require('json2csv').Parser;

class TimeActivityController {
	async getAllTimeActivities(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			checkValidation(req);

			const {
				page = 1,
				limit = 10,
				search = '',
				classId = '',
				customerId = '',
				employeeId = '',
				type = '',
				sort = '',
				isOverHours = false,
				payPeriodId = '',
				companyId = '',
				year = '',
			} = req.query;

			// if (!payPeriodId) {
			// 	throw new CustomError(400, 'Pay Period Id is required');
			// }

			if (!companyId) {
				throw new CustomError(400, 'Company id is required');
			}

			// Check If company exists
			const companyDetails = await companyRepository.getDetails(
				companyId as string
			);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			// Checking is the user is permitted
			const isPermitted = await checkPermission(req, companyId as string, {
				permissionName: 'Time Logs',
				permission: ['view'],
			});

			if (!isPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			const { timeActivitiesWithHours, timeActivitiesCount } =
				await timeActivityServices.getAllTimeActivitiesServices({
					companyId: String(companyId),
					page: Number(page),
					limit: Number(limit),
					search: String(search),
					classId: String(classId),
					customerId: String(customerId),
					employeeId: String(employeeId),
					type: String(type),
					sort: String(sort),
					isOverHours:
						isOverHours === 'false'
							? false
							: isOverHours === 'true'
							? true
							: '',
					payPeriodId: String(payPeriodId),
					year: String(year),
				});

			return DefaultResponse(res, 200, 'Time Activities fetched successfully', {
				timeActivities: timeActivitiesWithHours,
				timeActivitiesCount: timeActivitiesCount,
			});
		} catch (err) {
			next(err);
		}
	}

	async syncTimeActivities(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			checkValidation(req);

			const companyId = req.body?.companyId;

			// Check If company exists
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			// Checking is the user is permitted
			const isAddPermitted = await checkPermission(req, companyId, {
				permissionName: 'Time Logs',
				permission: ['add'],
			});

			// Checking is the user is permitted
			const isEditPermitted = await checkPermission(req, companyId, {
				permissionName: 'Time Logs',
				permission: ['edit'],
			});

			if (!isAddPermitted && !isEditPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			// Check if company is connected
			if (companyDetails.isConnected == false) {
				throw new CustomError(400, 'Company is not connected');
			}

			// Check if company is active
			if (companyDetails.status == false) {
				throw new CustomError(400, 'Company status is not active');
			}

			await timeActivityServices.syncTimeActivityByLastSync(companyId);
			// await timeActivityServices.syncTimeActivities(companyId);

			return DefaultResponse(res, 200, 'Time Activities synced successfully');
		} catch (err) {
			next(err);
		}
	}

	async updateTimeActivity(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			checkValidation(req);

			const {
				timeActivityId,
				companyId,
				hours,
				minute,
				classId,
				className,
				customerId,
				customerName,
			} = req.body;

			// Checking is the user is permitted
			const isPermitted = await checkPermission(req, companyId, {
				permissionName: 'Time Logs',
				permission: ['edit'],
			});

			if (!isPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			// Update service
			const updatedTimeActivity = await timeActivityServices.updateTimeActivity(
				{
					timeActivityId,
					companyId,
					hours,
					minute,
					classId,
					className,
					customerId,
					customerName,
				}
			);

			return DefaultResponse(
				res,
				200,
				'Time activity updated successfully',
				updatedTimeActivity
			);
		} catch (err) {
			next(err);
		}
	}

	async createTimeActivity(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			checkValidation(req);

			const {
				companyId,
				hours,
				minute,
				classId,
				className,
				customerId,
				customerName,
				activityDate,
				employeeId,
			} = req.body;

			// Check If company exists
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			if (!classId || !customerId || !employeeId) {
				throw new CustomError(
					400,
					'ClassId, CustomerId and EmployeeId are required'
				);
			}

			// Checking is the user is permitted
			const isPermitted = await checkPermission(req, companyId, {
				permissionName: 'Time Logs',
				permission: ['add'],
			});

			if (!isPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			// Create service
			const createTimeActivity = await timeActivityServices.createTimeActivity({
				companyId,
				hours,
				minute,
				classId,
				className,
				customerId,
				customerName,
				activityDate,
				employeeId,
			});

			return DefaultResponse(
				res,
				201,
				'Time activity created successfully',
				createTimeActivity
			);
		} catch (err) {
			next(err);
		}
	}

	async deleteTimeActivity(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const { timeActivityId, companyId } = req.body;
			checkValidation(req);

			// Checking is the user is permitted
			const isPermitted = await checkPermission(req, companyId, {
				permissionName: 'Time Logs',
				permission: ['delete'],
			});

			if (!isPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			await timeActivityServices.deleteTimeActivity({
				companyId: companyId,
				timeActivityId: timeActivityId,
			});

			return DefaultResponse(res, 200, 'Time Activity deleted successfully');
		} catch (err) {
			next(err);
		}
	}

	// Export Time Activity CSV
	async exportTimeActivity(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const {
				companyId,
				search = '',
				classId = '',
				customerId = '',
				employeeId = '',
				payPeriodId = '',
			} = req.query;

			const { timeActivities, companyDetails, payPeriodData } =
				await timeActivityServices.exportTimeActivity(
					companyId as string,
					search as string,
					classId as string,
					customerId as string,
					employeeId as string,
					payPeriodId as string
				);

			const timeActivityData = JSON.parse(JSON.stringify(timeActivities));

			const fileHeader: any = [
				'Activity Date',
				'Employee Name',
				'Customer',
				'Class',
				'Hours',
			];

			const jsonData = new dataExporter({ fileHeader });

			let dateRange;

			let startDate;
			let endDate;
			if (payPeriodData) {
				startDate = moment(payPeriodData.startDate).format('MM/DD/YYYY');
				endDate = moment(payPeriodData.endDate).format('MM/DD/YYYY');
				dateRange = `${startDate} - ${endDate}`;
			} else {
				dateRange = 'All';
			}
			const extraData =
				`Report Name ,Time Logs\n` +
				`Period ,${dateRange}\n` +
				`QBO Company's Name ,${companyDetails?.tenantName}\n` +
				`\n`;

			const csvData = jsonData.parse(timeActivityData);

			res.setHeader('Content-Type', 'text/csv');

			res.setHeader(
				'Content-Disposition',
				'attachment; filename=sample_data.csv'
			);

			return res.status(200).end(extraData + csvData);
		} catch (err) {
			next(err);
		}
	}

	// Export Pdf
	async exportTimeActivityPdf(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const htmlData = req.body.html;
			const fileName = req.body.fileName;

			const response = await axios.post(
				'https://pdf.satvasolutions.com/api/ConvertHtmlToPdf',
				{
					FileName: fileName,
					HtmlData: htmlData,
				}
			);

			return res.status(200).json({
				data: response.data,
			});
		} catch (err) {
			next(err);
		}
	}

	// Export Excel
	async exportTimeActivityExcel(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const {
				companyId,
				search = '',
				classId = '',
				customerId = '',
				employeeId = '',
				startDate = '',
				endDate = '',
				payPeriodId = '',
			} = req.query;

			let formattedStartDate = '';
			let formattedEndDate = '';

			if (startDate && endDate) {
				// Format start date
				const newStart: any = new Date(startDate as string);
				newStart.setUTCHours(0, 0, 0, 0);
				formattedStartDate = newStart.toISOString();

				// Format end date
				const newEnd: any = new Date(endDate as string);
				newEnd.setUTCHours(0, 0, 0, 0);
				formattedEndDate = newEnd.toISOString();
			}

			const { timeActivities, companyDetails } =
				await timeActivityServices.exportTimeActivity(
					companyId as string,
					search as string,
					classId as string,
					customerId as string,
					employeeId as string,
					payPeriodId as string
				);

			// Create a new Excel workbook and worksheet
			const wb = new Excel.Workbook();
			const ws = wb.addWorksheet('Sheet 1');

			// Define Excel styles
			const boldTitleStyle = wb.createStyle({
				font: {
					bold: true,
					size: 14,
				},
				alignment: {
					horizontal: 'center',
				},
			});

			let fileName = '';
			let dateRange = '';
			if (startDate && endDate) {
				fileName =
					formattedStartDate === formattedEndDate
						? `${moment(formattedEndDate).format('MM-DD-YYYY')}`
						: `${moment(formattedStartDate).format('MM-DD-YYYY')} - ${moment(
								formattedEndDate
						  ).format('MM-DD-YYYY')}`;
				dateRange =
					formattedStartDate === formattedEndDate
						? `${moment(formattedEndDate).format('MM-DD-YYYY')}`
						: `${moment(formattedStartDate).format('MM-DD-YYYY')} - ${moment(
								formattedEndDate
						  ).format('MM-DD-YYYY')}`;
			} else {
				fileName = moment().format('MM-DD-YYYY');
				dateRange = 'All';
			}

			// Add the title (with bold formatting)
			ws.cell(1, 1, true).string('Report Name:');
			ws.cell(1, 2, true).string('Time Log Activity');

			ws.cell(2, 1).string('Period');
			ws.cell(2, 2).string(dateRange);
			ws.cell(3, 1).string("QBO Company's Name");
			ws.cell(3, 2).string(companyDetails?.tenantName);

			// Add headers
			ws.cell(5, 1).string('Activity Date').style(boldTitleStyle);
			ws.cell(5, 2).string('Employee').style(boldTitleStyle);
			ws.cell(5, 3).string('Customer').style(boldTitleStyle);
			ws.cell(5, 4).string('Class').style(boldTitleStyle);
			ws.cell(5, 5).string('Hours').style(boldTitleStyle);

			// Add data from JSON
			timeActivities.forEach((item: any, index: any) => {
				ws.cell(index + 6, 1).string(item['Activity Date']);
				ws.cell(index + 6, 2).string(item['Class']);
				ws.cell(index + 6, 3).string(item['Customer']);
				ws.cell(index + 6, 4).string(item['Employee Name']);
				ws.cell(index + 6, 5).string(item['Hours']);
			});

			// Generate Excel file
			const excelFileName = `${fileName}.xlsx`;
			wb.write(excelFileName, (err: any) => {
				if (err) {
					console.error('Error writing Excel file:', err);
					res.status(500).json({ error: 'Error generating Excel file' });
				} else {
					console.log('Excel file generated:', excelFileName);
					res.download(excelFileName, (err) => {
						if (err) {
							console.error('Error sending Excel file:', err);
							res.status(500).json({ error: 'Error sending Excel file' });
						} else {
							// Clean up the Excel file after it's sent
							fs.unlinkSync(excelFileName);
						}
					});
				}
			});
		} catch (err) {
			next(err);
		}
	}
}

export default new TimeActivityController();
