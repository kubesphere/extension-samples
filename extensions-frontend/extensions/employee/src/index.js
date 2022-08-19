import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'employee',
  link: '/employee/list',
  title: 'EMPLOYEE_MANAGEMENT',
  icon: 'cluster',
  order: 0,
  desc: 'Employee management system',
  skipAuth: true,
};

const pluginConfig = {
  routes,
  menus: [menu],
  locales,
};

globals.context.registerExtension(pluginConfig);
