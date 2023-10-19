import { createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';

export const disconnectAction = createAsyncThunk(
	'quickbooks/disconnect',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/quickbooks/disconnect', {
				companyId: localStorage.getItem('companyId'),
			});

			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
