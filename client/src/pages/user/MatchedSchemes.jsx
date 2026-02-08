import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemeAPI } from '../../services/api';
import { isProfileComplete } from '../../utils/profileUtils';
import { FileText, AlertCircle, TrendingUp } from 'lucide-react';

const MatchedSchemes = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatchedSchemes();
    }
  }, [user]);

  const fetchMatchedSchemes = async () => {
    try {
      // Check if profile has enough data for meaningful matching
      const hasMinimumData = isProfileComplete(user);
      
      if (!hasMinimumData) {
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      const response = await schemeAPI.getMatchedSchemes();
      setSchemes(response.data.data || []);
      setProfileComplete(true);
    } catch (error) {
      console.error('Error fetching matched schemes:', error);
      // If it's a 400 error, profile might be incomplete
      if (error.response?.status === 400) {
        setProfileComplete(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
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

  if (!profileComplete) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="text-yellow-600" size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-gov-900 mb-3">
            Complete Your Profile
          </h2>
          <p className="text-gov-600 mb-6">
            Please complete your profile to see schemes you're eligible for
          </p>
          <Link to="/user/profile" className="btn-primary">
            Update Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-header">Matched Schemes</h1>
        <p className="text-gov-600">
          Schemes you're eligible for based on your profile
        </p>
      </div>

      {/* Stats Card */}
      {schemes.length > 0 && (
        <div className="mb-6 p-6 bg-accent-600 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-1">{schemes.length}</div>
              <p className="text-accent-100">Schemes Matched</p>
            </div>
            <TrendingUp size={48} className="text-accent-200" />
          </div>
        </div>
      )}

      {/* Schemes List */}
      {schemes.length === 0 ? (
        <div className="card text-center py-12">
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80"
            alt="No schemes found"
            className="w-48 h-48 object-cover rounded-lg mx-auto mb-6 opacity-60"
          />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">
            No Matched Schemes
          </h3>
          <p className="text-gov-600 mb-6">
            We couldn't find any schemes matching your profile at the moment
          </p>
          <Link to="/user/all-schemes" className="btn-primary">
            Browse All Schemes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((item) => {
            if (!item?.scheme) return null;
            
            const matchPercentage = Math.round(item.matchPercentage || 0);
            
            return (
              <div key={item.scheme._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gov-900 mb-1">
                          {item.scheme.name || 'Unnamed Scheme'}
                        </h3>
                        <p className="text-sm text-gov-600 font-medium mb-3">
                          {item.scheme.ministry || 'Ministry not specified'}
                        </p>
                      </div>
                      <div className={`ml-4 flex items-center justify-center w-20 h-20 rounded-full ${getMatchColor(matchPercentage)} flex-shrink-0`}>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{matchPercentage}%</div>
                          <div className="text-xs">Match</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gov-700 mb-4 line-clamp-2">
                      {item.scheme.description || 'No description available'}
                    </p>

                    {/* Matched Rules */}
                    {item.matchedRules && Array.isArray(item.matchedRules) && item.matchedRules.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gov-900 mb-2">
                          Why you match:
                        </h4>
                        <div className="space-y-1">
                          {item.matchedRules.slice(0, 3).map((rule, idx) => (
                            <div key={idx} className="text-sm text-gov-700 flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="capitalize">
                                {rule?.field?.replace(/_/g, ' ') || 'N/A'}: {rule?.operator || 'N/A'} {Array.isArray(rule?.value) ? rule.value.join(', ') : (rule?.value || 'N/A')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.scheme._id && (
                      <Link
                        to={`/user/scheme/${item.scheme._id}`}
                        className="inline-flex items-center text-accent-600 hover:text-accent-700 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchedSchemes;
