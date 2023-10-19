import moment from 'moment';
import { prisma } from '../client/prisma';
import { PayPeriodInterface } from '../interfaces/payPeriodInterface';
import { CustomError } from '../models/customError';
import {
	companyRepository,
	employeeCostRepository,
	employeeRepository,
} from '../repositories';
import payPeriodRepository from '../repositories/payPeriodRepository';

class payPeriodServices {
	async getAllPayPeriods(payPeriodData: any) {
		const companyId = payPeriodData.companyId;

		const { page, limit, year } = payPeriodData;

		let offset;

		if (page && limit) {
			offset = (Number(page) - 1) * Number(limit);
		}
		// Check If company exists
		const companyDetails = await companyRepository.getDetails(companyId);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		let dateFilter = {};

		if (year) {
			const startDateOfYear = new Date(`${Number(year)}-01-01T00:00:00.000Z`);
			const endDateOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
			dateFilter = {
				OR: [
					{
						startDate: {
							gte: startDateOfYear,
							lt: endDateOfYear,
						},
					},
					{
						endDate: {
							gte: startDateOfYear,
							lt: endDateOfYear,
						},
					},
				],
			};
		}

		const data = {
			offset: offset,
			limit: limit,
			companyId: companyId,
			dateFilter: dateFilter,
		};

		const payPeriods = await payPeriodRepository.getAll(data);
		return payPeriods;
	}

	async count(payPeriodData: any) {
		const { companyId } = payPeriodData;
		const payPeriodCount = await prisma.payPeriod.count({
			where: {
				companyId: companyId,
			},
		});
		return payPeriodCount;
	}

	async createNewPayPeriod(payPeriodData: PayPeriodInterface) {
		const { companyId, startDate, endDate } = payPeriodData;

		// Check If company exists
		const companyDetails = await companyRepository.getDetails(companyId);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		if (endDate < startDate) {
			throw new CustomError(400, 'Start date must be before end date');
		}

		const { isInPayPeriod } = await payPeriodRepository.isDateInAnyPayPeriod(
			payPeriodData
		);

		if (isInPayPeriod) {
			throw new CustomError(400, 'Dates are already in pay period');
		}

		const payPeriod = await payPeriodRepository.create(payPeriodData);

		// Create employee cost value for this pay period

		const employees = await employeeRepository.getAllEmployeesByCompanyId(
			companyId
		);
		if (employees.length === 0) {
			const error = new CustomError(404, 'No employee found in this company');
			throw error;
		}
		await employeeCostRepository.createMonthlyCost(
			employees,
			companyId,
			payPeriod.id
		);

		return payPeriod;
	}

	async editPayPeriod(payPeriodData: any) {
		const companyId = payPeriodData.companyId;

		// Check If company exists
		const companyDetails = await companyRepository.getDetails(companyId);
		if (!companyDetails) {
			throw new CustomError(404, 'Company not found');
		}

		const { isInPayPeriod, payPeriod }: any =
			await payPeriodRepository.isDateInEditPayPeriod(payPeriodData);

		if (isInPayPeriod && payPeriod.id != payPeriodData.id) {
			throw new CustomError(400, 'Dates are already in pay period');
		}

		const data = await payPeriodRepository.update(payPeriodData);
		return data;
	}

	async getAllPayPeriodDates(companyId: string) {
		const payPeriods = await prisma.payPeriod.findMany({
			where: {
				companyId,
			},
			orderBy: {
				startDate: 'asc',
			},
		});
		const dates: string[] = [];

		payPeriods.forEach((e) => {
			const startDate: any = new Date(e.startDate);
			const endDate: any = new Date(e.endDate);

			// Calculate the difference in milliseconds between start and end dates
			const timeDiff = endDate - startDate;

			// Calculate the number of days between start and end dates
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

			// Push the start date into the result array
			dates.push(moment(startDate).format('YYYY-MM-DD'));

			// Push all dates in between
			for (let i = 1; i < daysDiff; i++) {
				const date = new Date(startDate);
				date.setDate(startDate.getDate() + i);
				dates.push(moment(date).format('YYYY-MM-DD'));
			}

			// Push the end date into the result array
			dates.push(moment(endDate).format('YYYY-MM-DD'));
		});

		return dates;
	}
}

export default new payPeriodServices();
