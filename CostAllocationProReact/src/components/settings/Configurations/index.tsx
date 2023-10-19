import {
	Loader,
	SaveCancelButtons,
	TableActionHeader,
} from 'components/Global';
import ConfirmDelete from 'components/Global/confirmDeleteModel';
import { FC, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chartOfAccountAction } from 'redux/action/chartOfAccountAction';
import { classAction } from 'redux/action/classAction';
import { updateConfiguration } from 'redux/action/configurationAction';
import { getConfigurationFieldAction } from 'redux/action/configurationFieldAction';
import { customerAccountAction } from 'redux/action/customerAction';
import { deleteApiWithData, getApi, postApi } from 'redux/apis';
import { AppDispatch } from 'redux/store';
import {
	checkPermission,
	isValidConfigurationSettings,
	toastText,
} from 'utils/utils';
import AllocationSettings from './AllocationSettings';
import ConfigurationSettings from './ConfigurationSettings';
import ConfigurationHeader from './Header';
import { SettingsChangeHandler } from './MappingBox/types';
import styles from './index.module.scss';
import { ConfigurationsProps } from './types';
import { getEmployeeCostAction } from 'redux/action/employeeCostAction';
import { getEmployeeCostColumnAction } from 'redux/action/employeeCostColumnSlice';

