import { Card, Image } from 'antd';
import styles from './index.module.scss';
import { IntegrationCardInterface } from './types';
import './index.scss';
import { ConnectToQuickbooks } from 'utils/svgs';

const IntegrationCard = (props: IntegrationCardInterface) => {
	return (
		<Card bordered={false} className={styles.integration__card}>
			<div className={styles.integration__card__image}>
				<Image preview={false} src={props?.logo} />
			</div>
			<div className={styles.integration__card__details}>
				{/* <p className={styles.integration__card__company}>Company:</p> */}
				<p className={styles.integration__card__connect}>{props?.title}</p>
				<div
					onClick={props?.onClick}
					className={styles.integration__card__button}
				>
					<ConnectToQuickbooks />
				</div>
				{/* <Button
					type="primary"
					className={styles.integration__card__button}
					ghost={props?.ghost}
					onClick={props?.onClick}
				>
					{props?.buttonText}
				</Button> */}
			</div>
		</Card>
	);
};

export default IntegrationCard;
