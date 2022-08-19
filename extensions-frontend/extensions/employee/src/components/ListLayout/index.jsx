import React from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { NavTitle, NavMenu } from '@ks-console/shared';
import { Group } from '@kubed/icons';

const PageSide = styled.div`
  position: fixed;
  top: 88px;
  padding: 0 20px 40px;
  width: 260px;
  z-index: 99;
`;

const PageMain = styled.div`
  margin-left: 240px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ListLayout = () => {
  const location = useLocation();
  const navs = [
    {
      name: 'employee',
      children: [
        {
          name: 'list',
          icon: 'human',
          skipAuth: true,
          title: 'Employee',
        },
        {
          name: 'deleted',
          icon: 'bird',
          skipAuth: true,
          title: 'EMPLOYEE_DELETED',
        },
      ],
    },
  ];

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Group variant="light" size={40} />}
          title={t('EMPLOYEE_MANAGEMENT')}
          style={{ marginBottom: '20px' }}
        />
        <NavMenu navs={navs} pathname={location.pathname} prefix="/employee" />
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
};

export default ListLayout;
