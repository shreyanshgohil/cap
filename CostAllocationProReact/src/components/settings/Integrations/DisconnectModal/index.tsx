import { Image, Modal } from 'antd';
import { ConnectToQuickbooks } from 'utils/svgs';
import styles from './index.module.scss';
import './index.scss';
import { DisconnectModalInterface } from './types';

const DisconnectModal = (props: DisconnectModalInterface) => {
	const {
		isModalOpen,
		handleOk,
		handleCancel,
		buttonText,
		text,
		buttonColor,
		image,
		isLoading,
		isReconnect,
	} = props;

	return (
		<div>
			<Modal
				open={isModalOpen}
				onOk={handleOk}
				onCancel={handleCancel}
				footer={[
					<div className={styles['modal-body__buttons']} key={Math.random()}>
						{isReconnect ? (
							<div
								onClick={handleOk}
								className={styles.integration__card__button}
							>
								<ConnectToQuickbooks />
							</div>
						) : (
							<>
								<button
									key="submit"
									className={`${styles[`modal-body__buttons--${buttonColor}`]}  
							} ${isLoading && 'pointer-event-none'}`}
									onClick={handleOk}
								>
									{isLoading ? (
										<img src="assets/gifs/loading-black.gif" height={40} />
									) : (
										buttonText
									)}
								</button>
								<button
									key="cancel"
									className={styles['modal-body__buttons--cancel']}
									onClick={handleCancel}
								>
									No
								</button>
							</>
						)}
					</div>,
				]}
			>
				<div className={styles['modal-body']}>
					<Image
						className={
							isReconnect
								? styles['modal-body__image_reconnect']
								: styles['modal-body__image']
						}
						src={image}
						preview={false}
					/>
					{!isReconnect && <p className={styles['modal-body__text']}>{text}</p>}
				</div>
			</Modal>
		</div>
	);
};

export default DisconnectModal;
