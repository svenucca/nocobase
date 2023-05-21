import pkg from '../../package.json' assert { type: 'json' };

export { default } from './Plugin';
export type { Interceptor } from './Plugin';
export * from './constants';
export { Provider } from './providers';

export const namespace = pkg.name;
