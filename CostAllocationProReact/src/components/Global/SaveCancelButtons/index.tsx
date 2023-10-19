import { Form } from 'antd';
import styles from './index.module.scss';
import { FC } from 'react';
import { SaveCancelButtonsProps } from './types';

// For save and cancel button
const SaveCancelButtons: FC<SaveCancelButtonsProps> = (props) => {
	// Inits
	const {
		cancelHandler,
		saveHandler,
		loadingForSave = false,
		loadingForCancel = false,
		saveTitle,
		cancelTitle,
	} = props;
	// JSX
	return (
		<div className={styles.buttons}>
			<Form.Item>
				<button
					className={`${styles['buttons__btn']} ${
						styles['buttons__btn--save']
					} ${loadingForSave && 'pointer-event-none'}`}
					onClick={saveHandler}
				>
					{loadingForSave ? (
						<img src="/assets/gifs/loading-black.gif" height={40} />
					) : (
						saveTitle
					)}
				</button>
			</Form.Item>
			<Form.Item>
				<button
					className={`${styles['buttons__btn']} ${styles['buttons__btn--cancel']}`}
					onClick={cancelHandler}
				>
					{loadingForCancel ? (
						<img src="/assets/gifs/loading-black.gif" height={40} />
					) : (
						cancelTitle
					)}
				</button>
			</Form.Item>
		</div>
	);
};

export default SaveCancelButtons;
