import Moment from 'moment-timezone';
import config from '../../config';

/* eslint-disable @typescript-eslint/no-var-requires */
const QuickBooks = require('node-quickbooks');

class QuickbooksClient {
	async getCompanyInfo(
		accessToken: string,
		realmId: string,
		refreshToken: string
	): Promise<any> {
		return new Promise((resolve, reject) => {
			const qbo = new QuickBooks(
				config.quickbooksClientId,
				config.quickbooksClientSecret,
				accessToken,
				true,
				realmId,
				config.quickbooksEnvironment == 'sandbox' ? true : false,
				true,
				null,
				'2.0',
				refreshToken
			);
			qbo.getCompanyInfo(realmId, async function (err: any, response: any) {
				if (err) {
					reject(err);
				} else {
					resolve(response);
				}
			});
		});
	}

	async getEmployees(
		accessToken: string,
		realmId: string,
		refreshToken: string
	) {
		return new Promise((resolve, reject) => {
			const qbo = new QuickBooks(
				config.quickbooksClientId,
				config.quickbooksClientSecret,
				accessToken,
				true,
				realmId,
				config.quickbooksEnvironment == 'sandbox' ? true : false,
				true,
				null,
				'2.0',
				refreshToken
			);

			qbo.findEmployees(
				[{ field: 'Active', value: [true, false], operator: 'IN' }],
				// [{ field: 'fetchAll', value: true }],
				async function (err: any, response: any) {
					if (err) {
						reject(err);
					} else {
						resolve(response);
					}
				}
			);
		});
	}

	async getAllAccounts(
		accessToken: string,
		realmId: string,
		refreshToken: string
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);

				qbo.findAccounts(
					[
						{ field: 'AccountType', value: 'Expense' },
						{ field: 'fetchAll', value: true },
						{ field: 'asc', value: 'Name' },
					],
					async function (err: any, response: any) {
						if (err) {
							reject(err);
						} else {
							resolve(response);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}

	async getAllClasses(
		accessToken: string,
		realmId: string,
		refreshToken: string
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);

				qbo.findClasses(
					[
						{ field: 'fetchAll', value: true },
						{ field: 'Active', value: true },
						{ field: 'asc', value: 'Name' },
					],
					async function (err: any, response: any) {
						if (err) {
							reject(err);
						} else {
							resolve(response);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}

	async getAllCustomers(
		accessToken: string,
		realmId: string,
		refreshToken: string
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);
				qbo.findCustomers(
					[
						{ field: 'fetchAll', value: true },
						{ field: 'asc', value: 'GivenName' },
						{ field: 'Active', value: true },
					],
					async function (err: any, response: any) {
						if (err) {
							reject(err);
						} else {
							resolve(response);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}

	async getAllTimeActivities(
		accessToken: string,
		realmId: string,
		refreshToken: string
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);

				qbo.findTimeActivities(
					[
						// { field: 'TxnDate', value: '2014-12-01', operator: '>' },
						// { field: 'TxnDate', value: '2014-12-03', operator: '<' },
						// { field: 'limit', value: 5 },
						{ field: 'fetchAll', value: true },
					],
					async function (err: any, timeActivities: any) {
						if (err) {
							reject(err);
						} else {
							console.log('Time activity: ' + timeActivities);
							resolve(timeActivities);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}

	// Get employees by last sync date
	async getEmployeesByLastSync(
		accessToken: string,
		realmId: string,
		refreshToken: string,
		lastSyncDate: Date
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);
				qbo.findEmployees(
					[
						{ field: 'Active', value: [true, false], operator: 'IN' },
						{
							field: 'MetaData.LastUpdatedTime',
							value: Moment(lastSyncDate).tz('America/Los_Angeles').format(),
							operator: '>=',
						},
						// { field: 'fetchAll', value: true },
					],
					async function (err: any, timeActivities: any) {
						if (err) {
							reject(err);
						} else {
							resolve(timeActivities);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}

	// Get time activities by last sync date
	async getTimeActivitiesByLastSync(
		accessToken: string,
		realmId: string,
		refreshToken: string,
		lastSyncDate: Date
	) {
		try {
			return new Promise((resolve, reject) => {
				const qbo = new QuickBooks(
					config.quickbooksClientId,
					config.quickbooksClientSecret,
					accessToken,
					true,
					realmId,
					config.quickbooksEnvironment == 'sandbox' ? true : false,
					true,
					null,
					'2.0',
					refreshToken
				);
				qbo.findTimeActivities(
					[
						{
							field: 'MetaData.LastUpdatedTime',
							value: Moment(lastSyncDate).tz('America/Los_Angeles').format(),
							operator: '>=',
						},
						{ field: 'fetchAll', value: true },
					],
					async function (err: any, timeActivities: any) {
						if (err) {
							reject(err);
						} else {
							resolve(timeActivities);
						}
					}
				);
			});
		} catch (err) {
			throw err;
		}
	}
}

export default new QuickbooksClient();
