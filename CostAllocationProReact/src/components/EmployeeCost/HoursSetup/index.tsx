/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { Input, Select, Table } from 'antd';
import { ClockSvg, SortSvgBottom, SortSvgTop } from 'utils/svgs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import HoursSetupFilter from '../HoursSetupFilter';
import {
	getEmployeeAction,
	paginateGetEmployeeAction,
} from 'redux/action/employeeAction';
import { getEmployeeCostAction } from 'redux/action/employeeCostAction';

const HoursSetup = () => {
	const { Column } = Table;
	const dispatch = useDispatch<AppDispatch>();

	const { count } = useSelector((state: any) => state?.employees);

	const { data } = useSelector((state: any) => state.employees);

	const [employeeData, setEmployeeData] = useState([]);

	useEffect(() => {
		const finalData = data?.map((singleData: any) => {
			return {
				id: singleData?.id,
				employeeName: singleData?.fullName,
				email: singleData?.email,
				employeeType: 'Salary Exempt',
				maximumAllocatedHours: '2000',
				maximumVacationHours: '1000',
			};
		});
		setEmployeeData(finalData);
	}, [data]);

	useEffect(() => {
		dispatch(
			paginateGetEmployeeAction({
				page: 1,
				limit: 10,
			})
		);
	}, []);

	const tableRef = useRef<HTMLDivElement>(null);

	const tableChangeHandler = () => {
		// console.log('Change');
	};

	return (
		<div>
			<HoursSetupFilter />
			<Table
				scroll={{ y: '43vh' }}
				pagination={false}
				ref={tableRef}
				className="employee-cost"
				onChange={tableChangeHandler}
				footer={() => {
					return (
						<p className="employee-cost-footer">
							Total No. of Employee: {count}
						</p>
					);
				}}
				dataSource={employeeData}
			>
				<Column
					title="Employee Name"
					dataIndex="employeeName"
					key="employeeName"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					width={'25%'}
					sorter={() => {
						return null as any;
					}}
					className="bg-white"
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
				/>
				<Column
					title="Employee Type"
					dataIndex="employeeType"
					key="name"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					width={'25%'}
					sorter={() => {
						return null as any;
					}}
					className="bg-white"
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					render={(value: string, employeeData: any, index: any) => {
						return (
							<Select
								placeholder="Select Employee Type"
								size="large"
								style={{ width: '100%' }}
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
						);
					}}
				/>
				<Column
					title="Maximum allocate hours per year"
					dataIndex="maximumAllocatedHours"
					key="maximumAllocatedHours"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					width={'25%'}
					sorter={() => {
						return null as any;
					}}
					className="bg-white"
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					render={(value: string, employeeData: any, index: any) => {
						return (
							<Input
								value={value}
								min={0}
								size="large"
								defaultValue={value}
								prefix={'$'}
							/>
						);
					}}
				/>
				<Column
					title="Maximum Vacation/PTO hours per year"
					dataIndex="maximumVacationHours"
					key="maximumVacationHours"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					width={'25%'}
					sorter={() => {
						return null as any;
					}}
					className="bg-white"
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					render={(value: string, employeeData: any, index: any) => {
						return (
							<Input
								value={value}
								min={0}
								size="large"
								defaultValue={value}
								prefix={'$'}
							/>
						);
					}}
				/>
			</Table>
		</div>
	);
};

export default HoursSetup;
