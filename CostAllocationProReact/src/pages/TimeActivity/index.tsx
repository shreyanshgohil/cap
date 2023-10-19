/* eslint-disable @typescript-eslint/no-unused-vars */
import { Loader, TableActionHeader } from 'components/Global';
import ConfirmDelete from 'components/Global/confirmDeleteModel';
import { TimeLogSheetSelector, TimeLogs } from 'components/TimeActivity';
import { TimeLog } from 'components/TimeActivity/TimeLogs/types';
import TimeSheet from 'components/TimeActivity/TimeSheet';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	addTimeLog,
	getTimeLogs,
	splitTimeLogAction,
	updateTimeLog,
} from 'redux/action/timeLogsAction';
import { AppDispatch } from 'redux/store';
import {
	checkPermission,
	divideTimeBySlots,
	divideTimeInHalf,
	hasText,
	makeTotalTime,
	timeDifference,
	toastText,
} from 'utils/utils';
import styles from './index.module.scss';
import { deleteApiWithData, getApi, postApi } from 'redux/apis';
import { clearTimeLogRedux } from 'redux/slice/timeLogSlice';
import CreateTimeSheetModal from 'components/TimeActivity/CreateTimeSheetModal';
import { TimeSheetFormData } from 'components/TimeActivity/CreateTimeSheetModal/types';
import moment from 'moment';

