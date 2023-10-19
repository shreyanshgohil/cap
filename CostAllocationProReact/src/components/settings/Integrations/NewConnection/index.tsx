import { Button, Image, Typography } from 'antd';
import styles from './index.module.scss';
import { NewConnectionInterface } from './types';
const { Title } = Typography;

const NewConnection = (props: NewConnectionInterface) => {
	const { setIsNewConnection } = props;

	const handleNewConnection = () => {
		setIsNewConnection(false);
	};

	return (
		<div className={styles['main-container']}>
			<div className={styles['image-container']}>
				<Image
					src={'/assets/images/add-new-connection.png'}
					className={styles['image-container__image']}
					preview={false}
				/>
				<Title level={3} className={styles['image-container__image-text']}>
					You don&lsquo;t have any Connection now?
				</Title>
				<Button
					type="primary"
					className={styles['image-container__button']}
					onClick={handleNewConnection}
				>
					+ New Connection
				</Button>
			</div>
		</div>
	);
};

export default NewConnection;
