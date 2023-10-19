/* eslint-disable no-mixed-spaces-and-tabs */
import { prisma } from '../client/prisma';
import { CustomError } from '../models/customError';
import {
	companyRepository,
	employeeCostRepository,
	employeeRepository,
} from '../repositories';
import payPeriodRepository from '../repositories/payPeriodRepository';
class EmployeeCostService {
	async getMonthlyCost(
		companyId: string,
		date: string,
		page: number,
		limit: number,
		search: string,
		type: string,
		sort: string,
		payPeriodId: string
	) {
		try {
			// Offset
			const offset = (Number(page) - 1) * Number(limit);

			const company = await companyRepository.getDetails(companyId);
			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}

			// Conditions for search
			const searchCondition = search
				? {
						OR: [
							{
								fullName: {
									mode: 'insensitive',
									contains: search as string,
								},
							},
						],
				  }
				: {};

			// Conditions for sort
			const sortCondition = {
				orderBy: {
					fullName: sort ? sort : 'asc',
				},
			};

			// Check which method is activate in company configuration - Hourly Or Percentage

			// const configurations =
			// 	await configurationRepository.getCompanyConfiguration(companyId);

			const isPercentage = true;

			// if (configurations?.payrollMethod === 'Hours') {
			// 	isPercentage = false;
			// } else {
			// 	isPercentage = true;
			// }

			let employeesMonthlyCost = [];

			if (payPeriodId) {
				employeesMonthlyCost = await employeeCostRepository.getMonthlyCost(
					companyId,
					date,
					offset,
					limit,
					searchCondition,
					sortCondition,
					isPercentage,
					payPeriodId
				);
			} else {
				employeesMonthlyCost = await employeeCostRepository.getEmployees(
					companyId,
					offset,
					limit,
					searchCondition,
					sortCondition
				);
			}

			const count = await employeeCostRepository.count(
				companyId,
				searchCondition
			);
			return { employees: employeesMonthlyCost, count };
		} catch (error) {
			throw error;
		}
	}

	async getMonthlyCostV2(
		companyId: string,
		date: string,
		page: number,
		limit: number,
		search: string,
		type: string,
		sort: string,
		payPeriodId: string
	) {
		try {
			// Offset
			const offset = (Number(page) - 1) * Number(limit);

			const company = await companyRepository.getDetails(companyId);
			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}

			// Conditions for search
			const searchCondition = search
				? {
						OR: [
							{
								fullName: {
									mode: 'insensitive',
									contains: search as string,
								},
							},
						],
				  }
				: {};

			// Conditions for sort
			const sortCondition = {
				orderBy: {
					fullName: sort ? sort : 'asc',
				},
			};

			// Check which method is activate in company configuration - Hourly Or Percentage

			// const configurations =
			// 	await configurationRepository.getCompanyConfiguration(companyId);

			const isPercentage = true;

			// if (configurations?.payrollMethod === 'Hours') {
			// 	isPercentage = false;
			// } else {
			// 	isPercentage = true;
			// }

			let employeesMonthlyCost: any[] = [];

			if (payPeriodId) {
				employeesMonthlyCost = await employeeCostRepository.getMonthlyCost(
					companyId,
					date,
					offset,
					limit,
					searchCondition,
					sortCondition,
					isPercentage,
					payPeriodId
				);
			} else {
				employeesMonthlyCost = await employeeCostRepository.getEmployees(
					companyId,
					offset,
					limit,
					searchCondition,
					sortCondition
				);
			}

			const employeeCostMappingData: any[] = [];

			if (employeesMonthlyCost.length) {
				employeesMonthlyCost.forEach((singleEmployeeData: any) => {
					const obj: any = {};

					obj['employeeName'] = singleEmployeeData.fullName;
					obj['totalLaborBurden'] = '0.00';
					if (singleEmployeeData && singleEmployeeData?.employeeCostField) {
						singleEmployeeData.employeeCostField.forEach(
							(singleFieldObj: any) => {
								if (singleFieldObj && singleFieldObj.field) {
									obj[singleFieldObj.field.id] =
										singleFieldObj.costValue[0].value;
									obj[`value_${singleFieldObj.field.id}`] =
										singleFieldObj.costValue[0].id;
									obj[`section_${singleFieldObj.field.id}`] =
										singleFieldObj.field.configurationSectionId;
								}
							}
						);
					}
					obj['status'] = singleEmployeeData?.active;
					employeeCostMappingData.push(obj);
				});
			}

			const count = await employeeCostRepository.count(
				companyId,
				searchCondition
			);
			return { employees: employeeCostMappingData, count, payPeriodId };
		} catch (error) {
			throw error;
		}
	}

	async getMonthlyCostTotal(companyId: string, payPeriodId: string, search: string) {
		const company = await companyRepository.getDetails(companyId);
		if (!company) {
			const error = new CustomError(404, 'Company not found');
			throw error;
		}

		const payPeriod = await payPeriodRepository.getDetails(payPeriodId, companyId);
		if (!payPeriod) {
			const error = new CustomError(404, 'Pay period not found');
			throw error;
		}

		const employeesMonthlyCost =
			await employeeCostRepository.getMonthlyCostTotal(companyId, payPeriodId, search);

		const obj: any = {
			employeeName: 'Total',
			status: true,
		};

		const companyFields = await prisma.field.findMany({
			where: {
				companyId,
				jsonId: 't1',
			},
		});

		const totalFields: any[] = [];

		companyFields.forEach((e) => {
			if (!totalFields.includes(e.id)) {
				totalFields.push(e.id);
			}
		});

		employeesMonthlyCost.forEach((singleEmployeeData: any) => {
			singleEmployeeData.employeeCostField.forEach((singleFieldObj: any) => {
				if (singleEmployeeData && singleEmployeeData?.employeeCostField) {
					if (obj[singleFieldObj.field.id]) {
						obj[singleFieldObj.field.id] += Number(
							singleFieldObj.costValue[0].value
						);
					} else {
						obj[singleFieldObj.field.id] = Number(
							singleFieldObj.costValue[0].value
						);
					}
				}
			});
		});

		let total = 0;

		Object.keys(obj).forEach((key: string) => {
			if (totalFields.includes(key)) {
				total += obj[key];
			}
		});

		obj['totalLaborBurden'] = total;

		return obj;
	}

	async getMonthlyCostExport(
		companyId: string,
		date: string,
		search: string,
		type: string,
		sort: string,
		isPercentage: boolean,
		payPeriodId: string
	) {
		try {
			const company = await companyRepository.getDetails(companyId);
			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}
			let payPeriodData;
			if (payPeriodId) {
				// Get pay period details
				payPeriodData = await payPeriodRepository.getDetails(payPeriodId, companyId);

				if (!payPeriodData) {
					throw new CustomError(404, 'Pay period not found');
				}
			}

			// Conditions for search
			const searchCondition = search
				? {
						OR: [
							{
								fullName: {
									mode: 'insensitive',
									contains: search as string,
								},
							},
						],
				  }
				: {};

			// Conditions for sort
			const sortCondition = {
				orderBy: {
					fullName: sort ? sort : 'asc',
				},
			};

			const employeesMonthlyCost =
				await employeeCostRepository.getMonthlyCostExport(
					companyId,
					date,
					searchCondition,
					sortCondition,
					isPercentage,
					payPeriodId
				);
			const count = await employeeCostRepository.count(
				companyId,
				searchCondition
			);
			return { employees: employeesMonthlyCost, count, company, payPeriodData };
		} catch (error) {
			throw error;
		}
	}

	// For create the monthly time cost data
	async createMonthlyCost(companyId: string, payPeriodId: string) {
		try {
			const company = await companyRepository.getDetails(companyId);

			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}

			// Check if pay period exists
			const payPeriod = await payPeriodRepository.getDetails(payPeriodId, companyId);

			if (!payPeriod) {
				throw new CustomError(404, 'Pay period not found');
			}

			// const isValueExist = await employeeCostRepository.isMonthlyValueCreated(
			// 	companyId,
			// 	date
			// );

			// if (isValueExist) {
			// 	return;
			// }

			// await employeeCostRepository.createMonth(companyId, date);

			const employees = await employeeRepository.getAllEmployeesByCompanyId(
				companyId
			);
			if (employees.length === 0) {
				const error = new CustomError(404, 'No employee found in this company');
				throw error;
			}
			const createdMonthlyCosts =
				await employeeCostRepository.createMonthlyCost(
					employees,
					companyId,
					payPeriodId
				);

			return createdMonthlyCosts;
		} catch (error) {
			throw error;
		}
	}
	async updateMonthlyCost(
		employeeCostValueID: string,
		value: string,
		paPeriodId: string,
		isCalculatorValue: boolean
	) {
		try {
			const updatedEmployeeCostValue = employeeCostRepository.updateMonthlyCost(
				employeeCostValueID,
				value,
				paPeriodId,
				isCalculatorValue
			);
			return updatedEmployeeCostValue;
		} catch (error) {
			throw error;
		}
	}
}

export default new EmployeeCostService();
