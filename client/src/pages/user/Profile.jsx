import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Save, User, Phone, MapPin, Briefcase, GraduationCap, Heart, Info, Camera, Upload, CreditCard, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const GENDERS = ['Male', 'Female', 'Other'];
const EDUCATION_LEVELS = ['Below 10th', '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Doctorate'];
const MARITAL_STATUS = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other', 'Prefer not to say'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

const Profile = () => {
  const { user, updateUserProfile, refreshUser, setUserFromResponse } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [pendingDocs, setPendingDocs] = useState({
    aadhaarDocument: null,
    incomeCertificate: null,
    categoryCertificate: null,
  });
  
  // Initialize form data from user, and update when user changes
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    age: user?.age || '',
    gender: user?.gender || '',
    maritalStatus: user?.maritalStatus || '',
    state: user?.state || '',
    district: user?.district || '',
    pinCode: user?.pinCode || '',
    category: user?.category || '',
    religion: user?.religion || '',
    income: user?.income || '',
    occupation: user?.occupation || '',
    education: user?.education || '',
    disability: user?.disability && user.disability !== 'None',
    profileImage: user?.profileImage || '',
    aadhaarNumber: user?.aadhaarNumber || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    bankName: user?.bankDetails?.bankName || '',
    branchName: user?.bankDetails?.branchName || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        age: user.age || '',
        gender: user.gender || '',
        maritalStatus: user.maritalStatus || '',
        state: user.state || '',
        district: user.district || '',
        pinCode: user.pinCode || '',
        category: user.category || '',
        religion: user.religion || '',
        income: user.income || '',
        occupation: user.occupation || '',
        education: user.education || '',
        disability: user.disability && user.disability !== 'None',
        profileImage: user.profileImage || '',
        aadhaarNumber: user.aadhaarNumber || '',
        accountNumber: user.bankDetails?.accountNumber || '',
        ifscCode: user.bankDetails?.ifscCode || '',
        bankName: user.bankDetails?.bankName || '',
        branchName: user.bankDetails?.branchName || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const fetchPincodeDetails = async () => {
    const pin = formData.pinCode?.trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) return;

    setPincodeLookupLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const first = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          state: first.State || prev.state,
          district: first.District || prev.district,
        }));
        toast.success('Location auto-filled from PIN code');
      } else {
        toast.warning('PIN code not found. Please enter state and district manually.');
      }
    } catch {
      toast.error('Could not fetch PIN details. Please enter manually.');
    } finally {
      setPincodeLookupLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await authAPI.uploadProfileImage(formData);

      if (response.data.success && response.data.data.profileImage) {
        const imageUrl = response.data.data.profileImage;
        setFormData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        
        // Refresh user in context to get updated profile image
        await refreshUser();
        
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, JPEG, and PNG files are allowed');
      return;
    }
    setPendingDocs(prev => ({ ...prev, [docType]: file }));
    e.target.value = '';
  };

  const handleDocumentUpload = async (docType) => {
    const file = pendingDocs[docType];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append(docType, file);
      const response = await authAPI.uploadProfileDocuments(fd);
      if (response.data.success && response.data.data) {
        setUserFromResponse(response.data.data);
        setPendingDocs(prev => ({ ...prev, [docType]: null }));
        toast.success(`${docType.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} uploaded successfully!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert numeric fields and structure bank details
    const profileData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      income: formData.income ? parseInt(formData.income) : undefined,
      // Convert disability checkbox (boolean) to User model enum (string)
      disability: formData.disability ? 'Physical' : 'None',
      bankDetails: {
        accountNumber: formData.accountNumber || '',
        ifscCode: formData.ifscCode || '',
        bankName: formData.bankName || '',
        branchName: formData.branchName || '',
      },
    };

    // Remove flat bank fields
    delete profileData.accountNumber;
    delete profileData.ifscCode;
    delete profileData.bankName;
    delete profileData.branchName;

    // Remove empty bankDetails if all fields are empty (allows clearing)
    if (!profileData.bankDetails.accountNumber && !profileData.bankDetails.ifscCode &&
        !profileData.bankDetails.bankName && !profileData.bankDetails.branchName) {
      profileData.bankDetails = { accountNumber: '', ifscCode: '', bankName: '', branchName: '' };
    }

    // Remove empty strings (but keep bankDetails for explicit clearing)
    Object.keys(profileData).forEach(key => {
      if (key !== 'bankDetails' && profileData[key] === '') {
        delete profileData[key];
      }
    });

    const result = await updateUserProfile(profileData);
    if (result.success) {
      // AuthContext already shows toast; user state updates trigger form sync via useEffect
    }
    setLoading(false);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-header flex items-center">
            <User className="mr-3 text-accent-600" size={32} />
            Complete Your Profile
          </h1>
          <p className="text-gov-600 mt-2">
            Provide your details to get personalized scheme recommendations. All information is confidential and used only for scheme matching.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6 flex items-start">
          <Info className="text-accent-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-gov-700">
            <strong>Privacy Notice:</strong> Your demographic information is securely stored and used only to match you with eligible government schemes. You can update or delete this information anytime.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <Camera className="mr-2 text-accent-600" size={20} />
              Profile Picture
            </h2>
            <div className="flex items-center space-x-6">
              {/* Image Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gov-100 border-4 border-accent-200 flex items-center justify-center">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gov-400" size={48} />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <label className="btn-secondary cursor-pointer inline-flex items-center">
                  <Upload className="mr-2" size={18} />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gov-600 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <User className="mr-2 text-accent-600" size={20} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="150"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Status</option>
                  {MARITAL_STATUS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <Phone className="mr-2 text-accent-600" size={20} />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Mobile Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                />
                <p className="text-xs text-gov-600 mt-1">Format: 9876543210</p>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input bg-gov-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gov-600 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <MapPin className="mr-2 text-accent-600" size={20} />
              Location Details
            </h2>
            <p className="text-sm text-gov-600 mb-4">
              Enter your PIN code first — we&apos;ll auto-fill state and district for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">PIN Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    onBlur={() => formData.pinCode?.length === 6 && fetchPincodeDetails()}
                    className="input flex-1"
                    placeholder="6-digit PIN code"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={fetchPincodeDetails}
                    disabled={pincodeLookupLoading || formData.pinCode?.length !== 6}
                    className="btn-secondary whitespace-nowrap flex items-center"
                    title="Auto-fill state & district from PIN"
                  >
                    {pincodeLookupLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <>Lookup</>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select State</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input"
                  placeholder="Auto-filled from PIN or enter manually"
                />
              </div>
            </div>
          </div>

          {/* Social & Economic Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <Heart className="mr-2 text-accent-600" size={20} />
              Social & Economic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Religion (Optional)</label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Religion</option>
                  {RELIGIONS.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Annual Income (₹)</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  placeholder="Enter annual income"
                />
              </div>

              <div>
                <label className="label">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Farmer, Student, Business"
                />
              </div>
            </div>
          </div>

          {/* Education & Special Categories */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <GraduationCap className="mr-2 text-accent-600" size={20} />
              Education & Special Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Highest Education</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Education Level</option>
                  {EDUCATION_LEVELS.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="disability"
                  name="disability"
                  checked={formData.disability}
                  onChange={handleChange}
                  className="w-4 h-4 text-accent-600 border-gov-300 rounded focus:ring-accent-500"
                />
                <label htmlFor="disability" className="ml-2 text-sm text-gov-700">
                  Person with Disability (PwD)
                </label>
              </div>
            </div>
          </div>

          {/* Aadhaar & Bank Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
              <CreditCard className="mr-2 text-accent-600" size={20} />
              Aadhaar & Bank Details
            </h2>
            <p className="text-sm text-gov-600 mb-4">
              Store these once so you don&apos;t need to enter them for every scheme application.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="12-digit Aadhaar number"
                  maxLength="12"
                  pattern="[0-9]{12}"
                />
                <p className="text-xs text-gov-600 mt-1">Format: 123456789012</p>
              </div>
              <div>
                <label className="label">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="Bank account number"
                />
              </div>
              <div>
                <label className="label">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., SBIN0001234"
                />
              </div>
              <div>
                <label className="label">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Name of your bank"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Branch Name</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Branch name"
                />
              </div>
            </div>
          </div>

          {/* Submit Button - Save Profile (text fields only) */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Save className="mr-2" size={18} />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* Documents Section - Separate from form */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gov-900 mb-4 flex items-center">
            <FileText className="mr-2 text-accent-600" size={20} />
            Common Documents
          </h2>
          <p className="text-sm text-gov-600 mb-4">
            Upload these documents once. They will be used automatically when you apply for schemes.
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Aadhaar Document</label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex-1 min-w-[200px] flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {user?.documents?.aadhaarDocument ? 'Uploaded ✓' : pendingDocs.aadhaarDocument ? pendingDocs.aadhaarDocument.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, 'aadhaarDocument')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {user?.documents?.aadhaarDocument && (
                  <a href={user.documents.aadhaarDocument} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 hover:underline">View</a>
                )}
                {pendingDocs.aadhaarDocument && (
                  <button
                    type="button"
                    onClick={() => handleDocumentUpload('aadhaarDocument')}
                    disabled={uploading}
                    className="btn-primary flex items-center"
                  >
                    <Upload className="mr-2" size={16} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="label">Income Certificate</label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex-1 min-w-[200px] flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {user?.documents?.incomeCertificate ? 'Uploaded ✓' : pendingDocs.incomeCertificate ? pendingDocs.incomeCertificate.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, 'incomeCertificate')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {user?.documents?.incomeCertificate && (
                  <a href={user.documents.incomeCertificate} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 hover:underline">View</a>
                )}
                {pendingDocs.incomeCertificate && (
                  <button
                    type="button"
                    onClick={() => handleDocumentUpload('incomeCertificate')}
                    disabled={uploading}
                    className="btn-primary flex items-center"
                  >
                    <Upload className="mr-2" size={16} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="label">Category Certificate (SC/ST/OBC/EWS)</label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex-1 min-w-[200px] flex items-center justify-center px-4 py-3 border-2 border-dashed border-gov-300 rounded-lg hover:border-accent-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gov-400 mr-2" />
                  <span className="text-sm text-gov-600">
                    {user?.documents?.categoryCertificate ? 'Uploaded ✓' : pendingDocs.categoryCertificate ? pendingDocs.categoryCertificate.name : 'Choose file (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, 'categoryCertificate')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {user?.documents?.categoryCertificate && (
                  <a href={user.documents.categoryCertificate} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 hover:underline">View</a>
                )}
                {pendingDocs.categoryCertificate && (
                  <button
                    type="button"
                    onClick={() => handleDocumentUpload('categoryCertificate')}
                    disabled={uploading}
                    className="btn-primary flex items-center"
                  >
                    <Upload className="mr-2" size={16} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Consent Notice */}
        <div className="mt-6 p-4 bg-gov-50 border border-gov-200 rounded-lg">
          <p className="text-xs text-gov-600 text-center">
            By updating your profile, you consent to the use of this information for matching you with eligible government schemes. Your data is protected under the Digital Personal Data Protection Act, 2023.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
