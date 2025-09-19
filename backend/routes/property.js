const express = require('express');
const router = express.Router();
const propertyService = require('../services/propertyService');

// Search properties by address
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid search term',
        message: 'Search term must be at least 2 characters long'
      });
    }
    
    const results = propertyService.searchByAddress(q);
    
    // Add formatted data for frontend
    const formattedResults = results.map(property => ({
      objectId: property.objectId,
      address: property.fullAddress,
      fullAddress: property.fullAddress,
      houseNumber: property.houseNumber,
      streetName: property.streetName,
      suburb: property.suburb,
      lotSize: property.lotSizeM2,
      lotSizeDisplay: property.lotSizeDisplay,
      type: property.propertyType,
      propertyType: property.propertyType,
      zoning: property.zoning,
      title: property.title
    }));
    
    res.json({
      success: true,
      results: formattedResults,
      properties: formattedResults,
      count: formattedResults.length,
      message: `Found ${formattedResults.length} matching properties`
    });
    
  } catch (error) {
    console.error('Property search error:', error);
    res.status(500).json({
      error: 'Property search failed',
      message: 'Unable to search properties'
    });
  }
});

// Get property by address components
router.get('/address', (req, res) => {
  try {
    const { houseNumber, streetName, suburb } = req.query;
    
    if (!streetName && !suburb) {
      return res.status(400).json({
        error: 'Missing address components',
        message: 'Street name or suburb is required'
      });
    }
    
    const property = propertyService.getByAddress(houseNumber, streetName, suburb);
    
    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
        message: 'No property found matching the provided address'
      });
    }
    
    res.json({
      success: true,
      property: {
        type: property.propertyType,
        lotSize: property.lotSizeM2,
        zoning: property.zoning,
        address: property.fullAddress,
        suburb: property.suburb,
        postCode: property.postCode,
        lotNumber: property.lotNumber,
        planNumber: property.planNumber,
        title: property.title,
        estimatedData: false
      },
      message: 'Property information retrieved from Albury Council data'
    });
    
  } catch (error) {
    console.error('Property lookup error:', error);
    res.status(500).json({
      error: 'Property lookup failed',
      message: 'Unable to retrieve property information'
    });
  }
});

// Get property by property number
router.get('/number/:propertyNumber', (req, res) => {
  try {
    const { propertyNumber } = req.params;
    
    const property = propertyService.getByPropertyNumber(propertyNumber);
    
    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
        message: `No property found with number ${propertyNumber}`
      });
    }
    
    res.json({
      success: true,
      property: {
        type: property.propertyType,
        lotSize: property.lotSizeM2,
        zoning: property.zoning,
        address: property.fullAddress,
        suburb: property.suburb,
        postCode: property.postCode,
        lotNumber: property.lotNumber,
        planNumber: property.planNumber,
        title: property.title,
        estimatedData: false
      },
      message: 'Property information retrieved from Albury Council data'
    });
    
  } catch (error) {
    console.error('Property lookup error:', error);
    res.status(500).json({
      error: 'Property lookup failed',
      message: 'Unable to retrieve property information'
    });
  }
});

// Get all suburbs
router.get('/suburbs', (req, res) => {
  try {
    const suburbs = propertyService.getSuburbs();
    
    res.json({
      success: true,
      suburbs,
      count: suburbs.length
    });
    
  } catch (error) {
    console.error('Suburbs lookup error:', error);
    res.status(500).json({
      error: 'Suburbs lookup failed',
      message: 'Unable to retrieve suburbs list'
    });
  }
});

// Get streets in a suburb
router.get('/streets/:suburb', (req, res) => {
  try {
    const { suburb } = req.params;
    const streets = propertyService.getStreetsInSuburb(suburb);
    
    res.json({
      success: true,
      streets,
      suburb,
      count: streets.length
    });
    
  } catch (error) {
    console.error('Streets lookup error:', error);
    res.status(500).json({
      error: 'Streets lookup failed',
      message: 'Unable to retrieve streets list'
    });
  }
});

// Get property statistics
router.get('/stats', (req, res) => {
  try {
    const stats = propertyService.getStats();
    
    if (!stats) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Property data is not loaded'
      });
    }
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Stats lookup error:', error);
    res.status(500).json({
      error: 'Stats lookup failed',
      message: 'Unable to retrieve property statistics'
    });
  }
});

module.exports = router;