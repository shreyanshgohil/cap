import { createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';

export const customerAccountAction = createAsyncThunk(
	'customer/get',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/quickbooks/customers', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const refreshAccountAction = createAsyncThunk(
	'customer/refresh',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/quickbooks/customers', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
