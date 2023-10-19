/* eslint-disable no-mixed-spaces-and-tabs */

import moment from 'moment-timezone';
import { prisma } from '../client/prisma';
import {
	getAllTimeActivityInterface,
	updateTimeActivityInterface,
} from '../interfaces/timeActivityInterface';
import { CustomError } from '../models/customError';
import quickbooksClient from '../quickbooksClient/quickbooksClient';
import { companyRepository, employeeRepository } from '../repositories';
import timeActivityRepository from '../repositories/timeActivityRepository';
import quickbooksServices from './quickbooksServices';
import payPeriodRepository from '../repositories/payPeriodRepository';

interface QuickbooksTimeActivityInterface {
	accessToken: string;
	tenantID: string;
	refreshToken: string;
	companyId: string;
}

class TimeActivityService {
	// Get all time activities
	async getAllTimeActivitiesServices(
		timeActivityData: getAllTimeActivityInterface
	) {
		const {
			companyId,
			search,
			sort,
			page,
			limit,
			type,
			classId,
			customerId,
			employeeId,
			isOverHours,
			payPeriodId,
			year,
		} = timeActivityData;

		// let yearFilter = {};
		// if (year) {
		// 	yearFilter = {
		// 		AND: [
		// 			{
		// 				activityDate: {
		// 					gte: new Date(`${Number(year)}-01-01T00:00:00Z`), // Start of the year
		// 				},
		// 			},
		// 			{
		// 				activityDate: {
		// 					lt: new Date(`${Number(year) + 1}-01-01T00:00:00Z`), // Start of the next year
		// 				},
		// 			},
		// 		],
		// 	};
		// }

		// console.log('YEAR: ', yearFilter);

		let dateFilters = {};

		if (payPeriodId) {
			// Get pay period details
			const payPeriodData = await payPeriodRepository.getDetails(
				payPeriodId,
				companyId as string
			);

			if (!payPeriodData) {
				throw new CustomError(404, 'Pay period not found');
			}

			const payPeriodStartDate = payPeriodData?.startDate;
			const payPeriodEndDate = payPeriodData?.endDate;

			let startDate: any;
			let endDate: any;

			if (payPeriodStartDate && payPeriodEndDate) {
				// Format start date
				startDate = payPeriodStartDate.setUTCHours(0, 0, 0, 0);
				// startDate = newStart.toISOString();

				// Format end date
				endDate = payPeriodEndDate.setUTCHours(23, 59, 59, 999);
				// endDate = newEnd.toISOString();
			}

			if (startDate && endDate) {
				dateFilters = {
					activityDate: {
						gte: new Date(startDate),
						lte: new Date(endDate),
					},
				};
			} else {
				dateFilters = {};
			}
		}
		// Offset set
		const offset = (Number(page) - 1) * Number(limit);

		// Set filter conditions
		const filteredData = [];

		if (classId) {
			filteredData.push({ classId: classId });
		}
		if (customerId) {
			filteredData.push({ customerId: customerId });
		}
		if (employeeId) {
			filteredData.push({
				employee: {
					id: employeeId,
				},
			});
		}

		if (year) {
			filteredData.push(
				{
					activityDate: {
						gte: new Date(`${Number(year)}-01-01T00:00:00Z`), // Start of the year
					},
				},
				{
					activityDate: {
						lt: new Date(`${Number(year) + 1}-01-01T00:00:00Z`), // Start of the next year
					},
				}
			);
		}

		const filterConditions =
			filteredData?.length > 0
				? {
						AND: filteredData,
				  }
				: {};

		// const dateFilters =
		// 	startDate && endDate
		// 		? {
		// 				activityDate: {
		// 					gte: startDate,
		// 					lte: endDate,
		// 				},
		// 		  }
		// 		: {};

		// Conditions for searching
		const searchCondition = search
			? {
					OR: [
						{
							className: { contains: search as string, mode: 'insensitive' },
						},
						{
							customerName: { contains: search as string, mode: 'insensitive' },
						},
						{
							employee: {
								fullName: { contains: search as string, mode: 'insensitive' },
							},
						},
					],
			  }
			: {};

		// Conditions for sort
		const sortCondition: any = sort
			? {
					orderBy: [
						{
							[sort as string]: type ?? 'asc',
						},
						{
							id: 'asc',
						},
					],
			  }
			: {
					orderBy: [
						{
							activityDate: 'desc',
						},
						{
							id: 'asc',
						},
					],
			  };

		if (sort === 'employee') {
			sortCondition['orderBy'] = [
				{
					employee: {
						fullName: type,
					},
				},
				{ id: 'asc' },
			];
		}

		// Check if company exists or not
		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		// CODE FOR HANDLING OVER HOURS AND UNDER HOURS

		// Update total hours for each time activities

		// const allTimeActivities = await timeActivityRepository.getAllTimeActivities(
		// 	{
		// 		companyId: companyId,
		// 	}
		// );

		// const allTimeActivityHoursUpdate =
		// 	await this.calculateTimeActivitiesWithHours(allTimeActivities);

		// // Update over hour records
		// await Promise.all(
		// 	allTimeActivityHoursUpdate?.map(async (singleActivity: any) => {
		// 		// if (singleActivity?.isOver) {
		// 		await overHoursRepository.updateOverHoursByYear(
		// 			singleActivity?.companyId,
		// 			singleActivity?.employeeId,
		// 			new Date(singleActivity?.activityDate).getFullYear(),
		// 			singleActivity?.overHours,
		// 			singleActivity?.overMinutes,
		// 			singleActivity?.isOver
		// 		);
		// 		// }
		// 	})
		// );

		let timeActivitiesWithHours;

		if (isOverHours) {
			const timeActivities = {
				companyId: companyId,
				isOverHours: isOverHours,
				offset: offset,
				limit: limit,
				filterConditions: filterConditions,
				searchCondition: searchCondition,
				sortCondition: sortCondition,
				dateFilters: dateFilters,
				search: search,
				sort: sort,
				type: type,
			};

			timeActivitiesWithHours =
				await timeActivityRepository.getAllTimeActivitiesOverHours(
					timeActivities
				);
		} else {
			const timeActivities = await timeActivityRepository.getAllTimeActivities({
				companyId: companyId,
				offset: offset,
				limit: limit,
				filterConditions: filterConditions,
				searchCondition: searchCondition,
				sortCondition: sortCondition,
				dateFilters: dateFilters,
			});

			timeActivitiesWithHours = await this.calculateTimeActivitiesWithHours(
				timeActivities
			);
		}

		const timeActivitiesCount =
			await timeActivityRepository.getAllTimeActivitiesCount({
				companyId: companyId,
			});

		return { timeActivitiesWithHours, timeActivitiesCount };
		// return { timeActivitiesWithHours, timeActivitiesCount, timeActivities };
	}

