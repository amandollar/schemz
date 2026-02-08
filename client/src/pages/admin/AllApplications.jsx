import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const AllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchAllApplications = async () => {
    try {
      const response = await adminAPI.getAllApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter) {
      setFilteredApplications(applications.filter((a) => a.status === statusFilter));
    } else {
      setFilteredApplications(applications);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
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
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-header flex items-center">
          <Users className="mr-3" size={32} />
          All Organizer Applications
        </h1>
        <p className="text-slate-600">View all organizer application history</p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-slate-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-slate-600">
            Showing {filteredApplications.length} of {applications.length} applications
          </span>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Found</h3>
          <p className="text-slate-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((app) => (
            <div key={app._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {app.userId?.name}
                    </h3>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">{app.userId?.email}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Organization</label>
                      <p className="text-slate-900">{app.organization}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Designation</label>
                      <p className="text-slate-900">{app.designation}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Applied On</label>
                      <p className="text-slate-900">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {app.remarks && (
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm font-medium text-blue-900 mb-1">Admin Remarks:</p>
                      <p className="text-sm text-blue-800">{app.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllApplications;
