import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizerAPI, schemeApplicationAPI } from '../../services/api';
import { FileText, CheckCircle, XCircle, Clock, Download, User, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';

const SchemeApplications = () => {
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', action: null });

  useEffect(() => {
    if (schemeId) {
      fetchSchemeAndApplications();
    }
  }, [schemeId]);

  useEffect(() => {
    filterApplications();
  }, [activeTab, applications]);

  const fetchSchemeAndApplications = async () => {
    try {
      const [schemeRes, appsRes] = await Promise.all([
        organizerAPI.getMySchemes(),
        schemeApplicationAPI.getSchemeApplications(schemeId)
      ]);

      // Find the specific scheme
      const schemes = schemeRes.data.data || [];
      const foundScheme = schemes.find(s => s._id === schemeId);
      setScheme(foundScheme);

      setApplications(appsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (activeTab === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((app) => app.status === activeTab));
    }
  };

  const handleApprove = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Approve Application',
      message: 'Are you sure you want to approve this application?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      action: async () => {
        setActionLoading(id);
        try {
          await schemeApplicationAPI.approveApplication(id);
          toast.success('Application approved successfully!');
          fetchSchemeAndApplications();
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
      title: 'Reject Application',
      message: 'Please provide a reason for rejecting this application.',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      requireInput: true,
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection...',
      inputRequired: true,
      action: async (reason) => {
        if (!reason || reason.trim() === '') {
          toast.error('Rejection reason is required');
          return;
        }

        setActionLoading(id);
        try {
          await schemeApplicationAPI.rejectApplication(id, reason.trim());
          toast.success('Application rejected');
          fetchSchemeAndApplications();
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

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'badge-success',
      rejected: 'badge-danger',
      pending: 'badge-warning',
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <Clock className="text-yellow-600" size={24} />;
    }
  };

  const tabs = [
    { key: 'all', label: 'All', count: applications.length },
    { key: 'pending', label: 'Pending', count: applications.filter((a) => a.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: applications.filter((a) => a.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: applications.filter((a) => a.status === 'rejected').length },
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

  if (!scheme) {
    return (
      <div className="page-container">
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">Scheme Not Found</h3>
          <p className="text-gov-600 mb-6">The scheme you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/organizer/my-schemes" className="btn-primary">
            Back to My Schemes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/organizer/my-schemes"
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4 font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to My Schemes
        </Link>
        <h1 className="section-header mb-2">Scheme Applications</h1>
        <div className="bg-accent-50 border-l-4 border-accent-500 p-4 rounded-r-lg mb-4">
          <h2 className="text-lg font-semibold text-gov-900 mb-1">{scheme.name}</h2>
          <p className="text-sm text-gov-600">{scheme.ministry}</p>
        </div>
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

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">No Applications Found</h3>
          <p className="text-gov-600">
            {activeTab === 'all'
              ? 'No one has applied to this scheme yet'
              : `No ${activeTab} applications`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <div key={application._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  {getStatusIcon(application.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gov-900">
                        {application.user?.name || 'Unknown User'}
                      </h3>
                      <span className={`badge ${getStatusBadge(application.status)}`}>
                        {application.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-sm text-gov-600 mb-3">{application.user?.email || 'No email'}</p>

                    {/* Application Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gov-600 mb-1">Applied On</p>
                        <div className="flex items-center text-sm text-gov-900">
                          <Calendar size={14} className="mr-2" />
                          {new Date(application.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {application.reviewedAt && (
                        <div>
                          <p className="text-xs text-gov-600 mb-1">Reviewed On</p>
                          <div className="flex items-center text-sm text-gov-900">
                            <Calendar size={14} className="mr-2" />
                            {new Date(application.reviewedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Applicant Details */}
                    {application.applicantDetails && (
                      <div className="bg-gov-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-semibold text-gov-900 mb-3">Applicant Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {application.applicantDetails.age && (
                            <div>
                              <span className="text-gov-600">Age:</span>{' '}
                              <span className="font-medium text-gov-900">{application.applicantDetails.age}</span>
                            </div>
                          )}
                          {application.applicantDetails.gender && (
                            <div>
                              <span className="text-gov-600">Gender:</span>{' '}
                              <span className="font-medium text-gov-900">{application.applicantDetails.gender}</span>
                            </div>
                          )}
                          {application.applicantDetails.category && (
                            <div>
                              <span className="text-gov-600">Category:</span>{' '}
                              <span className="font-medium text-gov-900">{application.applicantDetails.category}</span>
                            </div>
                          )}
                          {application.applicantDetails.education && (
                            <div>
                              <span className="text-gov-600">Education:</span>{' '}
                              <span className="font-medium text-gov-900">{application.applicantDetails.education}</span>
                            </div>
                          )}
                          {application.applicantDetails.income && (
                            <div>
                              <span className="text-gov-600">Income:</span>{' '}
                              <span className="font-medium text-gov-900">
                                ₹{application.applicantDetails.income.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {application.applicantDetails.state && (
                            <div>
                              <span className="text-gov-600">State:</span>{' '}
                              <span className="font-medium text-gov-900">{application.applicantDetails.state}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Purpose */}
                    {application.applicationData?.purpose && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gov-900 mb-2">Application Purpose</h4>
                        <p className="text-sm text-gov-700 bg-gov-50 p-3 rounded-lg">
                          {application.applicationData.purpose}
                        </p>
                      </div>
                    )}

                    {/* Bank Details */}
                    {application.applicationData?.bankDetails && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gov-900 mb-2">Bank Details</h4>
                        <div className="bg-gov-50 p-3 rounded-lg text-sm">
                          {application.applicationData.bankDetails.accountNumber && (
                            <p className="text-gov-700">
                              <span className="font-medium">Account:</span> {application.applicationData.bankDetails.accountNumber}
                            </p>
                          )}
                          {application.applicationData.bankDetails.ifscCode && (
                            <p className="text-gov-700">
                              <span className="font-medium">IFSC:</span> {application.applicationData.bankDetails.ifscCode}
                            </p>
                          )}
                          {application.applicationData.bankDetails.bankName && (
                            <p className="text-gov-700">
                              <span className="font-medium">Bank:</span> {application.applicationData.bankDetails.bankName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {application.status === 'rejected' && application.rejectionReason && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                        <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-800">{application.rejectionReason}</p>
                      </div>
                    )}

                    {/* Documents */}
                    {application.documents && (
                      <div className="border-t border-gov-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gov-900 mb-3">Uploaded Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {application.documents.marksheet && (
                            <div className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors group">
                              <span className="text-sm text-gov-900 flex items-center">
                                <FileText size={16} className="mr-2 text-accent-600" />
                                Marksheet
                              </span>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={application.documents.marksheet}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-600 hover:text-accent-700"
                                  title="View in new tab"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <a
                                  href={application.documents.marksheet}
                                  download="marksheet.pdf"
                                  className="text-gov-600 hover:text-gov-900"
                                  title="Download Marksheet"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          )}
                          {application.documents.incomeCertificate && (
                            <div className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors group">
                              <span className="text-sm text-gov-900 flex items-center">
                                <FileText size={16} className="mr-2 text-accent-600" />
                                Income Certificate
                              </span>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={application.documents.incomeCertificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-600 hover:text-accent-700"
                                  title="View in new tab"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <a
                                  href={application.documents.incomeCertificate}
                                  download="income-certificate.pdf"
                                  className="text-gov-600 hover:text-gov-900"
                                  title="Download Income Certificate"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          )}
                          {application.documents.categoryCertificate && (
                            <div className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors group">
                              <span className="text-sm text-gov-900 flex items-center">
                                <FileText size={16} className="mr-2 text-accent-600" />
                                Category Certificate
                              </span>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={application.documents.categoryCertificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-600 hover:text-accent-700"
                                  title="View in new tab"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <a
                                  href={application.documents.categoryCertificate}
                                  download="category-certificate.pdf"
                                  className="text-gov-600 hover:text-gov-900"
                                  title="Download Category Certificate"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          )}
                          {application.documents.otherDocuments && application.documents.otherDocuments.length > 0 && (
                            application.documents.otherDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors group">
                                <span className="text-sm text-gov-900 flex items-center">
                                  <FileText size={16} className="mr-2 text-accent-600" />
                                  {doc.name || `Document ${index + 1}`}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent-600 hover:text-accent-700"
                                    title="View in new tab"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                  <a
                                    href={doc.url}
                                    download={doc.name || `document-${index + 1}.pdf`}
                                    className="text-gov-600 hover:text-gov-900"
                                    title={`Download ${doc.name || `Document ${index + 1}`}`}
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {/* PDF Viewer Section */}
                        {(application.documents.marksheet || 
                          application.documents.incomeCertificate || 
                          application.documents.categoryCertificate ||
                          (application.documents.otherDocuments && application.documents.otherDocuments.length > 0)) && (
                          <div className="mt-4 pt-4 border-t border-gov-200">
                            <h5 className="text-xs font-semibold text-gov-700 mb-2">Quick View (Click to expand):</h5>
                            <div className="space-y-2">
                              {application.documents.marksheet && (
                                <details className="bg-gov-50 rounded-lg">
                                  <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gov-900 hover:bg-gov-100">
                                    View Marksheet PDF
                                  </summary>
                                  <div className="p-2">
                                    <div className="mb-2 flex justify-end">
                                      <a
                                        href={application.documents.marksheet}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-600 hover:text-accent-700 inline-flex items-center"
                                      >
                                        Open in new tab <ExternalLink size={12} className="ml-1" />
                                      </a>
                                    </div>
                                    <iframe
                                      src={`${application.documents.marksheet}#toolbar=1&navpanes=1`}
                                      className="w-full h-96 border border-gov-200 rounded"
                                      title="Marksheet PDF"
                                      onError={(e) => {
                                        console.error('PDF load error:', e);
                                      }}
                                    />
                                    <p className="text-xs text-gov-500 mt-2">
                                      If PDF doesn't load, click "Open in new tab" above or download the document.
                                    </p>
                                  </div>
                                </details>
                              )}
                              {application.documents.incomeCertificate && (
                                <details className="bg-gov-50 rounded-lg">
                                  <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gov-900 hover:bg-gov-100">
                                    View Income Certificate PDF
                                  </summary>
                                  <div className="p-2">
                                    <div className="mb-2 flex justify-end">
                                      <a
                                        href={application.documents.incomeCertificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-600 hover:text-accent-700 inline-flex items-center"
                                      >
                                        Open in new tab <ExternalLink size={12} className="ml-1" />
                                      </a>
                                    </div>
                                    <iframe
                                      src={`${application.documents.incomeCertificate}#toolbar=1&navpanes=1`}
                                      className="w-full h-96 border border-gov-200 rounded"
                                      title="Income Certificate PDF"
                                    />
                                    <p className="text-xs text-gov-500 mt-2">
                                      If PDF doesn't load, click "Open in new tab" above or download the document.
                                    </p>
                                  </div>
                                </details>
                              )}
                              {application.documents.categoryCertificate && (
                                <details className="bg-gov-50 rounded-lg">
                                  <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gov-900 hover:bg-gov-100">
                                    View Category Certificate PDF
                                  </summary>
                                  <div className="p-2">
                                    <div className="mb-2 flex justify-end">
                                      <a
                                        href={application.documents.categoryCertificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-600 hover:text-accent-700 inline-flex items-center"
                                      >
                                        Open in new tab <ExternalLink size={12} className="ml-1" />
                                      </a>
                                    </div>
                                    <iframe
                                      src={`${application.documents.categoryCertificate}#toolbar=1&navpanes=1`}
                                      className="w-full h-96 border border-gov-200 rounded"
                                      title="Category Certificate PDF"
                                    />
                                    <p className="text-xs text-gov-500 mt-2">
                                      If PDF doesn't load, click "Open in new tab" above or download the document.
                                    </p>
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {application.status === 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleApprove(application._id)}
                      disabled={actionLoading === application._id}
                      className="btn-success flex items-center justify-center space-x-2"
                    >
                      {actionLoading === application._id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(application._id)}
                      disabled={actionLoading === application._id}
                      className="btn-danger flex items-center justify-center space-x-2"
                    >
                      <XCircle size={18} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
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

export default SchemeApplications;
