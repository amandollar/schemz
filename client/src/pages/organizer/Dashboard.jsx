import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { organizerAPI, schemeApplicationAPI } from '../../services/api';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Edit, Eye, Users, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', action: null });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await organizerAPI.getMySchemes();
      const schemes = response.data.data || [];

      // Calculate stats
      const stats = {
        draft: schemes.filter((s) => s.status === 'draft').length,
        pending: schemes.filter((s) => s.status === 'pending').length,
        approved: schemes.filter((s) => s.status === 'approved').length,
        rejected: schemes.filter((s) => s.status === 'rejected').length,
        total: schemes.length,
      };

      setStats(stats);
      setRecentSchemes(schemes.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gov-100 text-gov-700 border-gov-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: FileText,
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };
    return icons[status] || FileText;
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Scheme',
      message: 'Are you sure you want to delete this scheme? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      requireInput: false,
      action: async () => {
        setDeleteLoading(id);
        try {
          await organizerAPI.deleteScheme(id);
          toast.success('Scheme deleted successfully');
          fetchDashboardData(); // Refresh the dashboard
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete scheme');
        } finally {
          setDeleteLoading(null);
        }
      }
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.action) {
      await confirmModal.action();
    }
    setConfirmModal({ isOpen: false, type: 'info', action: null });
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
      {/* Header Section */}
      <div className="mb-8">
        <div>
          <h1 className="section-header mb-2">Organizer Dashboard</h1>
          <p className="text-gov-600">
            Welcome back, {user?.name || 'Organizer'}. Manage and track your schemes.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Schemes */}
        <div className="card hover:shadow-medium transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-600 mb-1">Total Schemes</p>
              <p className="text-3xl font-bold text-gov-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-accent-100 rounded-lg">
              <FileText className="text-accent-600" size={24} />
            </div>
          </div>
        </div>

        {/* Draft Schemes */}
        <div className="card hover:shadow-medium transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-600 mb-1">Draft</p>
              <p className="text-3xl font-bold text-gov-900">{stats.draft}</p>
            </div>
            <div className="p-3 bg-gov-100 rounded-lg">
              <FileText className="text-gov-600" size={24} />
            </div>
          </div>
        </div>

        {/* Pending Schemes */}
        <div className="card hover:shadow-medium transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-600 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-gov-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        {/* Approved Schemes */}
        <div className="card hover:shadow-medium transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-gov-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats.rejected > 0 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                {stats.rejected} Scheme{stats.rejected > 1 ? 's' : ''} Rejected
              </h3>
              <p className="text-sm text-red-800 mb-3">
                Review admin feedback and make necessary changes to resubmit.
              </p>
              <Link 
                to="/organizer/my-schemes?status=rejected" 
                className="text-sm font-medium text-red-700 hover:text-red-900 inline-flex items-center"
              >
                Review Rejected Schemes →
              </Link>
            </div>
          </div>
        </div>
      )}

      {stats.pending > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Clock className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                {stats.pending} Scheme{stats.pending > 1 ? 's' : ''} Under Review
              </h3>
              <p className="text-sm text-yellow-800">
                Your schemes are being reviewed by administrators. You'll be notified once a decision is made.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <Link
          to="/organizer/my-schemes"
          className="card hover:shadow-medium transition-all hover:border-accent-300 group block"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gov-100 rounded-lg group-hover:bg-gov-200 transition-colors">
              <FileText className="text-gov-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gov-900 mb-1">Manage Schemes</h3>
              <p className="text-sm text-gov-600">View and edit all your schemes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Schemes */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gov-900">Recent Schemes</h2>
            <p className="text-sm text-gov-600 mt-1">Your latest scheme submissions</p>
          </div>
          <Link
            to="/organizer/my-schemes"
            className="text-sm font-medium text-accent-600 hover:text-accent-700 inline-flex items-center"
          >
            View All
            <TrendingUp size={16} className="ml-1" />
          </Link>
        </div>

        {recentSchemes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gov-100 rounded-full mb-4">
              <FileText className="text-gov-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gov-900 mb-2">
              No Schemes Yet
            </h3>
            <p className="text-gov-600 mb-6 max-w-md mx-auto">
              Get started by creating your first government scheme. It's quick and easy!
            </p>
            <Link to="/organizer/create-scheme" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={18} />
              <span>Create Your First Scheme</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSchemes.map((scheme) => {
              const StatusIcon = getStatusIcon(scheme.status);
              return (
                <div
                  key={scheme._id}
                  className="p-4 border border-gov-200 rounded-lg hover:border-accent-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gov-900 text-base">
                          {scheme.name}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)} shrink-0 ml-2`}>
                          {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gov-600 mb-2 font-medium">
                        {scheme.ministry}
                      </p>
                      <p className="text-sm text-gov-700 line-clamp-2 mb-3">
                        {scheme.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {(scheme.status === 'draft' || scheme.status === 'rejected') && (
                            <Link
                              to={`/organizer/edit-scheme/${scheme._id}`}
                              className="text-accent-600 hover:text-accent-700 font-medium inline-flex items-center"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Link>
                          )}
                          {scheme.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(scheme._id)}
                              disabled={deleteLoading === scheme._id}
                              className="text-red-600 hover:text-red-700 font-medium inline-flex items-center disabled:opacity-50"
                            >
                              <Trash2 size={14} className="mr-1" />
                              {deleteLoading === scheme._id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                          {scheme.status === 'approved' && (
                            <span className="text-green-600 inline-flex items-center">
                              <CheckCircle size={14} className="mr-1" />
                              Active
                            </span>
                          )}
                          <span className="text-gov-500 text-xs">
                            {new Date(scheme.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'info', action: null })}
        onConfirm={handleConfirm}
        title={confirmModal.title || 'Confirm Action'}
        message={confirmModal.message || 'Are you sure?'}
        confirmText={confirmModal.confirmText || 'Confirm'}
        cancelText={confirmModal.cancelText || 'Cancel'}
        type={confirmModal.type}
        requireInput={confirmModal.requireInput || false}
        inputLabel={confirmModal.inputLabel || ''}
        inputPlaceholder={confirmModal.inputPlaceholder || ''}
        inputRequired={confirmModal.inputRequired || false}
      />
    </div>
  );
};

export default OrganizerDashboard;
