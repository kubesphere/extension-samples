import routes from './routes';

const menus = [
  {
    parent: 'global',
    name: 'external-link',
    title: 'External Link',
    icon: 'cluster',
    order: 0,
    desc: 'Hello external-link',
    skipAuth: true,
  },
];

const extensionConfig = { routes, menus };

export default extensionConfig;
