import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddressMap from '../components/AddressMap';
import PropertySearch from '../components/PropertySearch';
import SelectedPropertyMap from '../components/SelectedPropertyMap';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyInfoMessage, setPropertyInfoMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    property: {
      type: '',
      lotSize: '',
      zoning: 'R1',
      address: '',
      coordinates: null
    },
    proposal: {
      structureType: '',
      height: '',
      floorArea: '',
      distanceFromBoundary: ''
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setError(null);
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      property: {
        ...prev.property,
        address: addressData.address,
        coordinates: addressData.coordinates
      }
    }));
    setError(null);
  };

  const handlePropertyInfoUpdate = (propertyInfo, message) => {
    if (propertyInfo) {
      setFormData(prev => ({
        ...prev,
        property: {
          ...prev.property,
          type: propertyInfo.type,
          lotSize: propertyInfo.lotSize.toString(),
          zoning: propertyInfo.zoning
        }
      }));
    }
    setPropertyInfoMessage(message);
  };

  const handlePropertySelect = (propertyData) => {
    setFormData(prev => ({
      ...prev,
      property: {
        ...prev.property,
        type: propertyData.type,
        lotSize: propertyData.lotSize.toString(),
        zoning: propertyData.zoning,
        address: propertyData.address
      }
    }));
    setPropertyInfoMessage('Property information loaded from Albury Council database');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string values to numbers where needed
      const assessmentData = {
        property: {
          type: formData.property.type,
          lotSize: parseFloat(formData.property.lotSize),
          zoning: formData.property.zoning,
          // Only include address and coordinates if they exist
          ...(formData.property.address && { address: formData.property.address }),
          ...(formData.property.coordinates && { coordinates: formData.property.coordinates })
        },
        proposal: {
          ...formData.proposal,
          height: parseFloat(formData.proposal.height),
          floorArea: parseFloat(formData.proposal.floorArea),
          distanceFromBoundary: parseFloat(formData.proposal.distanceFromBoundary)
        }
      };

      const response = await axios.post('/api/assess', assessmentData);
      
      // Navigate to results page with assessment data
      navigate('/results', { 
        state: { 
          assessment: response.data.assessment,
          input: assessmentData,
          metadata: response.data.metadata
        } 
      });

    } catch (err) {
      console.error('Assessment error:', err);
      setError(
        err.response?.data?.details?.join(', ') || 
        err.response?.data?.message || 
        'Failed to assess proposal. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const { property, proposal } = formData;
    return (
      property.type &&
      property.lotSize &&
      proposal.structureType &&
      proposal.height &&
      proposal.floorArea &&
      proposal.distanceFromBoundary
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white bg-opacity-90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-white border-opacity-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Development Approval Assessment
          </h1>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Determine if your proposed structure requires council approval under NSW planning regulations
          </p>
          <div className="flex justify-center space-x-12 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Complimentary Assessment
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              NSW SEPP Compliant
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Immediate Results
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-danger mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step 1: Property Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-slate-700 text-white rounded w-8 h-8 flex items-center justify-center font-semibold mr-4 text-sm">1</div>
            <h2 className="text-xl font-semibold text-gray-900">Property Location</h2>
          </div>
          <p className="text-gray-600 mb-6">Search for your property to retrieve accurate lot size and zoning information from council records</p>
          <PropertySearch onPropertySelect={handlePropertySelect} />
        </div>
        


        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 2: Property Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-slate-700 text-white rounded w-8 h-8 flex items-center justify-center font-semibold mr-4 text-sm">2</div>
              <h2 className="text-xl font-semibold text-gray-900">Property Information</h2>
            </div>
            {propertyInfoMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">
                  {propertyInfoMessage}
                </p>
              </div>
            )}
            
            {/* Property Location Display */}
            {formData.property.address && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Property Location
                </h3>
                <SelectedPropertyMap address={formData.property.address} />
              </div>
            )}
            
            {/* Manual Address Entry - Only show if no property selected */}
            {!formData.property.address && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Manual Address Entry
                  </h3>
                  <span className="text-xs text-gray-500">For properties outside Albury region</span>
                </div>
                <AddressMap 
                  onAddressSelect={handleAddressSelect}
                  onPropertyInfoUpdate={handlePropertyInfoUpdate}
                />
              </div>
            )}
            


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.property.type}
                  onChange={(e) => handleInputChange('property', 'type', e.target.value)}
                  required
                >
                  <option value="">Select property type</option>
                  <option value="urban">Urban (city/suburban)</option>
                  <option value="rural">Rural (farm/acreage)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lot Size (m²)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.property.lotSize}
                  onChange={(e) => handleInputChange('property', 'lotSize', e.target.value)}
                  placeholder="e.g. 800"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">As shown on property title or rates notice</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoning Classification
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.property.zoning}
                  onChange={(e) => handleInputChange('property', 'zoning', e.target.value)}
                >
                  <option value="R1">R1 - General Residential</option>
                  <option value="R2">R2 - Low Density Residential</option>
                  <option value="R3">R3 - Medium Density Residential</option>
                  <option value="R5">R5 - Large Lot Residential</option>
                  <option value="RU1">RU1 - Primary Production</option>
                  <option value="RU5">RU5 - Village</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Proposed Development */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-slate-700 text-white rounded w-8 h-8 flex items-center justify-center font-semibold mr-4 text-sm">3</div>
              <h2 className="text-xl font-semibold text-gray-900">Proposed Development</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structure Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.proposal.structureType}
                  onChange={(e) => handleInputChange('proposal', 'structureType', e.target.value)}
                  required
                >
                  <option value="">Select structure type</option>
                  <option value="shed">Shed (storage/workshop)</option>
                  <option value="patio">Patio (covered outdoor area)</option>
                  <option value="pergola">Pergola (garden structure)</option>
                  <option value="carport">Carport (vehicle shelter)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Height (metres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.proposal.height}
                  onChange={(e) => handleInputChange('proposal', 'height', e.target.value)}
                  placeholder="e.g. 3.5"
                  min="0.1"
                  max="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Measured from natural ground level to highest point</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Area (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.proposal.floorArea}
                  onChange={(e) => handleInputChange('proposal', 'floorArea', e.target.value)}
                  placeholder="e.g. 40"
                  min="0.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Total covered area (length × width)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Boundary Setback (metres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={formData.proposal.distanceFromBoundary}
                  onChange={(e) => handleInputChange('proposal', 'distanceFromBoundary', e.target.value)}
                  placeholder="e.g. 2.5"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Closest distance to any property boundary</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-md shadow-sm transition-colors duration-200 ${
                (!isFormValid() || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Assessment...
                </span>
              ) : (
                'Submit Assessment'
              )}
            </button>
            <p className="text-gray-500 mt-3 text-sm">Assessment typically completes within 30 seconds</p>
          </div>
        </form>

        {/* Information Panel */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Assessment Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Measurement Requirements</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• All measurements must be accurate to 0.1m</li>
                <li>• Height measured from natural ground level</li>
                <li>• Floor area includes all covered areas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Boundary Setbacks</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Measure to all property boundaries</li>
                <li>• Include front, side, and rear setbacks</li>
                <li>• Use the minimum distance found</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> This assessment is based on NSW State Environmental Planning Policy (SEPP) regulations. 
              Local council requirements may vary. Always consult with your local council for definitive approval requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
