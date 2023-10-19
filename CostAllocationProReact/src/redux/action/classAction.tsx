import { createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';

export const classAction = createAsyncThunk(
	'class/get',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi(`/quickbooks/classes`, {
				companyId: localStorage.getItem('companyId'),
			});

			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const refreshClass = createAsyncThunk(
	'class/refresh',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi(`/quickbooks/classes`, {
				companyId: localStorage.getItem('companyId'),
			});

			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
