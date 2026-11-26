import AdminGuard from '../../components/Admin/AdminGuard';

export const metadata = {
  title: 'Host & Admin Console',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
