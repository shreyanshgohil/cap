import { createSlice } from '@reduxjs/toolkit';
import {
	addTimeLog,
	deleteTimeLogAction,
	getTimeLogs,
	getTimeLogsPaginate,
	splitTimeLogAction,
	updateTimeLog,
} from 'redux/action/timeLogsAction';
import { toastText } from 'utils/utils';
const initialState = {
	isLoading: true,
	isFirstTimeLoading: true,
	deleteLoader: false,
	commonLoader: false,
	data: [],
	error: null,
	count: 0,
};

const timeLogsSlice = createSlice({
	initialState,
	name: 'class',
	reducers: {
		clearTimeLogRedux: () => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getTimeLogs.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getTimeLogs.fulfilled, (state, action) => {
			state.data = action.payload.timeActivities;
			state.count = action.payload.timeActivitiesCount;
			state.isFirstTimeLoading = false;
			state.isLoading = false;
		});
		builder.addCase(getTimeLogs.rejected, (state: any, action) => {
			state.error = action.payload;
			state.isFirstTimeLoading = false;
			state.isLoading = false;
		});

		builder.addCase(getTimeLogsPaginate.fulfilled, (state: any, action) => {
			state.data = [...state.data, ...action.payload];
			state.isLoading = false;
		});
		builder.addCase(addTimeLog.pending, (state: any) => {
			state.isLoading = true;
		});
		builder.addCase(addTimeLog.fulfilled, (state: any, action) => {
			state.data = [action.payload, ...state.data];
			state.isLoading = false;
		});
		builder.addCase(addTimeLog.rejected, (state: any, action) => {
			state.error = action.payload;
		});
		builder.addCase(updateTimeLog.fulfilled, (state: any) => {
			state.isLoading = false;
		});
		// Delete time log
		builder.addCase(deleteTimeLogAction.pending, (state: any) => {
			state.deleteLoader = true;
		});
		builder.addCase(deleteTimeLogAction.fulfilled, (state: any) => {
			state.deleteLoader = false;
		});
		builder.addCase(deleteTimeLogAction.rejected, (state: any, action) => {
			state.error = action.payload;
			state.deleteLoader = false;
		});
		// split time log
		builder.addCase(splitTimeLogAction.pending, (state: any) => {
			state.commonLoader = true;
		});
		builder.addCase(splitTimeLogAction.fulfilled, (state: any) => {
			state.commonLoader = false;
		});
		builder.addCase(splitTimeLogAction.rejected, (state: any, action: any) => {
			state.error = action.payload;
			state.commonLoader = false;
			toastText(action.payload.message, 'error');
		});
	},
});

export default timeLogsSlice;
export const { clearTimeLogRedux } = timeLogsSlice.actions;
