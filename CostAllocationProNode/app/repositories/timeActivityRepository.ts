import { prisma } from '../client/prisma';
import { getAllTimeActivityInterface } from '../interfaces/timeActivityInterface';
import { CustomError } from '../models/customError';

class TimeActivityRepository {
	async getAllTimeActivities(timeActivityData: getAllTimeActivityInterface) {
		try {
			const isOverHours = false;

			const {
				companyId,
				offset,
				limit,
				searchCondition,
				filterConditions,
				sortCondition,
				dateFilters,
			} = timeActivityData;

			const query = {
				where: {
					companyId: companyId,
					...searchCondition,
					...filterConditions,
					...dateFilters,
				},

				include: {
					employee: {
						select: {
							id: true,
							fullName: true,
						},
					},
					SplitTimeActivities: {
						select: {
							id: true,
							classId: true,
							className: true,
							customerId: true,
							customerName: true,
							hours: true,
							minute: true,
							activityDate: true,
						},
					},
				},
				skip: offset,
				take: limit,
				...sortCondition,
			};

			if (!offset) {
				delete query['skip'];
			}
			if (!limit) {
				delete query['take'];
			}

			if (isOverHours) {
				const timeActivities = await prisma.hoursOver.findMany({
					where: {
						companyId: companyId,
						isOverHours: isOverHours,
					},
					include: {
						employee: {
							include: {
								timeActivities: {
									orderBy: {
										activityDate: 'desc',
									},
								},
							},
						},
					},
				});
				return timeActivities;
			}

			const timeActivities = await prisma.timeActivities.findMany(query);
			return timeActivities;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

	// Get time activity with over hours
	async getAllTimeActivitiesOverHours(
		timeActivityData: getAllTimeActivityInterface
	) {
		try {
			const {
				companyId,
				isOverHours,
				offset,
				limit,
				// searchCondition,
				// filterConditions,
				// sortCondition,
				// dateFilters,
				search,
				sort,
				type,
			} = timeActivityData;

			let queryString = `
							SELECT 
								ta."id" as id, 
								ta."timeActivityId" as timeActivityId,
								ta."classId" as classId, 
								ta."className" as className, 
								ta."customerId" as customerId, 
								ta."customerName" as customerName, 
								ta."hours" as hours,
								ta."minute" as minutes,
								ta."companyId" as companyId,
								ta."employeeId" as employeeId,
								ta."activityDate" as activityDate,  
								e."fullName" as employeeName,
								json_agg(Distinct "ho") as overHours,
								json_agg(Distinct "sa") as splitActivities
								FROM "TimeActivities" ta
								LEFT JOIN "Employee" e ON ta."employeeId" = e."id"
								LEFT JOIN "SplitTimeActivities" sa ON sa."timeActivityId" = ta."id"
								LEFT JOIN "HoursOver"  ho ON e."id" = ho."employeeId" AND ho."year" = EXTRACT('Year' FROM ta."activityDate") 

								WHERE ta."companyId" = '${companyId}' AND ho."isOverHours"=true
							`;

			if (search) {
				queryString += ` AND (ta."className"='${search}' OR ta."customerName"='${search}' OR e."fullName"='${search}')`;
			}

			let sortColumnName = `ta."activityDate"`;

			if (sort === 'className') {
				sortColumnName = `ta."className"`;
			}
			if (sort === 'customerName') {
				sortColumnName = `ta."customerName"`;
			}
			if (sort === 'employeeName') {
				sortColumnName = `e."fullName"`;
			}

			queryString += `
								GROUP BY ta."id", e."fullName"
								ORDER BY ${sortColumnName} ${type ? type : 'desc'}
								OFFSET ${offset}
								LIMIT ${limit}`;

			if (isOverHours) {
				const timeActivities: any = await prisma.$queryRawUnsafe(queryString);
				console.log('Time: ', timeActivities);
				const finalData = timeActivities.map((singleActivity: any) => {
					const data = {
						id: singleActivity?.id,
						timeActivityId: singleActivity?.timeactivityid,
						classId: singleActivity?.classid,
						className: singleActivity?.classname,
						customerId: singleActivity?.customerid,
						customerName: singleActivity?.customername,
						hours: singleActivity?.hours,
						minute: singleActivity?.minutes,
						companyId: singleActivity?.companyid,
						employeeId: singleActivity?.employeeid,
						activityDate: singleActivity?.activitydate,
						employeeName: singleActivity?.employeename,
						overhours: singleActivity?.overhours,
						employee: {
							id: singleActivity?.employeeid,
							fullName: singleActivity?.employeename,
						},
						SplitTimeActivities: singleActivity?.splitactivities[0]
							? singleActivity?.splitactivities
							: [],
						isOver: singleActivity?.overhours[0].isOverHours,
						overHours: singleActivity?.overhours[0].overHours,
						overMinutes: singleActivity?.overhours[0].overMinutes,
						actualHours: singleActivity?.hours,
						actualMinutes: singleActivity?.minutes,
					};

					return data;
				});

				return finalData;
			}
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

	async getTimeActivityDetails(timeActivityData: any) {
		try {
			const { companyId, parentActivityId } = timeActivityData;

			const timeActivity = await prisma.timeActivities.findFirst({
				where: {
					id: parentActivityId,
					companyId: companyId,
				},
				include: {
					SplitTimeActivities: true,
				},
			});

			return timeActivity;
		} catch (err) {
			throw err;
		}
	}

	async getSingleTimeActivity(parentActivityId: string) {
		try {
			const timeActivity = await prisma.timeActivities.findFirst({
				where: {
					id: parentActivityId,
				},
				include: {
					SplitTimeActivities: true,
				},
			});

			return timeActivity;
		} catch (err) {
			throw err;
		}
	}

	async getAllTimeActivitiesCount(
		timeActivityData: getAllTimeActivityInterface
	) {
		try {
			const { companyId } = timeActivityData;
			const timeActivitiesCount = await prisma.timeActivities.count({
				where: {
					companyId: companyId,
				},
			});
			return timeActivitiesCount;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

	async updateOrCreateTimeActivity(
		timeActivityId: string,
		companyId: string,
		timeActivityData: any
	) {
		try {
			const timeActivities = await prisma.timeActivities.findFirst({
				where: {
					timeActivityId: timeActivityId,
					companyId: companyId,
				},
			});

			let updatedTimeActivities;
			if (timeActivities) {
				const employee = await prisma.employee.findFirst({
					where: {
						employeeId: timeActivityData?.employeeId,
						companyId: companyId,
					},
				});
				if (!employee) {
					throw new CustomError(
						400,
						'You need to sync employees before time activities'
					);
				}
				const data = {
					classId: timeActivityData?.classId,
					className: timeActivityData?.className,
					customerId: timeActivityData?.customerId,
					customerName: timeActivityData?.customerName,
					hours: timeActivityData?.hours,
					minute: timeActivityData?.minute,
					employeeId: employee?.id,
					companyId: companyId,
					// employee: { connect: { id: employee?.id } },
					// company: { connect: { id: companyId } },
					activityDate: new Date(timeActivityData?.activityDate),
				};
				if (!data.className) {
					delete data.className;
				}
				if (!data.classId) {
					delete data.classId;
				}
				const updated: any = await prisma.timeActivities.updateMany({
					where: {
						timeActivityId: timeActivityId,
						companyId: companyId,
					},
					data: data,
				});
				updatedTimeActivities = updated[0];
			} else {
				const employee = await prisma.employee.findFirst({
					where: {
						employeeId: timeActivityData?.employeeId,
						companyId: companyId,
					},
				});
				if (!employee) {
					throw new CustomError(
						400,
						'You need to sync employees before time activities'
					);
				}
				const data = {
					timeActivityId: timeActivityData?.timeActivityId,
					classId: timeActivityData?.classId,
					className: timeActivityData?.className,
					customerId: timeActivityData?.customerId,
					customerName: timeActivityData?.customerName,
					hours: timeActivityData?.hours,
					minute: timeActivityData?.minute,
					employee: { connect: { id: employee?.id } },
					company: { connect: { id: companyId } },
					activityDate: new Date(timeActivityData?.activityDate),
				};

				if (!data.classId) {
					delete data.classId;
				}
				if (!data.className) {
					delete data.className;
				}

				updatedTimeActivities = await prisma.timeActivities.create({
					data,
				});
			}
			return updatedTimeActivities;
		} catch (err) {
			console.log('ERR:', err);
			throw err;
		}
	}

	// Update Time activity hours
	async updateTimeActivity(timeActivityData: any) {
		try {
			const {
				timeActivityId,
				companyId,
				hours,
				minute,
				classId,
				className,
				customerId,
				customerName,
			} = timeActivityData;

			const findActivity = await prisma.timeActivities.findFirst({
				where: {
					id: timeActivityId,
					companyId: companyId,
				},
			});

			if (!findActivity) {
				throw new CustomError(404, 'Time Activity not found');
			}

			const data = {
				hours: hours,
				minute: minute,
				classId: classId,
				className: className,
				customerId: customerId,
				customerName: customerName,
			};

			if (!classId) {
				delete data['classId'];
			}

			if (!className) {
				delete data['className'];
			}

			const updatedTimeActivity = await prisma.timeActivities.update({
				where: {
					id: timeActivityId,
				},
				data: data,
			});
			return updatedTimeActivity;
		} catch (err) {
			throw err;
		}
	}

	// Create a new time activity at first time sync
	async createTimeActivitySync(timeActivityData: any, companyId: string) {
		try {
			let employee = null;
			if (timeActivityData?.employeeId) {
				employee = await prisma.employee.findFirst({
					where: {
						employeeId: timeActivityData?.employeeId,
						companyId: companyId,
					},
				});
			}
			const data: any = {
				timeActivityId: timeActivityData?.timeActivityId,
				hours: timeActivityData?.hours,
				minute: timeActivityData?.minute,
				activityDate: new Date(timeActivityData?.activityDate),
				company: { connect: { id: timeActivityData?.companyId } },
				classId: timeActivityData?.classId,
				className: timeActivityData?.className,
				customerId: timeActivityData?.customerId,
				customerName: timeActivityData?.customerName,
				employee: { connect: { id: employee?.id } },
			};

			if (!timeActivityData?.classId) {
				delete data.classId;
				delete data.className;
			}

			if (!timeActivityData?.customerId) {
				delete data.customerId;
				delete data.customerName;
			}

			if (!employee?.id) {
				delete data.employee;
			}
			const createdTimeActivity = await prisma.timeActivities.create({
				data: data,
				include: {
					employee: {
						select: {
							id: true,
							fullName: true,
						},
					},
				},
			});
			return createdTimeActivity;
		} catch (err) {
			throw err;
		}
	}

	// Create a new time activity
	async createTimeActivity(timeActivityData: any) {
		try {
			let employee = null;
			if (timeActivityData?.employeeId) {
				employee = await prisma.employee.findUnique({
					where: { id: timeActivityData?.employeeId },
				});
			}
			const data: any = {
				// timeActivityId: timeActivityData?.timeActivityId,
				hours: timeActivityData?.hours,
				minute: timeActivityData?.minute,
				activityDate: new Date(timeActivityData?.activityDate),
				company: { connect: { id: timeActivityData?.companyId } },
				classId: timeActivityData?.classId,
				className: timeActivityData?.className,
				customerId: timeActivityData?.customerId,
				customerName: timeActivityData?.customerName,
				employee: { connect: { id: employee?.id } },
			};

			if (!timeActivityData?.classId) {
				delete data.classId;
				delete data.className;
			}

			if (!timeActivityData?.customerId) {
				delete data.customerId;
				delete data.customerName;
			}

			if (!employee?.id) {
				delete data.employee;
			}
			const createdTimeActivity = await prisma.timeActivities.create({
				data: data,
				include: {
					employee: {
						select: {
							id: true,
							fullName: true,
						},
					},
					SplitTimeActivities: true,
				},
			});
			return createdTimeActivity;
		} catch (err) {
			throw err;
		}
	}

	// Delete a time activity
	async deleteTimeActivity(timeActivityData: any) {
		const { timeActivityId, companyId } = timeActivityData;

		const findActivity = await prisma.timeActivities.findFirst({
			where: {
				id: timeActivityId,
				companyId: companyId,
			},
		});

		if (!findActivity) {
			throw new CustomError(404, 'Time Activity not found');
		}

		await prisma.splitTimeActivities.deleteMany({
			where: {
				timeActivityId: timeActivityId,
			},
		});

		const deleted = await prisma.timeActivities.deleteMany({
			where: {
				id: timeActivityId,
				companyId: companyId,
			},
		});
		return deleted;
	}

	// Get all time activities for export
	async getAllTimeActivityForExport(data: any) {
		const { companyId, filterConditions, searchCondition, dateFilters } = data;
		try {
			const timeActivities = await prisma.timeActivities.findMany({
				where: {
					companyId: companyId,
					...searchCondition,
					...filterConditions,
					...dateFilters,
				},
				include: {
					employee: {
						select: {
							id: true,
							fullName: true,
						},
					},
					SplitTimeActivities: {
						include: {
							employee: true,
						},
					},
				},
				orderBy: {
					activityDate: 'desc',
				},
			});
			return timeActivities;
		} catch (err) {
			throw err;
		}
	}

	// Get employee hours
	async getEmployeeHours(data: any) {
		const { companyId, employeeId, year, fieldId } = data;

		console.log('YEAR: ', year);

		try {
			const employeeCostFieldId = await prisma.employeeCostField.findFirst({
				where: {
					companyId: companyId,
					fieldId: fieldId,
					employeeId: employeeId,
				},
			});
			const employees = await prisma.employeeCostValue.findFirst({
				where: {
					employeeId: employeeId,
					// year: year,
					employeeFieldId: employeeCostFieldId?.id,
					isPercentage: false,
				},
			});
			return employees;
		} catch (err) {
			throw err;
		}
	}

	// Get employee-year wise time activity
	async getTimeActivityByEmployee(data: any) {
		try {
			const { companyId, employeeId, year } = data;
			const employee = await prisma.timeActivities.findMany({
				where: {
					companyId: companyId,
					employeeId: employeeId,
					activityDate: {
						gte: new Date(year, 0, 1),
						lt: new Date(year + 1, 0, 1),
					},
				},
			});

			return employee;
		} catch (err) {
			throw err;
		}
	}

	// Get employee-time wise time activity
	async getTimeActivityByEmployeeDate(data: any) {
		try {
			const { companyId, employeeId, startDate, endDate } = data;
			const employee = await prisma.timeActivities.findMany({
				where: {
					companyId: companyId,
					employeeId: employeeId,
					activityDate: {
						gte: startDate,
						lt: endDate,
					},
				},
				include: {
					employee: true,
				},
			});

			return employee;
		} catch (err) {
			throw err;
		}
	}
}

export default new TimeActivityRepository();
