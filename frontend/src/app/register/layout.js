import { redirect } from 'next/navigation';
import { AUTH_ENABLED } from '../../config';

export const metadata = {
  title: 'Create Account',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }) {
  if (!AUTH_ENABLED) {
    redirect('/');
  }
  return children;
}
