import { prisma } from '../client/prisma';
class EmployeeCostRepository {
	// For get the monthly cost value per employee
	async getMonthlyCost(
		companyId: string,
		date: string,
		offset: number,
		limit: number,
		searchCondition: any,
		sortCondition: any,
		isPercentage: boolean,
		payPeriodId: string
	) {
		try {
			// const dateCopy = new Date(date);
			const employeesCostByMonth = await prisma.employee.findMany({
				where: {
					companyId: companyId,
					...searchCondition,
				},
				include: {
					employeeCostField: {
						include: {
							field: true,
							costValue: {
								where: {
									payPeriodId: payPeriodId,
									isPercentage: true,
								},
								// where: {
								// 	month: dateCopy.getMonth() + 1,
								// 	year: dateCopy.getFullYear(),
								// 	isPercentage: isPercentage,
								// },
							},
						},
					},
				},
				skip: offset,
				take: limit,
				...sortCondition,
			});

			return employeesCostByMonth;
		} catch (error) {
			throw error;
		}
	}

	async getMonthlyCostTotal(companyId: string, payPeriodId: string, search: string) {

		const query: any = {
			companyId,
			fullName: {
				contains: search,
				mode: 'insensitive'
			}
		}

		if(!search) {
			delete query.fullName;
		}

		const employeesCostByMonth = await prisma.employee.findMany({
			where: query,
			include: {
				employeeCostField: {
					include: {
						field: true,
						costValue: {
							where: {
								payPeriodId: payPeriodId,
								isPercentage: true,
							},
						},
					},
				},
			},

			orderBy: {
				fullName: 'asc',
			},
		});
		return employeesCostByMonth;
	}

	async getEmployees(
		companyId: string,
		offset: number,
		limit: number,
		searchCondition: any,
		sortCondition: any
	) {
		try {
			// const dateCopy = new Date(date);
			const employeesCostByMonth = await prisma.employee.findMany({
				where: {
					companyId: companyId,
					...searchCondition,
				},
				skip: offset,
				take: limit,
				...sortCondition,
			});

			return employeesCostByMonth;
		} catch (error) {
			throw error;
		}
	}

	async getMonthlyCostExport(
		companyId: string,
		date: string,
		searchCondition: any,
		sortCondition: any,
		isPercentage: boolean,
		payPeriodId?: string
	) {
		const isPercentageValue = isPercentage || true;
		try {
			const employeesCostByMonth = await prisma.employee.findMany({
				where: {
					companyId: companyId,
					...searchCondition,
				},
				include: {
					employeeCostField: {
						include: {
							field: {
								include: {
									configurationSection: true,
								},
							},
							costValue: {
								where: {
									payPeriodId: payPeriodId,
									isPercentage: isPercentageValue,
								},
							},
						},
					},
				},

				...sortCondition,
			});

			return employeesCostByMonth;
		} catch (error) {
			throw error;
		}
	}

	async count(companyId: string, searchCondition: any) {
		try {
			const employeeCount = await prisma.employee.count({
				where: {
					companyId: companyId,
					...searchCondition,
				},
			});
			return employeeCount;
		} catch (error) {
			throw error;
		}
	}

	// Create monthly cost values for all employees
	async createMonthlyCost(
		employees: any,
		companyId: string,
		payPeriodId: string
	) {
		await Promise.all(
			employees.map(async (singleEmployee: any) => {
				// Fetching all the fields of that employee
				const employeeCostFields = await prisma.employeeCostField.findMany({
					where: {
						companyId: companyId,
						employeeId: singleEmployee.id,
					},
					select: {
						id: true,
						employee: true,
						employeeId: true,
						company: true,
						companyId: true,
						fieldId: true,
						field: {
							select: {
								jsonId: true,
								configurationSection: {
									select: {
										no: true,
									},
								},
							},
						},
					},
				});

				// Creating the values for single employee - For Percentage Method
				employeeCostFields.map(async (singleEmployeeCostFields) => {
					if (singleEmployeeCostFields?.field?.configurationSection?.no == 0) {
						if (singleEmployeeCostFields?.field?.jsonId == 'f1') {
							await prisma.employeeCostValue.create({
								data: {
									employee: { connect: { id: singleEmployee.id } },
									employeeCostField: {
										connect: { id: singleEmployeeCostFields.id },
									},
									payPeriod: { connect: { id: payPeriodId } },
									value: null,
									isPercentage: true,
								},
							});
						} else {
							await prisma.employeeCostValue.create({
								data: {
									employee: { connect: { id: singleEmployee.id } },
									employeeCostField: {
										connect: { id: singleEmployeeCostFields.id },
									},
									payPeriod: { connect: { id: payPeriodId } },
									value: '0:00',
									isPercentage: true,
								},
							});
						}
					} else {
						await prisma.employeeCostValue.create({
							data: {
								employee: { connect: { id: singleEmployee.id } },
								employeeCostField: {
									connect: { id: singleEmployeeCostFields.id },
								},
								payPeriod: { connect: { id: payPeriodId } },
								isPercentage: true,
							},
						});
					}
				});
			})
		);
		return 'Percentage values created successfully';
	}

