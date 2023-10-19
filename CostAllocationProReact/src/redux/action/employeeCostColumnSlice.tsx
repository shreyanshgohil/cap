import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi } from 'redux/apis';

export const getEmployeeCostColumnAction = createAsyncThunk(
	'employee-cost-columns/get',
	async (_, { rejectWithValue }) => {
		try {
			const response = await getApi('/configuration', {
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
