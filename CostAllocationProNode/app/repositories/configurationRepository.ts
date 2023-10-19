import { prisma } from '../client/prisma';
import { DefaultConfigurationSettings, sections } from '../constants/data';
import employeeCostRepository from './employeeCostRepository';
import payPeriodRepository from './payPeriodRepository';

class ConfigurationRepository {
	// Create default configuration settings for the first time company is created
	async createDefaultConfiguration(companyId: string) {
		try {
			const configuration = await prisma.configuration.create({
				data: {
					settings: DefaultConfigurationSettings,
					indirectExpenseRate: 10,
					payrollMethod: 'Percentage',
					company: { connect: { id: companyId } },
				},
			});
			return configuration;
		} catch (err) {
			throw err;
		}
	}

	// Get company configurations
	async getCompanyConfiguration(companyId: string) {
		try {
			const configuration = await prisma.configuration.findFirst({
				where: {
					companyId: companyId,
				},
			});
			return configuration;
		} catch (err) {
			throw err;
		}
	}

	// Update configuration settings
	async updateConfiguration(companyId: string, data: any) {
		try {
			const updatedConfiguration = await prisma.configuration.update({
				where: {
					companyId: companyId,
				},
				data: data,
			});
			return updatedConfiguration;
		} catch (err) {
			throw err;
		}
	}
	async getConfigurationField(companyId: string) {
		try {
			const configurationSection = await prisma.configurationSection.findMany({
				where: {
					companyId,
				},
				orderBy: {
					no: 'asc',
				},
				include: {
					fields: {
						orderBy: {
							jsonId: 'asc',
						},
					},
				},
			});
			return configurationSection;
		} catch (err) {
			throw err;
		}
	}
	async createField(companyId: string, sectionId: any, data: any) {
		try {
			const createdField = await prisma.field.create({
				data: {
					company: { connect: { id: companyId } },
					configurationSection: { connect: { id: sectionId } },
					...data,
				},
			});
			return createdField;
		} catch (err) {
			throw err;
		}
	}
	async deleteConfigurationField(fieldId: string, companyId: string) {
		try {
			const deletedField = await prisma.field.delete({
				where: {
					id: fieldId,
				},
			});

			const percentAndHourArray = [true, false];
			console.log(companyId, percentAndHourArray);

			const listOfPeriod = await payPeriodRepository.getAll({
				companyId,
				dateFilter: {},
			});
			await Promise.all(
				percentAndHourArray.map(async () => {
					await Promise.all(
						listOfPeriod.map(async (singlePayPeriod: any) => {
							const configurationFields = await this.getConfigurationField(
								companyId
							);
							const monthlyCost = await employeeCostRepository.getMonthlyCost(
								companyId,
								'',
								0,
								10000000,
								{},
								{},
								true,
								singlePayPeriod.id
							);
							monthlyCost.map((singleEmployeeData: any) => {
								configurationFields.map(
									async (singleConfigurationSection: any) => {
										if (singleConfigurationSection.no !== 0) {
											let total = 0;
											singleEmployeeData.employeeCostField.forEach(
												(singleEmployeeCostField: any) => {
													if (
														singleEmployeeCostField.field
															.configurationSectionId ===
															singleConfigurationSection.id &&
														singleEmployeeCostField.field.jsonId !== 't1'
													) {
														total += Number(
															singleEmployeeCostField.costValue[0].value
														);
													}
												}
											);
											const fieldToUpdate =
												singleEmployeeData.employeeCostField.find(
													(singleEmployeeCostField: any) =>
														singleEmployeeCostField.field
															.configurationSectionId ===
															singleConfigurationSection.id &&
														singleEmployeeCostField.field.jsonId === 't1'
												);

											await employeeCostRepository.updateMonthlyCost(
												fieldToUpdate.costValue[0].id,
												total.toFixed(2)
											);
										}
									}
								);
							});
						})
					);
				})
			);

			return deletedField;
		} catch (err) {
			throw err;
		}
	}
	async editConfigurationField(fieldId: string, fieldName: string) {
		try {
			const updatedField = await prisma.field.update({
				where: {
					id: fieldId,
				},
				data: {
					name: fieldName,
				},
			});
			return updatedField;
		} catch (err) {
			throw err;
		}
	}
	async initialFieldSectionCreate(companyId: string) {
		try {
			await Promise.all(
				sections.map(async (singleSection) => {
					const section = await prisma.configurationSection.create({
						data: {
							sectionName: singleSection.sectionName,
							no: singleSection.no,
							company: { connect: { id: companyId } },
						},
					});
					await Promise.all(
						singleSection.fields.map(async (singleField) => {
							await prisma.field.create({
								data: {
									jsonId: singleField.jsonId,
									name: singleField.name,
									type: singleField.type,
									company: { connect: { id: companyId } },
									configurationSection: { connect: { id: section.id } },
								} as any,
							});
						})
					);
				})
			);
		} catch (err) {
			throw err;
		}
	}
}

export default new ConfigurationRepository();
