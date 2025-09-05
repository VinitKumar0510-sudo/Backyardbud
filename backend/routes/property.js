const express = require('express');
const router = express.Router();

// Mock property data for demonstration
// In production, this would connect to council databases or GIS services
const mockPropertyData = {
  getPropertyInfo: (lat, lng) => {
    // Simple logic to determine property type based on location
    // This is mock data - in reality you'd query actual property databases
    
    // Determine urban vs rural based on general Australian patterns
    // This is simplified - in reality you'd use proper land use data
    const majorCities = [
      { lat: -33.8688, lng: 151.2093, radius: 0.5 }, // Sydney
      { lat: -37.8136, lng: 144.9631, radius: 0.4 }, // Melbourne
      { lat: -27.4698, lng: 153.0251, radius: 0.3 }, // Brisbane
      { lat: -31.9505, lng: 115.8605, radius: 0.3 }, // Perth
      { lat: -34.9285, lng: 138.6007, radius: 0.2 }, // Adelaide
      { lat: -35.2809, lng: 149.1300, radius: 0.2 }, // Canberra
    ];
    
    const isUrban = majorCities.some(city => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      return distance < city.radius;
    });
    
    // Generate mock lot size based on property type
    const lotSize = isUrban ? 
      Math.floor(Math.random() * (800 - 300) + 300) : // Urban: 300-800m²
      Math.floor(Math.random() * (10000 - 1000) + 1000); // Rural: 1000-10000m²
    
    // Determine zoning based on location and type (Australian standard zones)
    const zoning = isUrban ? 
      ['R1', 'R2', 'R3', 'R4'][Math.floor(Math.random() * 4)] :
      ['RU1', 'RU2', 'RU4', 'RU5'][Math.floor(Math.random() * 4)];
    
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
    
    // Check if coordinates are within Australia
    if (latitude < -44 || latitude > -10 || longitude < 113 || longitude > 154) {
      return res.status(400).json({
        error: 'Location outside service area',
        message: 'This tool is currently only available for properties in Australia'
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