	async syncTimeActivities(companyId: string) {
		const companyDetails = await companyRepository.getDetails(companyId);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		// Get access token for quickbooks
		const authResponse = await quickbooksServices.getAccessToken(companyId);

		// If company exists - sync time activities by last sync
		if (companyDetails) {
			const timeActivities: any = await this.syncTimeActivityFirstTime({
				accessToken: authResponse?.accessToken as string,
				refreshToken: authResponse?.refreshToken as string,
				tenantID: authResponse?.tenantID as string,
				companyId: companyId as string,
			});

			if (
				timeActivities &&
				timeActivities?.QueryResponse?.TimeActivity?.length > 0
			) {
				// Filtered vendors, fetching employees only
				const filteredEmployees =
					timeActivities?.QueryResponse?.TimeActivity?.filter(
						(timeActivity: any) => timeActivity?.EmployeeRef
					);

				await Promise.all(
					filteredEmployees?.map(async (timeActivity: any) => {
						const data: any = {
							timeActivityId: timeActivity?.Id,
							classId: timeActivity?.ClassRef?.value || null,
							className: timeActivity?.ClassRef?.name || null,
							customerId: timeActivity?.CustomerRef?.value || null,
							customerName: timeActivity?.CustomerRef?.name || null,
							hours: timeActivity?.Hours?.toString() || '0',
							minute: timeActivity?.Minutes?.toString() || '0',
							activityDate: timeActivity?.TxnDate,
							employeeId: timeActivity?.EmployeeRef?.value,
						};

						// update or create time activity

						return await timeActivityRepository.updateOrCreateTimeActivity(
							timeActivity?.Id,
							companyId,
							data
						);
					})
				);
				return timeActivities?.QueryResponse?.TimeActivity;
				// console.log('My time activities: ', timeActivities);
			} else {
				// Else - sync time activities for the first time

				await this.syncTimeActivityFirstTime({
					accessToken: authResponse?.accessToken as string,
					refreshToken: authResponse?.refreshToken as string,
					tenantID: authResponse?.tenantID as string,
					companyId: companyId as string,
				});
			}
		}
	}

