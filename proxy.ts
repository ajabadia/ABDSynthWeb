import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
 
const proxy = createMiddleware(routing);

export default proxy;
export { proxy };

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es|en)/:path*']
};
