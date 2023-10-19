import { Next, Previous } from 'utils/svgs';
import styles from './index.module.scss'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { AppDispatch } from 'redux/store';
import { payPeriodOptionsAction } from 'redux/action/payPeriodAction';
import moment from 'moment';

export default function PayPeriodFilter({ onChangePayPeriodId, payPeriodId }: PayPeriodFilterProps) {

    console.log('payperiod', payPeriodId);

    const dispatch = useDispatch<AppDispatch>();

    const [payPeriodIndex, setPayPeriodIndex] = useState(-1);

    const payPeriods = useSelector((state: any) => state?.payPeriods?.optionData);

    console.log(payPeriods);

    useEffect(() => {
        dispatch(payPeriodOptionsAction())
    }, [])

    useEffect(() => {
        if (payPeriodId) {
            const index = payPeriods.findIndex(
                (singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
            );
            console.log(index);
            setPayPeriodIndex(index > 0 ? index : 0);
        }
    }, [payPeriodId])

    const previousPayPeriodHandler = () => {
        if (payPeriods && payPeriods.length > 0) {
            const index = payPeriods.findIndex(
                (singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
            );

            if (payPeriods[index - 1]) {
                onChangePayPeriodId(payPeriods[index - 1]?.id);
                // setPayPeriodIndex(index);
            }
        }
    };

    const nextPayPeriodHandler = () => {
        if (payPeriods && payPeriods.length > 0) {
            const index = payPeriods.findIndex(
                (singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
            );
            console.log(index);
            if (payPeriods[index + 1]) {
                onChangePayPeriodId(payPeriods[index + 1]?.id);
                // setPayPeriodIndex(index);
            }
        }
    };

    return (
        <div className={styles['search-filter-main-pay-period']}>
            <div
                className={`${styles[`search-filter-main-prev`]} ${(!payPeriodId || payPeriodIndex <= 0) ? 'pointer-event-none' : ''}`}
                onClick={previousPayPeriodHandler}
            >
                <Previous />
                Prev
            </div>
            <div className={`${styles['payPeriod-display']} ${payPeriods[payPeriodIndex] ? '' : styles['gray']}`} >
                {
                    payPeriods[payPeriodIndex] ?
                        `${moment(payPeriods[payPeriodIndex].startDate).format('MM/DD/YYYY')} - ${moment(payPeriods[payPeriodIndex].endDate).format('MM/DD/YYYY')}` :
                        'Select PayPeriod'
                }
            </div>
            <div
                className={`${styles[`search-filter-main-next`]} ${payPeriods &&
                    (payPeriods.length === 0 || payPeriods.length === 1)
                    ? 'pointer-event-none'
                    : ''
                    }
								${payPeriodIndex == payPeriods.length - 1 && 'pointer-event-none'}
							`}
                onClick={nextPayPeriodHandler}
            >
                Next
                <Next />
            </div>
        </div>
    )
}

interface PayPeriodFilterProps {
    payPeriodId: string | null;
    onChangePayPeriodId: (payPeriodId: string) => void;
}