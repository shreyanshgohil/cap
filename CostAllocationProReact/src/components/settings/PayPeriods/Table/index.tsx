/* eslint-disable react-hooks/rules-of-hooks */
import { DatePicker, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	CostAllocation,
	EditActionSvg,
	EmployeeCost,
	JournalEntries,
	TickSmall,
	TimeLogs,
} from 'utils/svgs';
import { checkPermission } from 'utils/utils';
import SearchAndFilter from '../SearchAndFilter/index';
import './index.scss';
import { DynamicTableProps } from './types';

const DynamicTable: FC<DynamicTableProps> = (props) => {
	// Inits
	const { Column } = Table;
	const {
		payPeriodData,
		filterValue,
		tableRef,
		performSortHandler,
		savePayPeriodHandler,
		editClickHandler,
		payPeriodDates,
		editPayPeriodHandler,
		performFilterHandler,
		payPeriodYear,
		changeEmployeeCost,
		focusChangeHandler,
	} = props;

	const { RangePicker } = DatePicker;
	const navigate = useNavigate();
	// For handle the table change click
	const tableChangeHandler = (_: any, __: any, data: any) => {
		performSortHandler && performSortHandler(data.order);
	};

	function isDateDisabled(date: any) {
		// Convert the date to a string in 'YYYY-MM-DD' format
		const dateString = date.format('YYYY-MM-DD');

		// Check if the dateString is included in the disabledDates array
		return payPeriodDates.includes(dateString);
	}

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isEditPayPeriodPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Pay Period',
		permission: ['edit'],
	});

	const employeeCostChickHandler = (data: any) => {
		console.log(data);
		navigate(`/employee-costs?payPeriodId=${data.id}`);
		changeEmployeeCost && changeEmployeeCost('1');
	};
	// JSX
	return (
		<div className={'dynamic-table'}>
			<SearchAndFilter
				searchValue={''}
				filterValue={filterValue}
				performFilterHandler={performFilterHandler}
				payPeriodYear={payPeriodYear}
			/>
			<Table
				dataSource={payPeriodData}
				scroll={{ y: '54vh', x: '63vh' }}
				pagination={false}
				className="table-global"
				ref={tableRef}
				onChange={tableChangeHandler}
			>
				<Column
					title="Sr. No"
					dataIndex="index"
					key="index"
					className="bg-white"
					width={'10%'}
				/>
				<Column
					title={() => (
						<p
							style={{
								textAlign: 'center',
							}}
						>
							Pay Periods
						</p>
					)}
					dataIndex="phone"
					key="phone"
					className={`bg-white`}
					width={'300px'}
					render={(value: any, data: any) => {
						const startDate: any = data.startDate
							? new Date(data.startDate)
							: null;
						const endDate: any = data.endDate ? new Date(data.endDate) : null;
						const selectedRange: any = [
							startDate ? dayjs(startDate) : null,
							startDate ? dayjs(endDate) : null,
						];
						return (
							<div className="pay-period-column">
								{!data.isEditing ? (
									<div className="date">
										<p>
											<span>{startDate.getMonth() + 1}</span>
											<span>/</span>
											<span>{startDate.getDate()}</span>
											<span>/</span>
											<span>{startDate.getFullYear()}</span>
										</p>
										<p>-</p>
										<p>
											<span>{endDate.getMonth() + 1}</span>
											<span>/</span>
											<span>{endDate.getDate()}</span>
											<span>/</span>
											<span>{endDate.getFullYear()}</span>
										</p>
									</div>
								) : (
									<RangePicker
										className={`range-picker ${
											data.isError && 'err-range-picker'
										}`}
										size="large"
										disabledDate={(date) => isDateDisabled(date)}
										style={{ width: 260 }}
										onFocus={() => {
											focusChangeHandler(data);
										}}
										status={data.isError}
										format="MM/DD/YYYY"
										value={selectedRange}
										onChange={(rangeData: any) => {
											editPayPeriodHandler(
												data,
												rangeData?.[0]?.['$d'] || null,
												rangeData?.[1]?.['$d'] || null
											);
										}}
									/>
								)}
							</div>
						);
					}}
				/>
				<Column
					title={() => (
						<p
							style={{
								textAlign: 'center',
							}}
						>
							Employee Costs
						</p>
					)}
					dataIndex="phone"
					key="phone"
					className={`bg-white`}
					render={(value: any, data: any) => {
						return (
							<div className="pay-period-column">
								<div className="section-time">
									<p
										className="employee-cost-pay-period"
										onClick={() => employeeCostChickHandler(data)}
									>
										<EmployeeCost />
									</p>
								</div>
							</div>
						);
					}}
				/>

				<Column
					title={() => (
						<p
							style={{
								textAlign: 'center',
							}}
						>
							Time Log
						</p>
					)}
					dataIndex="phone"
					key="phone"
					className={`bg-white`}
					render={() => {
						return (
							<div className="pay-period-column">
								<div className="section-time">
									<p>
										<TimeLogs />
									</p>
								</div>
							</div>
						);
					}}
				/>
				<Column
					title={() => (
						<p
							style={{
								textAlign: 'center',
							}}
						>
							CostAllocations
						</p>
					)}
					dataIndex="phone"
					key="phone"
					className={`bg-white`}
					render={() => {
						return (
							<div className="pay-period-column">
								<div className="section-journal">
									<p>
										<CostAllocation />
									</p>
								</div>
							</div>
						);
					}}
				/>
				<Column
					title={() => (
						<p
							style={{
								textAlign: 'center',
							}}
						>
							Journal Entries
						</p>
					)}
					dataIndex="phone"
					key="phone"
					className={`bg-white`}
					render={() => {
						return (
							<div className="pay-period-column">
								<div className="section-time">
									<div className="section-journal">
										<p>
											<JournalEntries />
										</p>
									</div>
								</div>
							</div>
						);
					}}
				/>
				{isEditPayPeriodPermission && (
					<Column
						title="Action"
						dataIndex="action"
						key="action"
						className="bg-white"
						width={'10%'}
						render={(values, data: any) => {
							return (
								<Space size={20}>
									<>
										{!data.isEditing ? (
											<div
												className="cursor-pointer flex align-center justify-center"
												onClick={() => editClickHandler(data)}
											>
												<EditActionSvg />
											</div>
										) : (
											<div
												className={`cursor-pointer flex align-center justify-center action-svg `}
												onClick={() => savePayPeriodHandler(data)}
											>
												<TickSmall />
											</div>
										)}
									</>
								</Space>
							);
						}}
					/>
				)}
			</Table>
		</div>
	);
};

export default DynamicTable;
