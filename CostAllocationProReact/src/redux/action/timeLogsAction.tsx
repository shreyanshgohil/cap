import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteApiWithData, getApi, postApi, putApi } from 'redux/apis';

// Get All Roles
export const getTimeLogs = createAsyncThunk(
	'timeLogs/get',
	async (queryParameters: any = {}, { rejectWithValue }: any) => {
		try {
			const params = {
				...queryParameters,
				companyId: localStorage.getItem('companyId'),
			};

			const response = await getApi('/time-activities', params);

			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const getTimeLogsPaginate = createAsyncThunk(
	'timeLogs/paginate',
	async (queryParameters: any, { rejectWithValue }: any) => {
		try {
			const params = {
				...queryParameters,
				companyId: localStorage.getItem('companyId'),
			};

			const response = await getApi('/time-activities', params);
			return response.data.data.timeActivities;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const addTimeLog = createAsyncThunk(
	'timeLogs/addTimeLog',
	async (timeLogData: any, { rejectWithValue }: any) => {
		try {
			const response = await postApi(
				'/time-activities/create',
				{
					companyId: localStorage.getItem('companyId'),
					...timeLogData,
				},
				false
			);

			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const updateTimeLog = createAsyncThunk(
	'timeLogs/updateTimeLog',
	async (timeLogData: any, { rejectWithValue }: any) => {
		try {
			const response = await putApi(
				'/time-activities',
				{
					companyId: localStorage.getItem('companyId'),
					...timeLogData,
				},
				false
			);
			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const deleteTimeLogAction = createAsyncThunk(
	'timeLogs/deleteTimeLog',
	async (timeLogData: any, { rejectWithValue }: any) => {
		try {
			const response = await deleteApiWithData('/time-activities', {
				companyId: localStorage.getItem('companyId'),
				...timeLogData,
			});
			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const splitTimeLogAction = createAsyncThunk(
	'timeLogs/splitTimeActivity',
	async (timeLogData: any, { rejectWithValue }: any) => {
		try {
			const response = await postApi('/split-time-activity', {
				...timeLogData,
			});
			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
