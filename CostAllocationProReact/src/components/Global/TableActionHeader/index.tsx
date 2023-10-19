import { FC } from 'react';
import style from './index.module.scss';
import { TableActionHeaderProps } from './types';
import { Col, Row } from 'antd';

// Creating the global action component for table
const TableActionHeader: FC<TableActionHeaderProps> = (props) => {
	// Inits
	const { title, children } = props;
	// JSX
	return (
		<div className={style['table-action-header']}>
			<Row
				className={style['table-action-header__wrapper']}
				align={'middle'}
				justify={'space-between'}
			>
				<Col className={style['table-action-header__title']}>
					<h3>{title}</h3>
				</Col>
				<Col className={style['table-action-header__actions']}>{children}</Col>
			</Row>
		</div>
	);
};

export default TableActionHeader;
