import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizerAPI } from '../../services/api';
import RuleBuilder from '../../components/RuleBuilder';
import { FileText, Save, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const EditScheme = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    ministry: '',
    rules: [],
  });

  useEffect(() => {
    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    try {
      const response = await organizerAPI.getMySchemes();
      const scheme = response.data.data.find((s) => s._id === id);

      if (!scheme) {
        toast.error('Scheme not found');
        navigate('/organizer/my-schemes');
        return;
      }

      if (scheme.status !== 'draft' && scheme.status !== 'rejected') {
        toast.error('Only draft or rejected schemes can be edited');
        navigate('/organizer/my-schemes');
        return;
      }

      setFormData({
        name: scheme.name,
        description: scheme.description,
        benefits: scheme.benefits,
        ministry: scheme.ministry,
        rules: scheme.rules || [],
      });
    } catch (error) {
      console.error('Error fetching scheme:', error);
      toast.error('Failed to fetch scheme');
      navigate('/organizer/my-schemes');
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

    setSaving(true);

    try {
      await organizerAPI.updateScheme(id, formData);

      if (submitForApproval) {
        await organizerAPI.submitScheme(id);
        toast.success('Scheme updated and submitted for approval!');
      } else {
        toast.success('Scheme updated successfully!');
      }

      navigate('/organizer/my-schemes');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update scheme';
      toast.error(message);
    } finally {
      setSaving(false);
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
    <div className="page-container animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-header flex items-center">
            <FileText className="mr-3" size={32} />
            Edit Scheme
          </h1>
          <p className="text-slate-600">
            Update your scheme details and eligibility rules
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
                  <strong>Save Changes:</strong> Update the scheme and keep as draft
                </p>
                <p>
                  <strong>Submit for Approval:</strong> Update and send to admin for review
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={saving}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
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

export default EditScheme;
