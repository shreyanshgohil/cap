import { Modal } from 'antd';
import { FC } from 'react';
import { CloseSvg, DeleteSvg } from 'utils/svgs';
import styles from './index.module.scss';
import { ConfirmDeleteProps } from './types';

// ConfirmDelete popup
const ConfirmDelete: FC<ConfirmDeleteProps> = (props) => {
	// Inits
	const {
		handleCancel,
		handleOk,
		isModalOpen,
		deleteHandler,
		isLoading,
		deleteMessage = 'Delete?',
	} = props;

	// for delete the selected value
	// const deleteItemHandler = () => {
	// 	toastText('User deleted successfully', 'success');
	// 	handleCancel();
	// };

	//   JSX
	return (
		<Modal
			title={
				<div className={styles['confirm-delete-model']}>
					<DeleteSvg />
					<h4 className={styles['confirm-delete-model__title']}>
						Are you sure want to{' '}
						<span className={styles['confirm-delete-model__title--delete']}>
							{deleteMessage}
						</span>
					</h4>
				</div>
			}
			open={isModalOpen}
			onOk={handleOk}
			onCancel={handleCancel}
			centered={true}
			width={380}
			closeIcon={<CloseSvg />}
			footer={[
				<div key={'wrapper'} className={styles['confirm-delete-model__button']}>
					<button
						key="ok"
						className={`${styles['confirm-delete-model__button--save']} ${
							styles['confirm-delete-model__button--btn']
						} ${isLoading && 'pointer-event-none'}`}
						onClick={deleteHandler}
					>
						{isLoading ? (
							<img src="assets/gifs/loading-black.gif" height={40} />
						) : (
							'Yes! Delete'
						)}
					</button>
					<button
						key="cancel"
						onClick={handleCancel}
						className={`${styles['confirm-delete-model__button--cancel']} ${styles['confirm-delete-model__button--btn']}`}
					>
						Cancel
					</button>
				</div>,
			]}
		></Modal>
	);
};

export default ConfirmDelete;
