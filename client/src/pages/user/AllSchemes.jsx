import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schemeAPI } from '../../services/api';
import { FileText, Search, Filter } from 'lucide-react';

const AllSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [ministries, setMinistries] = useState([]);

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchTerm, selectedMinistry, schemes]);

  const fetchSchemes = async () => {
    try {
      const response = await schemeAPI.getAllSchemes();
      const schemesData = response.data.data || [];
      setSchemes(schemesData);
      setFilteredSchemes(schemesData);

      // Extract unique ministries
      const uniqueMinistries = [...new Set(schemesData.map((s) => s?.ministry).filter(Boolean))];
      setMinistries(uniqueMinistries);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    if (!schemes || schemes.length === 0) {
      setFilteredSchemes([]);
      return;
    }

    let filtered = [...schemes];

    if (searchTerm) {
      filtered = filtered.filter(
        (scheme) =>
          scheme?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMinistry) {
      filtered = filtered.filter((scheme) => scheme?.ministry === selectedMinistry);
    }

    setFilteredSchemes(filtered);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-header">All Schemes</h1>
        <p className="text-gov-600">
          Browse all available government schemes
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="label">
              <Search size={16} className="inline mr-2" />
              Search Schemes
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              placeholder="Search by name or description..."
            />
          </div>

          {/* Ministry Filter */}
          <div>
            <label className="label">
              <Filter size={16} className="inline mr-2" />
              Filter by Ministry
            </label>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="input"
            >
              <option value="">All Ministries</option>
              {ministries.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gov-200">
          <p className="text-sm text-gov-600">
            Showing <span className="font-semibold text-gov-900">{filteredSchemes.length}</span> of{' '}
            <span className="font-semibold text-gov-900">{schemes.length}</span> schemes
          </p>
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gov-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gov-900 mb-2">
            No Schemes Found
          </h3>
          <p className="text-gov-600">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme?._id || Math.random()} className="card hover:shadow-medium transition-shadow">
              <h3 className="text-lg font-semibold text-gov-900 mb-2">
                {scheme?.name || 'Unnamed Scheme'}
              </h3>
              <p className="text-sm text-gov-600 font-medium mb-3">
                {scheme?.ministry || 'Ministry not specified'}
              </p>
              <p className="text-gov-700 mb-4 line-clamp-3">
                {scheme?.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gov-200">
                <span className={`badge ${scheme?.active ? 'badge-success' : 'badge-secondary'}`}>
                  {scheme?.active ? 'Active' : 'Inactive'}
                </span>
                {scheme?._id && (
                  <Link
                    to={`/user/scheme/${scheme._id}`}
                    className="inline-flex items-center text-accent-600 hover:text-accent-700 font-medium text-sm"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSchemes;
