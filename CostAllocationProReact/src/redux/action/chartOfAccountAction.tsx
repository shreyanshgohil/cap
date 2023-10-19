import { createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';

export const chartOfAccountAction = createAsyncThunk(
	'ca/get',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/quickbooks/accounts', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const refreshOfAccountAction = createAsyncThunk(
	'ca/refresh',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/quickbooks/accounts', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
