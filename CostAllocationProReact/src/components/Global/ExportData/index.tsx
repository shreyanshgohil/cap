import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApi, getApiCSV } from 'redux/apis';
import { DownArrowSvg, ExportSvg } from 'utils/svgs';
import {
	downLoadPdfHours,
	downLoadPdfPercentage,
	downloadPDFTimeActivities,
	toastText,
} from 'utils/utils';
import styles from './index.module.scss';
import './index.scss';
import { ExportDataInterface } from './types';
import moment from 'moment';

// For export data
const ExportData = (props: ExportDataInterface) => {
	const { params, moduleName } = props;

	const payrollMethod = useSelector(
		(state: any) => state?.companies?.configurations?.payrollMethod
	);
	const companyDetails: any = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.company
	);
	// const selectedMonth = useSelector(
	// 	(state: any) => state.employeeCosts.selectedMonth
	// );

	const [selectedOption, setSelectedOption] = useState('');

	const [isLoading, setIsLoading] = useState(false);

	const handleSelect = (value: string) => {
		setSelectedOption(value);
	};

	const handleExport = async () => {
		if (selectedOption == 'csv') {
			if (moduleName === 'timeActivity') {
				try {
					const query = {
						search: params?.search,
						employeeId: params?.filter?.employeeId,
						classId: params?.filter?.classId,
						customerId: params?.filter?.customerId,
						startDate: params?.dateRangeDate?.startDate,
						endDate: params?.dateRangeDate?.endDate,
						payPeriodId: params?.filter?.payPeriodId,
					};

					// const formatedStartDate = moment(query?.startDate).format(
					// 	'MM/DD/YYYY'
					// );
					// const formatedEndDate = moment(query?.endDate).format('MM/DD/YYYY');

					setIsLoading(true);
					const response: any = await getApiCSV('/time-activities/export', {
						companyId: localStorage.getItem('companyId'),
						...query,
					});
					const url = window.URL.createObjectURL(
						new Blob([response.data], {
							type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
						})
					);

					const fileName = moment(new Date()).format('MMDDYYYYhhmmss');
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', `Time Log Report_${fileName}.csv`);
					document.body.appendChild(link);
					link.click();
					link.remove();

					setIsLoading(false);
				} catch (err) {
					toastText('Error in downloading', 'error');
					console.error(err);
					setIsLoading(false);
				}
			} else if (moduleName === 'employeeCost') {
				try {
					const isPercentage = payrollMethod === 'Hours' ? false : true;
					const query = {
						search: params?.search,
						isPercentage: isPercentage,
						payPeriodId: params.payPeriodId,
					};

					setIsLoading(true);
					const response: any = await getApi('/employee-cost/export', {
						companyId: localStorage.getItem('companyId'),
						...query,
					});
					const url = window.URL.createObjectURL(new Blob([response.data]));
					const link = document.createElement('a');
					link.href = url;
					const fileName = moment(new Date()).format('MMDDYYYYhhmmss');
					link.setAttribute('download', `Employee Cost_${fileName}.csv`);
					document.body.appendChild(link);
					link.click();
					link.remove();

					setIsLoading(false);
				} catch (err) {
					toastText('Error in downloading', 'error');
					setIsLoading(false);
				}
			}
		} else if (selectedOption == 'pdf') {
			if (moduleName === 'timeActivity') {
				try {
					const query: any = {
						search: params?.search,
						employeeId: params?.filter?.employeeId,
						classId: params?.filter?.classId,
						customerId: params?.filter?.customerId,
						startDate: params?.dateRangeDate?.startDate,
						endDate: params?.dateRangeDate?.endDate,
						page: 1,
						limit: 100000,
						payPeriodId: params?.filter?.payPeriodId,
						payPeriodData: params.payPeriodData,
					};

					setIsLoading(true);

					downloadPDFTimeActivities(query, companyDetails?.tenantName).then(
						() => {
							setIsLoading(false);
						}
					);
				} catch (err) {
					setIsLoading(false);
					toastText('Error in downloading pdf', 'error');
				}
			} else if (moduleName === 'employeeCost') {
				setIsLoading(true);
				const isPercentage = payrollMethod === 'Hours' ? false : true;
				const query = {
					search: params?.search,
					date: params?.date,
					isPercentage: isPercentage,
				};
				let range;
				if (params.payPeriodData) {
					const startDate = moment(params.payPeriodData.startDate).format(
						'MM/DD/YYYY'
					);
					const endDate = moment(params.payPeriodData.endDate).format(
						'MM/DD/YYYY'
					);
					range = `${startDate} - ${endDate}`;
				}

				if (query.isPercentage) {
					downLoadPdfPercentage(
						params.payPeriodId,
						companyDetails?.tenantName,
						range as string
					).then(() => {
						setIsLoading(false);
					});
				} else {
					downLoadPdfHours(new Date(), companyDetails?.tenantName).then(() => {
						setIsLoading(false);
					});
				}
			}
		}
	};

	useEffect(() => {
		handleExport().then(() => {
			handleSelect('');
		});
	}, [selectedOption]);

	return (
		<div className={` ${styles['export-data']}`}>
			<div className={styles['export-data__wrapper']}>
				<span
					// onClick={handleExport}
					className={styles['export-data__wrapper-svg']}
				>
					{isLoading ? (
						<img src="/assets/gifs/loading-black.gif" height={40} />
					) : (
						<ExportSvg />
					)}
				</span>
				<Select
					value={selectedOption}
					suffixIcon={<DownArrowSvg />}
					placeholder="Export as"
					className="export-select"
					style={{ width: 200 }}
					onChange={handleSelect}
					options={[
						{ label: 'Export as', value: '' },
						{ label: 'PDF', value: 'pdf' },
						{ label: '.CSV', value: 'csv' },
					]}
					size="large"
				/>
			</div>
		</div>
	);
};

export default ExportData;
