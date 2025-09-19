const fs = require('fs');
const path = require('path');

class PropertyService {
  constructor() {
    this.properties = [];
    this.loaded = false;
    this.loadData();
  }

  loadData() {
    try {
      const csvPath = path.join(__dirname, '../data/Property_Boundaries.csv');
      const csvData = fs.readFileSync(csvPath, 'utf8');
      
      // Parse CSV data
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      this.properties = lines.slice(1)
        .filter(line => line.trim()) // Remove empty lines
        .map(line => {
          const values = this.parseCSVLine(line);
          const property = {};
          
          headers.forEach((header, index) => {
            property[header.trim()] = values[index] ? values[index].trim() : '';
          });
          
          return this.processProperty(property);
        })
        .filter(property => property.addressNumber); // Filter out invalid entries
      
      this.loaded = true;
      console.log(`✅ Loaded ${this.properties.length} properties from Albury Council data`);
      
    } catch (error) {
      console.error('❌ Error loading property data:', error.message);
      this.properties = [];
      this.loaded = false;
    }
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current); // Add the last value
    return values;
  }

  processProperty(rawProperty) {
    // Convert area to square meters if needed
    let lotSizeM2 = 0;
    const areaTotal = parseFloat(rawProperty.area_total) || 0;
    const areaUnits = rawProperty.area_units || '';
    
    if (areaUnits === 'm²') {
      lotSizeM2 = areaTotal;
    } else if (areaUnits === 'h²') {
      lotSizeM2 = areaTotal * 10000; // Convert hectares to m²
    }

    // Determine property type based on lot size and suburb
    const propertyType = this.determinePropertyType(lotSizeM2, rawProperty.suburb);
    
    // Determine zoning (simplified mapping)
    const zoning = this.determineZoning(rawProperty.suburb, propertyType);

    return {
      objectId: rawProperty.OBJECTID,
      propertyNumber: rawProperty.property_number,
      houseNumber: rawProperty.house_number,
      addressNumber: rawProperty.address_number,
      streetName: rawProperty.street_name,
      streetSuffix: rawProperty.street_suffix,
      suburb: rawProperty.suburb,
      postCode: rawProperty.post_code,
      fullAddress: rawProperty.short_address,
      lotNumber: rawProperty.lot_number,
      planNumber: rawProperty.plan_number,
      title: rawProperty.title,
      lotSizeM2: Math.round(lotSizeM2),
      lotSizeDisplay: `${areaTotal} ${areaUnits}`,
      propertyType,
      zoning,
      shapeArea: parseFloat(rawProperty.Shape__Area) || 0,
      shapeLength: parseFloat(rawProperty.Shape__Length) || 0
    };
  }

  determinePropertyType(lotSizeM2, suburb) {
    // Urban areas in Albury region
    const urbanSuburbs = [
      'ALBURY', 'EAST ALBURY', 'WEST ALBURY', 'NORTH ALBURY', 'SOUTH ALBURY',
      'LAVINGTON', 'THURGOONA', 'SPRINGDALE HEIGHTS'
    ];
    
    const isUrbanSuburb = urbanSuburbs.includes(suburb?.toUpperCase());
    
    // Generally, lots over 2000m² in rural areas or over 1000m² in outer areas are considered rural
    if (lotSizeM2 > 2000 && !isUrbanSuburb) {
      return 'rural';
    } else if (lotSizeM2 > 1000 && ['TABLE TOP', 'WIRLINGA', 'ETTAMOGAH', 'SPLITTERS CREEK'].includes(suburb?.toUpperCase())) {
      return 'rural';
    }
    
    return 'urban';
  }

  determineZoning(suburb, propertyType) {
    // Simplified zoning determination based on suburb and property type
    // In reality, this would come from council zoning maps
    
    if (propertyType === 'rural') {
      return 'RU1'; // Primary Production
    }
    
    // Urban residential zones
    const highDensitySuburbs = ['ALBURY', 'EAST ALBURY', 'WEST ALBURY'];
    const mediumDensitySuburbs = ['NORTH ALBURY', 'SOUTH ALBURY', 'LAVINGTON'];
    
    if (highDensitySuburbs.includes(suburb?.toUpperCase())) {
      return 'R3'; // Medium Density Residential
    } else if (mediumDensitySuburbs.includes(suburb?.toUpperCase())) {
      return 'R2'; // Low Density Residential
    }
    
    return 'R1'; // General Residential
  }

  // Search properties by address
  searchByAddress(searchTerm) {
    if (!this.loaded || !searchTerm) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    
    return this.properties
      .filter(property => {
        const fullAddress = property.fullAddress?.toLowerCase() || '';
        const streetName = property.streetName?.toLowerCase() || '';
        const suburb = property.suburb?.toLowerCase() || '';
        
        return fullAddress.includes(term) || 
               streetName.includes(term) || 
               suburb.includes(term) ||
               (property.houseNumber && property.houseNumber.toString().includes(term));
      })
      .slice(0, 10); // Limit to 10 results
  }

  // Get property by exact address match
  getByAddress(houseNumber, streetName, suburb) {
    if (!this.loaded) {
      return null;
    }

    return this.properties.find(property => {
      const matchHouse = !houseNumber || property.houseNumber === houseNumber.toString();
      const matchStreet = !streetName || 
        property.streetName?.toLowerCase() === streetName.toLowerCase();
      const matchSuburb = !suburb || 
        property.suburb?.toLowerCase() === suburb.toLowerCase();
      
      return matchHouse && matchStreet && matchSuburb;
    });
  }

  // Get property by property number
  getByPropertyNumber(propertyNumber) {
    if (!this.loaded) {
      return null;
    }

    return this.properties.find(property => 
      property.propertyNumber === propertyNumber.toString()
    );
  }

  // Get all suburbs
  getSuburbs() {
    if (!this.loaded) {
      return [];
    }

    const suburbs = [...new Set(this.properties.map(p => p.suburb).filter(Boolean))];
    return suburbs.sort();
  }

  // Get streets in a suburb
  getStreetsInSuburb(suburb) {
    if (!this.loaded || !suburb) {
      return [];
    }

    const streets = this.properties
      .filter(p => p.suburb?.toLowerCase() === suburb.toLowerCase())
      .map(p => `${p.streetName} ${p.streetSuffix}`.trim())
      .filter(Boolean);
    
    return [...new Set(streets)].sort();
  }

  // Get property statistics
  getStats() {
    if (!this.loaded) {
      return null;
    }

    const totalProperties = this.properties.length;
    const urbanProperties = this.properties.filter(p => p.propertyType === 'urban').length;
    const ruralProperties = this.properties.filter(p => p.propertyType === 'rural').length;
    
    const suburbs = this.getSuburbs();
    
    const avgLotSize = this.properties.reduce((sum, p) => sum + p.lotSizeM2, 0) / totalProperties;
    
    return {
      totalProperties,
      urbanProperties,
      ruralProperties,
      totalSuburbs: suburbs.length,
      averageLotSize: Math.round(avgLotSize),
      suburbs: suburbs.slice(0, 10) // Top 10 suburbs
    };
  }
}

// Create singleton instance
const propertyService = new PropertyService();

module.exports = propertyService;