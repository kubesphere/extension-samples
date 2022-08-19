import React from 'react';
import ListLayout from '../components/ListLayout';
import List from '../containers/List';
import Deleted from '../containers/Deleted';
import Detail from '../containers/Detail';

export default [
  {
    path: '/employee',
    element: <ListLayout />,
    children: [
      {
        path: '/employee/list',
        element: <List />,
      },
      {
        path: '/employee/deleted',
        element: <Deleted />,
      },
    ],
  },
  {
    path: '/employee/:id',
    element: <Detail />,
  },
];
