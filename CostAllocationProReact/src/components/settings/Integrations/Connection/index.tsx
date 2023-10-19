import IntegrationCard from 'components/Global/IntegrationCard';
import React from 'react';
import { Col, Row } from 'antd';
import { integrationsCards } from 'constants/Data';
import styles from './index.module.scss';
import { getApi } from 'redux/apis';
import { toastText } from 'utils/utils';

const Connection = () => {
	const connectionHandler = () => {
		getApi('/quickbooks/authurl')
			.then((res) => {
				window.open(res.data.data, '_self');
			})
			.catch(() => {
				toastText('Something went wrong', 'error');
			});
	};

	return (
		<Row gutter={16} className={styles['']}>
			{integrationsCards?.map((card, index) => {
				return (
					<Col
						key={index}
						className="gutter-row"
						xl={8}
						lg={8}
						md={12}
						sm={12}
						xs={24}
					>
						<IntegrationCard
							title={card?.title}
							buttonText={card?.buttonText}
							logo={card?.logo}
							ghost={card?.ghost}
							onClick={connectionHandler}
						/>
					</Col>
				);
			})}
		</Row>
	);
};

export default Connection;