	// For create the monthly values
	// async createMonthlyCost(employees: any, companyId: string, date: any) {
	// 	try {
	// 		// OLD Requirement

	// 		const dateCopy = new Date(date);

	// 		const monthArr: any = await prisma.monthYearTable.findMany({
	// 			where: {
	// 				year: dateCopy.getFullYear(),
	// 				companyId: companyId,
	// 			},
	// 			orderBy: {
	// 				month: 'desc',
	// 			},
	// 		});

	// 		const uniqueEmployeeIds = new Set();

	// 		const filteredEmployees = employees?.filter((singleEmployee: any) => {
	// 			if (!uniqueEmployeeIds.has(singleEmployee.id)) {
	// 				uniqueEmployeeIds.add(singleEmployee.id);
	// 				return true;
	// 			}
	// 			return false;
	// 		});

	// 		await Promise.all(
	// 			filteredEmployees.map(async (singleEmployee: any) => {
	// 				const getEmployeeHours = await overHoursRepository.getOverHoursByYear(
	// 					companyId,
	// 					singleEmployee?.id,
	// 					dateCopy.getFullYear()
	// 				);

	// 				if (!getEmployeeHours) {
	// 					const createEmployeeHours =
	// 						await overHoursRepository.createOverHoursByYear(
	// 							companyId,
	// 							singleEmployee?.id,
	// 							dateCopy.getFullYear()
	// 						);
	// 					console.log('Created EmployeeHours: ' + createEmployeeHours);
	// 				}
	// 			})
	// 		);

	// 		await Promise.all(
	// 			employees.map(async (singleEmployee: any) => {
	// 				// Fetching all the fields of that employee
	// 				const employeeCostFields = await prisma.employeeCostField.findMany({
	// 					where: {
	// 						companyId: companyId,
	// 						employeeId: singleEmployee.id,
	// 					},
	// 					select: {
	// 						id: true,
	// 						employee: true,
	// 						employeeId: true,
	// 						company: true,
	// 						companyId: true,
	// 						fieldId: true,
	// 						field: {
	// 							select: {
	// 								jsonId: true,
	// 								configurationSection: {
	// 									select: {
	// 										no: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				});

	// 				// Creating the values for single employee - For Hourly Method
	// 				employeeCostFields.map(async (singleEmployeeCostFields) => {
	// 					if (
	// 						singleEmployeeCostFields?.field?.configurationSection?.no == 0
	// 					) {
	// 						if (singleEmployeeCostFields?.field?.jsonId == 'f1') {
	// 							// Employee Type field

	// 							if (monthArr && monthArr.length > 1) {
	// 								const findEmployee = await prisma.employeeCostValue.findFirst(
	// 									{
	// 										where: {
	// 											month: monthArr[1].month,
	// 											year: dateCopy.getFullYear(),
	// 											isPercentage: false,
	// 											employeeFieldId: singleEmployeeCostFields?.id,
	// 										},
	// 									}
	// 								);

	// 								await prisma.employeeCostValue.create({
	// 									data: {
	// 										employee: { connect: { id: singleEmployee.id } },
	// 										employeeCostField: {
	// 											connect: { id: singleEmployeeCostFields.id },
	// 										},
	// 										month: dateCopy.getMonth() + 1,
	// 										year: dateCopy.getFullYear(),
	// 										value: findEmployee?.value || null,
	// 										isPercentage: false,
	// 									},
	// 								});
	// 							} else {
	// 								await prisma.employeeCostValue.create({
	// 									data: {
	// 										employee: { connect: { id: singleEmployee.id } },
	// 										employeeCostField: {
	// 											connect: { id: singleEmployeeCostFields.id },
	// 										},
	// 										month: dateCopy.getMonth() + 1,
	// 										year: dateCopy.getFullYear(),
	// 										value: null,
	// 										isPercentage: false,
	// 									},
	// 								});
	// 							}
	// 						} else {
	// 							// find last months hour

