import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './components/UserManagement';

const UserManagementPage = () => {
  const { token } = useAuth();

  return <UserManagement token={token} />;
};

export default UserManagementPage;
