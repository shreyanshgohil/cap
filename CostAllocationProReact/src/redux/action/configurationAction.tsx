import { createAsyncThunk } from '@reduxjs/toolkit';
import { putApi } from 'redux/apis';

export const updateConfiguration = createAsyncThunk(
	'configuration/get',
	async (configurationData: any, { rejectWithValue }) => {
		try {
			const response = await putApi('/companies/configuration', {
				companyId: localStorage.getItem('companyId'),
				...configurationData,
			});
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);
