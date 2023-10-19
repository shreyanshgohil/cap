import { FC } from 'react';
import styles from './index.module.scss';
import { SingleMappingSection } from './types';
import { Input, Select, Tooltip } from 'antd';
import {
	BlueAddSvg,
	DeleteActionSvg,
	EditActionSvg,
	TickMark,
} from 'utils/svgs';
import { filterQBEntities } from 'utils/utils';
import { checkPermission } from 'utils/utils';
import { useSelector } from 'react-redux';
// for mapping the our column with  QB
const MappingBox: FC<SingleMappingSection> = (props) => {
	// inits
	const {
		singleMappingSection,
		qbSelectionObj,
		settingsChangeHandler,
		isFirstTimeSubmit,
		allMappingSection,
		addFieldHandler,
		showModal,
	} = props;
	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);
	const qbValues = qbSelectionObj?.[singleMappingSection.type] || [];

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

	// For filter out the selected items
	const filteredItems = filterQBEntities(
		allMappingSection,
		singleMappingSection.type,
		qbValues
	);

	// For select the initial value
	const findSelectBoxValueHandler = (singleMapping: any) => {
		const foundedElement = qbValues.find(
			(singleEl: any) => singleEl?.Id === singleMapping?.value
		);
		if (singleMappingSection.type === 'qbCoa') {
			return foundedElement?.Name;
		} else if (singleMappingSection.type === 'qbCustomer') {
			return foundedElement?.DisplayName;
		} else if (singleMappingSection.type === 'qbClass') {
			return foundedElement?.FullyQualifiedName;
		}
	};

	// JSX
	return (
		<div
			className={`${styles['mapping-box']} ${
				!(
					isAddIntegrationPermission ||
					isEditIntegrationPermission ||
					isDeleteIntegrationPermission
				) && `${styles['remove-last']}`
			}`}
		>
			<div className={styles['mapping-box__wrapper']}>
				<div className={styles['mapping-box__top']}>
					<div className={styles['mapping-box__top--title-wrapper']}>
						<Tooltip title={singleMappingSection.toolTip}>
							<h5
								className={`${styles['mapping-box__top--title']} ${styles['mapping-box__top--title-cap']}`}
							>
								{singleMappingSection.capMappingTitle}
							</h5>
						</Tooltip>
					</div>
					<Tooltip
						title={
							singleMappingSection.id == 0 &&
							'Only Classes with subclasses will get synced for e.g. Parent Class: Sub Class'
						}
					>
						<h5
							className={`${styles['mapping-box__top--title']} ${styles['mapping-box__top--title-qb']}`}
						>
							{singleMappingSection.qbMappingValue}
						</h5>
					</Tooltip>
				</div>
				<div className={styles['mapping-box__center']}>
					{Object.values(singleMappingSection.fields).map(
						(singleMapping: any, index: number) => {
							const selectBoxValue = findSelectBoxValueHandler(singleMapping);
							return (
								<div
									key={index}
									className={styles['mapping-box__center--wrapper']}
								>
									<div
										className={` ${styles['mapping-box__center--single-mapping']}`}
									>
										<div
											className={
												styles[
													'mapping-box__center--single-mapping--svg-wrapper'
												]
											}
										>
											<div className={styles['field-label']}>
												{!singleMapping.isEditing ? (
													<>
														<h4
															id={`${singleMappingSection.id}${singleMapping.id}`}
														>
															{singleMapping.label}
														</h4>
														<span className="required-field">*</span>
													</>
												) : (
													<Input
														size="large"
														id={`${singleMappingSection.id}${singleMapping.id}`}
														defaultValue={singleMapping.label}
														style={{ width: '80%' }}
														onChange={(event) => {
															settingsChangeHandler({
																sectionId: singleMappingSection.id,
																fieldId: singleMapping.id,
																fieldName: 'label',
																dataId: event.target.value,
															});
														}}
													/>
												)}
											</div>
											<div className={styles['edit-delete-wrapper']}>
												{singleMapping.editable &&
													singleMapping.label.trim() !== '' &&
													isEditIntegrationPermission && (
														<label
															htmlFor={`${singleMappingSection.id}${singleMapping.id}`}
															className="cursor-pointer"
															onClick={() => {
																settingsChangeHandler({
																	sectionId: singleMappingSection.id,
																	fieldId: singleMapping.id,
																	fieldName: 'isEditing',
																	dataId: !singleMapping.isEditing,
																});
															}}
														>
															{singleMapping.isEditing ? (
																<TickMark />
															) : (
																<EditActionSvg />
															)}
														</label>
													)}
												{singleMapping.deletable &&
													isDeleteIntegrationPermission && (
														<div
															className="cursor-pointer"
															onClick={() =>
																showModal(
																	singleMappingSection.id,
																	singleMapping.id
																)
															}
														>
															<DeleteActionSvg />
														</div>
													)}
											</div>
										</div>
										<div
											className={
												styles[
													'mapping-box__center--single-mapping--select-wrapper'
												]
											}
										>
											<Select
												placeholder={singleMappingSection?.placeHolder}
												size="large"
												getPopupContainer={(trigger) => trigger.parentNode}
												value={selectBoxValue}
												onChange={(dataValue) => {
													settingsChangeHandler({
														sectionId: singleMappingSection.id,
														fieldId: singleMapping.id,
														fieldName: 'value',
														dataId: dataValue,
													});
												}}
											>
												{filteredItems.map((qbData: any, key: number) => {
													if (singleMappingSection.type === 'qbCoa') {
														return (
															<Select.Option
																value={qbData?.Id}
																key={key}
																disabled={qbData.isDisable}
															>
																{qbData?.Name}
															</Select.Option>
														);
													} else if (
														singleMappingSection.type === 'qbCustomer'
													) {
														return (
															<Select.Option
																value={qbData?.Id}
																key={key}
																disabled={qbData.isDisable}
															>
																{qbData?.DisplayName}
															</Select.Option>
														);
													} else if (singleMappingSection.type === 'qbClass') {
														return (
															<Select.Option
																value={qbData?.Id}
																key={key}
																disabled={qbData.isDisable}
															>
																{qbData?.FullyQualifiedName}
															</Select.Option>
														);
													}
												})}
											</Select>
											{!isFirstTimeSubmit && !singleMapping.value && (
												<p className="error-message">
													{singleMappingSection?.errorMessage}
												</p>
											)}
										</div>
									</div>
									<div>
										{!isFirstTimeSubmit &&
											singleMapping.label.trim() === '' && (
												<p className="error-message">
													Please enter the field name
												</p>
											)}
									</div>
								</div>
							);
						}
					)}
				</div>

				{singleMappingSection.addMore &&
					isAddIntegrationPermission &&
					Object.values(singleMappingSection.fields).length < 20 && (
						<div className={styles['mapping-box__bottom']}>
							<div onClick={() => addFieldHandler(singleMappingSection.id)}>
								<BlueAddSvg />
								<p className={styles['mapping-box__bottom--add-more']}>
									Add Another Item
								</p>
							</div>
						</div>
					)}
			</div>
		</div>
	);
};

export default MappingBox;
