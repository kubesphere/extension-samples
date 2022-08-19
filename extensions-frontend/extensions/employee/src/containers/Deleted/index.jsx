import React, { useRef } from 'react';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { Banner, Button, Menu, MenuItem, Dropdown, notify, Field } from '@kubed/components';
import { Group, More, Trash } from '@kubed/icons';
import { DataTable, request } from '@ks-console/shared';

const Deleted = () => {
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

  const getActionMenu = row => {
    return (
      <Menu>
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

  return (
    <>
      <Banner
        icon={<Group />}
        title={t('EMPLOYEE_DELETED')}
        description={t('EMPLOYEE_DESC')}
        className="mb12"
      />
      <DataTable
        ref={tableRef}
        columns={columns}
        tableName="employee-deleted"
        rowKey="name"
        url={`${requestUrlPrefix}employees?deleted=1`}
        useStorageState={false}
        disableRowSelect={false}
        selectType={false}
      />
    </>
  );
};

export default Deleted;
