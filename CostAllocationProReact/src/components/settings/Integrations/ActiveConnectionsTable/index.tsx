import { Image, Space, Switch, Table } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getApi, postApi, putApi } from 'redux/apis';
import {
	updateCompanyConnect,
	updateCompanyStatus,
} from 'redux/slice/companySlice';
import { AppDispatch } from 'redux/store';
import {
	IntegrationConfigurationSvg,
	IntegrationDisconnectSvg,
} from 'utils/svgs';
import { checkPermission, toastText } from 'utils/utils';
import DisconnectModal from '../DisconnectModal';
import styles from './index.module.scss';
import './index.scss';
// import { getCompanies } from 'redux/slice/companySlice';

const ActiveConnectionsTable = (props: any) => {
	const { Column } = Table;

	const { data, setSelectedSidebar } = props;

	const dispatch = useDispatch<AppDispatch>();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

	const [companyId, setCompanyId] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	// for check is there add permission
	const isConfigurationPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Configurations',
		permission: ['view'],
	});

	const isAddIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Integrations',
			permission: ['add'],
		}
	);

	// for check is there add permission
	const isEditIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Integrations',
			permission: ['edit'],
		}
	);

	// for check is there add permission
	const isDeleteIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Integrations',
			permission: ['delete'],
		}
	);

	const showModal = (connected: any, data: any) => {
		setCompanyId(data?.key);
		setIsConnected(connected);
		setIsModalOpen(true);
	};

	const hideModal = () => {
		setCompanyId('');
		setIsConnected(false);
		setIsModalOpen(false);
	};

	const showConnectModal = (connected: any, data: any) => {
		setCompanyId(data?.key);
		setIsConnected(connected);
		setIsConnectModalOpen(true);
	};

	const hideConnectModal = () => {
		setCompanyId('');
		setIsConnected(false);
		setIsConnectModalOpen(false);
	};

	const statusHandler = (value: boolean, data: any) => {
		putApi('/quickbooks', {
			companyId: data?.key,
			status: value,
		})
			.then((res: any) => {
				toastText(res?.data?.message, 'success');

				const params = {
					data: data,
					value: value,
				};

				dispatch(updateCompanyStatus(params));
			})
			.then(() => {
				setSelectedSidebar('Integrations');
			})
			.catch((err) => {
				toastText(err?.response?.data?.message, 'error');
			});
	};

	const submitHandler = () => {
		if (isConnected == true) {
			setIsLoading(true);
			postApi('/quickbooks/disconnect', {
				companyId: companyId,
				// companyId: localStorage.getItem('companyId'),
			})
				.then((res: any) => {
					setIsModalOpen(false);
					dispatch(
						updateCompanyConnect({
							companyId: companyId,
							value: false,
						})
					);
					// dispatch(fetchProfileAction())
					// 	.unwrap()
					// 	.then((res) => {
					// 		dispatch(getCompanies(res));
					// 		dispatch(getCompanyDetails(companyId));
					// 	});
					setIsLoading(false);
					toastText(res?.data?.message, 'success');
				})
				.then(() => {
					const params = {
						data: {
							key: companyId,
						},
						value: false,
					};

					dispatch(updateCompanyStatus(params));
				})
				.then(() => {
					setSelectedSidebar('Integrations');
				})
				.catch((err: any) => {
					setIsModalOpen(false);
					setIsLoading(false);
					toastText(err?.response?.data?.message, 'error');
				});
		} else {
			setIsLoading(true);
			getApi('/quickbooks/authurl')
				.then((res) => {
					setIsLoading(false);
					localStorage.setItem('qbUrl', res.data.data);
					window.open(res.data.data, '_self');
				})
				.catch(() => {
					setIsLoading(false);
					toastText('Something went wrong', 'error');
				});

			// postApi('/quickbooks/callback', {
			// 	companyId: companyId,
			// })
			// 	.then((res: any) => {
			// 		setIsModalOpen(false);
			// 		dispatch(fetchProfileAction()).then(() => {
			// 			dispatch(getCompanies(companyId));
			// 		});
			// 		setIsLoading(false);
			// 		toastText(res?.data?.message, 'success');
			// 	})
			// 	.catch((err: any) => {
			// 		setIsModalOpen(false);
			// 		dispatch(fetchProfileAction()).then(() => {
			// 			dispatch(getCompanies(companyId));
			// 		});
			// 		toastText(err?.response?.data?.message, 'error');
			// 		setIsLoading(false);
			// 	});
		}
	};

	return (
		<div className={styles['main-container']}>
			<Table
				dataSource={data}
				className={styles['connection-table']}
				pagination={false}
				scroll={{ y: '61vh', x: '63vh' }}
			>
				<Column
					title="Accounting Software"
					dataIndex="accounting_software"
					key="accounting_software"
					render={(text: string) => (
						<Image
							src={text}
							preview={false}
							className="connection-table__logo"
							width={186.58}
						/>
					)}
					// width={'20%'}
				/>
				<Column
					title="Company"
					dataIndex="company"
					key="company"
					render={(data: any) => (
						<div className={styles['connection-table__company']}>
							<p className={styles['connection-table__company-title']}>
								{data?.title}
							</p>
							<p className={styles['connection-table__company-year']}>
								Fiscal Year: {data?.year}
							</p>
							<p className={styles['connection-table__company-currency']}>
								Currency: {data?.currency}
							</p>
						</div>
					)}
				/>
				<Column
					title="Company ID"
					dataIndex="connection_id"
					key="connection_id"
					render={(text: string) => (
						<p className={styles['connection-table__connection-id']}>{text}</p>
					)}
					// width={'16%'}
				/>
				<Column
					title="Status"
					dataIndex="status"
					key="status"
					render={(value: any, data: any) => {
						return (
							<Switch
								key={data?.key}
								defaultChecked={data?.action === false ? false : value}
								checked={data?.action === false ? false : value}
								onChange={(e) => statusHandler(e, data)}
								disabled={!isEditIntegrationPermission || !data?.action}
							></Switch>
						);
					}}
					width={'130px'}
				/>
				<Column
					title="Last Sync"
					dataIndex="last_sync"
					key="last_sync"
					render={(text: string) => (
						<p className={styles['connection-table__last-sync']}>{text}</p>
					)}
					// width={'12%'}
				/>

				<Column
					title="Action"
					dataIndex="action"
					key="action"
					render={(record: any, data: any) => {
						return (
							<Space size="middle">
								{(record &&
									isConfigurationPermission === false &&
									isDeleteIntegrationPermission == false) ||
								(!record &&
									isConfigurationPermission === false &&
									isAddIntegrationPermission == false) ? (
									<h5>N/A</h5>
								) : (
									<>
										<div className={styles['connection-table__action']}>
											{isConfigurationPermission && (
												<>
													<IntegrationConfigurationSvg />
													<p
														onClick={() => setSelectedSidebar('Configurations')}
													>
														Configure
													</p>
												</>
											)}
										</div>
										{record ? (
											<div className={styles['connection-table__action']}>
												{isDeleteIntegrationPermission && (
													<>
														<IntegrationDisconnectSvg />
														<p onClick={() => showModal(record, data)}>
															Disconnect
														</p>
													</>
												)}
											</div>
										) : (
											<div className={styles['connection-table__action']}>
												{isAddIntegrationPermission && (
													<>
														<IntegrationDisconnectSvg />
														<p onClick={() => showConnectModal(record, data)}>
															Connect
														</p>
													</>
												)}
											</div>
										)}
									</>
								)}
							</Space>
						);
					}}
				/>
			</Table>

			{isModalOpen && (
				<DisconnectModal
					isModalOpen={isModalOpen}
					handleOk={submitHandler}
					handleCancel={hideModal}
					text="Are you sure, you want to Disconnect?"
					buttonText="Yes"
					buttonColor="disconnect"
					image="assets/images/disconnect-image.png"
					isLoading={isLoading}
				/>
			)}

			{isConnectModalOpen && (
				<DisconnectModal
					isModalOpen={isConnectModalOpen}
					handleOk={submitHandler}
					handleCancel={hideConnectModal}
					text="Are you sure, you want to Reconnect?"
					buttonText="Yes"
					buttonColor="connect"
					image="assets/images/quickbooks-logo.png"
					// image="assets/images/connect-image.png"
					isLoading={isLoading}
					isReconnect={true}
				/>
			)}
		</div>
	);
};

export default ActiveConnectionsTable;
