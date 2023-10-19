import { Modal, Form, Row, Button, Col, Input } from 'antd';
import style from './index.module.scss';
import { CloseSvg } from 'utils/svgs';
import './index.scss'
import TextArea from 'antd/es/input/TextArea';
import { TimeSheetFormData } from './types';
import { useEffect } from 'react';
 
export default function CreateTimeSheetModal({ open, onCancel, onSubmitTimeSheet, timeSheetData, isExisting }: Props) {

    const [form] = Form.useForm();

    const handleCancel = () => {
        onCancel && onCancel();
    };

    const handleSubmit = (data: any) => {
        onSubmitTimeSheet && onSubmitTimeSheet(data);
        form.resetFields();
    };

    useEffect(() => {
        form.setFieldsValue(timeSheetData);
    }, [timeSheetData])

    return (
        <>
            <Modal
                open={open}
                onCancel={handleCancel}
                okText={'Save'}
                closable={false}
                footer={null}
                className="time-sheet-modal profile__popup"
            >
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    autoComplete="off"
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Row className={style['time-sheet-modal__header']}>
                        <div className="userDetailsTitle">
                            <b>{isExisting ? 'Update' : 'Create'} Timesheet</b>
                        </div>
                        <div
                            className={style['time-sheet-modal__header-delete']}
                            onClick={handleCancel}
                        >
                            <CloseSvg />
                        </div>
                    </Row>
                    <hr />
                    <div className="time-sheet-modal__body">
                        <Row style={{ marginBottom: '10px' }} >
                            <Col xs={24} md={8} lg={8} sm={8}  >
                                <p>Timesheet Name*</p>
                            </Col>
                            <Col xs={24} md={16} lg={16} sm={16} >
                                <Form.Item
                                    className="formItem"
                                    wrapperCol={{ span: 24 }}
                                    name={'name'}
                                    required={true}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter timesheet name',
                                            validateTrigger: 'onChange',
                                        }
                                    ]}
                                >
                                    <Input
                                        size="large"
                                        type={'text'}
                                    // defaultValue={userProfileData[item?.name]}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={24} md={8} lg={8} sm={8} >
                                <p>Notes</p>
                            </Col>
                            <Col xs={24} md={16} lg={16} sm={16} >
                                <Form.Item
                                    className="formItem"
                                    wrapperCol={{ span: 24 }}
                                    name={'notes'}
                                >
                                    <TextArea
                                        rows={4}
                                        style={{
                                            width: '100%'
                                        }}
                                    // defaultValue={userProfileData[item?.name]}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <hr />
                    <div className="time_sheet_modal_footer">
                        <Row justify="start" className="footerbtns" gutter={16}>
                            <Col xs={12} md={7} lg={7} sm={8}>
                                <Button className="cancel" block={true} onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={12} md={7} lg={7} sm={8}>
                                <Button
                                    className={`save`}
                                    htmlType="submit"
                                // size='small'
                                >
                                    {isExisting ? 'Update' : 'Create'} Timesheet
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Modal>
        </>
    )
}

interface Props {
    open: boolean,
    onCancel: () => void;
    timeSheetData: TimeSheetFormData;
    onSubmitTimeSheet: (data: TimeSheetFormData) => void;
    isExisting: boolean;
}