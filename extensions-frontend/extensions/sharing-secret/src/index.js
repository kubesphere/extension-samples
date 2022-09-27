import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'topbar',
  name: 'sharing-secret',
  link: '/sharing-secret/list',
  title: 'Sharing Secret',
  icon: 'cluster',
  order: 0,
  desc: 'Sharing secrets between namespaces',
  skipAuth: true,
};

const extensionConfig = {
  routes,
  menus: [menu],
  locales,
};

globals.context.registerExtension(extensionConfig);
