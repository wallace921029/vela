import { useAuth } from '@/contexts/AuthContext';
import InviteCodeManagement from './components/InviteCodeManagement';

const InviteCodeManagementPage = () => {
  const { token } = useAuth();

  return <InviteCodeManagement token={token} />;
};

export default InviteCodeManagementPage;
