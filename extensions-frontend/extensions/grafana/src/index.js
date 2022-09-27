import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'topbar',
  name: 'grafana',
  title: 'Grafana',
  icon: 'cluster',
  order: 0,
  desc: 'Grafana',
  skipAuth: true,
};

const extensionConfig = {
  routes,
  menus: [menu],
  locales,
};

globals.context.registerExtension(extensionConfig);
