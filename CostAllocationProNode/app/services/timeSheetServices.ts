/* eslint-disable no-mixed-spaces-and-tabs */
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { TimeSheetsStatus } from '../enum';
import { awsConfig } from '../config/aws';
import { CustomError } from '../models/customError';
import { companyRepository, employeeRepository } from '../repositories';
import timeActivityRepository from '../repositories/timeActivityRepository';
import timeSheetRepository from '../repositories/timeSheetRepository';
import payPeriodRepository from '../repositories/payPeriodRepository';
import timeActivityServices from './timeActivityServices';
import {
	GetTimeSheetInterface,
	TimeSheetInterface,
} from '../interfaces/timeSheetInterface';
import { minutesToHoursAndMinutes } from '../helpers/global';
import { prisma } from '../client/prisma';

const sqs = new SQSClient(awsConfig);

class TimeSheetServices {
	// Get all time sheets
	async getAllTimeSheets(timeSheetData: GetTimeSheetInterface) {
		const {
			companyId,
			payPeriodId,
			page,
			limit,
			search,
			createdBy,
			type,
			sort,
		} = timeSheetData;

		if (!companyId) {
			throw new CustomError(400, 'Company id is required');
		}

		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);
		if (!companyDetails) {
			throw new CustomError(400, 'Company not found');
		}

		// Offset set
		const offset = (Number(page) - 1) * Number(limit);

		// Filter Conditions

		let filterConditions = {};

		if (createdBy) {
			filterConditions = {
				createdBy: {
					id: createdBy,
				},
			};
		}

		let payPeriodFilter = {};

		if (payPeriodId) {
			payPeriodFilter = {
				payPeriodId: payPeriodId,
			};
		}

		// Conditions for searching
		const searchCondition = search
			? {
					OR: [
						{
							name: { contains: search as string, mode: 'insensitive' },
						},
					],
			  }
			: {};

		const orderByArray: any = [];

		if (sort === 'createdByName') {
			orderByArray.push({
				createdBy: {
					firstName: type ? type : 'desc',
				},
			});
		}

		if (sort === 'status') {
			orderByArray.push({
				status: type ? type : 'desc',
			});
		}

		orderByArray.push({
			id: 'desc'
		})

		const sortCondition = {
			orderBy: orderByArray,
		};

		const data = {
			companyId,
			offset: offset,
			limit: limit,
			filterConditions: filterConditions,
			searchCondition: searchCondition,
			sortCondition: sortCondition,
			payPeriodFilter: payPeriodFilter,
		};

		const { timeSheets, count } = await timeSheetRepository.getAllTimeSheets(
			data
		);

		timeSheets.forEach((singleTimeSheet: any) => {
			let approvedHours = 0;
			singleTimeSheet.timeActivities.forEach((singleTimeActivity: any) => {
				approvedHours += singleTimeActivity.hours
					? Number(singleTimeActivity.hours) * 60 +
					  Number(singleTimeActivity.minute)
					: Number(singleTimeActivity.minute);
			});

			const formattedHours = minutesToHoursAndMinutes(approvedHours);
			singleTimeSheet['approvedHours'] = formattedHours;
			singleTimeSheet['createdByName'] =
				singleTimeSheet?.createdBy?.firstName +
				' ' +
				singleTimeSheet?.createdBy?.lastName;
			delete singleTimeSheet.timeActivities;
		});

