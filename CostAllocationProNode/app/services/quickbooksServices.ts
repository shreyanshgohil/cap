import { CustomError } from '../models/customError';
import quickbooksAuthClient from '../quickbooksClient/quickbooksAuthClient';
import { companyRepository } from '../repositories';
import moment from 'moment-timezone';

class QuickbooksService {
	async getAccessToken(companyId: string) {
		try {
			const companyDetails = await companyRepository.getDetails(companyId);

			if (!companyDetails) {
				throw new CustomError(404, 'Company not found');
			}

			const accessTokenUTCDate = moment(companyDetails?.accessTokenUTCDate);
			const currentDateTime = moment(new Date());

			const minutes: string | number = currentDateTime.diff(
				accessTokenUTCDate,
				'minutes'
			);

			if (minutes >= 45) {
				const utc = moment.utc().valueOf();
				const authResponse = await quickbooksAuthClient.refreshToken(
					companyDetails?.refreshToken as string
				);
				if (authResponse != null) {
					const updatedCompany = await companyRepository.updateCompany(
						companyId,
						{
							accessToken: authResponse?.token?.access_token,
							refreshToken: authResponse?.token?.refresh_token,
							accessTokenUTCDate: moment.utc(utc).toDate(),
						}
					);
					return updatedCompany;
				}
			} else {
				return companyDetails;
			}
		} catch (err) {
			throw err;
		}
	}
}

export default new QuickbooksService();
