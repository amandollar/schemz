import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schemeApplicationAPI } from '../../services/api';
import { FileText, Download, Calendar, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await schemeApplicationAPI.getMyApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Approved</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-warning">Pending</span>;
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gov-900 mb-2">My Applications</h1>
        <p className="text-gov-600">Track the status of your scheme applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">
            No Applications Yet
          </h3>
          <p className="text-gov-600 mb-6">
            You haven't applied to any schemes yet. Browse available schemes and apply!
          </p>
          <Link to="/user/all-schemes" className="btn-primary">
            Browse Schemes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(application.status)}
                  <div>
                    <h3 className="text-xl font-semibold text-gov-900 mb-1">
                      {application.scheme?.name}
                    </h3>
                    <p className="text-sm text-accent-600 font-medium">
                      {application.scheme?.ministry}
                    </p>
                  </div>
                </div>
                {getStatusBadge(application.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gov-600 mb-1">Applied On</p>
                  <div className="flex items-center text-sm text-gov-900">
                    <Calendar size={16} className="mr-2" />
                    {new Date(application.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {application.reviewedAt && (
                  <div>
                    <p className="text-xs text-gov-600 mb-1">Reviewed On</p>
                    <div className="flex items-center text-sm text-gov-900">
                      <Calendar size={16} className="mr-2" />
                      {new Date(application.reviewedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-800">{application.rejectionReason}</p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-sm font-semibold text-green-900">
                    ✓ Your application has been approved! The scheme organizer will contact you for further steps.
                  </p>
                </div>
              )}

              {/* Documents */}
              <div className="border-t border-gov-200 pt-4">
                <p className="text-sm font-semibold text-gov-900 mb-3">Uploaded Documents:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {application.documents?.marksheet && (
                    <a
                      href={application.documents.marksheet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gov-900 flex items-center">
                        <FileText size={16} className="mr-2 text-accent-600" />
                        Marksheet
                      </span>
                      <ExternalLink size={14} className="text-gov-400" />
                    </a>
                  )}
                  {application.documents?.incomeCertificate && (
                    <a
                      href={application.documents.incomeCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gov-900 flex items-center">
                        <FileText size={16} className="mr-2 text-accent-600" />
                        Income Certificate
                      </span>
                      <ExternalLink size={14} className="text-gov-400" />
                    </a>
                  )}
                  {application.documents?.categoryCertificate && (
                    <a
                      href={application.documents.categoryCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gov-900 flex items-center">
                        <FileText size={16} className="mr-2 text-accent-600" />
                        Category Certificate
                      </span>
                      <ExternalLink size={14} className="text-gov-400" />
                    </a>
                  )}
                  {application.documents?.otherDocuments && application.documents.otherDocuments.length > 0 && application.documents.otherDocuments.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-gov-50 hover:bg-gov-100 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gov-900 flex items-center">
                        <FileText size={16} className="mr-2 text-accent-600" />
                        {doc.name}
                      </span>
                      <ExternalLink size={14} className="text-gov-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* View Scheme Button */}
              <div className="border-t border-gov-200 pt-4 mt-4">
                <Link
                  to={`/user/scheme/${application.scheme?._id}`}
                  className="btn-secondary text-sm"
                >
                  View Scheme Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
