import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteApiWithData, getApi, postApi } from 'redux/apis';

// Get All Roles
export const getRoleActionTable = createAsyncThunk(
	'roleTable/getRolesTable',
	async (queryObj: any, { rejectWithValue }: any) => {
		try {
			const response = await getApi(
				`/role/organization-roles/${localStorage.getItem('companyId')}${
					queryObj?.url ? `?${queryObj?.url}` : ''
				} `
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

export const paginateRoleTable = createAsyncThunk(
	'roleTable/paginateTable',
	async (url: any, { rejectWithValue, getState }: any) => {
		const alreadyAvailableRoles = getState().roles.data;
		try {
			const response = await getApi(
				`/role/organization-roles/${localStorage.getItem('companyId')}${
					url ? `?${url}` : ''
				} `
			);
			return [...alreadyAvailableRoles, ...response.data.data.roles];
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

// Add New Role
export const addRoleActionTable = createAsyncThunk(
	'roleTable/addRolesTable',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await postApi(`/role/create`, {
				...data,
				orgId: localStorage.getItem('companyId'),
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

// Edit Role
export const editRoleActionTable = createAsyncThunk(
	'roleTable/editRoleTable',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await postApi(`/role/update-role`, {
				...data,
				orgId: localStorage.getItem('companyId'),
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

// Delete Role
export const deleteRoleActionTable = createAsyncThunk(
	'roleTable/deleteRoleTable',
	async (data: any, { rejectWithValue }) => {
		try {
			const response = await deleteApiWithData(`/role`, {
				...data,
				orgId: localStorage.getItem('companyId'),
			});
			return { response: response.data, id: data?.roleId };
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
