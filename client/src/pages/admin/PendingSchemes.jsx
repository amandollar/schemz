import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';

const PendingSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', action: null });

  useEffect(() => {
    fetchPendingSchemes();
  }, []);

  const fetchPendingSchemes = async () => {
    try {
      const response = await adminAPI.getPendingSchemes();
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending schemes:', error);
      toast.error('Failed to fetch pending schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Approve Scheme',
      message: 'You can add optional remarks for this approval.',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      requireInput: true,
      inputLabel: 'Approval Remarks',
      inputPlaceholder: 'Enter optional remarks...',
      inputRequired: false,
      action: async (remarks) => {
        setActionLoading(id);
        try {
          await adminAPI.approveScheme(id, { remarks: remarks || 'Approved' });
          toast.success('Scheme approved successfully!');
          fetchPendingSchemes();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to approve scheme');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleReject = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Reject Scheme',
      message: 'Please provide a reason for rejecting this scheme.',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      requireInput: true,
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection...',
      inputRequired: true,
      action: async (remarks) => {
        if (!remarks || remarks.trim() === '') {
          toast.error('Rejection reason is required');
          return;
        }

        setActionLoading(id);
        try {
          await adminAPI.rejectScheme(id, { remarks });
          toast.success('Scheme rejected');
          fetchPendingSchemes();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to reject scheme');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleConfirm = async (inputValue) => {
    if (confirmModal.action) {
      await confirmModal.action(inputValue);
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
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-header flex items-center">
          <Clock className="mr-3" size={32} />
          Pending Schemes
        </h1>
        <p className="text-slate-600">
          Review and approve or reject scheme submissions
        </p>
      </div>

      {/* Empty State */}
      {schemes.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-slate-600">
            No pending schemes to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {schemes.map((scheme) => (
            <div key={scheme._id} className="card hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {scheme.name}
                  </h3>
                  <p className="text-sm text-gov-600 font-medium mb-3">
                    {scheme.ministry}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Created by: <strong>{scheme.createdBy?.name}</strong> ({scheme.createdBy?.email})
                  </p>
                  <p className="text-slate-700 mb-4">{scheme.description}</p>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-4">
                    <p className="text-sm text-green-900">
                      <strong>Benefits:</strong> {scheme.benefits}
                    </p>
                  </div>

                  {/* Eligibility Rules */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Eligibility Rules ({scheme.rules?.length || 0}):
                    </h4>
                    <div className="space-y-2">
                      {scheme.rules && scheme.rules.length > 0 ? (
                        scheme.rules.map((rule, index) => (
                          <div
                            key={index}
                            className="p-3 bg-accent-50 border-l-4 border-accent-500 rounded text-sm"
                          >
                            <span className="font-semibold capitalize">{rule.field?.replace(/_/g, ' ') || 'N/A'}</span>
                            <span className="mx-2">{rule.operator || 'N/A'}</span>
                            <span>
                              {Array.isArray(rule.value) ? rule.value.join(', ') : (rule.value || 'N/A')}
                            </span>
                            <span className="ml-3 text-gov-600">(Weight: {rule.weight || 0})</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gov-600">No rules defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleReject(scheme._id)}
                  disabled={actionLoading === scheme._id}
                  className="btn-danger flex items-center space-x-2"
                >
                  <XCircle size={20} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(scheme._id)}
                  disabled={actionLoading === scheme._id}
                  className="btn-success flex items-center space-x-2"
                >
                  {actionLoading === scheme._id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
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

export default PendingSchemes;
