/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input, Select, Table, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	getEmployeeCostAction,
	paginateEmployeeCostAction,
	updateEmployeeCost,
} from 'redux/action/employeeCostAction';
import { getEmployeeCostColumnAction } from 'redux/action/employeeCostColumnSlice';
import { AppDispatch } from 'redux/store';
import {
	CalculatorSvg,
	ClockSvg,
	QuickbooksEmployee,
	SortSvgBottom,
	SortSvgTop,
} from 'utils/svgs';
import { checkPermission, convertToHyphenCase, hasText, toastText } from 'utils/utils';
import SearchAndFilter from '../SearchAndFilter';
import styles from './index.module.scss';
import './index.scss';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	payPeriodOptionsAction,
	savePayPeriod,
} from 'redux/action/payPeriodAction';
import { clearEmployeeCostRedux, updateEmployeeCostValue } from 'redux/slice/employeeCostSlice';
import { Loader } from 'components/Global';
import { useDebounce } from 'use-debounce';
import { getApi, postApi } from 'redux/apis';
import { NumericFormat } from 'react-number-format';

const TestTable = () => {
	const { Column } = Table;
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();

	const {
		data,
		count,
		payPeriodId: currentDatePayPeriodId,
	} = useSelector((state: any) => state?.employeeCosts);
	const { data: sectionWiseFields } = useSelector(
		(state: any) => state?.employeeCostColumns
	);

	const payrollMethod = useSelector(
		(state: any) => state?.companies?.configurations?.payrollMethod
	);

	const [queryParams, setQueryParams] = useSearchParams();

	const [payPeriodId, setPayPeriodId] = useState<string | null>(
		queryParams.get('payPeriodId')
	);

	const tableRef = useRef<HTMLDivElement>(null);
	const finalTotalColumnId = useRef(Math.random());
	const [isInViewPort, setIsInViewPort] = useState<boolean>(false);
	const [employeeData, setEmployeeData] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [columns, setColumns] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState(null);

	const [isLoading, setIsLoading] = useState(false);

	const [debounceSearchValue] = useDebounce(searchValue, 1000);
	const [calculatorDefaultData, setCalculatorDefaultData] = useState({
		title: '',
		employee: '',
		costCategory: '',
		ytdCost: 0,
		newTotalAnnualCost: 0,
		remainingHoursUnderLimit: 0,
		originalRate: '--',
	});

	const [payPeriodDateRange, setPayPeriodDateRange] = useState<any[]>([]);

	const [totalCostRow, setTotalCostRow] = useState<any>(null);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isEditEmployeeCostPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Employee Cost',
			permission: ['edit'],
		}
	);

	const [applySearch, setApplySearch] = useState(false);

	const [sort, setSort] = useState('asc');

	const colorArray = ['cell-fff', 'cell-f2f2f2', 'cell-e7eff8', 'cell-f3ede7'];

	const sortData = {
		showSorterTooltip: { title: '' },
		defaultSortOrder: 'ascend',
		sorter: () => {
			return null as any;
		},
		sortDirections: ['ascend', 'descend', 'ascend'],
		sortIcon: (data: any) => {
			return data.sortOrder === 'ascend' ? <SortSvgTop /> : <SortSvgBottom />;
		},
	};

	// Get total employee-cost total

	const fetchEmployeeCostTotal: any = async () => {
		try {
			const query: any = {
				companyId: localStorage.getItem('companyId'),
				payPeriodId: payPeriodId,
				search: searchValue
			}

			if (!searchValue) {
				delete query.search;
			}

			const employeeCostData = await getApi(`/employee-cost/total`, query);
			return employeeCostData?.data?.data;
		} catch (error) {
			console.error(error);
			navigate('/unauthorized');
		}
	};

	useEffect(() => {
		dispatch(getEmployeeCostColumnAction()).then(() => {
			// createFields();
		});
		return () => {
			dispatch(clearEmployeeCostRedux());
		};
	}, []);

	useEffect(() => {
		getEmployeeCostData();
	}, [payPeriodId]);

	// useEffect(() => {
	// 	setPayPeriodId(queryParams.get('payPeriodId'));
	// }, [queryParams.get('payPeriodId')]);

	useEffect(() => {
		const finalColumns: any = [
			{
				isSectionLastColumn: true,
				className: 'employee-name',
				cellColor: 'cell-fff',
				sectionId: '',
				sectionName: '',
				fieldId: '',
				fieldName: 'Employee Name',
				inputNumberField: 'Text',
				isCalculatorNeeded: false,
				isDollarNeeded: false,
				isHours: false,
				total: false,
				title: 'Employee Name',
				dataIndex: 'employeeName',
				key: Math.random(),
				width: 200,
				isHoursSetup: false,
				...sortData,
			},
		];

		sectionWiseFields?.map((singleSection: any, sectionIndex: number) => {
			singleSection?.fields?.map((singleField: any, index: number) => {
				if (payrollMethod === 'Percentage' && singleSection.no === 0) {
					console.log('');
				} else {
					finalColumns.push({
						svg:
							sectionIndex === 0 && (index === 1 || index === 2) ? (
								<ClockSvg />
							) : null,
						cellWidth:
							sectionIndex === 0 && (index === 1 || index === 2) ? 130 : 90,
						className: convertToHyphenCase(singleField.name),
						sectionId: singleSection?.id,
						sectionName: singleSection?.sectionName,
						fieldId: singleField?.id,
						fieldName: singleField?.name,
						inputNumberField:
							singleField?.name == 'Employee Type'
								? 'Select'
								: singleField.jsonId.charAt(0) === 't'
									? 'Text'
									: 'Number',
						isCalculatorNeeded:
							singleSection?.sectionName == 'Employee Type' ||
								payrollMethod === 'Percentage'
								? false
								: true,
						isDollarNeeded:
							singleSection?.sectionName == 'Employee Type' ? false : true,
						isHours:
							singleField?.name == 'Maximum allocate hours per year'
								? true
								: singleField?.name == 'Maximum Vacation/PTO hours per year'
									? true
									: false,
						total: false,
						title: singleField?.name,
						dataIndex: singleField?.id,
						cellColor: colorArray[sectionIndex],
						isSectionLastColumn:
							index === singleSection?.fields.length - 1 ? true : false,
						key: singleField?.id,
						width:
							singleField?.name == 'Employee Type'
								? 250
								: singleField?.name == 'Maximum allocate hours per year'
									? 210
									: singleField?.name == 'Maximum Vacation/PTO hours per year'
										? 250
										: 140,
						status: singleField?.active,

						isHoursSetup: singleSection?.no == 0,
					});
				}
			});
		});

		const totalColumn = {
			isSectionLastColumn: false,
			cellColor: 'cell-fff',
			className: 'totalLabourBurden',
			sectionId: '',
			sectionName: '',
			fieldId: '',
			fieldName: 'Total Labor Burden',
			inputNumberField: 'Text',
			isCalculatorNeeded: false,
			isDollarNeeded: false,
			isHours: false,
			total: true,
			title: 'Total Labor Burden',
			dataIndex: 'totalLaborBurden',
			key: finalTotalColumnId,
			width: 200,
			isHoursSetup: false,
		};

		finalColumns.push(totalColumn);

		setColumns(finalColumns);
	}, [sectionWiseFields, payrollMethod]);

	useEffect(() => {
		dispatch(payPeriodOptionsAction());
	}, []);

	useEffect(() => {
		if (applySearch) {
			searchHandler(debounceSearchValue);
		}
	}, [debounceSearchValue, payPeriodId]);

	useEffect(() => {
		if (data && data.length) {
			if (currentDatePayPeriodId) {
				setPayPeriodId(currentDatePayPeriodId);
				setQueryParams({ payPeriodId: currentDatePayPeriodId });
			}
			finalCalculation(data);
			getTotalCostValueRow();
			return;
		}

		setEmployeeData([]);
	}, [data, columns, payrollMethod]);

	// Pagination
	useEffect(() => {
		if (tableRef.current) {
			const tableBody = tableRef.current
				? tableRef.current?.querySelector('.ant-table-body')
				: null;
			// if (tableBody) {
			tableBody?.addEventListener('scroll', scrollHandler);
			return () => tableBody?.removeEventListener('scroll', scrollHandler);
			// }
		}
	}, [tableRef.current]);

	useEffect(() => {
		(async () => {
			if (isInViewPort && employeeData.length < count) {
				setCurrentPage((prev: any) => prev + 1);

				const query = {
					page: currentPage + 1,
					limit: 10,
					search: searchValue,
					sort: sort,
					payPeriodId,
				};

				await dispatch(paginateEmployeeCostAction(query));
			}
		})();
	}, [isInViewPort, payPeriodId]);

	// const createFields = async () => {
	// 	try {
	// 		await postApi('/employee-cost', {
	// 			companyId: localStorage.getItem('companyId'),
	// 			date: selectedMonth,
	// 		});

	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// };

	// useEffect(() => {
	// 	createFields();
	// 	return () => {
	// 		createFields();
	// 	};
	// }, [selectedMonth]);

	const getEmployeeCostData = async () => {
		const query: any = {
			payPeriodId,
			page: 1,
			limit: 10,
		};

		if (!payPeriodId) {
			delete query.payPeriodId;
		}
		setIsLoading(true);
		const res = await dispatch(getEmployeeCostAction(query));
		setIsLoading(false);
		if (res.payload.error) {
			if (res.payload.error.message === 'Invalid PayPeriod') {
				navigate('/unauthorized');
			}
			// toastText(res.payload.error.message, 'error');
		}

		setCurrentPage(1);
	};

	const openCalculator = (
		data: any,
		singleColumn: any,
		employeeData: any,
		index: any,
		value: any
	) => {
		setCalculatorDefaultData((prev) => {
			return {
				...prev,
				title: data?.title,
				employee: data?.employee,
				singleColumn,
				employeeData,
				index,
				value,
			};
		});
		setIsOpen(true);
	};

	// const closeCalculator = () => {
	// 	setIsOpen(false);
	// };

	// const submitCalculator = () => {
	// 	setIsOpen(false);
	// };

	//adding body to scroll to table body Infinite scroll
	const scrollHandler = useCallback((event: any) => {
		const { currentTarget } = event;
		const tableBody = currentTarget?.querySelector('tbody');
		if (
			tableBody?.getBoundingClientRect().top +
			tableBody.getBoundingClientRect().height <
			screen.height - 100
		) {
			setIsInViewPort(true);
		} else {
			setIsInViewPort(false);
		}
	}, []);

	const searchHandler = (e: any) => {
		// const { value } = e.target;

		if (e?.trimStart().length >= 3) {
			setCurrentPage(1);
			dispatch(
				getEmployeeCostAction({
					search: e.trimStart(),
					page: 1,
					limit: 10,
					payPeriodId,
				})
			);
		} else if (e?.trimStart().length !== 0 || e === '') {
			setCurrentPage(1);
			dispatch(
				getEmployeeCostAction({
					search: '',
					page: 1,
					limit: 10,
					payPeriodId,
				})
			);
		}
	};

	// const removeThousandSeparators = (formattedValue: any) => {
	// 	return formattedValue.replace(/,/g, '');
	// };

	const handleChangeCostValue = (index: number, key: string, value: string) => {
		// const regex = /^-?\d{0,6}(?:\.\d{0,2})?$/;
		// const regex = /^\d{0,6}(?:\.\d{0,2})?$/;
		// const regex = /^\d*(?:\.\d*)?$/;
		// if (!regex.test(value)) {
		// 	return;
		// }
		const tempCopy = JSON.parse(JSON.stringify(employeeData));
		tempCopy[index][key] = hasText(value) ? value : 0.00;
		dispatch(updateEmployeeCostValue({ index, key, value }));
		setEmployeeData(tempCopy);
	};

	const changeHandler = async (
		index: number,
		key: string,
		value: string,
		method: string,
		isFromCalculator: boolean
	) => {
		// if (payrollMethod === 'Percentage') {
		const tempCopy = JSON.parse(JSON.stringify(employeeData));
		//calculation of fields
		let total = 0;
		const sectionKey = tempCopy[index][`section_${key}`];
		const section = sectionWiseFields.find(
			(singleSection: any) => singleSection.id === sectionKey
		);
		const totalCostSectionValueField = section.fields.find(
			(singleField: any) => singleField.jsonId === 't1'
		);
		for (const sectionField of section.fields) {
			if (sectionField.jsonId !== 't1') {
				total += Number(
					tempCopy[index][sectionField.id]
				);
			}
		}
		tempCopy[index][totalCostSectionValueField.id] = total.toFixed(2);
		dispatch(updateEmployeeCostValue({ index, key: totalCostSectionValueField.id, value: total.toFixed(2) }));
		finalCalculation(tempCopy);
		// setEmployeeData(tempCopy);
		// const numberValue: any = Number(value);
		// const regex = /^\d{0,6}(?:\.\d{0,2})?$/;
		// const regex = /^\d*(?:\.\d*)?$/;
		// if (!regex.test(numberValue)) {
		// 	return;
		// }
		await dispatch(
			updateEmployeeCost({
				employeeCostValueID: tempCopy[index][`value_${key}`],
				value: Number(value).toFixed(2) || '0.00',
				isCalculatorValue: isFromCalculator,
			})
		);
		await dispatch(
			updateEmployeeCost({
				employeeCostValueID:
					tempCopy[index][`value_${totalCostSectionValueField.id}`],
				value: Number(total).toFixed(2) || '0.00',
				isCalculatorValue: isFromCalculator,
			})
		);
		await getTotalCostValueRow();
		// if (method === 'hours') {
		// 	const timeArray = value.split(':');

		// 	if (timeArray[0]?.length <= 6 && timeArray[1]?.length <= 2) {
		// 		if (checkTimeFormat(value)) {
		// 			if (!value.includes(':')) {
		// 				value = value + ':00';
		// 			}
		// 			dispatch(
		// 				updateEmployeeCost({
		// 					employeeCostValueID: tempCopy[index][`value_${key}`],
		// 					value: `${timeArray[0]?.padStart(2, '0') || '00'}:${timeArray[1]?.padStart(2, '0') || '00'
		// 						}`,
		// 					// selectedMonth: selectedMonth,
		// 				})
		// 			);
		// 		}
		// 	} else {
		// 		return;
		// 	}
		// } else if (method === 'number') {

		// } else {
		// 	dispatch(
		// 		updateEmployeeCost({
		// 			employeeCostValueID: tempCopy[index][`value_${key}`],
		// 			value: value,
		// 		})
		// 	);
		// }
	};

	// For perform the sorting operation
	const performSortHandler = (type: string) => {
		setSort(type === 'ascend' ? 'asc' : 'desc');
		setCurrentPage(1);
		dispatch(
			getEmployeeCostAction({
				page: 1,
				limit: 10,
				sort: type === 'ascend' ? 'asc' : 'desc',
				payPeriodId,
			})
		);
	};

	// For handle the table change click
	const tableChangeHandler = (_: any, __: any, data: any) => {
		performSortHandler && performSortHandler(data.order);
	};

	//  for calculation of lastColumn
	const finalCalculation = async (_employeeData: any) => {
		const employeeDataCopy = JSON.parse(JSON.stringify(_employeeData));
		const fieldArray: any = [];
		sectionWiseFields.forEach((singleSection: any) => {
			if (singleSection.no !== 0) {
				// const fieldArray: any = [];
				singleSection.fields.forEach((singleField: any) => {
					if (singleField.jsonId === 't1') {
						fieldArray.push(singleField.id);
					}
				});
				// fieldObject[index] = fieldArray;
			}
		});
		_employeeData.forEach((singleEmployee: any, index: number) => {
			let total = 0;
			fieldArray.forEach((singleField: any) => {
				total += Number(singleEmployee[singleField] || 0);
			});
			employeeDataCopy[index]['totalLaborBurden'] = total.toFixed(2);
		});
		setEmployeeData(employeeDataCopy);
	};

	const getTotalCostValueRow = async () => {
		if (payPeriodId) {
			const totalCost = await fetchEmployeeCostTotal();
			if (totalCost) {
				setTotalCostRow(totalCost);
				return;
			}
			setTotalCostRow(null);
		}
	}

	const dateRangeDateHandler = (dateRange: any) => {
		setPayPeriodDateRange(dateRange);
	};

	const onSavePayPeriod = async () => {
		const data = {
			companyId: localStorage.getItem('companyId'),
			startDate: payPeriodDateRange[0]?.$d,
			endDate: payPeriodDateRange[1]?.$d,
		};

		const res = await dispatch(savePayPeriod(data));
		if (res?.payload?.id) {
			toastText('Pay Period Created Successfully', 'success');
			setPayPeriodId(res?.payload?.id);
			setQueryParams({ payPeriodId: res?.payload?.id });
			await dispatch(payPeriodOptionsAction());
		}

		if (res.payload.error) {
			toastText(res.payload.error.message, 'error');
		}
	};

	// (employeeData && columns)

	return (
		<>
			{(employeeData && columns) ? (
				<>
					<SearchAndFilter
						searchValue={searchValue}
						onChangeSearchValue={(value: any) => {
							setSearchValue(value);
							setApplySearch(true);
						}}
						dateRangeDateHandler={(dateRange: any) =>
							dateRangeDateHandler(dateRange)
						}
						payPeriodDateRange={payPeriodDateRange}
						onSavePayPeriod={() => onSavePayPeriod()}
						onChangePayPeriodId={(id: any) => {
							setPayPeriodId(id);
							setQueryParams({ payPeriodId: id });
						}}
						payPeriodId={payPeriodId}
						currentDatePayPeriodId={currentDatePayPeriodId}
						onSyncEmployee={() => setPayPeriodId(null)}
					/>

					<Table
						dataSource={totalCostRow ? [...employeeData, totalCostRow] : employeeData}
						scroll={{ y: 'calc(80vh - 38vh)' }}
						pagination={false}
						ref={tableRef}
						rowKey={(record: any) => {
							return record.employeeName;
						}}
						sticky
						className="employee-cost"
						onChange={tableChangeHandler}
						footer={() => {
							return (
								<p className="employee-cost-footer">
									Total No. of Employee: {count}
								</p>
							);
						}}
						rowClassName={(record: any) => {
							if (record.employeeName === 'Total') {
								return 'employee-cost-row'
							}
							return ''
						}}
					>
						{columns?.map((singleColumn: any) => {
							return (
								// isEmployeeCost &&
								// !singleColumn?.isHoursSetup && (
								<Column
									title={() => {
										return (
											<Tooltip>
												<div className="employee-const-column-title">
													<p>{singleColumn.svg}</p>
													<p>{singleColumn?.title}</p>
												</div>
											</Tooltip>
										);
									}}
									className={`${singleColumn.className} ${singleColumn.isSectionLastColumn && 'last-column'
										} ${singleColumn.cellColor}`}
									showSorterTooltip={{ title: '' }}
									defaultSortOrder={singleColumn.defaultSortOrder}
									sorter={singleColumn.sorter}
									sortDirections={singleColumn.sortDirections}
									sortIcon={singleColumn.sortIcon}
									dataIndex={singleColumn?.dataIndex}
									key={singleColumn?.key}
									fixed={singleColumn?.fieldName == 'Employee Name' && 'left'}
									width={singleColumn?.width}
									render={(value: string, employeeData: any, index: any) => {
										const calculatorData = {
											title: singleColumn?.fieldName,
											employee: employeeData?.employeeName,
										};
										return singleColumn?.inputNumberField === 'Select' ? (
											<Select
												placeholder="Select Employee Type"
												size="large"
												style={{ width: '100%' }}
												onChange={(value: any) => {
													changeHandler(
														index,
														singleColumn?.dataIndex,
														value,
														'select',
														false
													);
												}}
												disabled={
													!isEditEmployeeCostPermission || !employeeData?.status
												}
												value={value}
												options={[
													{
														value: 'salaried_exempt',
														label: 'Salaried Exempt',
													},
													{
														value: 'salaried_non_exempt',
														label: 'Salaried Non Exempt',
													},
													{ value: 'hourly', label: 'Hourly' },
												]}
											/>
										) : singleColumn?.inputNumberField === 'Number' ? (
											<div className={styles['dynamic-table__status']}>
												{singleColumn?.isHours == true ? (
													<Input
														value={value}
														size="large"
														className={
															singleColumn.cellWidth === 130
																? 'width-130'
																: 'width-90'
														}
														defaultValue={value}
														disabled={
															!isEditEmployeeCostPermission ||
															!employeeData?.status
														}
														onChange={(event: any) => {
															changeHandler(
																index,
																singleColumn?.dataIndex,
																event?.target?.value,
																'hours',
																false
															);
														}}
													/>
												) : (
													<>
														{/* {singleColumn.isCalculatorNeeded && (
															<span
																onClick={() =>
																	openCalculator(
																		calculatorData,
																		singleColumn,
																		employeeData,
																		index,
																		value
																	)
																}
																className={`${
																	styles['dynamic-table__calculator']
																} ${
																	!isEditEmployeeCostPermission &&
																	'pointer-event-none'
																}`}
															>
																<CalculatorSvg />
															</span>
														)} */}
														{
															employeeData.employeeName !== 'Total' ? (

																<NumericFormat
																	allowNegative={true}
																	decimalScale={2}
																	fixedDecimalScale={true}
																	thousandSeparator
																	customInput={Input}
																	value={value ?? 0}
																	className={
																		singleColumn.cellWidth === 130
																			? 'width-130'
																			: 'width-90'
																	}
																	min={0}
																	disabled={
																		!isEditEmployeeCostPermission ||
																		!employeeData?.status ||
																		!payPeriodId
																	}
																	size="large"
																	prefix={'$'}
																	// onChange={(event: any) => {
																	// 	handleChangeCostValue(
																	// 		index,
																	// 		singleColumn?.dataIndex,
																	// 		event?.target?.value
																	// 	);
																	// }}
																	onValueChange={(values: any) => {
																		handleChangeCostValue(
																			index,
																			singleColumn?.dataIndex,
																			values?.floatValue
																		);
																	}}
																	onBlur={() => {
																		changeHandler(
																			index,
																			singleColumn?.dataIndex,
																			value,
																			'number',
																			false
																		);
																	}}
																// formatter={(value) =>
																// 	`$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
																// }
																// parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
																/>
															) : (
																<NumericFormat
																	value={value}
																	thousandSeparator=","
																	decimalScale={2}
																	fixedDecimalScale={true}
																	displayType="text"
																	prefix='$'
																	renderText={(_value) => <h4
																		className={styles['dynamic-table-total']}
																		style={{
																			textAlign: 'right',
																		}}
																	>
																		{_value ?? 0}
																	</h4>}
																/>
															)
														}
													</>
												)}
											</div>
										) : (
											<div>
												{!(singleColumn.dataIndex === 'employeeName') ? (
													<NumericFormat
														value={value}
														thousandSeparator=","
														decimalScale={2}
														fixedDecimalScale={true}
														displayType="text"
														prefix='$'
														renderText={(_value) => <h4
															className={styles['dynamic-table-total']}
															style={{
																textAlign: 'right',
															}}
														>
															{_value ? _value : '$0.00'}
														</h4>}
													/>
												) : (
													employeeData.employeeName != 'Total' ? (
														<a
															className={styles['dynamic-table__employee']}
															href="https://app.sandbox.qbo.intuit.com/app/employees"
															target="blank"
														>
															<span
																className={styles['dynamic-table__employee-name']}
															>
																{value}
															</span>{' '}
															<QuickbooksEmployee />{' '}
															<span
																className={
																	styles['dynamic-table__employee-name-inactive']
																}
															>
																{!employeeData?.status && '(Inactive)'}
															</span>
														</a>
													) : (
														<>
															<span
																className={styles['dynamic-table__employee-name']}
															>
																{value}
															</span>
														</>
													)
												)}
											</div>
										);
									}}
								/>
								// )
							);
						})}
					</Table>
				</>
			) : (
				<div
					style={{
						position: 'fixed',
						top: 'calc(48vh + 70px)',
						left: 'calc(48vw + 150px)',
					}}
				>
					<Loader />
				</div>
			)}

			{/* {isOpen && (
				<CalculatorModal
					isModalOpen={isOpen}
					handleOk={submitCalculator}
					handleCancel={closeCalculator}
					calculatorDefaultData={calculatorDefaultData}
					sectionWiseFields={sectionWiseFields}
					defaultValue={'0.00'}
					employeeData={employeeData}
					changeHandler={changeHandler}
				/>
			)} */}
		</>
	);
};

export default TestTable;
