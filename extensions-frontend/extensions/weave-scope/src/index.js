import routes from './routes';
import locales from './locales';

const menus = [
  {
    parent: 'topbar',
    name: 'weave-scope',
    title: 'Weave Scope',
    icon: 'cluster',
    order: 0,
    desc: 'Weave Scope',
    skipAuth: true,
  }
];

const extensionConfig = {
  routes,
  menus,
  locales,
};

export default extensionConfig;
