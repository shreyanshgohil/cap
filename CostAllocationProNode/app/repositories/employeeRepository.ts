import { prisma } from '../client/prisma';
import employeeCostRepository from './employeeCostRepository';
import payPeriodRepository from './payPeriodRepository';

class EmployeeRepository {
	async getAllEmployeesByCompanyId(companyId: string) {
		try {
			const employees = await prisma.employee.findMany({
				where: {
					companyId: companyId,
				},
			});
			return employees;
		} catch (err) {
			throw err;
		}
	}

	async updateOrCreateEmployee(
		empId: string,
		companyId: string,
		employeeData: any,
		listOfFields?: any
	) {
		try {
			const employee = await prisma.employee.findFirst({
				where: {
					employeeId: empId,
					companyId: companyId,
				},
			});

			let updatedEmployees: any;
			if (employee) {
				const updated: any = await prisma.employee.updateMany({
					where: {
						employeeId: empId,
						companyId: companyId,
					},
					data: {
						fullName: employeeData?.fullName,
						email: employeeData?.email,
						phone: employeeData?.phone,
						active: employeeData?.active,
					},
				});
				updatedEmployees = updated[0];
			} else {
				updatedEmployees = await prisma.employee.create({
					data: {
						employeeId: employeeData?.employeeId,
						fullName: employeeData?.fullName,
						email: employeeData?.email,
						phone: employeeData?.phone,
						active: employeeData?.active,
						company: { connect: { id: employeeData?.companyId } },
					},
				});
				// This is new code for creating fields for employees after syncing

				if (listOfFields && listOfFields?.length > 0) {
					await Promise.all(
						await listOfFields.map(async (singleField: any) => {
							await prisma.employeeCostField.create({
								data: {
									employee: { connect: { id: updatedEmployees.id } },
									field: { connect: { id: singleField.id } },
									company: { connect: { id: companyId } },
								},
							});
						})
					);

					// Fetch all pay periods
					const payPeriods = await payPeriodRepository.getAll({
						companyId: companyId,
					});

					// Create initial values
					if (payPeriods.length > 0) {
						payPeriods.map(async (singlePayPeriod: any) => {
							await employeeCostRepository.createMonthlyCost(
								[updatedEmployees],
								companyId,
								singlePayPeriod.id
							);
						});
					}

					// OLD REQUIREMENT CODE NEED TO UPDATE WITH NEW
					// const monthList = await prisma.monthYearTable.findMany({
					// 	where: {
					// 		companyId: companyId,
					// 	},
					// });

					// // Create initial values
					// monthList?.map(async (singleRecord: any) => {
					// 	await employeeCostRepository.createMonthlyCost(
					// 		[updatedEmployees],
					// 		companyId,
					// 		new Date(
					// 			`${singleRecord?.month}/1/${singleRecord?.year}`
					// 		).toString()
					// 	);
					// });
				}
			}
			return updatedEmployees;
		} catch (err) {
			throw err;
		}
	}

	async getEmployeeDetails(employeeId: string) {
		const employee = await prisma.employee.findUnique({
			where: {
				id: employeeId,
			},
		});
		return employee;
	}
}

export default new EmployeeRepository();
