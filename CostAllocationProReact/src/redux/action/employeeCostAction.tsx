import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi, putApi } from 'redux/apis';

export const getEmployeeCostAction = createAsyncThunk(
	'employee-cost/get',
	async (params: any = {}, { rejectWithValue }) => {
		try {
			const response = await getApi('/employee-cost', {
				...params,
				companyId: localStorage.getItem('companyId'),
			});
			return response.data.data;
		} catch (error: any) {
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const paginateEmployeeCostAction = createAsyncThunk(
	'paginate-employee-cost-columns/get',
	async (params: any = {}, { rejectWithValue, getState }: any) => {

		// const newParams = {
		// 	...params,
		// 	page: 1,
		// 	limit: params.limit * params.page,
		// };

    const alreadyAvailableEmployees = getState()?.employeeCosts?.calculatedData;

		try {
			const response: any = await getApi('/employee-cost', {
				...params,
				companyId: localStorage.getItem('companyId'),
			});
			// return response.data.data.employees;
			return [...alreadyAvailableEmployees, ...response.data.data.employees];
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);

export const updateEmployeeCost = createAsyncThunk(
	'employee-cost/update',
	async (data: any = {}, { rejectWithValue, getState }: any) => {
		const alreadyAvailableEmployees = getState()?.employeeCosts?.data;
		try {
			const response: any = await putApi('/employee-cost', {
				...data,
				companyId: localStorage.getItem('companyId'),
			});

			return [...alreadyAvailableEmployees, ...response.data.data.employees];
		} catch (error: any) {
			if (!error.response) {
				throw error;
			}
			return rejectWithValue(error?.response?.data);
		}
	}
);