	// 							if (monthArr && monthArr.length > 1) {
	// 								const findEmployee = await prisma.employeeCostValue.findFirst(
	// 									{
	// 										where: {
	// 											month: monthArr[1].month,
	// 											year: dateCopy.getFullYear(),
	// 											isPercentage: false,
	// 											employeeFieldId: singleEmployeeCostFields?.id,
	// 										},
	// 									}
	// 								);

	// 								// Maximum allocated hours
	// 								await prisma.employeeCostValue.create({
	// 									data: {
	// 										employee: { connect: { id: singleEmployee.id } },
	// 										employeeCostField: {
	// 											connect: { id: singleEmployeeCostFields.id },
	// 										},
	// 										month: dateCopy.getMonth() + 1,
	// 										year: dateCopy.getFullYear(),
	// 										value: findEmployee?.value || '0:00',
	// 										isPercentage: false,
	// 									},
	// 								});
	// 							} else {
	// 								await prisma.employeeCostValue.create({
	// 									data: {
	// 										employee: { connect: { id: singleEmployee.id } },
	// 										employeeCostField: {
	// 											connect: { id: singleEmployeeCostFields.id },
	// 										},
	// 										month: dateCopy.getMonth() + 1,
	// 										year: dateCopy.getFullYear(),
	// 										value: '0:00',
	// 										isPercentage: false,
	// 									},
	// 								});
	// 							}
	// 						}
	// 					} else {
	// 						if (monthArr && monthArr.length > 1) {
	// 							const findEmployee = await prisma.employeeCostValue.findFirst({
	// 								where: {
	// 									month: monthArr[1].month,
	// 									year: dateCopy.getFullYear(),
	// 									isPercentage: false,
	// 									employeeFieldId: singleEmployeeCostFields?.id,
	// 								},
	// 							});

	// 							// For all other fields where value is default 0
	// 							await prisma.employeeCostValue.create({
	// 								data: {
	// 									employee: { connect: { id: singleEmployee.id } },
	// 									employeeCostField: {
	// 										connect: { id: singleEmployeeCostFields.id },
	// 									},
	// 									month: dateCopy.getMonth() + 1,
	// 									year: dateCopy.getFullYear(),
	// 									isPercentage: false,
	// 									value: findEmployee?.value,
	// 								},
	// 							});
	// 						} else {
	// 							await prisma.employeeCostValue.create({
	// 								data: {
	// 									employee: { connect: { id: singleEmployee.id } },
	// 									employeeCostField: {
	// 										connect: { id: singleEmployeeCostFields.id },
	// 									},
	// 									month: dateCopy.getMonth() + 1,
	// 									year: dateCopy.getFullYear(),
	// 									isPercentage: false,
	// 								},
	// 							});
	// 						}
	// 					}
	// 				});
	// 			})
	// 		);
	// 		await Promise.all(
	// 			employees.map(async (singleEmployee: any) => {
	// 				// Fetching all the fields of that employee
	// 				const employeeCostFields = await prisma.employeeCostField.findMany({
	// 					where: {
	// 						companyId: companyId,
	// 						employeeId: singleEmployee.id,
	// 					},
	// 					select: {
	// 						id: true,
	// 						employee: true,
	// 						employeeId: true,
	// 						company: true,
	// 						companyId: true,
	// 						fieldId: true,
	// 						field: {
	// 							select: {
	// 								jsonId: true,
	// 								configurationSection: {
	// 									select: {
	// 										no: true,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				});

