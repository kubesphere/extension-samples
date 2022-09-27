import React from 'react';
import ListLayout from '../components/ListLayout';
import Detail from '../containers/Detail';
import List from '../containers/List'

export default [
  {
    path: '/sharing-secret',
    element: <ListLayout />,
    children: [
      {
        path: '/sharing-secret/list',
        element: <List />,
      },
    ],
  },
  {
    path: '/sharing-secret/:name',
    element: <Detail />
  },
];
