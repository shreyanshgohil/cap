import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postApi } from 'redux/apis';
import { toastText } from 'utils/utils';
import { v4 as uuidv4 } from 'uuid';

const initialState: any = {
	isLoading: false,
	error: null,
};

export const loginAction = createAsyncThunk(
	'auth/Login',
	async (data: any, { rejectWithValue }) => {
		try {
			const machineId = uuidv4();
			const response = await postApi('/auth/login', {
				...data,
				machineId: machineId,
			});
			localStorage.setItem('machineId', machineId);
			return response.data;
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const logoutAction = createAsyncThunk(
	'auth/logout',
	async (_, { rejectWithValue }) => {
		try {
			const response = await postApi('/auth/logout', {
				machineId: localStorage.getItem('machineId'),
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

const AuthSlice = createSlice({
	name: 'Auth',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loginAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(loginAction.fulfilled, (state, action: any) => {
			state.isLoading = false;
			localStorage.setItem('accessToken', action?.payload?.data?.accessToken);
			localStorage.setItem('refreshToken', action?.payload?.data?.refreshToken);
			toastText(action?.payload?.message, 'success');
		});
		builder.addCase(loginAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});
		builder.addCase(logoutAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(logoutAction.fulfilled, (state) => {
			state.isLoading = false;
			localStorage.clear();
			toastText('User logged out successfully', 'success');
		});
		builder.addCase(logoutAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText('User logged out successfully', 'success');
		});
	},
});

export default AuthSlice;
