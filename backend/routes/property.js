const express = require('express');
const router = express.Router();

// Mock property data for demonstration
// In production, this would connect to council databases or GIS services
const mockPropertyData = {
  getPropertyInfo: (lat, lng) => {
    // Simple logic to determine property type based on location
    // This is mock data - in reality you'd query actual property databases
    
    // Rough boundaries for Albury urban vs rural areas
    const isUrban = lat > -36.1 && lat < -36.0 && lng > 146.9 && lng < 147.0;
    
    // Generate mock lot size based on property type
    const lotSize = isUrban ? 
      Math.floor(Math.random() * (1000 - 400) + 400) : // Urban: 400-1000m²
      Math.floor(Math.random() * (5000 - 1000) + 1000); // Rural: 1000-5000m²
    
    // Determine zoning based on location and type
    const zoning = isUrban ? 
      ['R1', 'R2', 'R3'][Math.floor(Math.random() * 3)] :
      ['RU1', 'RU5'][Math.floor(Math.random() * 2)];
    
    return {
      type: isUrban ? 'urban' : 'rural',
      lotSize,
      zoning,
      estimatedData: true // Flag to indicate this is estimated data
    };
  }
};

// Get property information based on coordinates
router.get('/info', (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'Latitude and longitude are required'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude and longitude must be valid numbers'
      });
    }
    
    // Check if coordinates are roughly within Albury area
    if (latitude < -36.2 || latitude > -35.9 || longitude < 146.8 || longitude > 147.1) {
      return res.status(400).json({
        error: 'Location outside service area',
        message: 'This tool is currently only available for properties in Albury'
      });
    }
    
    const propertyInfo = mockPropertyData.getPropertyInfo(latitude, longitude);
    
    res.json({
      success: true,
      property: propertyInfo,
      coordinates: { lat: latitude, lng: longitude },
      message: propertyInfo.estimatedData ? 
        'Property information is estimated. Please verify lot size and zoning details.' :
        'Property information retrieved successfully.'
    });
    
  } catch (error) {
    console.error('Property lookup error:', error);
    res.status(500).json({
      error: 'Property lookup failed',
      message: 'Unable to retrieve property information'
    });
  }
});

module.exports = router;