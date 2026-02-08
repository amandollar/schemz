import { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeApplicationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { isProfileReadyForApplication } from '../utils/profileUtils';

const ApplySchemeModal = ({ scheme, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileCheck, setProfileCheck] = useState(null);
  const [formData, setFormData] = useState({
    purpose: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    aadhaarNumber: '',
    remarks: ''
  });
  
  const [files, setFiles] = useState({
    marksheet: null,
    incomeCertificate: null,
    categoryCertificate: null,
    otherDocuments: []
  });

  // Check profile completeness when modal opens
  useEffect(() => {
    if (user && isOpen) {
      const check = isProfileReadyForApplication(user);
      setProfileCheck(check);
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleMultipleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate each file
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} has invalid type. Only PDF and images allowed`);
        return;
      }
    }
    
    setFiles(prev => ({ ...prev, otherDocuments: selectedFiles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to apply for schemes');
      return;
    }
    
    // Check profile completeness
    const profileValidation = isProfileReadyForApplication(user);
    if (!profileValidation.isValid) {
      toast.error(profileValidation.message);
      return;
    }
    
    if (!files.marksheet) {
      toast.error('Marksheet/Educational certificate is required');
      return;
    }
    
    if (!formData.purpose || formData.purpose.trim().length === 0) {
      toast.error('Please provide a purpose for your application');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData
      const submitData = new FormData();
      
      // Add scheme ID
      submitData.append('schemeId', scheme._id);
      
      // Add applicant details (from user profile)
      const applicantDetails = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || null,
        age: user.age || null,
        gender: user.gender || '',
        category: user.category || '',
        religion: user.religion || '',
        maritalStatus: user.maritalStatus || '',
        state: user.state || '',
        district: user.district || '',
        education: user.education || '',
        occupation: user.occupation || '',
        income: user.income || null,
        disability: user.disability || 'None'
      };
      submitData.append('applicantDetails', JSON.stringify(applicantDetails));
      
      // Add application data
      const applicationData = {
        purpose: formData.purpose,
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branchName: formData.branchName
        },
        aadhaarNumber: formData.aadhaarNumber,
        remarks: formData.remarks
      };
      submitData.append('applicationData', JSON.stringify(applicationData));
      
      // Add files
      submitData.append('marksheet', files.marksheet);
      if (files.incomeCertificate) {
        submitData.append('incomeCertificate', files.incomeCertificate);
      }
      if (files.categoryCertificate) {
        submitData.append('categoryCertificate', files.categoryCertificate);
      }
      if (files.otherDocuments && files.otherDocuments.length > 0) {
        files.otherDocuments.forEach((file) => {
          submitData.append('otherDocuments', file);
        });
      }
      
      await schemeApplicationAPI.submitApplication(submitData);
      
      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show profile completion warning if profile is incomplete
  if (profileCheck && !profileCheck.isValid) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gov-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gov-900">Profile Incomplete</h2>
              <p className="text-sm text-gov-600 mt-1">Complete your profile to apply</p>
            </div>
            <button
              onClick={onClose}
              className="text-gov-400 hover:text-gov-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gov-900 mb-2">
                  Complete Your Profile First
                </h3>
                <p className="text-gov-700 mb-4">
                  To apply for schemes, please complete the following required fields in your profile:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gov-600 mb-6">
                  {profileCheck.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/user/profile');
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <User size={18} />
                <span>Go to Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gov-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gov-900">Apply to Scheme</h2>
            <p className="text-sm text-gov-600 mt-1">{scheme.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gov-400 hover:text-gov-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Auto-filled Personal Details */}
          <div>
            <h3 className="text-lg font-semibold text-gov-900 mb-4">Personal Details (Auto-filled)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gov-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gov-600">Name</p>
                <p className="text-sm font-medium text-gov-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Email</p>
                <p className="text-sm font-medium text-gov-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Phone</p>
                <p className="text-sm font-medium text-gov-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Age</p>
                <p className="text-sm font-medium text-gov-900">{user.age || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Gender</p>
                <p className="text-sm font-medium text-gov-900">{user.gender || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Category</p>
                <p className="text-sm font-medium text-gov-900">{user.category || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Education</p>
                <p className="text-sm font-medium text-gov-900">{user.education || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gov-600">Annual Income</p>
                <p className="text-sm font-medium text-gov-900">
                  {user.income ? `₹${user.income.toLocaleString()}` : 'Not provided'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gov-600 mt-2">
              <AlertCircle size={14} className="inline mr-1" />
              If any information is incorrect, please update your profile before applying.
            </p>
          </div>

          {/* Application Purpose */}
          <div>
            <label htmlFor="purpose" className="form-label">
              Purpose of Application <span className="text-red-500">*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="form-input"
              rows="4"
              placeholder="Explain why you are applying for this scheme and how it will benefit you..."
              required
            />
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-semibold text-gov-900 mb-4">Bank Details (for benefit transfer)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountNumber" className="form-label">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div>
                <label htmlFor="bankName" className="form-label">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label htmlFor="branchName" className="form-label">Branch Name</label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>

          {/* Aadhaar Number */}
          <div>
            <label htmlFor="aadhaarNumber" className="form-label">Aadhaar Number</label>
            <input
              type="text"
              id="aadhaarNumber"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter 12-digit Aadhaar number"
              maxLength="12"
            />
          </div>

          {/* Document Uploads */}
          <div>
            <h3 className="text-lg font-semibold text-gov-900 mb-4">Upload Documents</h3>
            
            {/* Marksheet */}
            <div className="mb-4">
              <label className="form-label">
                Marksheet/Educational Certificate <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {files.marksheet ? files.marksheet.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'marksheet')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
                {files.marksheet && (
                  <FileText size={24} className="text-green-600" />
                )}
              </div>
            </div>

            {/* Income Certificate */}
            <div className="mb-4">
              <label className="form-label">Income Certificate (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {files.incomeCertificate ? files.incomeCertificate.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'incomeCertificate')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
                {files.incomeCertificate && (
                  <FileText size={24} className="text-green-600" />
                )}
              </div>
            </div>

            {/* Category Certificate */}
            <div className="mb-4">
              <label className="form-label">Category Certificate (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {files.categoryCertificate ? files.categoryCertificate.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'categoryCertificate')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
                {files.categoryCertificate && (
                  <FileText size={24} className="text-green-600" />
                )}
              </div>
            </div>

            {/* Other Documents */}
            <div>
              <label className="form-label">Other Supporting Documents (Optional, max 5 files)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {files.otherDocuments.length > 0 
                      ? `${files.otherDocuments.length} file(s) selected` 
                      : 'Choose files (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    onChange={handleMultipleFilesChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                  />
                </label>
                {files.otherDocuments.length > 0 && (
                  <FileText size={24} className="text-green-600" />
                )}
              </div>
              {files.otherDocuments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.otherDocuments.map((file, index) => (
                    <p key={index} className="text-xs text-gov-600">• {file.name}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="form-label">Additional Remarks (Optional)</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
              placeholder="Any additional information you'd like to provide..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gov-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplySchemeModal;
