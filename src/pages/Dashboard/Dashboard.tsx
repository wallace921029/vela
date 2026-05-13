import TimeWeatherWidget from '@/components/dashboard/TimeWeatherWidget';
import SearchBar from '@/components/dashboard/SearchBar';
import NavModule from '@/components/dashboard/NavModule';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-12 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <TimeWeatherWidget />
        <SearchBar />
        <NavModule />
      </div>
    </div>
  );
};

export default Dashboard;
