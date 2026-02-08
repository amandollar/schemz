import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  requireInput = false,
  inputLabel = '',
  inputPlaceholder = '',
  inputRequired = false
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireInput && inputRequired && !inputValue.trim()) {
      return; // Don't close if input is required but empty
    }
    onConfirm(inputValue.trim() || null);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (!requireInput || (requireInput && inputValue.trim()))) {
      handleConfirm();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="text-red-600" size={24} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={24} />;
      default:
        return <AlertCircle className="text-blue-600" size={24} />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onKeyDown={handleKeyPress}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gov-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gov-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gov-400 hover:text-gov-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gov-700 mb-4">{message}</p>
          
          {requireInput && (
            <div>
              <label className="block text-sm font-medium text-gov-900 mb-2">
                {inputLabel}
                {inputRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-3 py-2 border border-gov-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gov-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gov-700 bg-gov-100 hover:bg-gov-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={requireInput && inputRequired && !inputValue.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              requireInput && inputRequired && !inputValue.trim()
                ? 'bg-gov-300 text-gov-500 cursor-not-allowed'
                : getButtonColor()
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
