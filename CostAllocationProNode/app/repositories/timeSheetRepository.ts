import { prisma } from '../client/prisma';
import {
	GetTimeSheetInterface,
	TimeSheetInterface,
	TimeSheetLogsInterface,
} from '../interfaces/timeSheetInterface';

class TimeSheetRepository {
	// Get all time sheets
	async getAllTimeSheets(timeSheetData: GetTimeSheetInterface) {
		const {
			companyId,
			offset,
			limit,
			searchCondition,
			filterConditions,
			sortCondition,
			payPeriodFilter,
		} = timeSheetData;

		const timeSheets = await prisma.timeSheets.findMany({
			where: {
				companyId: companyId,
				...payPeriodFilter,
				...searchCondition,
				...filterConditions,
			},
			skip: offset,
			take: limit,
			...sortCondition,
			include: {
				timeActivities: true,
				createdBy: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		});

		const count = await prisma.timeSheets.count();

		return { timeSheets, count };
	}

	// Get time sheet details
	async getTimeSheetDetails(timeSheetId: string) {
		const timeSheetDetails = await prisma.timeSheets.findFirst({
			where: {
				id: timeSheetId,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
					},
				},
				timeActivities: true,
			},
		});
		return timeSheetDetails;
	}

	// Create new time sheet
	async createTimeSheet(timeSheetData: TimeSheetInterface) {
		const {
			name,
			notes,
			status = 'Draft',
			companyId,
			userId,
			payPeriodId,
			timeActivities,
		} = timeSheetData;

		const findExistingTimeSheet = await prisma.timeSheets.findUnique({
			where: {
				payPeriodId,
			},
		});

		if (findExistingTimeSheet) {
			const timeSheet = await prisma.timeSheets.update({
				where: {
					id: findExistingTimeSheet.id,
				},
				data: {
					name: name,
					notes: notes,
					status: status,
					company: { connect: { id: companyId } },
					createdBy: { connect: { id: userId } },
					payPeriod: { connect: { id: payPeriodId } },
					timeActivities: {
						connect: timeActivities.map((timeActivityId: any) => ({
							id: timeActivityId,
						})),
					},
					submittedOn: new Date(),
				},
			});

			return timeSheet;
		}

		const timeSheet = await prisma.timeSheets.create({
			data: {
				name: name,
				notes: notes,
				status: status,
				company: { connect: { id: companyId } },
				createdBy: { connect: { id: userId } },
				payPeriod: { connect: { id: payPeriodId } },
				timeActivities: {
					connect: timeActivities.map((timeActivityId: any) => ({
						id: timeActivityId,
					})),
				},
				submittedOn: new Date(),
			},
		});
		return timeSheet;
	}

	// Create new time sheet employee logs
	async createTimeSheetLogs(timeSheetLogsData: any) {
		const timeSheetLogs = await Promise.all(
			await timeSheetLogsData?.map(
				async (singleTimeSheetLog: TimeSheetLogsInterface) => {
					await prisma.timeSheetLogs.create({
						data: {
							hours: singleTimeSheetLog?.hours,
							minute: singleTimeSheetLog?.minute,
							timeSheets: { connect: { id: singleTimeSheetLog?.timeSheetsId } },
							employee: { connect: { id: singleTimeSheetLog?.employeeId } },
						},
					});
				}
			)
		);
		return timeSheetLogs;
	}

	// Get Employees
	async getEmployees(timeSheetId: string, companyId: string) {
		const timeSheet = await prisma.timeSheets.findFirst({
			where: {
				id: timeSheetId,
				companyId: companyId,
			},
			include: {
				timeActivities: {
					include: {
						employee: true,
					},
				},
			},
		});
		return timeSheet;
	}
}

export default new TimeSheetRepository();
