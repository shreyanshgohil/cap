import styles from './index.module.scss';

// For the loader
const Loader = () => {
	return (
		<div className={styles['loader']}>
			<img
				src="/assets/gifs/table-loader.gif"
				alt="loader"
				className={styles['loader--svg']}
			/>
		</div>
	);
};

export default Loader;
