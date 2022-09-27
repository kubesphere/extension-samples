import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { Link, Router } from 'react-router-dom';
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
  useForm,
  notify,
  Field,
  Select,
} from '@kubed/components';
import { Group, More, Pen, Trash } from '@kubed/icons';
import { DataTable, request } from '@ks-console/shared';

const FormWrapper = styled.div`
  padding: 15px 25px;
`;

const List = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [secrets, setSecrets] = useState([]);
  const [mapList, setMapList] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [form] = useForm();
  const secretRef = useRef();
  const requestNamespacePrefix = '/api/v1/';
  const requestSecretPrefix = '/apis/experimental.kubesphere.io/v1alpha1/';

  function updateSecrets() {
    const data = request.get(`${requestNamespacePrefix}secrets`);
    var res = [];
    data.then( response => {
      for (let i = 0, n = response.items.length; i < n; i += 1) {
        res.push({
          label: response.items[i].metadata.name,
          value: response.items[i].metadata.name,
        });
        mapList.push([response.items[i].metadata.name, response.items[i].metadata.namespace]);
      };
      setSecrets(res);
      setMapList(mapList);
    });
    console.log(mapList);
  };

  function updateNamespaces() {
    const data = request.get(`${requestNamespacePrefix}namespaces`);
    var res = [];
    data.then( response => {
      for (let i = 0, n = response.items.length; i < n; i += 1) {
        res.push({
          label: response.items[i].metadata.name,
          value: response.items[i].metadata.name
        });
      }
      setNamespaces(res);
    });
  };

  const deleteMutation = useMutation(
    data => {
      return request.delete(`${requestSecretPrefix}sharingsecrets/${data}`); 
    },
    {
      onSuccess: data => {
        form.resetFields();
        notify.success('Delete Success');
        secretRef.current.refetch();
      },
    },
  );

  const openShareModal = () => {
    updateSecrets();
    updateNamespaces();
    setModalVisible(true);
  };

  const closeShareModal = () => {
    setModalVisible(false);
  };

  const openEditModal = () => {
    setEditVisible(true);
  };

  const closeEditModal = () => {
    setEditVisible(false);
  }

  const onOk = () => {
    setConfirmLoading(true);
    form.submit();
  };

  function searchNamespace(s) {
    for (let i = 0, n = mapList.length; i < n; i += 1) {
      if (s == mapList[i][0]) return mapList[i][1];
    }
  }

  const submitMutation = useMutation(
    data => {
      var namespace = [];
      for (let i = 0, n = data.targetNamespacesName.length; i < n; i += 1) {
        namespace.push({
          "name":`${data.targetNamespacesName[i]}`
        });
      };
      var sharingSecret = {
        kind: "SharingSecret",
        apiVersion: "experimental.kubesphere.io/v1alpha1",
        metadata: {
          name: data.sharingName,
        },
        spec: {
          secretRef: {
            name: data.secretRefName,
            namespace: searchNamespace(data.secretRefName)
          },
          target: {
            namespaces: namespace, 
          },
        },
      };
      console.log(sharingSecret);
      return request.post(`${requestSecretPrefix}sharingsecrets`, sharingSecret);
    },
    {
      onSuccess: data => {
        form.resetFields();
        setConfirmLoading(false);
        closeShareModal();
        secretRef.current.refetch();
      },
    },
  );

  const getActionMenu = row => {
    return (
      <Menu>
        <MenuItem 
          icon={<Pen />} 
          // onClick={() => {
            // editMutation.mutate(row.spec.secretRef);
            // openEditModal();
          // }}
          onClick={openEditModal}
        >
          {t('EDIT')}
        </MenuItem>
        <MenuItem
          icon={<Trash />}
          onClick={() => {
            deleteMutation.mutate(row.metadata.name);
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
      field: 'metadata.name',
      render: (value, row) => (
        <Field value={value} label={row.target} as={Link} to={`/sharing-secret/${row.metadata.name}`} />
      ),
    },
    {
      title: t('Secret'),
      render: (value, row) => (
        <Field value={
          row.spec == undefined ? "-" : row.spec.secretRef.namespace + "/" + row.spec.secretRef.name
        } />        
      ),
    },
    {
      title: '',
      field: 'kind',
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
    <Button color="secondary" shadow onClick={openShareModal}>
      {t('Share')}
    </Button>
  );

  return (
    <>
      <Banner
        icon={<Group />}
        title={t('Sharing Secret')}
        description={t('share secrets between namespaces')}
        className="mb12"
      />
      <DataTable
        ref={secretRef}
        columns={columns}
        tableName="sharing-list"
        rowKey="name"
        url={`${requestSecretPrefix}sharingsecrets`}
        useStorageState={false}
        disableRowSelect={false}
        selectType={false}
        toolbarRight={toolbarRight}
      />
      <Modal
        title={t('Share')}
        visible={modalVisible}
        onCancel={closeShareModal}
        confirmLoading={confirmLoading}
        onOk={onOk}
      >
        <FormWrapper>
          <Form form={form} onFinish={submitMutation.mutate}>
            <FormItem
              className="test"
              name="sharingName"
              label={t('Name')}
              rules={[{ required: true, message: 'Please input a name!' }]}
            >
              <Input />
            </FormItem>
            <FormItem 
              className="test"
              name="secretRefName" 
              label={t('Secret')}
              rules={[{ required: true, message: 'Please select a namespace!' }]}
            >
              <Select 
                style={{ width: '500px' }} 
                options={secrets}
                showSearch
                allowClear
              />
            </FormItem>
            <FormItem 
              className="test" 
              name="targetNamespacesName" 
              label={t('Target')}
            >
              <Select
                style={{ width: '500px' }} 
                mode="multiple"
                options={namespaces}
                showArrow
              />
            </FormItem>
          </Form>
        </FormWrapper>
      </Modal>
      <Modal
        title={t('Edit')}
        visible={editVisible}
        onCancel={closeEditModal}
        confirmLoading={confirmLoading}
        onOk={onOk}
      >
        <FormWrapper>
          <Form form={form} onFinish={submitMutation.mutate}>
            <FormItem
              className="test"
              name="metadata.name"
              label={t('Name')}
            >
              <a>name</a>
            </FormItem>
            <FormItem 
              className="test"
              name="spec.secretRef.name" 
              label={t('Secret')}
            >
              <Select display/>
            </FormItem>
            <FormItem 
              className="test" 
              name="spec.target.namespaces" 
              label={t('Target')}
            >
              <Select
                style={{ width: '500px' }} 
                mode="multiple"
                options={namespaces}
                showArrow
              />
            </FormItem>
          </Form>
        </FormWrapper>
      </Modal>
    </>
  );
};

export default List;