	// 				// Creating the values for single employee - For Percentage Method
	// 				employeeCostFields.map(async (singleEmployeeCostFields) => {
	// 					if (
	// 						singleEmployeeCostFields?.field?.configurationSection?.no == 0
	// 					) {
	// 						if (singleEmployeeCostFields?.field?.jsonId == 'f1') {
	// 							await prisma.employeeCostValue.create({
	// 								data: {
	// 									employee: { connect: { id: singleEmployee.id } },
	// 									employeeCostField: {
	// 										connect: { id: singleEmployeeCostFields.id },
	// 									},
	// 									month: dateCopy.getMonth() + 1,
	// 									year: dateCopy.getFullYear(),
	// 									value: null,
	// 									isPercentage: true,
	// 								},
	// 							});
	// 						} else {
	// 							await prisma.employeeCostValue.create({
	// 								data: {
	// 									employee: { connect: { id: singleEmployee.id } },
	// 									employeeCostField: {
	// 										connect: { id: singleEmployeeCostFields.id },
	// 									},
	// 									month: dateCopy.getMonth() + 1,
	// 									year: dateCopy.getFullYear(),
	// 									value: '0:00',
	// 									isPercentage: true,
	// 								},
	// 							});
	// 						}
	// 					} else {
	// 						await prisma.employeeCostValue.create({
	// 							data: {
	// 								employee: { connect: { id: singleEmployee.id } },
	// 								employeeCostField: {
	// 									connect: { id: singleEmployeeCostFields.id },
	// 								},
	// 								month: dateCopy.getMonth() + 1,
	// 								year: dateCopy.getFullYear(),
	// 								isPercentage: true,
	// 							},
	// 						});
	// 					}
	// 				});
	// 			})
	// 		);
	// 		return 'Monthly Value created successfully';
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// Creating employee cost fields at integration time
	async createInitialValues(
		listOfEmployee: any,
		listOfFields: any,
		companyId: string
	) {
		try {
			await Promise.all(
				listOfEmployee.map(async (singleEmployee: any) => {
					listOfFields.map(async (singleField: any) => {
						await prisma.employeeCostField.create({
							data: {
								employee: { connect: { id: singleEmployee.id } },
								field: { connect: { id: singleField.id } },
								company: { connect: { id: companyId } },
							},
						});
					});
				})
			);
			return 'Initial values created';
		} catch (error) {
			throw error;
		}
	}

	// Create EmployeeCost when new field create
	async createNewEmployeeCost(
		listOfEmployee: any,
		fieldId: string,
		companyId: string,
		listOfPayPeriods: any
	) {
		try {
			await Promise.all(
				listOfEmployee.map(async (singleEmployee: any) => {
					//creating employee field
					const employeeCostField = await prisma.employeeCostField.create({
						data: {
							employee: { connect: { id: singleEmployee.id } },
							field: { connect: { id: fieldId } },
							company: { connect: { id: companyId } },
						},
					});

					// creating the employee cost field value - percentage
					await Promise.all(
						listOfPayPeriods.map(async (singlePayPeriod: any) => {
							await prisma.employeeCostValue.create({
								data: {
									employee: { connect: { id: singleEmployee?.id } },
									employeeCostField: {
										connect: { id: employeeCostField?.id },
									},
									payPeriod: { connect: { id: singlePayPeriod?.id } },
									isPercentage: true,
								},
							});
						})
					);

					// creating the employee cost field value - hourly
					// await Promise.all(
					// 	listOfPayPeriods.map(async (singlePayPeriod: any) => {
					// 		await prisma.employeeCostValue.create({
					// 			data: {
					// 				employee: { connect: { id: singleEmployee?.id } },
					// 				employeeCostField: {
					// 					connect: { id: employeeCostField?.id },
					// 				},
					// 				payPeriod: { connect: { id: singlePayPeriod?.id } },
					// 				isPercentage: false,
					// 			},
					// 		});
					// 	})
					// );
				})
			);
			return 'Initial values created';
		} catch (error) {
			throw error;
		}
	}

	// delete EmployeeCost when new field delete
	async deleteNewEmployeeCost(
		listOfEmployee: any,
		fieldId: string,
		companyId: string
	) {
		try {
			await Promise.all(
				listOfEmployee.map(async (singleEmployee: any) => {
					await prisma.employeeCostField.deleteMany({
						where: {
							employeeId: singleEmployee.id,
							fieldId: fieldId,
							companyId: companyId,
						},
					});
				})
			);
			return 'Initial values created';
		} catch (error) {
			throw error;
		}
	}

