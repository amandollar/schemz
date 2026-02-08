import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';

const PendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', action: null });

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const response = await adminAPI.getPendingApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      toast.error('Failed to fetch pending applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Approve Organizer Application',
      message: 'You can add optional remarks for this approval.',
      confirmText: 'Approve & Promote',
      cancelText: 'Cancel',
      requireInput: true,
      inputLabel: 'Approval Remarks',
      inputPlaceholder: 'Enter optional remarks...',
      inputRequired: false,
      action: async (remarks) => {
        setActionLoading(id);
        try {
          await adminAPI.approveApplication(id, { remarks: remarks || 'Approved' });
          toast.success('Application approved! User role updated to organizer.');
          fetchPendingApplications();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to approve application');
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
      title: 'Reject Organizer Application',
      message: 'Please provide a reason for rejecting this application.',
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
          await adminAPI.rejectApplication(id, { remarks });
          toast.success('Application rejected');
          fetchPendingApplications();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to reject application');
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
          <Users className="mr-3" size={32} />
          Pending Organizer Applications
        </h1>
        <p className="text-slate-600">
          Review and approve or reject organizer applications
        </p>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-slate-600">
            No pending applications to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="card hover:shadow-2xl transition-all">
              {/* Applicant Info */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {app.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {app.userId?.name}
                    </h3>
                    <p className="text-slate-600">{app.userId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Organization</label>
                  <p className="text-slate-900 mt-1">{app.organization}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Designation</label>
                  <p className="text-slate-900 mt-1">{app.designation}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Contact Number</label>
                  <p className="text-slate-900 mt-1">{app.contactNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Applied On</label>
                  <p className="text-slate-900 mt-1">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Reason for Application
                </label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap">{app.reason}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleReject(app._id)}
                  disabled={actionLoading === app._id}
                  className="btn-danger flex items-center space-x-2"
                >
                  <XCircle size={20} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleApprove(app._id)}
                  disabled={actionLoading === app._id}
                  className="btn-success flex items-center space-x-2"
                >
                  {actionLoading === app._id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Approve & Promote</span>
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

export default PendingApplications;
