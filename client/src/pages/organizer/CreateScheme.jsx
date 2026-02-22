import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerAPI, aiAPI } from '../../services/api';
import RuleBuilder from '../../components/RuleBuilder';
import { FileText, Save, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateScheme = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
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

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Please describe the scheme you want to create');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiAPI.generateScheme(aiPrompt.trim());
      if (res.data.success && res.data.data) {
        const { name, description, benefits, ministry, rules } = res.data.data;
        setFormData(prev => ({
          ...prev,
          name: name || prev.name,
          description: description || prev.description,
          benefits: benefits || prev.benefits,
          ministry: ministry || prev.ministry,
          rules: Array.isArray(rules) && rules.length > 0 ? rules : prev.rules,
        }));
        setShowAiModal(false);
        setAiPrompt('');
        toast.success('Scheme draft generated! Review and edit as needed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI generation failed';
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e, submitForApproval = false) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('Scheme name is required');
      return;
    }
    if (!formData.ministry?.trim()) {
      toast.error('Ministry/Department is required');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.benefits?.trim()) {
      toast.error('Benefits are required');
      return;
    }
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-header flex items-center">
              <FileText className="mr-3" size={32} />
              Create New Scheme
            </h1>
            <p className="text-slate-600">
              Define a new government scheme with custom eligibility rules
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="btn-secondary flex items-center gap-2 self-start sm:self-center"
          >
            <Sparkles size={20} className="text-amber-500" />
            AI Assist
          </button>
        </div>

        {/* AI Assist Modal */}
        {showAiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={24} className="text-amber-500" />
                  AI Assist
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Describe the scheme you want in a few words. AI will generate name, description, benefits, and eligibility rules.
              </p>
              <form onSubmit={handleAiGenerate}>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Scholarship for SC/ST students in Bihar, income below 2 lakh, 12th pass or graduate"
                  className="input min-h-[100px] mb-4"
                  disabled={aiLoading}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
