/* eslint-disable no-mixed-spaces-and-tabs */
import { Input, Modal } from 'antd';
import { SaveCancelButtons } from 'components/Global';
import { useEffect, useState } from 'react';
import './index.css';
import styles from './index.module.scss';
import { calculatorTypes } from './types';
import { toastText } from 'utils/utils';

const CalculatorModal = (props: calculatorTypes) => {
	const {
		isModalOpen,
		handleOk,
		handleCancel,
		calculatorDefaultData,
		// defaultValue,
		sectionWiseFields,
		changeHandler,
	} = props;

	const {
		title,
		employee,
		costCategory,
		ytdCost,
		newTotalAnnualCost,
		// remainingHoursUnderLimit,
	} = calculatorDefaultData;

	const [hours, setHours] = useState<any>(0);

	useEffect(() => {
		sectionWiseFields.forEach((singleSection: any) => {
			singleSection.fields.forEach((singleField: any) => {
				if (singleSection.no === 0 && singleField.jsonId === 'f2') {
					setHours(
						Number(
							calculatorDefaultData.employeeData[singleField.id].split(':')[0]
						) || 0
					);
				}
			});
		});
	}, []);

	const [data, setData] = useState({
		title: '',
		employee: '',
		costCategory: '',
		value: '',
		ytdCost: 0,
		newTotalAnnualCost: 0,
		remainingCost: 0,
		remainingHoursUnderLimit: 0,
		originalRate: '--',
		newEffectiveRate: 0,
	});

	useEffect(() => {
		const data: any = {
			title: title,
			employee: employee,
			costCategory: costCategory,
			value: calculatorDefaultData.value,
			ytdCost: ytdCost,
			newTotalAnnualCost: newTotalAnnualCost,
			remainingCost: Number(newTotalAnnualCost) - Number(ytdCost),
			remainingHoursUnderLimit: hours,
			originalRate: '--',
			newEffectiveRate:
				hours === 0
					? 0
					: (Number(newTotalAnnualCost) - Number(ytdCost)) / Number(hours),
		};

		if (calculatorDefaultData?.value !== '0.00' && hours !== 0) {
			const newValue = calculatorDefaultData?.value?.replace(/,/g, '');

			const remainingCost: string = Number(
				Number(newValue) * Number(hours)
			).toFixed(2);

			const annualCost: string = Number(
				Number(newValue) * Number(hours) +
					Number(calculatorDefaultData?.ytdCost)
			).toFixed(2);

			data['remainingCost'] = remainingCost;
			data['newEffectiveRate'] = newValue;
			data['newTotalAnnualCost'] = annualCost;
		}

		setData(data);
	}, [hours]);

	const handleNewTotalAnnualCost = (event: any) => {
		const value = event.target.value;

		setData((prev: any) => {
			return {
				...prev,
				value: value,
				newTotalAnnualCost: value,
				remainingCost: Number(value) - Number(prev.ytdCost),
				newEffectiveRate:
					hours === 0
						? 0
						: Number(
								(Number(value) - Number(prev.ytdCost)) /
									Number(prev.remainingHoursUnderLimit)
						  ).toFixed(2),
			};
		});
	};

	// For perform the save operation
	const saveClickHandler = () => {
		if (hours) {
			handleOk();
			changeHandler(
				calculatorDefaultData.index,
				calculatorDefaultData.singleColumn.key,
				String(data.newEffectiveRate),
				'number',
				true
			);
		} else {
			toastText('Maximum allocate hours required', 'error');
			// changeHandler();
		}
	};

	return (
		<div className={styles['calculator_modal']}>
			<Modal
				title={`Calculate Rate for '${data?.title}'`}
				open={isModalOpen}
				// onOk={handleOk}
				onCancel={handleCancel}
				footer={[
					<SaveCancelButtons
						key="buttons"
						saveHandler={saveClickHandler}
						cancelHandler={handleCancel}
						loadingForSave={false}
						saveTitle="Save"
						cancelTitle="Cancel"
					/>,
				]}
			>
				<hr />
				<div className={styles['calculator_modal__body']}>
					<p className={styles['calculator_modal__body-line']}>
						<span>Employee:</span>
						<span>{data?.employee}</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>Cost Category:</span>
						<span>{data?.title}</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>a. YTD Cost Allocated/Posted:</span>{' '}
						<span>$ {data?.ytdCost}</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>b. New Total Annual Cost Expectation:</span>
						<span
							className={`${styles['calculator_modal__body-line-input']} calculator-input`}
						>
							<Input
								type="number"
								onChange={handleNewTotalAnnualCost}
								prefix="$"
								value={data?.newTotalAnnualCost}
								defaultValue={data?.newTotalAnnualCost}
								size="large"
								min={1}
								className={styles['popup-input']}
							/>
						</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>c. Remaining Cost to Allocate:</span>{' '}
						<span>$ {data?.remainingCost}</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>d. Remaining Hours Under Limit</span>
						<span>{hours}</span>
					</p>
					<p className={styles['calculator_modal__body-line']}>
						<span>e. Original Rate</span> <span>{data?.originalRate}</span>
					</p>
					<p className={styles['calculator_modal__body-final']}>
						<span>New Effective Rate </span>
						<span>{data?.newEffectiveRate}</span>
					</p>
				</div>
				<hr />
			</Modal>
		</div>
	);
};

export default CalculatorModal;
