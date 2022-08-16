import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Banner,
  Button,
  Menu,
  MenuItem,
  Dropdown,
  Modal,
  Form,
  FormItem,
  Input,
  InputNumber,
  useForm,
  notify,
  Field,
} from '@kubed/components';
import { Group, More, Pen, Trash } from '@kubed/icons';
import { DataTable, request } from '@ks-console/shared';

const FormWrapper = styled.div`
  padding: 15px 25px;
`;

const List = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = useForm();
  const tableRef = useRef();
  const requestUrlPrefix = '/kapis/employee.kubesphere.io/v1alpha1/';

  const deleteMutation = useMutation(
    data => {
      return request.delete(`${requestUrlPrefix}employee/${data}`);
    },
    {
      onSuccess: data => {
        if (data.message === 'Success') {
          notify.success('Delete Success');
          tableRef.current.refetch();
        }
      },
    },
  );

  const openAddModal = () => {
    setModalVisible(true);
  };

  const closeAddModal = () => {
    setModalVisible(false);
  };

  const onOk = () => {
    setConfirmLoading(true);
    form.submit();
  };

  const submitMutation = useMutation(
    data => {
      return request.post(`${requestUrlPrefix}employee`, data);
    },
    {
      onSuccess: data => {
        if (data.message === 'Success') {
          form.resetFields();
          setConfirmLoading(false);
          closeAddModal();
          tableRef.current.refetch();
        }
      },
    },
  );

  const getActionMenu = row => {
    return (
      <Menu>
        <MenuItem icon={<Pen />}>{t('EDIT')}</MenuItem>
        <MenuItem
          icon={<Trash />}
          onClick={() => {
            deleteMutation.mutate(row.id);
          }}
        >
          {t('DELETE')}
        </MenuItem>
      </Menu>
    );
  };

  const columns = [
    {
      title: t('Name'),
      field: 'name',
      render: (value, row) => (
        <Field value={value} label={row.email} as={Link} to={`/employee/${row.id}`} />
      ),
    },
    {
      title: t('Age'),
      field: 'age',
    },
    {
      title: t('Email'),
      field: 'email',
    },
    {
      title: '',
      field: 'id',
      render: (value, row) => (
        <Dropdown content={getActionMenu(row)}>
          <Button variant="text">
            <More />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const toolbarRight = (
    <Button color="secondary" shadow onClick={openAddModal}>
      {t('ADD')}
    </Button>
  );

  return (
    <>
      <Banner
        icon={<Group />}
        title={t('EMPLOYEE_MANAGEMENT')}
        description={t('EMPLOYEE_DESC')}
        className="mb12"
      />
      <DataTable
        ref={tableRef}
        columns={columns}
        tableName="employee-list"
        rowKey="name"
        url={`${requestUrlPrefix}employees`}
        useStorageState={false}
        disableRowSelect={false}
        selectType={false}
        toolbarRight={toolbarRight}
      />
      <Modal
        title={t('ADD')}
        visible={modalVisible}
        onCancel={closeAddModal}
        confirmLoading={confirmLoading}
        onOk={onOk}
      >
        <FormWrapper>
          <Form form={form} onFinish={submitMutation.mutate}>
            <FormItem
              className="test"
              name="name"
              label={t('Name')}
              help={t('NAME_HELP')}
              rules={[{ required: true, message: 'Please input employee name!' }]}
            >
              <Input />
            </FormItem>
            <FormItem className="test" name="age" label={t('Age')}>
              <InputNumber />
            </FormItem>
            <FormItem className="test" name="email" label={t('Email')}>
              <Input />
            </FormItem>
          </Form>
        </FormWrapper>
      </Modal>
    </>
  );
};

export default List;
