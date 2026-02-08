import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';
import { Briefcase, Send } from 'lucide-react';

const ApplyOrganizer = () => {
  const [formData, setFormData] = useState({
    organization: '',
    designation: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await applicationAPI.submitApplication(formData);
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-header">Apply as Organizer</h1>
        <p className="text-gov-600">
          Submit your application to become a scheme organizer
        </p>
      </div>

      {/* Form Card */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gov-200">
          <div className="p-3 bg-accent-100 rounded-lg">
            <Briefcase className="text-accent-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gov-900">Organizer Application</h2>
            <p className="text-sm text-gov-600">Fill in your details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organization */}
          <div>
            <label htmlFor="organization" className="label">
              Organization Name
            </label>
            <input
              id="organization"
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="input"
              placeholder="Enter your organization name"
              required
            />
            <p className="mt-1.5 text-xs text-gov-600">
              The organization you represent or work for
            </p>
          </div>

          {/* Designation */}
          <div>
            <label htmlFor="designation" className="label">
              Your Designation
            </label>
            <input
              id="designation"
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="input"
              placeholder="Enter your designation"
              required
            />
            <p className="mt-1.5 text-xs text-gov-600">
              Your role or position in the organization
            </p>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="label">
              Reason for Application
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="input min-h-[120px] resize-y"
              placeholder="Explain why you want to become an organizer..."
              required
            />
            <p className="mt-1.5 text-xs text-gov-600">
              Describe your motivation and how you plan to contribute
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gov-200">
            <button
              type="button"
              onClick={() => navigate('/user/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Send size={18} />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">Application Review Process</h3>
        <p className="text-sm text-blue-800">
          Your application will be reviewed by administrators. You will be notified once a decision is made.
        </p>
      </div>
    </div>
  );
};

export default ApplyOrganizer;
