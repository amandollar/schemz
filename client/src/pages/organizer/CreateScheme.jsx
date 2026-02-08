import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerAPI } from '../../services/api';
import RuleBuilder from '../../components/RuleBuilder';
import { FileText, Save, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateScheme = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    ministry: '',
    rules: [],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRulesChange = (rules) => {
    setFormData({
      ...formData,
      rules,
    });
  };

  const handleSubmit = async (e, submitForApproval = false) => {
    e.preventDefault();

    if (formData.rules.length === 0) {
      toast.error('Please add at least one eligibility rule');
      return;
    }

    setLoading(true);

    try {
      const response = await organizerAPI.createScheme(formData);
      const schemeId = response.data.data._id;

      if (submitForApproval) {
        await organizerAPI.submitScheme(schemeId);
        toast.success('Scheme created and submitted for approval!');
      } else {
        toast.success('Scheme saved as draft!');
      }

      navigate('/organizer/my-schemes');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create scheme';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-header flex items-center">
            <FileText className="mr-3" size={32} />
            Create New Scheme
          </h1>
          <p className="text-slate-600">
            Define a new government scheme with custom eligibility rules
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Scheme Name */}
              <div>
                <label className="label">Scheme Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="PM Scholarship Scheme"
                  required
                />
              </div>

              {/* Ministry */}
              <div>
                <label className="label">Ministry / Department *</label>
                <input
                  type="text"
                  name="ministry"
                  value={formData.ministry}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ministry of Education"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[100px]"
                  placeholder="Detailed description of the scheme..."
                  required
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="label">Benefits *</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="input min-h-[80px]"
                  placeholder="₹50,000 per year for education expenses"
                  required
                />
              </div>
            </div>
          </div>

          {/* Eligibility Rules */}
          <div className="card">
            <RuleBuilder rules={formData.rules} onChange={handleRulesChange} />
          </div>

          {/* Action Buttons */}
          <div className="card bg-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="text-sm text-slate-600">
                <p>
                  <strong>Save as Draft:</strong> Save your work and continue editing later
                </p>
                <p>
                  <strong>Submit for Approval:</strong> Send to admin for review
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Submit for Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheme;
