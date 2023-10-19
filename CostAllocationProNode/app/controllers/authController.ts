/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import config from '../../config';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { RequestExtended } from '../interfaces/global';
import {
	companyRoleRepository,
	roleRepository,
	userRepository,
} from '../repositories';
import tokenRepository from '../repositories/tokenRepository';
import authServices from '../services/authServices';
import { CustomError } from '../models/customError';
import {
	checkTokens,
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
} from '../helpers/tokenHelper';
import { CompanyInfo, UserInfo } from '../interfaces';
import { User } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

class AuthController {
	// Register User
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const { data } = req.body;

			const customer = data?.subscription?.customer;

			const firstName = customer?.first_name;
			const lastName = customer?.last_name;
			const email = customer?.email?.toLowerCase();
			const customerId = customer?.customer_id;
			let companyAdminRole;

			// Check if company admin role exists
			companyAdminRole = await roleRepository.checkAdmin('Company Admin');

			if (!companyAdminRole) {
				companyAdminRole = await roleRepository.createRole(
					'Company Admin',
					'All company permissions granted',
					false,
					true
				);
			}

			// Check if admin role exists
			const isAdminExist = await roleRepository.checkAdmin('admin');

			if (!isAdminExist) {
				await roleRepository.createRole(
					'Admin',
					'All permissions granted',
					true,
					false
				);
			}

			// If email already exists

			const isExist = await userRepository.getByEmail(email);
			if (isExist) {
				throw new CustomError(400, 'Email already exists');
			}

			// Create new user
			const user = await authServices.register(
				firstName,
				lastName,
				email,
				customerId
			);

			// TEMP Until we not create the company
			// const companyData = {
			// 	tenantID: Math.random().toString(),
			// 	tenantName: 'Organization 1',
			// };

			// const company = await companyRepository.create(companyData);

			// await companyRepository?.connectCompany(user.id, company?.id);

			// TEMP END Until we not create the company

			// Uncomment code
			// Create new record in companyRole
			await companyRoleRepository.create(user?.id, companyAdminRole?.id);

