import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemeAPI, schemeApplicationAPI } from '../../services/api';
import { ArrowLeft, Building2, FileText, CheckCircle, Send } from 'lucide-react';
import ApplySchemeModal from '../../components/ApplySchemeModal';

const SchemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [application, setApplication] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchSchemeDetail();
    checkApplicationStatus();
  }, [id]);

  const fetchSchemeDetail = async () => {
    try {
      const response = await schemeAPI.getSchemeById(id);
      setScheme(response.data.data);
    } catch (error) {
      console.error('Error fetching scheme detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await schemeApplicationAPI.checkApplication(id);
      setHasApplied(response.data.hasApplied);
      setApplication(response.data.application);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    checkApplicationStatus();
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

  if (!scheme) {
    return (
      <div className="page-container">
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">
            Scheme Not Found
          </h3>
          <p className="text-gov-600 mb-6">
            The scheme you're looking for doesn't exist
          </p>
          <Link to="/user/all-schemes" className="btn-primary">
            Browse All Schemes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      {/* Scheme Header */}
      <div className="card mb-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="p-3 bg-accent-100 rounded-lg">
            <Building2 className="text-accent-600" size={24} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gov-900 mb-2">
              {scheme.name}
            </h1>
            <p className="text-accent-600 font-medium">
              {scheme.ministry}
            </p>
          </div>
          <span className={`badge ${scheme.active ? 'badge-success' : 'badge-secondary'}`}>
            {scheme.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-gov-700 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Benefits */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
          <CheckCircle className="mr-2 text-green-600" size={20} />
          Benefits
        </h2>
        <p className="text-gov-700 leading-relaxed whitespace-pre-line">
          {scheme.benefits}
        </p>
      </div>

      {/* Eligibility Criteria */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gov-900 mb-4">
          Eligibility Criteria
        </h2>
        {scheme.rules && scheme.rules.length > 0 ? (
          <div className="space-y-3">
            {scheme.rules.map((rule, index) => (
              <div
                key={index}
                className="p-4 bg-accent-50 border-l-4 border-accent-500 rounded-r-lg"
              >
                <p className="text-sm text-gov-900">
                  <span className="font-semibold capitalize">
                    {rule.field?.replace(/_/g, ' ') || 'N/A'}
                  </span>
                  <span className="mx-2 text-accent-700">{rule.operator || 'N/A'}</span>
                  <span className="text-gov-900">
                    {Array.isArray(rule.value) ? rule.value.join(', ') : (rule.value || 'N/A')}
                  </span>
                  <span className="ml-3 text-gov-600">(Weight: {rule.weight || 0})</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gov-600">No specific eligibility criteria defined</p>
        )}
      </div>

      {/* CTA */}
      <div className="card bg-accent-600 text-white">
        <h3 className="text-lg font-semibold mb-2">
          {hasApplied ? 'Application Submitted' : 'Ready to Apply?'}
        </h3>
        {hasApplied ? (
          <div>
            <p className="mb-4 text-accent-100">
              You have already applied to this scheme. Check your application status in My Applications.
            </p>
            <div className="flex items-center space-x-4">
              <span className={`badge ${
                application?.status === 'approved' ? 'badge-success' :
                application?.status === 'rejected' ? 'badge-danger' :
                'badge-warning'
              }`}>
                {application?.status?.toUpperCase() || 'PENDING'}
              </span>
              <Link to="/user/my-applications" className="btn bg-white text-accent-600 hover:bg-accent-50">
                View My Applications
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-accent-100">
              Submit your application with required documents to apply for this scheme
            </p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn bg-white text-accent-600 hover:bg-accent-50 inline-flex items-center"
            >
              <Send size={18} className="mr-2" />
              Apply Now
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplySchemeModal
        scheme={scheme}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default SchemeDetail;
