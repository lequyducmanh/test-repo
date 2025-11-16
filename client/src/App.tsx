import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './core/theme/theme';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { RoomsPage } from './pages/Rooms';
import { TenantsPage } from './pages/Tenants';
import { ContractsPage } from './pages/Contracts';
import { ServicesPage } from './pages/Services';
import { UtilityReadingsPage } from './pages/UtilityReadings';
import { MaintenancePage } from './pages/Maintenance';
import { UserManagementPage } from './features/users';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='rooms' element={<RoomsPage />} />
            <Route path='tenants' element={<TenantsPage />} />
            <Route path='contracts' element={<ContractsPage />} />
            <Route path='services' element={<ServicesPage />} />
            <Route path='utility-readings' element={<UtilityReadingsPage />} />
            <Route path='maintenance' element={<MaintenancePage />} />
            <Route path='users' element={<UserManagementPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
