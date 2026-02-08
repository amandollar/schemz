import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { organizerAPI } from '../../services/api';
import { FileText, Edit, Trash2, Send, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';

const MySchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', action: null });

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [activeTab, schemes]);

  const fetchSchemes = async () => {
    try {
      const response = await organizerAPI.getMySchemes();
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    if (activeTab === 'all') {
      setFilteredSchemes(schemes);
    } else {
      setFilteredSchemes(schemes.filter((s) => s.status === activeTab));
    }
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
        try {
          await organizerAPI.deleteScheme(id);
          toast.success('Scheme deleted successfully');
          fetchSchemes();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete scheme');
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

  const handleSubmit = async (id) => {
    try {
      await organizerAPI.submitScheme(id);
      toast.success('Scheme submitted for approval');
      fetchSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit scheme');
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

  const tabs = [
    { key: 'all', label: 'All', count: schemes.length },
    { key: 'draft', label: 'Draft', count: schemes.filter((s) => s.status === 'draft').length },
    { key: 'pending', label: 'Pending', count: schemes.filter((s) => s.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: schemes.filter((s) => s.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: schemes.filter((s) => s.status === 'rejected').length },
  ];

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-header flex items-center mb-2">
          <FileText className="mr-3" size={32} />
          My Schemes
        </h1>
        <p className="text-gov-600">Manage your government schemes</p>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-accent-600 text-white'
                  : 'bg-gov-100 text-gov-700 hover:bg-gov-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">
            No Schemes Found
          </h3>
          <p className="text-gov-600 mb-6">
            {activeTab === 'all'
              ? 'Create your first scheme to get started'
              : `No ${activeTab} schemes`}
          </p>
          {activeTab === 'all' && (
            <Link to="/organizer/create-scheme" className="btn-primary">
              Create Scheme
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchemes.map((scheme) => {
            if (!scheme) return null;
            
            return (
              <div key={scheme._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gov-900">
                        {scheme.name || 'Unnamed Scheme'}
                      </h3>
                      <span className={`badge ${getStatusBadge(scheme.status || 'draft')}`}>
                        {scheme.status || 'draft'}
                      </span>
                    </div>
                    <p className="text-sm text-gov-600 font-medium mb-3">
                      {scheme.ministry || 'Ministry not specified'}
                    </p>
                    <p className="text-gov-700 mb-4">{scheme.description || 'No description'}</p>
                    {scheme.benefits && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-4">
                        <p className="text-sm text-green-900">
                          <strong>Benefits:</strong> {scheme.benefits}
                        </p>
                      </div>
                    )}

                    {/* Rules Count & Applications */}
                    <div className="flex items-center space-x-4 text-sm text-gov-600 mb-4">
                      <span>
                        <strong>{scheme.rules?.length || 0}</strong> eligibility rules
                      </span>
                      {scheme.status === 'approved' && (
                        <span className={`badge ${scheme.active ? 'badge-success' : 'badge-secondary'}`}>
                          {scheme.active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </div>

                    {/* View Applications Link */}
                    {scheme.status === 'approved' && (
                      <Link
                        to={`/organizer/scheme-applications/${scheme._id}`}
                        className="inline-flex items-center text-accent-600 hover:text-accent-700 font-medium text-sm mb-4"
                      >
                        <Users size={16} className="mr-2" />
                        View Applications
                      </Link>
                    )}

                    {/* Admin Remarks */}
                    {scheme.remarks && (
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Admin Remarks:
                        </p>
                        <p className="text-sm text-blue-800">{scheme.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <div className="flex flex-col space-y-2">
                      {/* Edit (draft or rejected only) */}
                      {(scheme.status === 'draft' || scheme.status === 'rejected') && (
                        <Link
                          to={`/organizer/edit-scheme/${scheme._id}`}
                          className="btn-outline flex items-center justify-center space-x-2"
                        >
                          <Edit size={18} />
                          <span>Edit</span>
                        </Link>
                      )}

                      {/* Submit (draft only) */}
                      {scheme.status === 'draft' && (
                        <button
                          onClick={() => handleSubmit(scheme._id)}
                          className="btn-primary flex items-center justify-center space-x-2"
                        >
                          <Send size={18} />
                          <span>Submit</span>
                        </button>
                      )}

                      {/* Delete (draft only) */}
                      {scheme.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(scheme._id)}
                          className="btn-danger flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={18} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default MySchemes;
