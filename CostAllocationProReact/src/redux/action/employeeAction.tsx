import { createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';

export const getEmployeeAction = createAsyncThunk(
	'employee/get',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/employees', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const paginateGetEmployeeAction = createAsyncThunk(
	'paginate-employee/get',
	async (params: any, { rejectWithValue }) => {
		try {
			const response = await postApi('/employees', {
				...params,
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
