import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

interface DashboardData {
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: string;
  };
  tenants: {
    total: number;
    active: number;
  };
  contracts: {
    total: number;
    active: number;
    draft: number;
    expiring: number;
  };
  revenue: {
    monthly: number;
  };
  maintenance: {
    pending: number;
    inProgress: number;
    total: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getOverview();
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  if (!data) {
    return <Alert severity='info'>No data available</Alert>;
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card>
      <CardContent>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
        >
          <Box>
            <Typography color='textSecondary' gutterBottom variant='body2'>
              {title}
            </Typography>
            <Typography variant='h4' component='div' sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Typography variant='h4' sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Rooms */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Tổng số phòng'
            value={data.rooms.total}
            subtitle={`${data.rooms.available} phòng trống`}
            icon={HomeIcon}
            color='primary'
          />
        </Grid>

        {/* Occupancy Rate */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Tỷ lệ lấp đầy'
            value={`${data.rooms.occupancyRate}%`}
            subtitle={`${data.rooms.occupied}/${data.rooms.total} phòng`}
            icon={HomeIcon}
            color='success'
          />
        </Grid>

        {/* Tenants */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Người thuê'
            value={data.tenants.total}
            subtitle={`${data.tenants.active} đang hoạt động`}
            icon={PeopleIcon}
            color='info'
          />
        </Grid>

        {/* Contracts */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Hợp đồng'
            value={data.contracts.active}
            subtitle={`${data.contracts.expiring} sắp hết hạn`}
            icon={DescriptionIcon}
            color='warning'
          />
        </Grid>

        {/* Revenue */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Doanh thu tháng'
            value={`${data.revenue.monthly.toLocaleString('vi-VN')}đ`}
            subtitle='Từ hợp đồng đang hoạt động'
            icon={MoneyIcon}
            color='success'
          />
        </Grid>

        {/* Maintenance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Bảo trì'
            value={data.maintenance.total}
            subtitle={`${data.maintenance.pending} chờ xử lý`}
            icon={BuildIcon}
            color='error'
          />
        </Grid>

        {/* Room Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Trạng thái phòng
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2'>Đang thuê</Typography>
                  <Typography variant='body2' fontWeight='bold'>
                    {data.rooms.occupied} phòng
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2'>Trống</Typography>
                  <Typography variant='body2' fontWeight='bold'>
                    {data.rooms.available} phòng
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2'>Bảo trì</Typography>
                  <Typography variant='body2' fontWeight='bold'>
                    {data.rooms.maintenance} phòng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contract Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Tình trạng hợp đồng
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2'>Đang hoạt động</Typography>
                  <Typography
                    variant='body2'
                    fontWeight='bold'
                    color='success.main'
                  >
                    {data.contracts.active}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2'>Nháp</Typography>
                  <Typography variant='body2' fontWeight='bold'>
                    {data.contracts.draft}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2'>Sắp hết hạn</Typography>
                  <Typography
                    variant='body2'
                    fontWeight='bold'
                    color='warning.main'
                  >
                    {data.contracts.expiring}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