const TimeActivity = () => {
	// Inits
	const dispatch = useDispatch<AppDispatch>();
	const [timeLogsData, setTimeLogsData] = useState<any>([]);
	const [openTables, setOpenTables] = useState<string[]>([]);
	const [isTimeLog, isSetTimeLog] = useState(true);
	// const [hoursUnder, setHoursUnder] = useState(false);
	const [timeLogAdding, setTimeLogAdding]: any = useState([]);
	const [timeLogsDataCopy, setTimeLogsDataCopy] = useState<any>([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [parentTimeActivityId, setParentTimeActivityId] = useState(null);
	const [selectedTimeLog, setSelectedTimeLog] = useState<any>(null);
	const [payPeriod, setPayPeriod] = useState<any>(null);

	const [openCreateTimeSheet, setOpenCreateTimeSheet] = useState(false);
	const [timeSheetData, setTimeSheetData] = useState<any>(null);

	const [error] = useState({
		activityDate: false,
		hrs: false,
	});
	const { isFirstTimeLoading, data: timeLogs } = useSelector(
		(state: any) => state.timeLogs
	);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isViewTimeLogsPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['view'],
	});

	const navigate = useNavigate();

	if (isViewTimeLogsPermission === false) {
		navigate('/unauthorized');
	}

	useEffect(() => {
		document.title = 'CostAllocation Pro - Time Activity';
		return () => {
			dispatch(clearTimeLogRedux());
		};
	}, []);

	// Perform initial function call
	const initialCall = () => {
		dispatch(
			getTimeLogs({
				year: new Date().getFullYear(),
			})
		).then((res) => {
			if (res?.payload?.error?.status === 403) {
				navigate('/unauthorized');
			}
		});
	};

	// For add a single time log to timelog list
	const addTimeLogHandler = () => {
		const timeLog: any = {
			id: Math.random().toString(),
			timeActivityId: Math.random().toString(),
			classId: null,
			className: null,
			customerId: null,
			customerName: null,
			hours: '00',
			minute: '00',
			employeeId: null,
			actualTimeLog: '00:00',
			activityDate: new Date(),
			employeeName: null,
			isAdding: true,
			SplitTimeActivities: [],
		};
		setTimeLogAdding([timeLog, ...timeLogAdding]);
		setTimeLogsData([timeLog, ...timeLogsData]);
	};

	// For update a single time log to timelog list
	const updateTimeLogHandler = (id: string, name: string, value: any) => {
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === id
		);
		const addingTimeLogIndex = timeLogAdding.findIndex(
			(singleEl: any) => singleEl.id === id
		);
		if (name === 'customerName') {
			copyTimeLogs[timeLogIndex]['customerName'] = value.children;
			copyTimeLogs[timeLogIndex]['customerId'] = value.value;
			copyTimeLogs[timeLogIndex]['errorCustomer'] = false;
			copyTimeLogs[timeLogIndex]['isCustomerSelected'] = true;
			if (addingTimeLogIndex !== -1) {
				timeLogAdding[timeLogIndex]['customerName'] = value.children;
				timeLogAdding[timeLogIndex]['customerId'] = value.value;
				timeLogAdding[timeLogIndex]['errorCustomer'] = false;
				timeLogAdding[timeLogIndex]['isCustomerSelected'] = true;
			}
		} else if (name === 'className') {
			copyTimeLogs[timeLogIndex]['classId'] = value.value;
			copyTimeLogs[timeLogIndex]['className'] = value.children;
			copyTimeLogs[timeLogIndex]['errorClass'] = false;
			copyTimeLogs[timeLogIndex]['isClassSelected'] = true;
			if (addingTimeLogIndex !== -1) {
				timeLogAdding[timeLogIndex]['classId'] = value.value;
				timeLogAdding[timeLogIndex]['className'] = value.children;
				timeLogAdding[timeLogIndex]['errorClass'] = false;
				timeLogAdding[timeLogIndex]['isClassSelected'] = true;
			}
		} else if (name === 'employeeName') {
			copyTimeLogs[timeLogIndex]['employeeId'] = value.value;
			copyTimeLogs[timeLogIndex]['employeeName'] = value.children;
			copyTimeLogs[timeLogIndex]['errorEmployee'] = false;
			if (addingTimeLogIndex !== -1) {
				timeLogAdding[timeLogIndex]['employeeId'] = value.value;
				timeLogAdding[timeLogIndex]['employeeName'] = value.children;
				timeLogAdding[timeLogIndex]['errorEmployee'] = false;
			}
		} else if (name === 'hrs') {
			copyTimeLogs[timeLogIndex]['actualTimeLog'] = value;
			copyTimeLogs[timeLogIndex]['errorHrs'] = false;
			if (addingTimeLogIndex !== -1) {
				timeLogAdding[timeLogIndex]['actualTimeLog'] = value;
				timeLogAdding[timeLogIndex]['errorHrs'] = false;
			}
		} else if (name === 'activityDate') {
			copyTimeLogs[timeLogIndex][name] = value;
			copyTimeLogs[timeLogIndex]['errorActivityDate'] = false;
			if (addingTimeLogIndex !== -1) {
				timeLogAdding[timeLogIndex]['customerName'] = value.children;
				timeLogAdding[timeLogIndex]['customerId'] = value.value;
				timeLogAdding[timeLogIndex]['errorCustomer'] = false;
				timeLogAdding[timeLogIndex]['isCustomerSelected'] = true;
			}
		} else {
			copyTimeLogs[timeLogIndex][name] = value;
		}
		setTimeLogsData(copyTimeLogs);
	};

	// Disable handler
	const disableHandler = (id: string) => {
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === id
		);

		copyTimeLogs[timeLogIndex]['isDisabled'] = false;
		copyTimeLogs[timeLogIndex]['isEditing'] = true;

		setTimeLogsData(copyTimeLogs);
	};

	// For split the time log
	const splitTimeLogHandler = (singleTimeLog: any) => {
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const splitActivity = [];
		const timeLogIndex: any = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === singleTimeLog.id
		);

		const timeLog = copyTimeLogs[timeLogIndex];
		const hoursMinutesData = divideTimeInHalf(
			Number(timeLog.actualTimeLog.split(':')[0]),
			Number(timeLog.actualTimeLog.split(':')[1])
		);
		const minuteInInteger = Number.isInteger(
			Number(timeLog.actualTimeLog.split(':')[1]) / 2 || 0
		);

		for (let index = 0; index < 2; index++) {
			let actualMinute = hoursMinutesData.halfMinutes;
			if (index > 0 && !minuteInInteger) {
				actualMinute += 1;
			}
			splitActivity.push({
				id: timeLog.id,
				timeActivityId: timeLog?.timeActivityId,
				classId: timeLog?.classId || null,
				className: timeLog?.className || null,
				customerId: timeLog?.customerId,
				customerName: timeLog?.customerName,
				hours: hoursMinutesData.halfHours,
				minute: actualMinute,
				activityDate: timeLog?.activityDate,
				actualTimeLog: `${
					hoursMinutesData?.halfHours?.toString()?.padStart(2, '0') || '00'
				}:${actualMinute?.toString()?.padStart(2, '0') || '00'}`,
				isAdding: false,
				errorHrs: false,
				errorActivityDate: false,
				errorCustomer: false,
				errorClass: false,
				errorEmployee: false,
			});
		}

		copyTimeLogs[timeLogIndex]['SplitTimeActivities'] = splitActivity;
		copyTimeLogs[timeLogIndex]['isSplitting'] = true;
		setTimeLogsData(copyTimeLogs);
	};

	// For convert it into supported time log data
	const formateTimeLogData = () => {
		const formattedTimeLogs = timeLogs.map((singleTimeLog: TimeLog) => {
			const timeLogIndex = timeLogsData.findIndex(
				(singleTimeLogFromState: any) =>
					singleTimeLog.id === singleTimeLogFromState.id
			);

			if (timeLogIndex !== -1) {
				return timeLogsData[timeLogIndex];
			} else {
				const splitTimeLogs = singleTimeLog.SplitTimeActivities.map(
					(singleSplitTimeLog: any) => {
						return {
							id: singleSplitTimeLog.id,
							timeActivityId: singleSplitTimeLog?.timeActivityId,
							classId: singleSplitTimeLog?.classId || null,
							className: singleSplitTimeLog?.className || null,
							customerId: singleSplitTimeLog?.customerId,
							customerName: singleSplitTimeLog?.customerName,
							hours: singleSplitTimeLog?.hours,
							minute: singleSplitTimeLog?.minute,
							activityDate: singleSplitTimeLog?.activityDate,
							actualTimeLog: `${singleSplitTimeLog?.hours}:${singleSplitTimeLog?.minute}`,
							isAdding: false,
							errorHrs: false,
							errorActivityDate: false,
							errorCustomer: false,
							errorClass: false,
							errorEmployee: false,
						};
					}
				);
				return {
					id: singleTimeLog.id,
					timeActivityId: singleTimeLog?.timeActivityId,
					classId: singleTimeLog?.classId || null,
					className: singleTimeLog?.className || null,
					customerId: singleTimeLog?.customerId,
					customerName: singleTimeLog?.customerName,
					hours: singleTimeLog?.hours,
					minute: singleTimeLog?.minute,
					companyId: singleTimeLog?.companyId,
					employeeId: singleTimeLog?.employeeId,
					activityDate: singleTimeLog?.activityDate,
					employeeName: singleTimeLog?.employee?.fullName,
					actualTimeLog: `${singleTimeLog?.hours}:${singleTimeLog?.minute}`,
					isAdding: false,
					isEditing: false,
					errorHrs: false,
					isSplitting: false,
					errorActivityDate: false,
					errorCustomer: false,
					errorClass: false,
					errorEmployee: false,
					SplitTimeActivities: splitTimeLogs,
					isOver: singleTimeLog?.isOver,
					overHours: singleTimeLog?.overHours,
					overMinutes: singleTimeLog?.overMinutes,
					isDisabled:
						!singleTimeLog?.classId || !singleTimeLog?.customerId
							? true
							: false,
					isClassNull: singleTimeLog?.classId ? false : true,
					isClassSelected: false,
					isCustomerNull: singleTimeLog?.customerId ? false : true,
					isCustomerSelected: false,
				};
			}
		});
		setTimeLogsData([
			...timeLogAdding,
			...JSON.parse(JSON.stringify(formattedTimeLogs)),
		]);
		setTimeLogsDataCopy([
			...timeLogAdding,
			...JSON.parse(JSON.stringify(formattedTimeLogs)),
		]);
	};

	// For save on final save
	const saveAddedItemHandler = (activityId: string) => {
		const copyTimeLogs = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === activityId
		);
		const {
			id,
			timeActivityId,
			employeeName,
			isAdding,
			errorHrs,
			errorActivityDate,
			errorCustomer,
			errorClass,
			errorEmployee,
			actualTimeLog,
			...others
		} = copyTimeLogs[timeLogIndex];
		// console.log(
		// 	id,
		// 	timeActivityId,
		// 	employeeName,
		// 	isAdding,
		// 	errorHrs,
		// 	errorActivityDate,
		// 	actualTimeLog,
		// 	errorClass,
		// 	errorEmployee,
		// 	errorCustomer
		// );
		const timeArray = actualTimeLog.split(':');
		others['hours'] = timeArray[0]?.padStart(2, '0') || '00';
		others['minute'] = timeArray[1]?.padStart(2, '0') || '00';
		if (!others.hours && !others.minute) {
			copyTimeLogs[timeLogIndex].errorHrs = true;
			setTimeLogsData(copyTimeLogs);
		}
		if (others.hours == '00' && others.minute == '00') {
			copyTimeLogs[timeLogIndex].errorHrs = true;
			setTimeLogsData(copyTimeLogs);
		}
		if (!others.activityDate) {
			copyTimeLogs[timeLogIndex].errorActivityDate = true;
			setTimeLogsData(copyTimeLogs);
		}
		if (!others.customerId) {
			copyTimeLogs[timeLogIndex].errorCustomer = true;
			setTimeLogsData(copyTimeLogs);
		}
		if (!others.classId) {
			copyTimeLogs[timeLogIndex].errorClass = true;
			setTimeLogsData(copyTimeLogs);
		}
		if (!others.employeeId) {
			copyTimeLogs[timeLogIndex].errorEmployee = true;
			setTimeLogsData(copyTimeLogs);
		}

		if (
			others.activityDate &&
			others.classId &&
			others.customerId &&
			others.employeeId
		) {
			dispatch(addTimeLog(others))
				.unwrap()
				.then((res) => {
					if (res?.id) {
						copyTimeLogs[timeLogIndex].isAdding = false;
						copyTimeLogs[timeLogIndex].id = res.id;
						setTimeLogsData(copyTimeLogs);
						setTimeLogAdding((prev: any) => {
							return prev.filter(
								(timeLogSingle: any) => timeLogSingle.id !== activityId
							);
						});
					}
				});
		}
	};
	const updateSavedTimeLog = async (
		activityId: string,
		time: string,
		classId?: string,
		className?: string,
		customerId?: string,
		customerName?: string
	) => {
		const timeArray = time.split(':');
		const copyTimeLogs = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === activityId
		);

		const data = {
			timeActivityId: copyTimeLogs[timeLogIndex].id,
			hours: timeArray[0]?.padStart(2, '0') || '00',
			minute: timeArray[1]?.padStart(2, '0') || '00',
			classId: classId,
			className: className,
			customerId: customerId,
			customerName: customerName,
		};
		if (!customerId) {
			copyTimeLogs[timeLogIndex].errorCustomer = true;
		}
		if (!classId) {
			copyTimeLogs[timeLogIndex].errorClass = true;
		}
		setTimeLogsData(copyTimeLogs);

		if (!classId) {
			delete data['classId'];
		}
		if (!className) {
			delete data['className'];
		}
		if (!customerId) {
			delete data['customerId'];
		}
		if (!customerName) {
			delete data['customerName'];
		}

		if (classId && className && customerId && customerName) {
			copyTimeLogs[timeLogIndex].hours = timeArray[0]?.padStart(2, '0') || '00';
			copyTimeLogs[timeLogIndex].minute =
				timeArray[1]?.padStart(2, '0') || '00';
			if (
				!copyTimeLogs[timeLogIndex].hours &&
				!copyTimeLogs[timeLogIndex].minute
			) {
				copyTimeLogs[timeLogIndex].errorHrs = true;
				setTimeLogsData(copyTimeLogs);
			}

			// if (
			// 	copyTimeLogs[timeLogIndex].hours == '00' &&
			// 	copyTimeLogs[timeLogIndex].minute == '00'
			// ) {
			// 	copyTimeLogs[timeLogIndex].errorHrs = true;
			// 	setTimeLogsData(copyTimeLogs);
			// }

			if (
				copyTimeLogs[timeLogIndex].activityDate &&
				copyTimeLogs[timeLogIndex].classId &&
				copyTimeLogs[timeLogIndex].customerId &&
				copyTimeLogs[timeLogIndex].employeeId
			) {
				const regex = /^0*:(0*)$/;
				const regex2 = /^0*$/;
				if (
					regex.test(copyTimeLogs[timeLogIndex].actualTimeLog) ||
					regex2.test(copyTimeLogs[timeLogIndex].actualTimeLog)
				) {
					copyTimeLogs[timeLogIndex].actualTimeLog = '00:00';
				} else if (regex2.test(copyTimeLogs[timeLogIndex].hours)) {
					copyTimeLogs[
						timeLogIndex
					].actualTimeLog = `00:${copyTimeLogs[timeLogIndex].minute}`;
					copyTimeLogs[timeLogIndex].hours = '00';
					data['hours'] = '00';
				} else if (!hasText(copyTimeLogs[timeLogIndex].actualTimeLog)) {
					copyTimeLogs[timeLogIndex].actualTimeLog = '00:00';
					copyTimeLogs[timeLogIndex].hours = '00';
					copyTimeLogs[timeLogIndex].minute = '00';
				} else if (!copyTimeLogs[timeLogIndex].actualTimeLog.includes(':')) {
					copyTimeLogs[
						timeLogIndex
					].actualTimeLog = `${copyTimeLogs[timeLogIndex].actualTimeLog}:00`;
				} else if (
					copyTimeLogs[timeLogIndex].actualTimeLog.split(':')[0] == ''
				) {
					copyTimeLogs[
						timeLogIndex
					].actualTimeLog = `00${copyTimeLogs[timeLogIndex].actualTimeLog}`;
				} else if (
					copyTimeLogs[timeLogIndex].actualTimeLog.split(':')[1] == ''
				) {
					copyTimeLogs[
						timeLogIndex
					].actualTimeLog = `${copyTimeLogs[timeLogIndex].actualTimeLog}00`;
				}
				copyTimeLogs[timeLogIndex].isClassNull = false;
				copyTimeLogs[timeLogIndex].isCustomerNull = false;
				setTimeLogsData(copyTimeLogs);
				await dispatch(updateTimeLog(data));
			}
		} else {
			const regex = /^0*:(0*)$/;
			const regex2 = /^0*0$/;
			if (regex.test(time)) {
				copyTimeLogs[timeLogIndex].errorHrs = true;
				setTimeLogsData(copyTimeLogs);
			} else if (regex2.test(time)) {
				copyTimeLogs[timeLogIndex].errorHrs = true;
				setTimeLogsData(copyTimeLogs);
			} else if (time === '') {
				copyTimeLogs[timeLogIndex].errorHrs = true;
				setTimeLogsData(copyTimeLogs);
			} else {
				await dispatch(updateTimeLog(data));
			}
		}
	};

	const changeTimeLogSheet = (isTimeLog: boolean) => {
		isSetTimeLog(isTimeLog);
	};

	// For create the time sheet
	const openCreateTimeSheetModelHandler = async() => {
		setOpenCreateTimeSheet(true);
		try {
			const res = await getApi('/time-sheet/by-payPeriod', {
				payPeriodId: payPeriod.id,
				companyId: localStorage.getItem('companyId')
			});
			if (res?.data?.data) {
				setTimeSheetData(res.data.data);
				return;
			}
			setTimeSheetData(null);
		} catch (error) {
			console.log(error);
		}
	};

	const deleteTimeLogHandler = (timeLog: any) => {
		// initialCall();
		setTimeLogAdding((prev: any) => {
			return prev.filter(
				(timeLogSingle: any) => timeLogSingle.id !== timeLog.id
			);
		});
		setTimeLogsData((prevState: any) => {
			return prevState.filter(
				(singleTimeLog: any) => singleTimeLog.id !== timeLog.id
			);
		});
		setTimeLogsDataCopy((prevState: any) => {
			return prevState.filter(
				(singleTimeLog: any) => singleTimeLog.id !== timeLog.id
			);
		});
	};

	// For cancel the split operation
	const cancelSplitHandler = (timeLog: any) => {
		const copyTimeLogs = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === timeLog.id
		);
		copyTimeLogs[timeLogIndex]['SplitTimeActivities'] =
			timeLogsDataCopy[timeLogIndex].SplitTimeActivities;
		copyTimeLogs[timeLogIndex]['isSplitting'] = false;
		setTimeLogsData(JSON.parse(JSON.stringify(copyTimeLogs)));
	};

	const saveSplitTimeLogHandler = (timeLog: any) => {
		const copyTimeLogs = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === timeLog.id
		);
		copyTimeLogs[timeLogIndex]['isSplitting'] = false;
		const splitTimeLogForApi = timeLog.SplitTimeActivities.map(
			(singleSplitTimeLog: any) => {
				return {
					classId: singleSplitTimeLog.classId,
					className: singleSplitTimeLog.className,
					customerId: singleSplitTimeLog.customerId,
					customerName: singleSplitTimeLog.customerName,
					hours: singleSplitTimeLog.actualTimeLog.split(':')[0] || '00',
					minute: singleSplitTimeLog.actualTimeLog.split(':')[1] || '00',
					activityDate: singleSplitTimeLog.activityDate,
				};
			}
		);
		dispatch(
			splitTimeLogAction({
				timeActivityData: splitTimeLogForApi,
				parentActivityId: timeLog.id,
				employeeId: timeLog.employeeId,
			})
		)
			.unwrap()
			.then((data: any) => {
				// console.log(data);
				setTimeLogsData(JSON.parse(JSON.stringify(copyTimeLogs)));
				setTimeLogsDataCopy(JSON.parse(JSON.stringify(copyTimeLogs)));
			})
			.catch((error) => console.error('Error', error));
	};

	const updateSplitActivityHandler = (
		id: string,
		name: string,
		value: any,
		index: any
	) => {
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === id
		);

		// Check if child activity hours are not equals to total hours
		let totalMinutes = 0;
		copyTimeLogs[timeLogIndex]?.SplitTimeActivities.forEach(
			(singleSplitTimeActivity: any, arrIndex: number) => {
				if (index != arrIndex) {
					totalMinutes +=
						Number(singleSplitTimeActivity.actualTimeLog.split(':')[0]) * 60 +
						Number(singleSplitTimeActivity.actualTimeLog.split(':')[1]);
				}
			}
		);

		// totalMinutes =
		// 	totalMinutes +
		// 	Number(value.split(':')[0]) * 60 +
		// 	Number(value.split(':')[1]);

		if (value.includes(':')) {
			totalMinutes =
				totalMinutes +
				Number(value.split(':')[0]) * 60 +
				Number(value.split(':')[1]);
		} else {
			totalMinutes += Number(value.split(':')[0]) * 60;
		}

		if (name === 'className') {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['classId'] =
				value.value;
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['className'] =
				value.children;
		} else if (name === 'hrs') {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index][
				'actualTimeLog'
			] = value;
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['errorHrs'] =
				false;
		} else if (name === 'customerName') {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['customerName'] =
				value.children;
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['customerId'] =
				value.value;
		}
		copyTimeLogs[timeLogIndex]['isSplitting'] = true;

		let actualMinutes = 0;

		actualMinutes =
			Number(copyTimeLogs[timeLogIndex].actualTimeLog.split(':')[0]) * 60 +
			Number(copyTimeLogs[timeLogIndex].actualTimeLog.split(':')[1]);

		if (totalMinutes != actualMinutes) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index]['errorHrs'] =
				true;
		} else {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'].forEach(
				(singleActivity: any) => {
					singleActivity['errorHrs'] = false;
				}
			);
		}
		setTimeLogsData(copyTimeLogs);
	};

	const updateSplitActivityOnBlur = (
		id: string,
		name: string,
		value: any,
		index: any
	) => {
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === id
		);

		const regex = /^0*:(0*)$/;
		const regex2 = /^0*$/;
		if (
			regex.test(
				copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog
			) ||
			regex2.test(
				copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog
			)
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog =
				'00:00';
		} else if (
			regex2.test(
				copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].hours
			)
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog = `00:${copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].minute}`;
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].hours = '00';
		} else if (
			!hasText(
				copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog
			)
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog =
				'00:00';
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].hours = '00';
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].minute = '00';
		} else if (
			!copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog.includes(':')
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog = `${copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog}:00`;
		} else if (
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog.split(':')[0] == ''
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog = `00${copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog}`;
		} else if (
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog.split(':')[1] == ''
		) {
			copyTimeLogs[timeLogIndex]['SplitTimeActivities'][
				index
			].actualTimeLog = `${copyTimeLogs[timeLogIndex]['SplitTimeActivities'][index].actualTimeLog}00`;
		}
		setTimeLogsData(copyTimeLogs);
	};

	// For perform the sub split operation
	const subSplitHandler = (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => {
		// console.log(index);
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const allSplitTimeActivity = timeLog.SplitTimeActivities;
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === timeLog.id
		);
		const { dividedHours, dividedMinutes }: any = divideTimeBySlots(
			Number(timeLog.hours),
			Number(timeLog.minute),
			allSplitTimeActivity.length + 1
		);
		const timeArray = [];
		////////////////////// OLD CODE START ////////////////////

		// const hoursMinutesData = divideTimeInHalf(
		// 	Number(splitTimeActivity.actualTimeLog.split(':')[0]),
		// 	Number(splitTimeActivity.actualTimeLog.split(':')[1])
		// );

		// const minuteInInteger = Number.isInteger(
		// 	Number(splitTimeActivity.actualTimeLog.split(':')[1]) / 2 || 0
		// );

		// allSplitTimeActivity[index]['hours'] = hoursMinutesData.halfHours;
		// allSplitTimeActivity[index]['minute'] = hoursMinutesData.halfMinutes;
		// allSplitTimeActivity[index]['actualTimeLog'] = `${
		// 	hoursMinutesData?.halfHours?.toString()?.padStart(2, '0') || '00'
		// }:${hoursMinutesData?.halfMinutes?.toString()?.padStart(2, '0') || '00'}`;

		// allSplitTimeActivity.splice(index + 1, 0, {
		// 	id: Math.random().toString(),
		// 	timeActivityId: splitTimeActivity?.timeActivityId,
		// 	classId: splitTimeActivity?.classId || null,
		// 	className: splitTimeActivity?.className || null,
		// 	customerId: splitTimeActivity?.customerId,
		// 	customerName: splitTimeActivity?.customerName,
		// 	hours: hoursMinutesData.halfHours,
		// 	minute: !minuteInInteger
		// 		? hoursMinutesData.halfMinutes + 1
		// 		: hoursMinutesData.halfMinutes,
		// 	activityDate: splitTimeActivity?.activityDate,
		// 	actualTimeLog: `${
		// 		hoursMinutesData?.halfHours?.toString()?.padStart(2, '0') || '00'
		// 	}:${
		// 		!minuteInInteger
		// 			? (hoursMinutesData.halfMinutes + 1).toString()?.padStart(2, '0') ||
		// 			  '00'
		// 			: hoursMinutesData.halfMinutes?.toString()?.padStart(2, '0') || '00'
		// 	}`,
		// 	isAdding: false,
		// 	errorHrs: false,
		// 	errorActivityDate: false,
		// 	errorCustomer: false,
		// 	errorClass: false,
		// 	errorEmployee: false,
		// });

		// copyTimeLogs[timeLogIndex]['SplitTimeActivities'] = allSplitTimeActivity;
		// copyTimeLogs[timeLogIndex]['isSplitting'] = true;
		// setTimeLogsData(copyTimeLogs);

		////////////////////// OLD CODE END ////////////////////
		const splitTimeActivities = allSplitTimeActivity.map(
			(singleSplitTimeActivity: any) => {
				return {
					...singleSplitTimeActivity,
					hours: dividedHours,
					minute: dividedMinutes,
					actualTimeLog: `${
						dividedHours?.toString()?.padStart(2, '0') || '00'
					}:${dividedMinutes?.toString()?.padStart(2, '0') || '00'}`,
				};
			}
		);

		for (let index = 0; index < allSplitTimeActivity.length + 1; index++) {
			timeArray.push({ hours: dividedHours, minutes: dividedMinutes });
		}

		const totalTime = makeTotalTime(timeArray);
		const timeDifferenceObj = timeDifference(
			{ hours: Number(timeLog.hours), minutes: Number(timeLog.minute) },
			totalTime
		);
		const lastActivityTime = makeTotalTime([timeArray[0], timeDifferenceObj]);

		splitTimeActivities.push({
			id: Math.random().toString(),
			timeActivityId: splitTimeActivity?.timeActivityId,
			classId: splitTimeActivity?.classId || null,
			className: splitTimeActivity?.className || null,
			customerId: splitTimeActivity?.customerId,
			customerName: splitTimeActivity?.customerName,
			activityDate: splitTimeActivity?.activityDate,
			hours: lastActivityTime.hours,
			minute: lastActivityTime.minutes,
			actualTimeLog: `${
				lastActivityTime.hours?.toString()?.padStart(2, '0') || '00'
			}:${lastActivityTime.minutes?.toString()?.padStart(2, '0') || '00'}`,
			isAdding: false,
			errorHrs: false,
			errorActivityDate: false,
			errorCustomer: false,
			errorClass: false,
			errorEmployee: false,
		});

		copyTimeLogs[timeLogIndex]['SplitTimeActivities'] = splitTimeActivities;
		copyTimeLogs[timeLogIndex]['isSplitting'] = true;
		copyTimeLogs[timeLogIndex]['SplitTimeActivities'].forEach(
			(singleActivity: any) => {
				singleActivity['errorHrs'] = false;
			}
		);
		setTimeLogsData(copyTimeLogs);
	};

	// For remove the sub split timeLog
	const removeSubSplitHandler = async (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => {
		// console.log(splitTimeActivity, index);
		const timeArray = [];
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const allSplitTimeActivity = timeLog.SplitTimeActivities;
		const timeLogIndex = timeLogsData.findIndex(
			(singleEl: any) => singleEl.id === timeLog.id
		);
		if (allSplitTimeActivity.length === 2) {
			setIsDeleteModalOpen(true);
			setParentTimeActivityId(timeLog.id);
			setSelectedTimeLog(timeLog);

			// copyTimeLogs[timeLogIndex]['SplitTimeActivities'] = [];
			// setTimeLogsData(copyTimeLogs);
			return;
		}
		const { dividedHours, dividedMinutes }: any = divideTimeBySlots(
			Number(timeLog.hours),
			Number(timeLog.minute),
			allSplitTimeActivity.length - 1
		);

		// ////////////////// OLD CODE START //////////////////

		// console.log(copyTimeLogs, timeLogIndex);
		// const addToActivityIndex = index > 0 ? index - 1 : index + 1;
		// const addToActivity = allSplitTimeActivity[addToActivityIndex];

		// const hoursMinutesData = addTimeToTime(
		// 	Number(allSplitTimeActivity[index]['actualTimeLog'].split(':')[0]),
		// 	Number(allSplitTimeActivity[index]['actualTimeLog'].split(':')[1]),
		// 	Number(addToActivity['actualTimeLog'].split(':')[0]),
		// 	Number(addToActivity['actualTimeLog'].split(':')[1])
		// );
		// copyTimeLogs[timeLogIndex]['SplitTimeActivities'][addToActivityIndex][
		// 	'actualTimeLog'
		// ] = `${hoursMinutesData?.newHours?.toString()?.padStart(2, '0') || '00'}:${
		// 	hoursMinutesData?.newMinutes?.toString()?.padStart(2, '0') || '00'
		// }`;

		// ////////////////// OLD CODE END //////////////////

		for (let index = 0; index < allSplitTimeActivity.length - 1; index++) {
			timeArray.push({ hours: dividedHours, minutes: dividedMinutes });
		}

		const totalTime = makeTotalTime(timeArray);
		const timeDifferenceObj = timeDifference(
			{ hours: Number(timeLog.hours), minutes: Number(timeLog.minute) },
			totalTime
		);

		const lastActivityTime = makeTotalTime([timeArray[0], timeDifferenceObj]);

		const splitTimeActivities = allSplitTimeActivity.map(
			(singleSplitTimeActivity: any) => {
				return {
					...singleSplitTimeActivity,
					hours: dividedHours,
					minute: dividedMinutes,
					actualTimeLog: `${
						dividedHours?.toString()?.padStart(2, '0') || '00'
					}:${dividedMinutes?.toString()?.padStart(2, '0') || '00'}`,
				};
			}
		);
		splitTimeActivities.pop();

		splitTimeActivities[splitTimeActivities.length - 1]['hours'] =
			lastActivityTime.hours;
		splitTimeActivities[splitTimeActivities.length - 1]['minute'] =
			lastActivityTime.minutes;
		splitTimeActivities[splitTimeActivities.length - 1]['actualTimeLog'] = `${
			lastActivityTime.hours?.toString()?.padStart(2, '0') || '00'
		}:${lastActivityTime.minutes?.toString()?.padStart(2, '0') || '00'}`;
		copyTimeLogs[timeLogIndex]['SplitTimeActivities'] = splitTimeActivities;
		copyTimeLogs[timeLogIndex]['isSplitting'] = true;
		setTimeLogsData(copyTimeLogs);
	};

	// const filterUnderOverHandler = (value: boolean) => {
	// 	setHoursUnder(value);
	// };

	useEffect(() => {
		formateTimeLogData();
	}, [timeLogs]);

	// For fetch initial function data
	useEffect(() => {
		if(isTimeLog) {
			initialCall()
		}
	}, [isTimeLog]);
	// useEffect(() => {
	// 	initialCall();
	// }, []);


	const handleCancel = () => {
		setParentTimeActivityId(null);
		setSelectedTimeLog(null);
		setIsDeleteModalOpen(false);
	};

	const handleOk = async () => {
		setIsDeleteModalOpen(false);
	};

	const deleteHandler = async () => {
		await deleteApiWithData(`/split-time-activity/all`, {
			timeActivityId: parentTimeActivityId,
		});
		const copyTimeLogs: any = JSON.parse(JSON.stringify(timeLogsData));
		const data = copyTimeLogs.map((singleTimeLog: any) => {
			if (singleTimeLog.id === parentTimeActivityId) {
				return {
					...singleTimeLog,
					SplitTimeActivities: [],
				};
			} else {
				return singleTimeLog;
			}
		});
		const timeLogIndex = copyTimeLogs.findIndex(
			(singleEl: any) => singleEl.id === selectedTimeLog.id
		);
		data[timeLogIndex].isSplitting = false;
		setTimeLogsData(data);
		setOpenTables((prevState) => {
			return prevState.filter((single) => single !== selectedTimeLog.id);
		});
		setParentTimeActivityId(null);
		setSelectedTimeLog(null);
		setIsDeleteModalOpen(false);
	};

	const handleCreateTimeSheet = async (data: TimeSheetFormData) => {
		try {
			const res = await postApi('/time-sheet', { ...data, payPeriodId: payPeriod?.id, companyId: localStorage.getItem('companyId')});
			if(res.data?.data) {
				toastText(`TimeSheet ${timeSheetData ? 'Updated' : 'Created'} Successfully`, 'success');
				setTimeSheetData(res.data.data);
				setOpenCreateTimeSheet(false);
			}
		} catch (error: any) {
			toastText(error?.message, 'error');
		}
	}

	const handleChangePayPeriod = async(payPeriod: any) => {
		setPayPeriod(payPeriod);
		if(payPeriod) {
			try {
				const res = await getApi('/time-sheet/by-payPeriod', {
					payPeriodId: payPeriod.id,
					companyId: localStorage.getItem('companyId')
				});
				if(res?.data?.data) {
					setTimeSheetData(res.data.data);
					return;
				}
				setTimeSheetData(null);
			} catch (error) {
				console.log(error);	
			}
		}
	}

	// JSX
	return !isFirstTimeLoading ? (
		<>
			<div className={styles['time-activity']}>
				<div className={styles['time-activity__wrapper']}>
					<div className={styles['time-activity__action-header']}>
						<TableActionHeader title={'Time Activity'}>
							{(payPeriod && timeLogs?.length && isTimeLog) ? (
								<button
									className={`btn-black ${styles['user-table__action--button']}`}
									onClick={() => openCreateTimeSheetModelHandler()}
								>
									<p>{timeSheetData ? 'Update' : 'Create'} Timesheet</p>
								</button>
							) : null}
						</TableActionHeader>
					</div>
					<div className={styles['time-activity__log-ant-sheet']}>
						<TimeLogSheetSelector
							addTimeLogHandler={addTimeLogHandler}
							changeTimeLogSheet={changeTimeLogSheet}
							isTimeLog={isTimeLog}
							// hoursUnder={hoursUnder}
							// filterUnderOverHandler={filterUnderOverHandler}
						/>
					</div>
					{isTimeLog && (
						<div className={styles['time-activity__logs']}>
							<TimeLogs
								openTables={openTables}
								setOpenTables={setOpenTables}
								deleteTimeLogHandler={deleteTimeLogHandler}
								timeLogs={timeLogsData}
								updateTimeLogHandler={updateTimeLogHandler}
								saveAddedItemHandler={saveAddedItemHandler}
								updateSavedTimeLog={updateSavedTimeLog}
								disableHandler={disableHandler}
								splitTimeLogHandler={splitTimeLogHandler}
								error={error}
								cancelSplitHandler={cancelSplitHandler}
								saveSplitTimeLogHandler={saveSplitTimeLogHandler}
								updateSplitActivityHandler={updateSplitActivityHandler}
								subSplitHandler={subSplitHandler}
								updateSplitActivityOnBlur={updateSplitActivityOnBlur}
								// hoursUnder={hoursUnder}
								removeSubSplitHandler={removeSubSplitHandler}
								onChangePayPeriod={(payPeriod: any) => {
									handleChangePayPeriod(payPeriod);
								}}
							/>
						</div>
					)}
					{!isTimeLog && (
						<div className={styles['time-activity__time-sheet']}>
							<TimeSheet />
						</div>
					)}
				</div>
			</div>
			<ConfirmDelete
				handleCancel={handleCancel}
				handleOk={handleOk}
				isModalOpen={isDeleteModalOpen}
				deleteHandler={deleteHandler}
				deleteMessage="Delete? All split time logs will be deleted."
			/>
			<CreateTimeSheetModal
				open={openCreateTimeSheet}
				onCancel={() => setOpenCreateTimeSheet(false)}
				onSubmitTimeSheet={(data: TimeSheetFormData) => handleCreateTimeSheet(data)}
				timeSheetData={{
					name: payPeriod ? timeSheetData?.name || `Timesheet(${moment(payPeriod.startDate).format('MM/DD/YYYY')} - ${moment(payPeriod.endDate).format('MM/DD/YYYY')})` :  '',
					notes: timeSheetData?.notes || ''
				}}
				isExisting={timeSheetData ? true : false}
			/>
		</>
	) : (
		<Loader />
	);
};

export default TimeActivity;
