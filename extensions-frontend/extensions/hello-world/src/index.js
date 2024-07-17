import routes from './routes';
import locales from './locales';

const menus = [
  {
    parent: 'topbar',
    name: 'hello-world',
    title: 'HELLO_WORLD',
    icon: 'cluster',
    order: 0,
    desc: 'Say hi to the world!',
    skipAuth: true,
  },
];

const extensionConfig = {
  routes,
  menus,
  locales,
};

export default extensionConfig;
