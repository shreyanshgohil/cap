import { Form, Input } from 'antd';
import { FC, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { ingleUserInputInputWithLabelAndSvgProps } from './types';
// For create the dynamic input component
const InputWithLabelAndSvg: FC<ingleUserInputInputWithLabelAndSvgProps> = (
	props
) => {
	// Inits
	const { singleUserInput, disabled, focus = false } = props;
	const inputRef = useRef<HTMLInputElement>(null);

	const initialCall = () => {
		if (focus && inputRef.current) {
			inputRef.current.focus();
		}
	};

	useEffect(() => {
		initialCall();
	}, [inputRef]);

	// JSX
	return (
		<div className={styles['input-icon']}>
			<div className={styles['input-icon__title']}>
				{singleUserInput.svg && (
					<div className={styles['input-icon__title--svg']}>
						{singleUserInput.svg}
					</div>
				)}
				<label className={styles['input-icon__title--label']}>
					{singleUserInput.title}{' '}
					{singleUserInput?.required && (
						<span className="required-color">*</span>
					)}
				</label>
			</div>
			<div className={styles['input-icon__form']}>
				<Form.Item name={singleUserInput.name} rules={singleUserInput.rules}>
					{(singleUserInput.type === 'text' ||
						singleUserInput.type === 'number') && (
						<Input
							placeholder={singleUserInput.placeHolder}
							size="large"
							className={styles['input-icon__form--input']}
							type={singleUserInput.type}
							disabled={disabled ? disabled : false}
							ref={inputRef as any}
						/>
					)}

					{singleUserInput.type === 'password' && (
						<Input.Password
							placeholder={singleUserInput.placeHolder}
							size="large"
							className={styles['input-icon__form--input']}
						/>
					)}
				</Form.Item>
			</div>
		</div>
	);
};

export default InputWithLabelAndSvg;
