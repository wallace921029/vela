import TimeWeatherWidget from './components/TimeWeatherWidget';
import SearchBar from './components/SearchBar';
import NavModule from './components/NavModule';
import { DashboardSettings } from './components/DashboardSettings';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-12 relative min-h-screen">
      <DashboardSettings />
      <div className="mx-auto max-w-6xl">
        <TimeWeatherWidget />
        <SearchBar />
        <NavModule />
      </div>
    </div>
  );
};

export default Dashboard;
