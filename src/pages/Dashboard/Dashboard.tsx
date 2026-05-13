import TimeWeatherWidget from './components/TimeWeatherWidget';
import SearchBar from './components/SearchBar';
import NavModule from './components/NavModule';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        <TimeWeatherWidget />
        <SearchBar />
        <NavModule />
      </div>
    </div>
  );
};

export default Dashboard;