	// Create EmployeeCost Value when new field create
	async createNewMonthlyCost(
		employees: any,
		employeeCostFieldId: string,
		date: Date
	) {
		try {
			const dateCopy = new Date(date);
			console.log('Date : ', dateCopy);
			// For hours
			await Promise.all(
				employees.map(async (singleEmployee: any) => {
					await prisma.employeeCostValue.create({
						data: {
							employee: { connect: { id: singleEmployee?.id } },
							employeeCostField: {
								connect: { id: employeeCostFieldId },
							},
							// month: dateCopy.getMonth() + 1,
							// year: dateCopy.getFullYear(),
							isPercentage: false,
						},
					});
				})
			);

			// For percentage
			await Promise.all(
				employees.map(async (singleEmployee: any) => {
					await prisma.employeeCostValue.create({
						data: {
							employee: { connect: { id: singleEmployee?.id } },
							employeeCostField: {
								connect: { id: employeeCostFieldId },
							},
							// month: dateCopy.getMonth() + 1,
							// year: dateCopy.getFullYear(),
							isPercentage: true,
						},
					});
				})
			);
		} catch (error) {
			throw error;
		}
	}

	// For update the monthly cost value
	async updateMonthlyCost(
		employeeCostValueID: string,
		value: string,
		payPeriodId?: string,
		isCalculatorValue?: boolean
	) {
		try {
			console.log('Pay period : ', payPeriodId, isCalculatorValue);
			const updatedCost = await prisma.employeeCostValue.update({
				where: {
					id: employeeCostValueID,
				},
				data: {
					value: value,
				},
			});

			// const employeeCostValue = await prisma.employeeCostValue.findFirst({
			// 	where: {
			// 		id: employeeCostValueID,
			// 	},
			// 	include: {
			// 		employeeCostField: {
			// 			include: {
			// 				field: true,
			// 			},
			// 		},
			// 	},
			// });

			// if (!employeeCostValue) {
			// 	throw new CustomError(404, 'Employee cost field not found');
			// }
			// if (employeeCostValue?.employeeCostField.field?.type === 'Yearly') {
			// 	const year = new Date(date!).getFullYear();
			// 	console.log('Year: ' + year);
			// 	await prisma.employeeCostValue.updateMany({
			// 		where: {
			// 			year: year,
			// 			isPercentage: false,
			// 			employeeCostField: {
			// 				id: employeeCostValue.employeeCostField.id,
			// 			},
			// 		},
			// 		data: {
			// 			value: value,
			// 		},
			// 	});
			// } else {
			// 	await prisma.employeeCostValue.update({
			// 		where: {
			// 			id: employeeCostValueID,
			// 		},
			// 		data: {
			// 			value: value,
			// 			// isCalculatorValue: isCalculatorValue,
			// 			// calculatorValue: value,
			// 		},
			// 	});
			// }
			return updatedCost;
		} catch (error) {
			throw error;
		}
	}

	// For update the monthly cost value
	// async isMonthlyValueCreated(companyId: string, date: string) {
	// 	try {
	// 		const dateCopy = new Date(date);
	// 		const existedValue = await prisma.monthYearTable.findFirst({
	// 			where: {
	// 				companyId: companyId,
	// 				month: dateCopy.getMonth() + 1,
	// 				year: dateCopy.getFullYear(),
	// 			},
	// 		});
	// 		return existedValue;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
	// For update the monthly cost value
	// async createMonth(companyId: string, date: string) {
	// 	try {
	// 		const dateCopy = new Date(date);
	// 		const existedValue = await prisma.monthYearTable.create({
	// 			data: {
	// 				companyId: companyId,
	// 				month: dateCopy.getMonth() + 1,
	// 				year: dateCopy.getFullYear(),
	// 			},
	// 		});
	// 		return existedValue;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// For update the monthly cost value
	// async getMonthsByCompanyId(companyId: string) {
	// 	try {
	// 		const valueCreatedMonths = await prisma.monthYearTable.findMany({
	// 			where: {
	// 				companyId: companyId,
	// 			},
	// 		});
	// 		return valueCreatedMonths;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// Count total after deleting field

	// async countTotalAfterDelete(employeeList: any, companyId: string) {
	// 	await Promise.all(
	// 		employeeList?.map(async (singleEmployee: any) => {
	// 			await prisma.employeeCostValue;
	// 		})
	// 	);
	// }
}

export default new EmployeeCostRepository();
