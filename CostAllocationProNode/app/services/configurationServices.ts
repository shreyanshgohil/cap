import { CustomError } from '../models/customError';
import {
	companyRepository,
	employeeCostRepository,
	// employeeCostRepository,
	employeeRepository,
} from '../repositories';
import configurationRepository from '../repositories/configurationRepository';
import payPeriodServices from './payPeriodServices';
// import employeeServices from './employeeServices';
class ConfigurationService {
	// For get sections with fields
	async getFieldsSection(companyId: string) {
		try {
			const sections = await configurationRepository.getConfigurationField(
				companyId
			);
			return sections;
		} catch (error) {
			throw error;
		}
	}
	// For create field with section
	async createField(companyId: string, sectionId: string, data: any) {
		try {
			const company = await companyRepository.getDetails(companyId);
			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}
			const createdField = await configurationRepository.createField(
				companyId,
				sectionId,
				data
			);

			// Get all employees by companyId
			const employeeList = await employeeRepository.getAllEmployeesByCompanyId(
				companyId
			);

			// Employee Cost Field
			// const listOfMonths = await employeeCostRepository.getMonthsByCompanyId(
			// 	companyId
			// );

			// Get list of all pay periods
			const listOfPayPeriods = await payPeriodServices.getAllPayPeriods({
				companyId: companyId,
			});

			await employeeCostRepository.createNewEmployeeCost(
				employeeList,
				createdField?.id,
				companyId,
				listOfPayPeriods
			);

			return createdField;
		} catch (error) {
			throw error;
		}
	}
	// For delete field
	async deleteField(fieldId: string, companyId: string) {
		try {
			// const deletedField =
			await configurationRepository.deleteConfigurationField(
				fieldId,
				companyId
			);

			// Get all employee list
			const employees = await employeeRepository.getAllEmployeesByCompanyId(
				companyId
			);

			// return deletedField;
			return employees;
		} catch (error) {
			throw error;
		}
	}
	// For update field with section
	async updateField(fieldId: string, fieldName: string) {
		try {
			const editedField = await configurationRepository.editConfigurationField(
				fieldId,
				fieldName
			);
			return editedField;
		} catch (error) {
			throw error;
		}
	}
}
export default new ConfigurationService();
