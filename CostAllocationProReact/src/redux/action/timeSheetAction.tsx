import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApi } from 'redux/apis';

export const getTimeSheetsAction = createAsyncThunk(
    'timeSheet/get',
    async (queryParameters: any = {}, { rejectWithValue }: any) => {
        try {
            const params = {
                ...queryParameters,
                companyId: localStorage.getItem('companyId'),
            };

            const response = await getApi('/time-sheet', params);

            return response.data.data;
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const getTimeSheetsPaginateAction = createAsyncThunk(
    'timeSheet/paginate',
    async (queryParameters: any, { rejectWithValue }: any) => {
        try {
            const params = {
                ...queryParameters,
                companyId: localStorage.getItem('companyId'),
            };

            const response = await getApi('/time-sheet', params);
            return response.data.data.timeSheets;
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
);