	async lambdaSyncFunction(timeActivityData: any) {
		const {
			accessToken,
			tenantId,
			refreshToken,
			companyId,
			timeActivityLastSyncDate,
		} = timeActivityData;

		if (timeActivityLastSyncDate) {
			// Last sync exists

			console.log('TIME Activity Last Sync exist');
		} else {
			// Last sync does not exist - time activity sync for the first time

			// Find all time activities from quickbooks
			const timeActivities: any = await quickbooksClient.getAllTimeActivities(
				accessToken,
				tenantId,
				refreshToken
			);

			if (
				timeActivities &&
				timeActivities?.QueryResponse?.TimeActivity?.length > 0
			) {
				// Filtered vendors, fetching employees only
				const filteredEmployees =
					timeActivities?.QueryResponse?.TimeActivity?.filter(
						(timeActivity: any) => timeActivity?.EmployeeRef
					);

				await Promise.all(
					filteredEmployees?.map(async (timeActivity: any) => {
						let hours: any = 0;
						let minutes: any = 0;
						if (
							timeActivity?.Hours !== null &&
							timeActivity?.Hours !== undefined &&
							timeActivity?.Minutes !== null &&
							timeActivity?.Minutes !== undefined
						) {
							hours = timeActivity?.Hours;
							minutes = timeActivity?.Minutes;
						} else if (timeActivity?.Hours == 0 && timeActivity?.Minutes == 0) {
							hours = timeActivity?.Hours;
							minutes = timeActivity?.Minutes;
						} else {
							const start: any = new Date(timeActivity?.StartTime);
							const end: any = new Date(timeActivity?.EndTime);

							const breakHours = timeActivity?.BreakHours; // Example break hours
							const breakMinutes = timeActivity?.BreakMinutes; // Example break minutes

							// Calculate the total time duration in milliseconds
							let totalTimeInMillis: any = end - start;

							// If the start date is greater than end date
							if (start > end) {
								const nextDay: any = new Date(start);
								nextDay.setDate(nextDay.getDate() + 1);
								totalTimeInMillis += nextDay - start;
							}

							// Calculate the break time in milliseconds
							const breakTimeInMillis =
								(breakHours * 60 + breakMinutes) * 60 * 1000;

							// Calculate the effective work duration
							const effectiveTimeInMillis =
								totalTimeInMillis - breakTimeInMillis;

							// Calculate hours and minutes from milliseconds
							const effectiveHours = Math.floor(
								effectiveTimeInMillis / (60 * 60 * 1000)
							);
							const effectiveMinutes = Math.floor(
								(effectiveTimeInMillis % (60 * 60 * 1000)) / (60 * 1000)
							);

							hours = effectiveHours;
							minutes = effectiveMinutes;
						}
						const data: any = {
							timeActivityId: timeActivity?.Id,
							classId: timeActivity?.ClassRef?.value || null,
							className: timeActivity?.ClassRef?.name || null,
							customerId: timeActivity?.CustomerRef?.value || null,
							customerName: timeActivity?.CustomerRef?.name || null,
							hours: hours?.toString()?.padStart(2, '0') || '00',
							minute: minutes?.toString()?.padStart(2, '0') || '00',
							// hours: timeActivity?.Hours?.toString() || '0',
							// minute: timeActivity?.Minutes?.toString() || '0',
							activityDate: timeActivity?.TxnDate,
							employeeId: timeActivity?.EmployeeRef?.value,
							companyId: companyId,
						};

						// Dump time activity in the database for the first time

						return await timeActivityRepository.createTimeActivitySync(
							data,
							companyId
						);
					})
				);

				await prisma.company.update({
					where: {
						id: companyId,
					},
					data: {
						timeActivitiesLastSyncDate: moment(new Date())
							.tz('America/Los_Angeles')
							.format(),
					},
				});
			}
		}
	}

	async syncTimeActivityFirstTime(
		timeActivityData: QuickbooksTimeActivityInterface
	) {
		const { accessToken, refreshToken, tenantID } = timeActivityData;

		// Find all time activities from quickbooks
		const timeActivities = await quickbooksClient.getAllTimeActivities(
			accessToken,
			tenantID,
			refreshToken
		);

		return timeActivities;

		// Dump all time activities in db
	}

