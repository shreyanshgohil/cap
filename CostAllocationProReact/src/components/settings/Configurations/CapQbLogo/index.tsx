import { useSelector } from 'react-redux';
import styles from './index.module.scss';
// Configuration logo
const CapQbLogo = () => {
	// INITS

	const companyName = useSelector(
		(state: any) =>
			state?.companies?.selectedCompanyDetails?.company?.tenantName
	);
	// Jsx
	return (
		<div className={styles['cap-qb']}>
			<div className={styles['cap-qb__main_wrapper']}>
				<div className={styles['cap-qb__wrapper']}>
					<div>
						<img
							src="/assets/images/cap-logo.png"
							alt="cap-logo"
							className={styles['cap-qb__cap-logo']}
						/>
					</div>
					<div>
						<img
							src="/assets/images/quickbooks-logo.png"
							alt="qb-logo"
							className={styles['cap-qb__qb-logo']}
						/>
					</div>
				</div>
			</div>
			<p>Company: {companyName}</p>
		</div>
	);
};

export default CapQbLogo;
