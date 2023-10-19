import { TableActionHeader } from 'components/Global';
import { monthNames } from 'constants/Data';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getMonthAfter12Months } from 'utils/utils';
import ActiveConnectionsTable from './ActiveConnectionsTable';
import Connection from './Connection';
import NewConnection from './NewConnection';
import styles from './index.module.scss';

const Integrations = (props: any) => {
	const { setSelectedSidebar, openDrawerHandler } = props;

	const [isNewConnection, setIsNewConnection] = useState(true);
	const [isActiveConnectionTable, setIsActiveConnection] = useState(false);
	const [isConnection, setIsConnection] = useState(false);
	const [data, setData] = useState([]);

	const { selectedCompanyDetails, data: companiesData } = useSelector(
		(state: any) => state?.companies
	);

	const date = getMonthAfter12Months(
		monthNames.indexOf(selectedCompanyDetails?.company?.fiscalYear) + 1
	);

	const TimeAgo = (date: any) => {
		// const sourceTimeZone = 'America/Los_Angeles';
		const localDate = moment(date).utcOffset(
			new Date().getTimezoneOffset() * -1
		);
		const formattedTimeAgo = localDate.fromNow();

		return formattedTimeAgo;
		// return <span>{formattedTimeAgo}</span>;
	};

	useEffect(() => {
		const data = companiesData
			?.map((companyObj: any) => {
				if (companyObj?.company?.id === localStorage.getItem('companyId')) {
					const formattedDate = TimeAgo(
						companyObj?.company?.employeeLastSyncDate
					);
					return {
						key: companyObj?.company?.id,
						accounting_software: '/assets/images/quickbooks-logo.png',
						company: {
							title: companyObj?.company?.tenantName,
							year: `${companyObj?.company?.fiscalYear?.slice(0, 3)} -
					${date?.slice(0, 3)}`,
							currency: 'US Dollar',
						},
						connection_id: companyObj?.company?.tenantID,
						status: companyObj?.company?.status,
						last_sync: formattedDate || 'N/A',
						action: companyObj?.company?.isConnected,
					};
				} else {
					return;
				}
			})
			.filter((companyObj: any) => companyObj !== undefined);

		setData(data);
	}, [companiesData]);

	// const data = [
	// 	{
	// 		key: selectedCompanyDetails?.company?.id,
	// 		accounting_software: '/assets/images/quickbooks-logo.png',
	// 		company: {
	// 			title: selectedCompanyDetails?.company?.tenantName,
	// 			year: `${selectedCompanyDetails?.company?.fiscalYear?.slice(0, 3)} -
	// 				${date?.slice(0, 3)}`,
	// 			currency: 'US Dollar',
	// 		},
	// 		connection_id: selectedCompanyDetails?.company?.tenantID,
	// 		status: selectedCompanyDetails?.company?.status,
	// 		last_sync: selectedCompanyDetails?.company?.employeeLastSyncDate || 'N/A',
	// 		action: selectedCompanyDetails?.company?.isConnected,
	// 	},
	// ];

	const newConnectionHandler = () => {
		setIsNewConnection(false);
		setIsConnection(true);
		setIsActiveConnection(false);
	};

	return (
		<div>
			<div className="">
				<TableActionHeader title={'Integrations'}></TableActionHeader>
				{(isNewConnection || isActiveConnectionTable) && (
					<div className={styles['main-container']}>
						{companiesData?.length == 0 ? (
							<NewConnection setIsNewConnection={newConnectionHandler} />
						) : (
							<ActiveConnectionsTable
								data={data}
								setSelectedSidebar={setSelectedSidebar}
								openDrawerHandler={openDrawerHandler}
							/>
						)}
					</div>
				)}
				{isConnection && <Connection />}
			</div>
		</div>
	);
};

export default Integrations;