		return { timeSheets, count };
	}

	async createTimeSheet(timeSheetData: TimeSheetInterface) {
		const { companyId, payPeriodId } = timeSheetData;

		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);

		if (!companyDetails) {
			throw new CustomError(400, 'Company not found');
		}

		const payPeriodDetails = await payPeriodRepository.getDetails(
			payPeriodId as string,
			companyId
		);

		if (!payPeriodDetails) {
			throw new CustomError(400, 'Pay period not found');
		}

		const timeActivities =
			await timeActivityServices.getAllTimeActivitiesServices({
				companyId: companyId,
				payPeriodId: payPeriodId,
			});

		timeSheetData['timeActivities'] =
			timeActivities.timeActivitiesWithHours.map(
				(singleActivity: any) => singleActivity.id
			);

		// if (!name) {
		// 	const startDate = moment(payPeriodDetails.startDate).format('MM-DD-YYYY');
		// 	const endDate = moment(payPeriodDetails.endDate).format('MM-DD-YYYY');
		// 	timeSheetData['name'] = `Timesheet (${startDate} - ${endDate})`;
		// }

		const timeSheet = await timeSheetRepository.createTimeSheet(timeSheetData);

		return timeSheet;
	}

	// Create a new time sheet
	async createTimeSheetByDate(timeSheetData: any) {
		try {
			const { companyId, name, startDate, endDate, notes, status, user } =
				timeSheetData;

			let dateFilters = {};

			if (startDate && endDate) {
				if (startDate === endDate) {
					dateFilters = {
						activityDate: {
							equals: startDate,
						},
					};
				} else {
					dateFilters = {
						activityDate: {
							gte: startDate,
							lte: endDate,
						},
					};
				}
			} else {
				dateFilters = {};
			}

			const timeLogs = await timeActivityRepository.getAllTimeActivities({
				companyId: companyId,
				dateFilters: dateFilters,
			});

			const totalHoursAndMinutes: any = {};
			let finalHours = 0;
			let finalMinutes = 0;

			timeLogs?.forEach((singleActivity: any) => {
				const employeeId = singleActivity.employeeId;
				const hours = Number(singleActivity.hours);
				const minute = Number(singleActivity.minute);

				if (!totalHoursAndMinutes[employeeId!]) {
					totalHoursAndMinutes[employeeId!] = {
						totalHours: 0,
						totalMinutes: 0,
					};
				}
				totalHoursAndMinutes[employeeId!].totalHours += hours;
				totalHoursAndMinutes[employeeId!].totalMinutes += minute;

				// Adjust totalMinutes if it exceeds 59
				if (totalHoursAndMinutes[employeeId!].totalMinutes >= 60) {
					const additionalHours = Math.floor(
						totalHoursAndMinutes[employeeId!].totalMinutes / 60
					);
					totalHoursAndMinutes[employeeId!].totalHours += additionalHours;
					totalHoursAndMinutes[employeeId!].totalMinutes %= 60;
				}

				finalHours += hours;
				finalMinutes += minute;

				if (finalMinutes > 60) {
					const additionalHours = Math.floor(finalMinutes / 60);

					finalHours += additionalHours;
					finalMinutes %= 60;
				}
			});

			// Create new timesheet

			const finalTimeSheetData = {
				name: name as string,
				totalHours: finalHours.toString(),
				totalMinute: finalMinutes.toString(),
				notes: notes as string,
				status: status as TimeSheetsStatus,
				companyId: companyId as string,
				userId: user.id as string,
				submittedOn: new Date(),
				startDate: startDate as Date,
				endDate: endDate as Date,
				payPeriodId: '123',
			};

			const timeSheet = await timeSheetRepository.createTimeSheet(
				finalTimeSheetData
			);

			const timeSheetLogsData = Object.entries(totalHoursAndMinutes)?.map(
				(singleObject: any) => {
					return {
						employeeId: singleObject[0],
						hours: singleObject[1]['totalHours'].toString(),
						minute: singleObject[1]['totalMinutes'].toString(),
						timeSheetsId: timeSheet?.id,
					};
				}
			);

			const timeSheetLogs = await timeSheetRepository?.createTimeSheetLogs(
				timeSheetLogsData
			);

			console.log('Time logs: ', timeSheet, timeSheetLogs);

			return timeSheet;
		} catch (err) {
			throw err;
		}
	}

	// Get all time sheet employee logs
	async getTimeSheetLogs(timeSheetId: string) {
		try {
			const timeSheetDetails = await timeSheetRepository.getTimeSheetDetails(
				timeSheetId as string
			);
			if (!timeSheetDetails) {
				throw new CustomError(404, 'Time sheet not found');
			}

			return timeSheetDetails;
		} catch (err) {
			throw err;
		}
	}

	// Email time sheets
	async emailTimeSheet(timeSheetData: any) {
		try {
			const { timeSheetId, employeeList, companyId } = timeSheetData;

			const timeSheetDetails = await timeSheetRepository.getTimeSheetDetails(
				timeSheetId
			);
			if (!timeSheetDetails) {
				throw new CustomError(404, 'Time sheet not found');
			}

			await Promise.all(
				await employeeList.map(async (singleEmployee: any) => {
					const dateFilters = {
						activityDate: {
							gte: timeSheetDetails.startDate,
							lte: timeSheetDetails.endDate,
						},
					};
					const data = {
						employeeId: singleEmployee,
						dateFilters: dateFilters,
						companyId: companyId,
					};

					const allTimeLogs =
						await timeActivityRepository.getTimeActivityByEmployeeDate(data);

					const employeeDetails = await employeeRepository.getEmployeeDetails(
						singleEmployee
					);

					const pdfData = {
						allTimeLogs,
						startDate: timeSheetDetails.startDate,
						endDate: timeSheetDetails.endDate,
						employeeId: singleEmployee.employeeId,
						totalHours: timeSheetDetails.totalHours,
						totalMinutes: timeSheetDetails.totalMinute,
					};

					const queueData = new SendMessageCommand({
						QueueUrl: `${process.env.QUEUE_URL}`,
						MessageBody: JSON.stringify({
							pdfData: pdfData,
							singleEmployee: employeeDetails,
						}),
					});

					await sqs.send(queueData);

					// const pdfData = await timeLogPdfGenerate(
					// 	allTimeLogs,
					// 	timeSheetDetails.startDate,
					// 	timeSheetDetails.endDate,
					// 	singleEmployee.employeeId,
					// 	'120'
					// );

					// if (employeeDetails?.email) {
					// 	const response = await axios.post(
					// 		'https://pdf.satvasolutions.com/api/ConvertHtmlToPdf',
					// 		{
					// 			FileName: 'mypdf.pdf',
					// 			HtmlData: [btoa(pdfData)],
					// 		}
					// 	);
					// 	console.log('RES: ', response.data);
					// 	const mailOptions = {
					// 		from: config.smtpEmail,
					// 		to: employeeDetails?.email,
					// 		subject: `Actual hours worked Timesheet `,
					// 		html: 'This is pdf',
					// 		attachments: [
					// 			{
					// 				filename: 'cat.pdf',
					// 				content: response.data,
					// 				encoding: 'base64',
					// 			},
					// 		],

					// 		// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
					// 	};

					// 	sendEmail(mailOptions);
					// }
				})
			);
		} catch (err) {
			throw err;
		}
	}

	async getTimeSheetByPayPeriod(payPeriodId: string, companyId: string) {
		const timeSheetData = await prisma.timeSheets.findUnique({
			where: {
				payPeriodId,
			},
		});

		if (timeSheetData && timeSheetData.companyId != companyId) {
			throw new CustomError(400, 'Can not access timesheet');
		}

		return timeSheetData;
	}

	async getTimeSheetWiseEmployees(timeSheetId: string, companyId: string) {
		if (!timeSheetId) {
			throw new CustomError(400, 'Time Sheet id is required');
		}
		if (!companyId) {
			throw new CustomError(400, 'Company id is required');
		}

		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);

		if (!companyDetails) {
			throw new CustomError(400, 'Company not found');
		}

		const timeSheetDetails = await timeSheetRepository.getTimeSheetDetails(
			timeSheetId as string
		);
		
		if (!timeSheetDetails) {
			throw new CustomError(400, 'Time sheet not found');
		}

		const timeSheet = await timeSheetRepository.getEmployees(
			timeSheetId,
			companyId
		);

		const employeeIds: any = [];
		const newEmployees: any = [];

		timeSheet?.timeActivities.forEach((singleActivity: any) => {
			if (!employeeIds.includes(singleActivity.employee.id)) {
				employeeIds.push(singleActivity.employee.id);
			}
		});

		employeeIds.forEach((singleId: string) => {
			let minutes = 0;
			const objectEmp: any = {};
			const newArr = timeSheet?.timeActivities.filter(
				(singleActivity: any) => singleActivity.employee.id == singleId
			);

			newArr?.forEach((singleItem: any) => {
				minutes =
					(singleItem.hours
						? Number(singleItem.hours) * 60 + Number(singleItem.minute)
						: Number(singleItem.minute)) + Number(minutes);
				objectEmp['employeeId'] = singleItem.employee.id;
				objectEmp['employeeName'] = singleItem.employee.fullName;
				objectEmp['email'] = singleItem.employee.email;
			});

			// Convert minutes to hours

			const finalHours = minutesToHoursAndMinutes(minutes);
			objectEmp['approvedHours'] = finalHours;
			newEmployees.push(objectEmp);
		});

		// timeSheet &&
		// 	timeSheet.timeActivities.map((singleActivity: any) => {
		// 		let minutes = 0;
		// 		if (singleActivity.hours) {
		// 			minutes =
		// 				Number(singleActivity.hours) * 60 + Number(singleActivity.minute);
		// 		} else {
		// 			minutes = Number(singleActivity.minute);
		// 		}

		// 		if (object[singleActivity.employee.id]) {
		// 			object[singleActivity.employee.id] += Number(minutes);
		// 		} else {
		// 			object[singleActivity.employee.id] = minutes;
		// 		}
		// 	});

		return newEmployees;
	}
}

export default new TimeSheetServices();
