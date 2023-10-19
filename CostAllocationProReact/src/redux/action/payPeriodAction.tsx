import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi, postApi, putApi } from 'redux/apis';

export const payPeriodAction = createAsyncThunk(
	'payPeriod/get',
	async (queryParameters: any, { rejectWithValue }) => {
		try {
			const response = await getApi(
				`/pay-periods?companyId=${localStorage.getItem('companyId')}`,
				queryParameters
			);

			return response.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const paginateAction = createAsyncThunk(
	'payPeriod/paginate',
	async (queryParameters: any, { rejectWithValue }) => {
		try {
			const response = await getApi(
				`/pay-periods?companyId=${localStorage.getItem('companyId')}`,
				queryParameters
			);

			return response.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const editPeriodAction = createAsyncThunk(
	'payPeriod/edit',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await putApi(`/pay-periods/${data.payPeriodId}`, {
				companyId: localStorage.getItem('companyId'),
				...data,
			});

			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const getPeriodDatesAction = createAsyncThunk(
	'payPeriod/disable-dates',
	async (_: any, { rejectWithValue }) => {
		try {
			const response = await getApi(
				`/pay-periods/dates?companyId=${localStorage.getItem('companyId')}`
			);

			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const payPeriodOptionsAction = createAsyncThunk(
	'payPeriodOptions/get',
	async (_, { rejectWithValue }) => {
		try {
			const query = {
				companyId: localStorage.getItem('companyId'),
				// year,
			};

			// if (!year) {
			// 	delete query.year;
			// }

			const response = await getApi(`/pay-periods`, query);

			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const savePayPeriod = createAsyncThunk(
	'payPeriod/create',
	async (data: any, { rejectWithValue }) => {
		try {
			const res = await postApi('/pay-periods', data);
			return res.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
