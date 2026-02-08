import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FileText, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';

const AllSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [statusFilter, schemes]);

  const fetchAllSchemes = async () => {
    try {
      const response = await adminAPI.getAllSchemes();
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    if (statusFilter) {
      setFilteredSchemes(schemes.filter((s) => s.status === statusFilter));
    } else {
      setFilteredSchemes(schemes);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleSchemeStatus(id);
      toast.success('Scheme status toggled');
      fetchAllSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-secondary',
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
          <FileText className="mr-3" size={32} />
          All Schemes
        </h1>
        <p className="text-slate-600">Manage all schemes across the platform</p>
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
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-slate-600">
            Showing {filteredSchemes.length} of {schemes.length} schemes
          </span>
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Schemes Found</h3>
          <p className="text-slate-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme._id} className="card hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">{scheme.name}</h3>
                    <span className={`badge ${getStatusBadge(scheme.status)}`}>
                      {scheme.status}
                    </span>
                    {scheme.status === 'approved' && (
                      <span className={`badge ${scheme.active ? 'badge-success' : 'badge-secondary'}`}>
                        {scheme.active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gov-600 font-medium mb-3">{scheme.ministry}</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Created by: <strong>{scheme.createdBy?.name}</strong>
                  </p>
                  <p className="text-slate-700 mb-4">{scheme.description}</p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm text-green-900">
                      <strong>Benefits:</strong> {scheme.benefits}
                    </p>
                  </div>
                </div>

                {/* Toggle Active Status */}
                {scheme.status === 'approved' && (
                  <div className="ml-6">
                    <button
                      onClick={() => handleToggleStatus(scheme._id)}
                      className={`p-3 rounded-lg transition-all ${
                        scheme.active
                          ? 'bg-green-100 hover:bg-green-200'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      title={scheme.active ? 'Deactivate' : 'Activate'}
                    >
                      {scheme.active ? (
                        <ToggleRight size={32} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={32} className="text-slate-600" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSchemes;
