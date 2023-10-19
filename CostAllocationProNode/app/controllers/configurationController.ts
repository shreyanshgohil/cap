import { NextFunction, Request, Response } from 'express';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { CustomError } from '../models/customError';
import { companyRepository } from '../repositories';
import configurationRepository from '../repositories/configurationRepository';
import configurationServices from '../services/configurationServices';

class ConfigurationController {
	async getCompanyConfiguration(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company
			checkValidation(req);

			const companyId = req.body.companyId;
			// Check If company exists
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const configurationDetails =
				await configurationRepository.getCompanyConfiguration(companyId);

			return DefaultResponse(
				res,
				200,
				'Configurations fetched successfully',
				configurationDetails
			);
		} catch (err) {
			next(err);
		}
	}

	async updateCompanyConfiguration(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company
			checkValidation(req);

			const companyId = req.body.companyId;

			const { settings, indirectExpenseRate, payrollMethod } = req.body;

			// Check If company exists
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const data = {
				settings: settings,
				indirectExpenseRate: indirectExpenseRate,
				payrollMethod: payrollMethod,
			};

			// Update configuration

			const updatedConfiguration =
				await configurationRepository.updateConfiguration(companyId, data);

			return DefaultResponse(
				res,
				200,
				'Configurations updated successfully',
				updatedConfiguration
			);
		} catch (err) {
			next(err);
		}
	}
	async getFieldsSection(req: Request, res: Response, next: NextFunction) {
		try {
			const { companyId } = req.query;
			const sections = await configurationServices.getFieldsSection(
				companyId as string
			);
			return DefaultResponse(
				res,
				200,
				'Section fields fetched successfully',
				sections
			);
		} catch (error) {
			next(error);
		}
	}
	async createField(req: Request, res: Response, next: NextFunction) {
		try {
			const { companyId, sectionId, ...data } = req.body;
			checkValidation(req);
			const createdField = await configurationServices.createField(
				companyId,
				sectionId,
				data
			);

			return DefaultResponse(
				res,
				200,
				'Field created successfully',
				createdField
			);
		} catch (error) {
			next(error);
		}
	}
	async deleteField(req: Request, res: Response, next: NextFunction) {
		try {
			const { fieldId, companyId } = req.body;

			// Check If company exists
			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			checkValidation(req);
			const deletedField = await configurationServices.deleteField(
				fieldId,
				companyId
			);
			return DefaultResponse(
				res,
				200,
				'Field deleted successfully',
				deletedField
			);
		} catch (error) {
			next(error);
		}
	}
	async updateField(req: Request, res: Response, next: NextFunction) {
		try {
			const { fieldId, fieldName } = req.body;
			checkValidation(req);
			const editedField = await configurationServices.updateField(
				fieldId,
				fieldName
			);
			return DefaultResponse(
				res,
				200,
				'Field updated successfully',
				editedField
			);
		} catch (error) {
			next(error);
		}
	}
}

export default new ConfigurationController();