	async syncTimeActivityByLastSync(companyId: string) {
		try {
			// Check if company exists or not
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			// Get access token
			const authResponse = await quickbooksServices.getAccessToken(companyId);

			// DO NOT REMOVE THIS CODE

			// LAMBDA FUNCTION CALL

			// const syncData = await axios.post(
			// 	config.employeeSyncLambdaEndpoint,
			// 	{
			// 		accessToken: authResponse?.accessToken,
			// 		refreshToken: authResponse?.refreshToken,
			// 		tenantID: authResponse?.tenantID,
			// 		companyId: companyId,
			// 		employeeLastSyncDate: companyDetails?.employeeLastSyncDate,
			// 	},
			// 	{
			// 		headers: {
			// 			'x-api-key': config.employeeSyncLambdaApiKey,
			// 			'Content-Type': 'application/json',
			// 		},
			// 	}
			// );

			// return syncData?.data;

			// LAMBDA FUNCTION CALL

			// For local API

			// Get employees by last sync from Quickbooks

			const newTimeActivities: any =
				await quickbooksClient?.getTimeActivitiesByLastSync(
					authResponse?.accessToken as string,
					authResponse?.tenantID as string,
					authResponse?.refreshToken as string,
					companyDetails?.timeActivitiesLastSyncDate as Date
				);

			// If new records found

			let timeActivityArr = [];
			if (
				newTimeActivities &&
				newTimeActivities?.QueryResponse?.TimeActivity?.length > 0
			) {
				// Filtered vendors, fetching employees only
				const filteredEmployees =
					newTimeActivities?.QueryResponse?.TimeActivity?.filter(
						(timeActivity: any) => timeActivity?.EmployeeRef
					);
				timeActivityArr = await Promise.all(
					filteredEmployees?.map(async (timeActivity: any) => {
						let hours: any = '0';
						let minutes: any = '0';
						if (
							timeActivity?.Hours !== null &&
							timeActivity?.Hours !== undefined &&
							timeActivity?.Minutes !== null &&
							timeActivity?.Minutes !== undefined
						) {
							hours = timeActivity?.Hours;
							minutes = timeActivity?.Minutes;
						} else if (timeActivity?.Hours == 0 && timeActivity?.Minutes == 0) {
							hours = timeActivity?.Hours;
							minutes = timeActivity?.Minutes;
						} else {
							const start: any = new Date(timeActivity?.StartTime);
							const end: any = new Date(timeActivity?.EndTime);
							const breakHours = timeActivity?.BreakHours; // Example break hours
							const breakMinutes = timeActivity?.BreakMinutes; // Example break minutes

							// Calculate the total time duration in milliseconds
							let totalTimeInMillis: any = end - start;

							// If the start date is greater than end date
							if (start > end) {
								const nextDay: any = new Date(start);
								nextDay.setDate(nextDay.getDate() + 1);
								totalTimeInMillis += nextDay - start;
							}

							// Calculate the break time in milliseconds
							const breakTimeInMillis =
								(breakHours * 60 + breakMinutes) * 60 * 1000;

							// Calculate the effective work duration
							const effectiveTimeInMillis =
								totalTimeInMillis - breakTimeInMillis;

							// Calculate hours and minutes from milliseconds
							const effectiveHours = Math.floor(
								effectiveTimeInMillis / (60 * 60 * 1000)
							);
							const effectiveMinutes = Math.floor(
								(effectiveTimeInMillis % (60 * 60 * 1000)) / (60 * 1000)
							);

							hours = effectiveHours;
							minutes = effectiveMinutes;
						}

						const timeActivityData: any = {
							timeActivityId: timeActivity?.Id,
							classId: timeActivity?.ClassRef?.value || null,
							className: timeActivity?.ClassRef?.name || null,
							customerId: timeActivity?.CustomerRef?.value || null,
							customerName: timeActivity?.CustomerRef?.name || null,
							hours: hours?.toString()?.padStart(2, '0') || '00',
							minute: minutes?.toString()?.padStart(2, '0') || '00',
							// hours: timeActivity?.Hours?.toString() || '0',
							// minute: timeActivity?.Minutes?.toString() || '0',
							activityDate: timeActivity?.TxnDate,
							employeeId: timeActivity?.EmployeeRef?.value,
						};

						// Update or create timeActivity in db
						return await timeActivityRepository.updateOrCreateTimeActivity(
							timeActivity?.Id,
							companyId,
							timeActivityData
						);
					})
				);
			}
			// Update time activity last sync date
			await prisma.company.update({
				where: {
					id: companyId,
				},
				data: {
					timeActivitiesLastSyncDate: moment(new Date())
						.tz('America/Los_Angeles')
						.format(),
				},
			});
			return timeActivityArr;
		} catch (err) {
			throw err;
		}
	}

