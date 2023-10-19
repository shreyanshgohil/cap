import { Col, Row } from 'antd';
import { FC, useEffect } from 'react';
import { CloseSvg } from 'utils/svgs';
import styles from './index.module.scss';
import { SideDrawerProps } from './types';
// For handle the side drawer

// Created the wrapper for the side drawer
const SideDrawerWrapper: FC<SideDrawerProps> = (props) => {
	// Inits
	const {
		children,
		isOpen,
		closeDrawerByAnimation,
		removeDrawerFromDom,
		headerTitle,
		position,
		width,
		// editSelectedRole,
		// setEditSelectedRole,
	} = props;
	//for handle the key press of keyboard
	const keyPressHandler = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeDrawerByAnimation();
		}
	};

	// use effect for the close the on the sideDrawer on the esc button click
	useEffect(() => {
		window.addEventListener('keydown', keyPressHandler);
		return () => window.removeEventListener('keydown', keyPressHandler);
	});
	// JSX
	return (
		<>
			<div
				className={`${'stop-scroll-x'} ${`${
					width === 'full' ? styles.full : styles.half
				} ${styles['side-drawer']}`} ${
					position === 'bottom'
						? isOpen
							? styles['slide-top']
							: styles['slide-bottom']
						: isOpen
						? styles['slide-in']
						: styles['slide-out']
				}`}
				onAnimationEnd={() => {
					!isOpen && removeDrawerFromDom();
				}}
			>
				<Row
					className={styles['side-drawer__header']}
					justify={'space-between'}
					align={'middle'}
				>
					<Col>
						<h4 className={styles['side-drawer__header--heading']}>
							{headerTitle}
						</h4>
					</Col>
					<Col>
						<div
							className={styles['side-drawer__header--close-icon']}
							onClick={closeDrawerByAnimation}
						>
							<CloseSvg />
						</div>
					</Col>
				</Row>
				<div className={styles['side-drawer__body']}>{children}</div>
			</div>
			<div
				className={styles['side-drawer__backdrop']}
				onClick={closeDrawerByAnimation}
			/>
		</>
	);
};

export default SideDrawerWrapper;
