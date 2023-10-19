import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi, postApi } from 'redux/apis';

export const getPermissionsAction = createAsyncThunk(
	'auth/getPermission',
	async (roleId: any, { rejectWithValue }) => {
		try {
			const response = await getApi(`/permission/${roleId}`);
			return response.data.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const updatePermissionsAction = createAsyncThunk(
	'auth/updatePermission',
	async (permissions: any, { rejectWithValue }) => {
		try {
			const response = await postApi(
				'/permission/update-permission',
				permissions
			);
			return { permissions: permissions.permissions, response: response };
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