	// Update hours for time activity in DB
	async updateTimeActivity(timeActivityData: updateTimeActivityInterface) {
		const {
			companyId,
			timeActivityId,
			hours,
			minute,
			classId,
			className,
			customerId,
			customerName,
		} = timeActivityData;

		// Check if company exists or not
		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		// Update time logs
		const updated = await timeActivityRepository.updateTimeActivity({
			timeActivityId: timeActivityId,
			companyId: companyId,
			hours: hours,
			minute: minute,
			classId: classId,
			className: className,
			customerId: customerId,
			customerName: customerName,
		});
		return updated;
	}

	// Create a new time activity in DB
	async createTimeActivity(createTimeActivityData: any) {
		const { companyId, employeeId } = createTimeActivityData;

		// Check if company exists or not
		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		if (employeeId) {
			// Check if employee found
			const employeeDetails = await employeeRepository.getEmployeeDetails(
				employeeId as string
			);
			if (!employeeDetails) {
				throw new CustomError(404, 'Employee not found');
			}
		}

		const createdTimeActivity = await timeActivityRepository.createTimeActivity(
			createTimeActivityData
		);
		return createdTimeActivity;
	}

	// Delete time activity from DB
	async deleteTimeActivity(timeActivityData: updateTimeActivityInterface) {
		const { companyId, timeActivityId } = timeActivityData;

		// Check if company exists or not
		const companyDetails = await companyRepository.getDetails(
			companyId as string
		);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		// Deleted time logs
		const deleted = await timeActivityRepository.deleteTimeActivity({
			timeActivityId: timeActivityId,
			companyId: companyId,
		});
		return deleted;
	}

	// Export Time Activity
	async exportTimeActivity(
		companyId: string,
		search: string,
		classId: string,
		customerId: string,
		employeeId: string,
		payPeriodId: string
	) {
		let dateFilters = {};
		let payPeriodData;
		if (payPeriodId) {
			// Get pay period details
			payPeriodData = await payPeriodRepository.getDetails(
				payPeriodId!,
				companyId
			);

			if (!payPeriodData) {
				throw new CustomError(404, 'Pay period not found');
			}

			const payPeriodStartDate = payPeriodData?.startDate;
			const payPeriodEndDate = payPeriodData?.endDate;

			let startDate = '';
			let endDate = '';

			if (payPeriodStartDate && payPeriodEndDate) {
				// Format start date
				const newStart: any = new Date(payPeriodStartDate);
				newStart.setUTCHours(0, 0, 0, 0);
				startDate = newStart.toISOString();

				// Format end date
				const newEnd: any = new Date(payPeriodEndDate);
				newEnd.setUTCHours(0, 0, 0, 0);
				endDate = newEnd.toISOString();
			}

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
		}

		// Check If company exists
		const companyDetails = await companyRepository.getDetails(companyId);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		// Set filter conditions
		const filteredData = [];

		if (classId) {
			filteredData.push({ classId: classId });
		}
		if (customerId) {
			filteredData.push({ customerId: customerId });
		}
		if (employeeId) {
			filteredData.push({
				employee: {
					id: employeeId,
				},
			});
		}
		const filterConditions =
			filteredData?.length > 0
				? {
						AND: filteredData,
				  }
				: {};

		// Conditions for searching
		const searchCondition = search
			? {
					OR: [
						{
							className: { contains: search as string, mode: 'insensitive' },
						},
						{
							customerName: { contains: search as string, mode: 'insensitive' },
						},
						{
							employee: {
								fullName: { contains: search as string, mode: 'insensitive' },
							},
						},
					],
			  }
			: {};

		const getAllActivities =
			await timeActivityRepository.getAllTimeActivityForExport({
				companyId: companyId,
				filterConditions: filterConditions,
				searchCondition: searchCondition,
				dateFilters: dateFilters,
			});

		const timeActivities: any = [];

		getAllActivities?.forEach((singleTimeActivity) => {
			if (
				singleTimeActivity.SplitTimeActivities &&
				singleTimeActivity.SplitTimeActivities.length > 0
			) {
				singleTimeActivity.SplitTimeActivities.forEach((singleSplit: any) => {
					const object = {
						'Activity Date': moment(singleSplit.activityDate).format(
							'MM/DD/YYYY'
						),
						'Employee Name': singleSplit?.employee?.fullName,
						Customer: singleSplit?.customerName
							? singleSplit?.customerName
							: 'NA',
						Class: singleSplit?.className ? singleSplit?.className : 'NA',
						Hours: `${singleSplit?.hours}:${singleSplit?.minute}`,
					};
					timeActivities.push(object);
				});
			} else {
				const object = {
					'Activity Date': moment(singleTimeActivity.activityDate).format(
						'MM/DD/YYYY'
					),
					'Employee Name': singleTimeActivity?.employee?.fullName,
					Customer: singleTimeActivity?.customerName
						? singleTimeActivity?.customerName
						: 'NA',
					Class: singleTimeActivity?.className
						? singleTimeActivity?.className
						: 'NA',
					Hours: `${singleTimeActivity?.hours}:${singleTimeActivity?.minute}`,
				};
				timeActivities.push(object);
			}
		});

		return { timeActivities, companyDetails, payPeriodData };
	}