			return DefaultResponse(
				res,
				201,
				'User registration successful, please check your email for accessing your account'
			);
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	// Login User
	async login(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			checkValidation(req);
			const { email, password, machineId } = req.body;

			const { accessToken, refreshToken, user } = await authServices.login(
				email?.toLowerCase(),
				password,
				machineId
			);

			// req.session.accessToken = accessToken;
			// req.session.refreshToken = refreshToken;

			const {
				password: userPassword,
				forgotPasswordToken,
				forgotPasswordTokenExpiresAt,
				isVerified,
				companies,
				...finalUser
			} = user;

			return DefaultResponse(res, 200, 'User logged in successfully', {
				...finalUser,
				accessToken,
				refreshToken,
			});
		} catch (err) {
			next(err);
		}
	}

	// Forgot Password
	async forgotPassword(req: Request, res: Response, next: NextFunction) {
		try {
			checkValidation(req);

			const { email } = req.body;

			await authServices.forgotPassword(email);

			return DefaultResponse(
				res,
				200,
				'Please check your inbox. If you have account with us you got email with reset instruction.'
				// 'Password reset link sent to your email address'
			);
		} catch (err) {
			console.log('Err: ', err);
			next(err);
		}
	}

	// Verify Forgot Password Token
	async verifyForgotPasswordToken(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const { token } = req.query;
			await authServices.verifyForgotPassword(token as string);

			return DefaultResponse(
				res,
				200,
				'Reset Password Token verified successfully'
			);
		} catch (err) {
			next(err);
		}
	}

	// Change Password
	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			checkValidation(req);
			const { password } = req.body;
			const { token } = req.params;

			const user = await authServices.changePassword(token, password);

			return DefaultResponse(
				res,
				200,
				'User password changed successfully',
				user
			);
		} catch (err) {
			next(err);
		}
	}

	// Fetch Profile
	async fetchProfile(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const profile = await userRepository.getById(req.user.id);

			// If the user has bought a subscription then there is no company or role assigned to that user
			const user: any = await companyRoleRepository.getRecordWithNullCompanyId(
				req.user.id
			);

			let profileData;
			if (user.length > 0) {
				// Check if the user is companyAdmin
				const isCompanyAdmin = await roleRepository.checkCompanyAdminRole(
					user[0]?.role?.id
				);
				if (isCompanyAdmin) {
					profileData = {
						...profile,
						isFirstCompanyAdmin: true,
					};
				} else {
					profileData = {
						...profile,
						isFirstCompanyAdmin: false,
					};
				}
			} else {
				profileData = {
					...profile,
					isFirstCompanyAdmin: false,
				};
			}

			const userByEmail: any = await userRepository.getByEmail(
				profileData?.email
			);

			if (userByEmail?.companies?.length > 0) {
				const isValidForLoginWithRole = userByEmail?.companies?.some(
					(singleCompany: CompanyInfo) => {
						return singleCompany?.role?.status;
					}
				);

				if (!isValidForLoginWithRole) {
					throw new CustomError(
						204,
						'You are not authorized to access the system please contact your administrator.'
					);
				}
			}

			return DefaultResponse(
				res,
				200,
				'Profile fetched successfully',
				profileData
			);
		} catch (err) {
			next(err);
		}
	}

	// Update Profile
	async updateProfile(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const { email, ...data } = req.body;
			if (req?.file?.location) {
				const fileUrl = req.file.location.replace(config.s3BaseUrl, '');
				data.profileImg = fileUrl;
			}
			// Form data giving the null in string
			if (data.profileImg === 'null') {
				data.profileImg = null;
			}
			const profile = await userRepository.update(req.user.id, data);
			// If the user has bought a subscription then there is no company or role assigned to that user
			const user: any = await companyRoleRepository.getRecordWithNullCompanyId(
				req.user.id
			);

			let profileData;
			if (user.length > 0) {
				// Check if the user is companyAdmin
				const isCompanyAdmin = await roleRepository.checkCompanyAdminRole(
					user[0]?.role?.id
				);
				if (isCompanyAdmin) {
					profileData = {
						...profile,
						isFirstCompanyAdmin: true,
					};
				} else {
					profileData = {
						...profile,
						isFirstCompanyAdmin: false,
					};
				}
			} else {
				profileData = {
					...profile,
					isFirstCompanyAdmin: false,
				};
			}

			return DefaultResponse(
				res,
				200,
				'Profile updated successfully',
				profileData
			);
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	// Logout

	async logout(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const accessToken = req.accessToken;
			const refreshToken = req.refreshToken;

			const machineId = req.body.machineId;
			const deleted = await tokenRepository.delete(
				req.user.id,
				accessToken,
				refreshToken,
				machineId
			);
			return DefaultResponse(res, 200, 'User logged out successfully');
		} catch (err) {
			next(err);
		}
	}

	// Refresh Token
	async refreshToken(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const { accessToken, refreshToken } = req.body;

			if (!accessToken || !refreshToken) {
				throw new CustomError(401, 'Unauthorized user');
			}

			const verifiedAccessToken: any = await verifyAccessToken(accessToken);

			if (!verifiedAccessToken) {
				throw new CustomError(401, 'Invalid access token');
			}

			const isValid = await checkTokens(
				verifiedAccessToken?.id,
				accessToken,
				refreshToken
			);

			if (!isValid) {
				const error = new CustomError(401, 'Token expired');
				return next(error);
			}

			// Generate new access token
			const newAccessToken = generateAccessToken({
				id: verifiedAccessToken?.id,
				email: verifiedAccessToken?.email,
			});

			// Generate new refresh token
			const newRefreshToken = generateRefreshToken({
				id: verifiedAccessToken?.id,
				email: verifiedAccessToken?.email,
			});

			await tokenRepository?.updateTokens(
				verifiedAccessToken?.id,
				accessToken,
				refreshToken,
				newAccessToken,
				newRefreshToken
			);

			const data = {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			};

			return DefaultResponse(res, 200, 'Refreshed token', data);
		} catch (err) {
			next(err);
		}
	}
}

export default new AuthController();
