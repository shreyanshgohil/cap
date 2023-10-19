import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi, putApiNoHeader } from 'redux/apis';

export const fetchProfileAction = createAsyncThunk(
	'auth/fetchProfile',
	async (_, { rejectWithValue }) => {
		try {
			const response = await getApi('/auth/fetch-profile');
			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const updateProfileAction = createAsyncThunk(
	'auth/updateProfile',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await putApiNoHeader('/auth', data);
			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const deleteProfileImageAction = createAsyncThunk(
	'auth/delete',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await putApiNoHeader('/auth', data);
			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const uploadProfileImageAction = createAsyncThunk(
	'auth/upload',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await putApiNoHeader('/auth', data);
			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
