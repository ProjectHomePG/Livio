import { redirect } from 'next/navigation';
import { AUTH_ENABLED } from '../../config';

export const metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }) {
  if (!AUTH_ENABLED) {
    redirect('/');
  }
  return children;
}
