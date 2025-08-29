import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddressMap from '../components/AddressMap';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string values to numbers where needed
      const assessmentData = {
        property: {
          ...formData.property,
          lotSize: parseFloat(formData.property.lotSize)
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
        <div className="text-center mb-8">
          <img 
            src="/backyard-buds-logo.svg" 
            alt="Backyard Buds Logo" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Backyard Assessment</h1>
          <p className="text-gray-600 text-lg">
            Let's check if your backyard project qualifies as exempt development!
          </p>
        </div>

        {error && (
          <div className="alert-danger mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Location */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Location</h2>
            <AddressMap 
              onAddressSelect={handleAddressSelect}
              onPropertyInfoUpdate={handlePropertyInfoUpdate}
              selectedAddress={formData.property.address}
            />
            {propertyInfoMessage && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {propertyInfoMessage}
                </p>
              </div>
            )}
          </div>

          {/* Property Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Property Type</label>
                <select
                  className="form-select"
                  value={formData.property.type}
                  onChange={(e) => handleInputChange('property', 'type', e.target.value)}
                  required
                >
                  <option value="">Select property type</option>
                  <option value="urban">Urban</option>
                  <option value="rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="form-label">Lot Size (m²)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.property.lotSize}
                  onChange={(e) => handleInputChange('property', 'lotSize', e.target.value)}
                  placeholder="e.g. 800"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="form-label">Zoning (Optional)</label>
                <select
                  className="form-select"
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

          {/* Proposal Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Structure Type</label>
                <select
                  className="form-select"
                  value={formData.proposal.structureType}
                  onChange={(e) => handleInputChange('proposal', 'structureType', e.target.value)}
                  required
                >
                  <option value="">Select structure type</option>
                  <option value="shed">Shed</option>
                  <option value="patio">Patio</option>
                  <option value="pergola">Pergola</option>
                  <option value="carport">Carport</option>
                </select>
              </div>

              <div>
                <label className="form-label">Height (metres)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.proposal.height}
                  onChange={(e) => handleInputChange('proposal', 'height', e.target.value)}
                  placeholder="e.g. 3.5"
                  min="0.1"
                  max="10"
                  required
                />
              </div>

              <div>
                <label className="form-label">Floor Area (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.proposal.floorArea}
                  onChange={(e) => handleInputChange('proposal', 'floorArea', e.target.value)}
                  placeholder="e.g. 40"
                  min="0.1"
                  required
                />
              </div>

              <div>
                <label className="form-label">Distance from Boundary (metres)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.proposal.distanceFromBoundary}
                  onChange={(e) => handleInputChange('proposal', 'distanceFromBoundary', e.target.value)}
                  placeholder="e.g. 2.5"
                  min="0"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum distance from any property boundary
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`btn-primary px-8 py-3 text-lg ${
                (!isFormValid() || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assessing...
                </span>
              ) : (
                'Assess Proposal'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 p-6 rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need Help?
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Measurements should be in metres and square metres
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Distance from boundary is the closest distance to any property boundary
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Height is measured from natural ground level to the highest point
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Floor area includes the total covered area of the structure
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
