import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Banner,
  Button,
  Descriptions,
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

const Description = styled.div`
  margin-bottom: 12px;
  font-family: Roboto, PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, Microsoft YaHei,
    微软雅黑, STHeitiSC-Light, simsun, 宋体, WenQuanYi Zen Hei, WenQuanYi Micro Hei, sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.67;
  letter-spacing: normal;
  color: #79879c;
  word-break: break-all;
`;

const DetailInfo = styled.div`
  padding: 12px;

  .detail-title {
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 600;
  }
`;

const List = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [secrets, setSecrets] = useState([]);
  const [editName, setEditName] = useState('');
  const [editSecret, setEditSecret] = useState('');
  const [editSecretFrom, setEditSecretFrom] = useState('');
  const [mapList, setMapList] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [editNamespaces, setEditNamespaces] = useState([]);
  const [form] = useForm();
  const [editForm] = useForm(); 
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

  function updateEdit(s) {
    request.get(`${requestSecretPrefix}sharingsecrets/${s}`).then(
      res => { 
        setEditSecret(`${res ? res.spec.secretRef.name : "-"}`); 
        setEditSecretFrom(`${res ? res.spec.secretRef.namespace : "-"}`)
        var tmp = [];
        for (let i = 0, n = res.spec.target.namespaces.length; i < n; i += 1) {
          tmp.push({ label: res.spec.target.namespaces[i].name});
        }
        setEditNamespaces(tmp);
      } 
    );
  }

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
    form.resetFields();
    setConfirmLoading(false);
    setModalVisible(false);
  };

  const openEditModal = (s) => {
    updateEdit(s);
    updateNamespaces();
    setEditVisible(true);
  };

  const closeEditModal = () => {
    editForm.resetFields();
    setConfirmLoading(false);
    setEditVisible(false);
  }

  const onOk = () => {
    setConfirmLoading(true);
    form.submit();
  };

  const editOk = () => {
    setConfirmLoading(true);
    editForm.submit();
  }

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
      return request.post(`${requestSecretPrefix}sharingsecrets`, sharingSecret);
    },
    {
      onSuccess: data => {
        closeShareModal();
        secretRef.current.refetch();
      },
    },
  );

  const editMutation = useMutation(
    data => {
      var namespace = [];
      for (let i = 0, n = data.targetNamespaces.length; i < n; i += 1) {
        namespace.push({
          "name":`${data.targetNamespaces[i]}`
        });
      };
      var editSharingSecret = {
        apiVersion: "experimental.kubesphere.io/v1alpha1",
        kind: "SharingSecret",
        metadata: {
          name: editName, 
          resourceVersion: "1257340"
        },
        spec: {
          secretRef: {
            name: editSecret,
            namespace: editSecretFrom
          },
          target: {
            namespaces: namespace, 
          },
        },
      };
      return request.put(`${requestSecretPrefix}sharingsecrets/${editName}`, editSharingSecret);
    },
    {
      onSuccess: data => {
        closeEditModal();
        secretRef.current.refetch();
      },
    },
  );

  const getActionMenu = (row) => {
    return (
      <Menu>
        <MenuItem 
          icon={<Pen />} 
          onClick={() => {
            editForm.resetFields();
            setEditName(`${row.metadata.name}`);
            openEditModal(`${row.metadata.name}`);
          }}
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
      title: t('Namespace/Secret'),
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
        onOk={editOk}
      >
        <FormWrapper>
        <Form form={editForm} onFinish={editMutation.mutate}>
          <DetailInfo>
            <div className="detail-title">{t('Name')}</div>
            <Description>{editName}</Description>
          </DetailInfo>
          <DetailInfo>
            <div className="detail-title">{t('Secret from')}</div>
            <Description>{editSecretFrom}</Description>
          </DetailInfo>
          <DetailInfo>
            <div className="detail-title">{t('Already selected')}</div>
            <Descriptions variant="default" data={editNamespaces} />
          </DetailInfo>
          <DetailInfo>
            <div className="detail-title">{t('Reselect')}</div>
            <FormItem
              className="test"
              name="targetNamespaces"
            >
              <Select 
                style={{ width: '500px' }} 
                mode="multiple"
                options={namespaces}
                showArrow
              />
            </FormItem>
          </DetailInfo>  
        </Form>
        </FormWrapper>
      </Modal>
    </>
  );
};

export default List;
