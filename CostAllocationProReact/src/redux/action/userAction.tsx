import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteApiWithData, getApi, postApi, putApi } from 'redux/apis';

export const getUsersAction = createAsyncThunk(
	'users/getUsers',
	async (params: any = {}, { rejectWithValue }) => {
		try {
			const response = await getApi('/users', {
				...params,
				company: localStorage.getItem('companyId'),
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

export const paginateUserAction = createAsyncThunk(
	'users/paginateUsers',
	async (params: any = {}, { rejectWithValue, getState }: any) => {
		const alreadyAvailableUsers = getState().users.data;
		try {
			const response = await getApi('/users', {
				...params,
				company: localStorage.getItem('companyId'),
			});
			return [...alreadyAvailableUsers, ...response.data.data];
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const inviteUserAction = createAsyncThunk(
	'users/inviteUser',
	async (data: object, { rejectWithValue }) => {
		try {
			const response = await postApi('/users/invite-user', {
				...data,
				company: localStorage.getItem('companyId'),
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

export const editUserAction = createAsyncThunk(
	'users/editUser',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await putApi('/users', {
				...data,
				companyId: localStorage.getItem('companyId'),
			});

			return { response: response.data, editData: data };
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const deleteUserAction = createAsyncThunk(
	'users/deleteUser',
	async (data: any, { rejectWithValue }) => {
		try {
			const user = data?.userId;
			const response = await deleteApiWithData('/users', {
				user: user,
				company: localStorage.getItem('companyId'),
			});

			return { response: response.data, id: data?.id };
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
