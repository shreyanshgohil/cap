/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Response } from 'express';
import config from '../../config';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { RequestExtended } from '../interfaces/global';
import { AuthTokenInterface } from '../interfaces/quickbooksInterfaces';
import { checkPermission } from '../middlewares/isAuthorizedUser';
import { CustomError } from '../models/customError';
import quickbooksAuthClient from '../quickbooksClient/quickbooksAuthClient';
import quickbooksClient from '../quickbooksClient/quickbooksClient';
import {
	companyRepository,
	employeeCostRepository,
	employeeRepository,
} from '../repositories';
import configurationRepository from '../repositories/configurationRepository';
import employeeServices from '../services/employeeServices';
import quickbookServices from '../services/quickbooksServices';
import timeActivityServices from '../services/timeActivityServices';
import { prisma } from '../client/prisma';
import moment from 'moment';
// import axios from 'axios';

// import timeActivityServices from '../services/timeActivityServices';

class QuickbooksController {
	// Get Quickbooks Auth URI
	async getQuickbooksAuthUri(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const subId = req?.user?.id;
			// const subId = req.body.subId;
			const qboAuthorizeUrl = await quickbooksAuthClient.authorizeUri(subId);

			return DefaultResponse(
				res,
				200,
				'Quickbooks AuthUri retrieved successfully',
				qboAuthorizeUrl
			);
		} catch (err) {
			console.log('Err: ', err);
			next(err);
		}
	}

	// Quickbooks callback
	async quickbooksCallback(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Get company id from body - only for reconnecting company
			const companyId = req?.body?.companyId;

			// Fetch URL
			const url = String(req?.body?.url);

			const currentUrl = new URL(req?.body?.url);

			const searchParams = currentUrl?.searchParams;

			const userId = searchParams.get('state')!;

			const authToken: AuthTokenInterface =
				await quickbooksAuthClient.createAuthToken(url);

			const qboCompanyInfo = await quickbooksClient.getCompanyInfo(
				authToken.access_token,
				authToken.realmId,
				authToken.refresh_token
			);

			let finalCompanyDetails;

			if (companyId != 'undefined' && companyId !== null) {
				// checking is user permitted
				const isPermitted = await checkPermission(req, companyId, {
					permissionName: 'Integrations',
					permission: ['edit'],
				});
				if (!isPermitted) {
					throw new CustomError(403, 'You are not authorized');
				}

				const companyDetails = await companyRepository.getDetails(companyId);

				if (!companyDetails) {
					const error = new CustomError(404, 'Company not found');
					throw error;
				}

				if (companyDetails?.tenantID !== authToken.realmId) {
					const error = new CustomError(401, 'Can not connect this company');
					throw error;
				}

				finalCompanyDetails = await companyRepository.updateCompany(companyId, {
					accessToken: authToken.access_token,
					refreshToken: authToken.refresh_token,
					isConnected: true,
					tenantID: authToken.realmId,
					fiscalYear: qboCompanyInfo?.FiscalYearStartMonth,
				});

				// const syncData = await axios.post(
				// 	'https://vwarjgvafl.execute-api.us-east-1.amazonaws.com/default/cost-allocation-pro-dev-employeeDump',
				// 	{
				// 		accessToken: authToken.access_token,
				// 		refreshToken: authToken.refresh_token,
				// 		tenantID: authToken.realmId,
				// 		companyId: companyId,
				// 		employeeLastSyncDate: companyDetails?.employeeLastSyncDate,
				// 	},
				// 	{
				// 		headers: {
				// 			'x-api-key': 'CRkwakE0jkO3y4uNIBVZ8LeqJfK7rtHaXTR9NkXg',
				// 			'Content-Type': 'application/json',
				// 		},
				// 	}
				// );

				// console.log('Sync data update: ', syncData);
			} else {
				// For first time company integration

				// Check if the same company is already connected
				const isAlreadyConnected = await companyRepository.getCompanyByTenantId(
					authToken.realmId
				);

				if (isAlreadyConnected) {
					const error = new CustomError(404, 'Company is already connected');
					throw error;
				}
				const data = {
					tenantID: authToken.realmId,
					tenantName: qboCompanyInfo?.CompanyName,
					accessToken: authToken.access_token,
					refreshToken: authToken.refresh_token,
					accessTokenUTCDate: new Date(),
					isConnected: true,
					fiscalYear: qboCompanyInfo?.FiscalYearStartMonth,
				};
				finalCompanyDetails = await companyRepository.create(data);

				await companyRepository?.connectCompany(
					userId,
					finalCompanyDetails?.id
				);

				await configurationRepository.createDefaultConfiguration(
					finalCompanyDetails?.id
				);

				// DO NOT REMOVE THIS CODE

				// LAMBDA FUNCTION CALL

				// const syncData = await axios.post(
				// 	config.employeeSyncLambdaEndpoint,
				// 	{
				// 		accessToken: authToken.access_token,
				// 		refreshToken: authToken.refresh_token,
				// 		tenantID: authToken.realmId,
				// 		companyId: finalCompanyDetails?.id,
				// 	},
				// 	{
				// 		headers: {
				// 			'x-api-key': config.employeeSyncLambdaApiKey,
				// 			'Content-Type': 'application/json',
				// 		},
				// 	}
				// );

				// const syncTimeActivities = await axios.post(
				// 	config.timeactivitySyncLambdaEndpoint,
				// 	{
				// 		accessToken: authToken.access_token,
				// 		refreshToken: authToken.refresh_token,
				// 		tenantID: authToken.realmId,
				// 		companyId: finalCompanyDetails?.id,
				// 	},
				// 	{
				// 		headers: {
				// 			'x-api-key': config.timeactivitySyncLambdaApiKey,
				// 			'Content-Type': 'application/json',
				// 		},
				// 	}
				// );

				// LAMBDA FUNCTION CALL

				// Do not remove API for employee sync
				const syncData = await employeeServices.syncEmployeeFirstTime({
					accessToken: authToken?.access_token,
					refreshToken: authToken?.refresh_token,
					tenantId: authToken?.realmId,
					companyId: finalCompanyDetails?.id,
				});
				// Do not remove API for employee sync

				// Do not remove API for timeativity sync
				const syncTimeActivities =
					await timeActivityServices.lambdaSyncFunction({
						accessToken: authToken?.access_token,
						refreshToken: authToken?.refresh_token,
						tenantId: authToken?.realmId,
						companyId: finalCompanyDetails?.id,
					});
				// Do not remove API for timeativity sync

				// Update employee last sync date
				await prisma.company.update({
					where: {
						id: finalCompanyDetails?.id,
					},
					data: {
						employeeLastSyncDate: moment(new Date())
							.tz('America/Los_Angeles')
							.format(),
					},
				});

				// Update employee last sync date
				await prisma.company.update({
					where: {
						id: finalCompanyDetails?.id,
					},
					data: {
						timeActivitiesLastSyncDate: moment(new Date())
							.tz('America/Los_Angeles')
							.format(),
					},
				});

				const fields = await configurationRepository.initialFieldSectionCreate(
					finalCompanyDetails?.id
				);

				const employees = await employeeRepository.getAllEmployeesByCompanyId(
					finalCompanyDetails?.id
				);
				const sectionWithFields =
					await configurationRepository.getConfigurationField(
						finalCompanyDetails?.id
					);
				const sectionFields = sectionWithFields.reduce(
					(accumulator: any, section) => {
						accumulator.push(...section.fields);
						return accumulator;
					},
					[]
				);

				const values = await employeeCostRepository.createInitialValues(
					employees,
					sectionFields,
					finalCompanyDetails?.id
				);

				// await employeeServices.syncEmployeesByLastSync(companyId);
			}

			return DefaultResponse(
				res,
				200,
				'Company connected successfully',
				finalCompanyDetails
			);
		} catch (err) {
			next(err);
		}
	}

	// Disconnect Quickbooks company
	async quickbooksDisconnect(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const companyId = req.body.companyId;

			// checking is user permitted
			const isPermitted = await checkPermission(req, companyId, {
				permissionName: 'Integrations',
				permission: ['delete'],
			});

			if (!isPermitted) {
				throw new CustomError(403, 'You are not authorized');
			}

			const companyDetails = await companyRepository.getDetails(companyId);

			await quickbooksAuthClient.revokeToken(
				companyDetails?.refreshToken as string
			);

			await companyRepository.updateCompany(companyId, {
				isConnected: false,
			});

			return DefaultResponse(
				res,
				200,
				'Quickbooks company disconnected successfully'
			);
		} catch (err) {
			next(err);
		}
	}

	// Update Quickbooks company status - sync On/Off
	async updateCompanyStatus(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const { companyId, status } = req.body;

			const companyDetails = await companyRepository.getDetails(companyId);
			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const updatedCompanyStatus = await companyRepository.updateStatus(
				companyId,
				status
			);

			return DefaultResponse(
				res,
				200,
				'Status updated successfully',
				updatedCompanyStatus
			);
		} catch (err) {
			next(err);
		}
	}

	// Get All Employees
	async getAllQBEmployees(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse = await quickbookServices.getAccessToken(companyId);

			// Get All Employees From Quickbooks
			const allEmployees: any = await quickbooksClient.getEmployees(
				authResponse?.accessToken as string,
				authResponse?.tenantID as string,
				authResponse?.refreshToken as string
			);

			return DefaultResponse(
				res,
				200,
				'All employees fetched ',
				allEmployees?.QueryResponse?.Employee
			);
		} catch (err) {
			next(err);
		}
	}

	// Get All Accounts
	async getAllAccounts(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse = await quickbookServices.getAccessToken(companyId);

			if (authResponse?.status == true) {
				// Get All Accounts From Quickbooks
				const accounts: any = await quickbooksClient.getAllAccounts(
					authResponse?.accessToken as string,
					authResponse?.tenantID as string,
					authResponse?.refreshToken as string
				);

				// Accounts with account number
				const finalAccounts = accounts?.QueryResponse?.Account?.map(
					(account: any) => {
						if (account?.AcctNum) {
							return {
								...account,
								Name: `${account?.AcctNum} - ${account?.Name}`,
							};
						} else {
							return account;
						}
					}
				);

				return DefaultResponse(
					res,
					200,
					'All accounts fetched successfully',
					finalAccounts
				);
			} else {
				return DefaultResponse(res, 200, 'Company status is not active');
			}
		} catch (err) {
			next(err);
		}
	}

	// Get All Customers
	async getAllCustomer(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse = await quickbookServices.getAccessToken(companyId);

			if (authResponse?.status == true) {
				// Get All Customers from Quickbooks
				const customers: any = await quickbooksClient.getAllCustomers(
					authResponse?.accessToken as string,
					authResponse?.tenantID as string,
					authResponse?.refreshToken as string
				);

				await prisma.company.update({
					where: {
						id: companyId,
					},
					data: {
						customerLastSyncDate: moment(new Date())
							.tz('America/Los_Angeles')
							.format(),
					},
				});

				return DefaultResponse(
					res,
					200,
					'All accounts fetched successfully',
					customers?.QueryResponse?.Customer
				);
			} else {
				return DefaultResponse(res, 200, 'Company status is not active');
			}
		} catch (err) {
			next(err);
		}
	}

	// Get All Classes
	async getAllClasses(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse = await quickbookServices.getAccessToken(companyId);

			if (authResponse?.status == true) {
				// Get All Classes From Quickbooks
				const classes: any = await quickbooksClient.getAllClasses(
					authResponse?.accessToken as string,
					authResponse?.tenantID as string,
					authResponse?.refreshToken as string
				);

				const finalClasses = classes?.QueryResponse?.Class?.filter(
					(item: any) => item?.SubClass === true
				);

				await prisma.company.update({
					where: {
						id: companyId,
					},
					data: {
						classLastSyncDate: moment(new Date())
							.tz('America/Los_Angeles')
							.format(),
					},
				});

				return DefaultResponse(
					res,
					200,
					'All classes fetched successfully',
					finalClasses
				);
			} else {
				return DefaultResponse(res, 200, 'Company status is not active');
			}
		} catch (err) {
			next(err);
		}
	}

	// Get Company Info
	async getCompanyInfo(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse: any = await quickbookServices.getAccessToken(
				companyId
			);

			// Get Company Details From Quickbooks
			const qboCompanyInfo = await quickbooksClient.getCompanyInfo(
				authResponse.accessToken,
				authResponse.tenantID,
				authResponse.refreshToken
			);

			return DefaultResponse(
				res,
				200,
				'Company details fetched successfully',
				qboCompanyInfo
			);
		} catch (err) {
			next(err);
		}
	}

	// Get All TimeActivities
	async getAllTimeActivities(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			// Check validation for company id
			checkValidation(req);

			const companyId = req.body.companyId;

			// Get access token
			const authResponse: any = await quickbookServices.getAccessToken(
				companyId
			);

			// Get Company Details From Quickbooks
			const qboCompanyInfo = await quickbooksClient.getAllTimeActivities(
				authResponse.accessToken,
				authResponse.tenantID,
				authResponse.refreshToken
			);

			return DefaultResponse(
				res,
				200,
				'Time activities fetched successfully',
				qboCompanyInfo
			);
		} catch (err) {
			next(err);
		}
	}
}

export default new QuickbooksController();
