import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FileText, Users, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingSchemes: 0,
    pendingApplications: 0,
    totalSchemes: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pendingSchemesRes, pendingAppsRes, allSchemesRes, allAppsRes] = await Promise.all([
        adminAPI.getPendingSchemes(),
        adminAPI.getPendingApplications(),
        adminAPI.getAllSchemes(),
        adminAPI.getAllApplications(),
      ]);

      const pendingSchemes = pendingSchemesRes.data.data || [];
      const pendingApplications = pendingAppsRes.data.data || [];
      const allSchemes = allSchemesRes.data.data || [];
      const allApplications = allAppsRes.data.data || [];

      setStats({
        pendingSchemes: pendingSchemes.length,
        pendingApplications: pendingApplications.length,
        totalSchemes: allSchemes.length,
        totalApplications: allApplications.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set defaults on error
      setStats({
        pendingSchemes: 0,
        pendingApplications: 0,
        totalSchemes: 0,
        totalApplications: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 h-48 bg-gradient-to-r from-accent-700 to-accent-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80"
          alt="Administration"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/90 text-lg">
              Manage schemes and organizer applications
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Schemes */}
        <div className="stat-card">
          <div className="p-2.5 bg-yellow-100 rounded-lg mb-3 inline-block">
            <Clock className="text-yellow-600" size={20} />
          </div>
          <div className="stat-value">{stats.pendingSchemes}</div>
          <div className="stat-label">Pending Schemes</div>
          <Link
            to="/admin/pending-schemes"
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
          >
            Review →
          </Link>
        </div>

        {/* Pending Applications */}
        <div className="stat-card">
          <div className="p-2.5 bg-yellow-100 rounded-lg mb-3 inline-block">
            <Users className="text-yellow-600" size={20} />
          </div>
          <div className="stat-value">{stats.pendingApplications}</div>
          <div className="stat-label">Pending Applications</div>
          <Link
            to="/admin/pending-applications"
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
          >
            Review →
          </Link>
        </div>

        {/* Total Schemes */}
        <div className="stat-card">
          <div className="p-2.5 bg-accent-100 rounded-lg mb-3 inline-block">
            <FileText className="text-accent-600" size={20} />
          </div>
          <div className="stat-value">{stats.totalSchemes}</div>
          <div className="stat-label">Total Schemes</div>
          <Link
            to="/admin/all-schemes"
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
          >
            View All →
          </Link>
        </div>

        {/* Total Applications */}
        <div className="stat-card">
          <div className="p-2.5 bg-green-100 rounded-lg mb-3 inline-block">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <div className="stat-value">{stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
          <Link
            to="/admin/all-applications"
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gov-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/pending-schemes"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="text-accent-600" size={20} />
              <h3 className="font-medium text-gov-900">Review Schemes</h3>
            </div>
            <p className="text-sm text-gov-600">
              Approve or reject pending scheme submissions
            </p>
          </Link>
          <Link
            to="/admin/pending-applications"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Users className="text-accent-600" size={20} />
              <h3 className="font-medium text-gov-900">Review Applications</h3>
            </div>
            <p className="text-sm text-gov-600">
              Process organizer applications
            </p>
          </Link>
          <Link
            to="/admin/all-schemes"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="text-accent-600" size={20} />
              <h3 className="font-medium text-gov-900">Manage Schemes</h3>
            </div>
            <p className="text-sm text-gov-600">
              View and manage all schemes in the system
            </p>
          </Link>
          <Link
            to="/admin/all-applications"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Users className="text-accent-600" size={20} />
              <h3 className="font-medium text-gov-900">Application History</h3>
            </div>
            <p className="text-sm text-gov-600">
              View all organizer applications
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
