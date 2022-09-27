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
      name: 'sharing secret',
      children: [
        {
          name: 'list',
          icon: 'human',
          skipAuth: true,
          title: 'Secret',
        },
      ],
    },
  ];

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Group variant="light" size={40} />}
          title={t('Sharing Secret')}
          style={{ marginBottom: '20px' }}
        />
        <NavMenu navs={navs} pathname={location.pathname} prefix="/sharing-secret" />
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
};

export default ListLayout;