// Main component for configuration page
const Configurations: FC<ConfigurationsProps> = (props) => {
	// Inits
	const { setSelectedSidebar } = props;
	const dispatch = useDispatch<AppDispatch>();
	const configurationContainerRef = useRef<HTMLDivElement>(null);
	const { isLoading, configurations: configurationsData } = useSelector(
		(state: any) => state.companies
	);
	const { selectedMonth } = useSelector((state: any) => state?.employeeCosts);

	const { data: qbClass, isLoading: qbClassLoading } = useSelector(
		(state: any) => state?.class
	);
	const { data: qbChartOfAccounts, isLoading: qbChartOfAccountsLoading } =
		useSelector((state: any) => state.chartOfAccounts);
	const { data: qbCustomers, isLoading: qbCustomersLoading } = useSelector(
		(state: any) => state.customer
	);
	const { updateConfigurationLoader } = useSelector(
		(state: any) => state.companies
	);
	const isConnected = useSelector(
		(state: any) => state.companies.selectedCompanyDetails?.company?.isConnected
	);
	const status = useSelector(
		(state: any) => state.companies.selectedCompanyDetails?.company?.status
	);
	const [isFirstTimeSubmit, setFirstTimeSubmit] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [configurationsDataCopy, setConfigurationsDataCopy] = useState(
		configurationsData.settings
	);
	const [qbSelectionObj, setQbSelectionObj] = useState<any>({});
	const [payrollMethod, setPayrollMethod] = useState('Percentage');
	const [selectedItemDeleteData, setSelectedDelete] = useState<any>(null);
	const [indirectExpenseRate, setIndirectExpenseRate] = useState(
		configurationsData?.indirectExpenseRate
	);
	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	useEffect(() => {
		dispatch(getConfigurationFieldAction());
	}, []);

	// for handle the any of the settings change
	const settingsChangeHandler = (settingsChangeData: SettingsChangeHandler) => {
		const { sectionId, dataId, fieldId, fieldName } = settingsChangeData;
		const tempCopy = JSON.parse(JSON.stringify(configurationsDataCopy));
		tempCopy[sectionId].fields[fieldId][fieldName] = dataId;
		setConfigurationsDataCopy(tempCopy);
	};

	// For generate the appropriate mapping for QBclass and QBCustomer, QBChatOfAccount
	const generateMappingObject = () => {
		const quickBookClass = qbClass?.map((singleClass: any) => {
			return { ...singleClass, isDisable: false };
		});
		const quickBookCustomers = qbCustomers?.map((singleClass: any) => {
			return { ...singleClass, isDisable: false };
		});
		const quickBookChartOfAccounts = qbChartOfAccounts?.map(
			(singleClass: any) => {
				return { ...singleClass, isDisable: false };
			}
		);
		setQbSelectionObj({
			qbCoa: quickBookChartOfAccounts,
			qbCustomer: quickBookCustomers,
			qbClass: quickBookClass,
		});
	};

	// For handle the payroll method change type
	const changePayrollMethodHandler = (selectedPayrollMethod: string) => {
		setPayrollMethod(selectedPayrollMethod);
	};

	// For handle the expanse rate
	const changeExpenseRateAllocationHandler = (e: any) => {
		setIndirectExpenseRate(e);
	};

	// For set the default value for the selected payroll method and indirect expense
	const handleInitialState = () => {
		setPayrollMethod(configurationsData?.payrollMethod);
		setIndirectExpenseRate(configurationsData?.indirectExpenseRate);
	};

	// For save the configuration
	const saveConfigurationHandler = async () => {
		const response = await getApi('/configuration', {
			companyId: localStorage.getItem('companyId'),
		});
		const configurationFields = response.data.data;

		await dispatch(getConfigurationFieldAction());
		setFirstTimeSubmit(false);
		const { isValidSelectBox, isAddEditFalse, isBlankLabel, remainingId } =
			isValidConfigurationSettings(configurationsDataCopy);
		if (remainingId) {
			const el = document.getElementById(remainingId) as HTMLElement;
			el.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			});
			// el.focus();
		}
		if (!isValidSelectBox) {
			toastText('Please select valid Quickbook details', 'error');
			return;
		}

		if (!isAddEditFalse) {
			toastText('Please complete the editing of columns first', 'error');
			return;
		}

		if (isBlankLabel) {
			toastText('Please enter the valid column name', 'error');
			return;
		}

		// FOR ADD THE FIELD  IN SQL
		if (isValidSelectBox && isAddEditFalse && !isBlankLabel) {
			// let finalChanges: any = [];

			const newObject = Object.values(configurationsDataCopy);
			const fieldsObject: any = {};

			for (const singleSection of configurationFields) {
				const fieldArray = singleSection.fields.map(
					(singleField: any) => singleField.jsonId
				);
				fieldsObject[singleSection.no] = fieldArray;
			}
			const newSqlObject: any = {};

			for (const singleSection of newObject as any) {
				const data = Object.values(singleSection.fields).filter(
					(singleField: any) => {
						if (fieldsObject?.[singleSection?.id]) {
							if (
								!fieldsObject?.[singleSection?.id]?.includes(singleField.id)
							) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}
					}
				);
				const sqlSection: any = configurationFields.find(
					(sqlSingleSection: any) => sqlSingleSection.no == singleSection.id
				);
				if (sqlSection?.id && data.length > 0) {
					newSqlObject[sqlSection.id] = data;
				}
			}

			// FOR DELETE THE FIELD IN SQL
			const deleteFieldObject: any = {};
			const deleteSqlSection: any = [];
			for (const [
				index,
				singleSection,
			] of configurationFields.entries() as any) {
				if (index !== 0) {
					const fieldArray: any = [];
					for (const singleField of singleSection.fields) {
						if (singleField.jsonId.charAt(0) === 'f') {
							fieldArray.push(singleField.jsonId);
						}
					}
					deleteFieldObject[singleSection.no] = fieldArray;
				}
			}

			for (const singleSection of newObject as any) {
				if (deleteFieldObject?.[singleSection?.id]) {
					for (const field of Object.values(singleSection.fields) as any) {
						const index = deleteFieldObject[singleSection.id].indexOf(field.id);
						if (index >= 0) {
							deleteFieldObject[singleSection.id].splice(index, 1);
						}
					}
				}
			}
			for (const section of configurationFields) {
				if (deleteFieldObject[section.no]) {
					const ids = deleteFieldObject[section.no];
					if (ids.length > 0) {
						const fields = section.fields.filter((singleField: any) =>
							deleteFieldObject[section.no].includes(singleField.jsonId)
						);
						for (const singleMyField of fields as any) {
							deleteSqlSection.push(singleMyField.id);
						}
					}
				}
			}

			// for (const singleSection of configurationFields) {
			// 	const data = singleSection.fields.filter((singleField) => {});
			// }

			Promise.all(
				deleteSqlSection.map(async (singleField: string) => {
					try {
						const response = await deleteApiWithData('/configuration', {
							fieldId: singleField,
							companyId: localStorage.getItem('companyId'),
						});
						return response;
					} catch (err) {
						console.error('API Error:', err);
					}
				})
			);

			const finalArr: any = [];

			Object.entries(newSqlObject).forEach((singleItem: any) => {
				const data = singleItem[1].map((item: any) => {
					return {
						sectionId: singleItem[0],
						jsonId: item?.id,
						name: item?.label,
					};
				});
				finalArr.push(...data);
			});

			// Call configuration create api for field creation
			const promises = finalArr.map(async (singleField: any) => {
				try {
					const response = await postApi('/configuration', {
						companyId: localStorage.getItem('companyId'),
						sectionId: singleField?.sectionId,
						name: singleField?.name,
						jsonId: singleField?.jsonId,
					});
					return response;
				} catch (err) {
					console.error('API Error:', err);
				}
			});

			await Promise.all(promises);

			dispatch(
				updateConfiguration({
					settings: configurationsDataCopy,
					indirectExpenseRate: Number(indirectExpenseRate.toFixed(2)),
					payrollMethod: payrollMethod,
				})
			)
				.unwrap()
				.then(() => {
					configurationContainerRef.current?.scrollTo({
						top: 0,
						left: 0,
						behavior: 'smooth',
					});
					dispatch(getEmployeeCostAction({ date: selectedMonth }));
					dispatch(getEmployeeCostColumnAction());
				});
		}
	};
	// For reset the configuration
	const cancelConfigurationHandler = () => {
		setFirstTimeSubmit(true);
		setConfigurationsDataCopy(configurationsData.settings);
		handleInitialState();
	};

	//delete fieldHandler
	const deleteFieldHandler = (sectionMappingId: string, fieldId: string) => {
		const tempCopy = JSON.parse(JSON.stringify(configurationsDataCopy));
		delete tempCopy[sectionMappingId].fields[fieldId];
		setConfigurationsDataCopy(tempCopy);
	};

	// For add the extra field
	const addFieldHandler = (sectionID: string) => {
		const tempCopy = JSON.parse(JSON.stringify(configurationsDataCopy));
		setFirstTimeSubmit(true);
		let largestId = 0;

		for (const key in tempCopy[sectionID].fields) {
			if (key.startsWith('f')) {
				const number = parseInt(key.slice(1));
				if (!isNaN(number) && number > largestId) {
					largestId = number;
				}
			}
		}

		const id = 'f' + Number(largestId + 1);
		// const id = String(Math.random());

		const field = {
			id: id,
			label: '',
			value: null,
			editable: true,
			deletable: true,
			ratesLimited: false,
			isEditing: true,
		};
		tempCopy[sectionID].fields = {
			...tempCopy[sectionID].fields,
			[id]: field,
		};
		setConfigurationsDataCopy(tempCopy);
	};

	// for check is there add permission
	const isAddIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Configurations',
			permission: ['add'],
		}
	);

	// for check is there add permission
	const isEditIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Configurations',
			permission: ['edit'],
		}
	);

	// for check is there add permission
	const isDeleteIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Configurations',
			permission: ['delete'],
		}
	);

	const initialFunction = () => {
		dispatch(classAction());
		dispatch(chartOfAccountAction());
		dispatch(customerAccountAction());
		if (status === false || isConnected === false) {
			toastText('Please Connect the Quickbooks company first', 'error');
			setSelectedSidebar('Integrations');
		}
	};

	// For initial fetch the class COA and customer
	useEffect(() => {
		initialFunction();
	}, []);

	//   For cancel operation
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	//   For conform operation
	const handleOk = () => {
		setIsModalOpen(false);
	};

	//   For open the model
	const showModal = (sectionMappingId: string, fieldId: string) => {
		setSelectedDelete({
			sectionMappingId: sectionMappingId,
			fieldId: fieldId,
		});
		setIsModalOpen(true);
	};

	// For generate the mapping obj
	useEffect(() => {
		generateMappingObject();
	}, [qbClass, qbChartOfAccounts, qbCustomers]);

	useEffect(() => {
		handleInitialState();
	}, [configurationsData]);

	if (
		isLoading ||
		qbClassLoading ||
		qbChartOfAccountsLoading ||
		qbCustomersLoading
	) {
		return <Loader />;
	}

	const deleteHandler = () => {
		deleteFieldHandler(
			selectedItemDeleteData.sectionMappingId,
			selectedItemDeleteData.fieldId
		);
		setIsModalOpen(false);
	};

	// JSX code
	return (
		<>
			<div className={styles.configuration}>
				<TableActionHeader title="Configurations" />
				<div
					className={styles.configuration__wrapper}
					ref={configurationContainerRef}
				>
					<div className={styles['configuration__header']}>
						<ConfigurationHeader />
					</div>
					<div className={styles['configuration__settings']}>
						<div className={styles['configuration__settings--configuration']}>
							<ConfigurationSettings
								settingsData={configurationsDataCopy}
								qbSelectionObj={qbSelectionObj}
								settingsChangeHandler={settingsChangeHandler}
								isFirstTimeSubmit={isFirstTimeSubmit}
								deleteFieldHandler={deleteFieldHandler}
								addFieldHandler={addFieldHandler}
								showModal={showModal}
							>
								{(isAddIntegrationPermission ||
									isDeleteIntegrationPermission ||
									isEditIntegrationPermission) && (
									<div className={styles['buttons-wrapper']}>
										<SaveCancelButtons
											saveTitle="Save"
											cancelTitle="Reset"
											loadingForSave={updateConfigurationLoader}
											loadingForCancel={false}
											saveHandler={saveConfigurationHandler}
											cancelHandler={cancelConfigurationHandler}
										/>
									</div>
								)}
							</ConfigurationSettings>
						</div>
						<div className={styles['configuration__settings--allocation']}>
							<AllocationSettings
								settingsData={configurationsDataCopy}
								payrollMethod={payrollMethod}
								changePayrollMethodHandler={changePayrollMethodHandler}
								indirectExpenseRate={indirectExpenseRate}
								changeExpenseRateAllocationHandler={
									changeExpenseRateAllocationHandler
								}
								settingsChangeHandler={settingsChangeHandler}
							/>
						</div>
					</div>
				</div>
			</div>
			<ConfirmDelete
				handleCancel={handleCancel}
				handleOk={handleOk}
				isModalOpen={isModalOpen}
				deleteHandler={deleteHandler}
			/>
		</>
	);
};

export default Configurations;
