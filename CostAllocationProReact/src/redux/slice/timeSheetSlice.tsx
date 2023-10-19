import { createSlice } from '@reduxjs/toolkit';
import { getTimeSheetsAction, getTimeSheetsPaginateAction } from 'redux/action/timeSheetAction';
const initialState = {
    isLoading: true,
    isFirstTimeLoading: true,
    data: [],
    error: null,
    count: 0,
};

const timeSheetSlice = createSlice({
    initialState,
    name: 'timeSheet',
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getTimeSheetsAction.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getTimeSheetsAction.fulfilled, (state, action) => {
            state.data = action.payload.timeSheets;
            state.count = action.payload.count;
            state.isFirstTimeLoading = false;
            state.isLoading = false;
            state.error = null;
        });
        builder.addCase(getTimeSheetsAction.rejected, (state: any, action) => {
            state.error = action.payload;
            state.isFirstTimeLoading = false;
            state.isLoading = false;
            state.data = [];
        });
        //Paginate slice
        builder.addCase(getTimeSheetsPaginateAction.fulfilled, (state: any, action) => {
            state.data = [...state.data, ...action.payload];
            state.isLoading = false;
        });
    } 
});

export default timeSheetSlice;
