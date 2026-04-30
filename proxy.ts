import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

const handleIntl = createMiddleware(routing);

export default function proxy(request: any) {
  return handleIntl(request);
}

export const config = {
  matcher: ['/', '/(es|en)/:path*']
};