	async calculateTimeActivitiesWithHours(timeActivities: any) {
		const finalData = await Promise.all(
			await timeActivities?.map(async (singleActivity: any) => {
				const field = await prisma.field.findFirst({
					where: {
						companyId: singleActivity?.companyId as string,
						name: 'Maximum allocate hours per year',
					},
				});
				const data = {
					employeeId: singleActivity?.employeeId,
					companyId: singleActivity?.companyId,
					year: new Date(singleActivity.activityDate).getFullYear(),
					fieldId: field?.id,
				};
				const employeeTotalHours =
					await timeActivityRepository.getEmployeeHours(data);

				let actualHours = 0;
				let actualMinutes = 0;

				const employeeHours =
					await timeActivityRepository.getTimeActivityByEmployee({
						companyId: singleActivity?.companyId,
						employeeId: singleActivity?.employeeId,
						year: new Date(singleActivity.activityDate).getFullYear(),
					});

				employeeHours?.map((singleEmpHours: any) => {
					actualHours += Number(singleEmpHours?.hours);
					actualMinutes += Number(singleEmpHours?.minute);
				});

				if (actualMinutes > 60) {
					const additionalHours = Math.floor(actualMinutes / 60);
					actualHours += additionalHours;
					actualMinutes %= 60;
				}

				const employeeFinalHours = {
					actualHours: actualHours,
					actualMinutes: actualMinutes,
					totalHours: Number(employeeTotalHours?.value?.split(':')[0]),
					totalMinutes: Number(employeeTotalHours?.value?.split(':')[1]),
				};

				return employeeFinalHours;
			})
		);

		const timeActivitiesWithHours = timeActivities?.map(
			(singleActivity: any, index: number) => {
				const totalHours = finalData[index]?.totalHours;
				const totalMinutes = finalData[index]?.totalMinutes;

				const actualHours = finalData[index]?.actualHours;
				const actualMinutes = finalData[index]?.actualMinutes;

				//  Calculate total time in minutes
				const totalTimeInMinutes = totalHours * 60 + totalMinutes;
				const actualTimeInMinutes = actualHours * 60 + actualMinutes;

				//  Calculate the difference in minutes
				let timeDifferenceInMinutes = totalTimeInMinutes - actualTimeInMinutes;

				// Take the absolute value of the result for further calculations
				timeDifferenceInMinutes = Math.abs(timeDifferenceInMinutes);

				//  Calculate hours and minutes from the difference
				const hoursDifference = Math.floor(
					Number(timeDifferenceInMinutes) / 60
				);
				const minutesDifference = Number(timeDifferenceInMinutes) % 60;

				const data = {
					...singleActivity,
					isOver: actualTimeInMinutes > totalTimeInMinutes ? true : false,
					totalHours: totalHours,
					totalMinutes: totalMinutes,
					actualHours: actualHours,
					actualMinutes: actualMinutes,
					overHours: hoursDifference,
					overMinutes: minutesDifference,
				};

				return data;
			}
		);

		return timeActivitiesWithHours;
	}
}

export default new TimeActivityService();
