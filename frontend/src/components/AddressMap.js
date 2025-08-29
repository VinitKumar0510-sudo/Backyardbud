import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};



const AddressMap = ({ onAddressSelect, onPropertyInfoUpdate, selectedAddress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([-36.0737, 146.9135]); // Albury coordinates
  const [markerPosition, setMarkerPosition] = useState(null);
  const searchTimeout = useRef(null);

  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Try multiple search strategies
      const searches = [
        // Search with Albury context
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Albury, NSW, Australia')}&limit=3&addressdetails=1`,
        // Broader NSW search
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', NSW, Australia')}&limit=2&addressdetails=1`
      ];

      let allResults = [];
      
      for (const searchUrl of searches) {
        try {
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'BackyardBuds/1.0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              allResults = [...allResults, ...data];
            }
          }
        } catch (err) {
          console.warn('Search attempt failed:', err);
        }
      }

      // Remove duplicates and limit results
      const uniqueResults = allResults
        .filter((result, index, self) => 
          index === self.findIndex(r => r.place_id === result.place_id)
        )
        .slice(0, 5);

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  const handleAddressSelect = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapCenter([lat, lng]);
    setMarkerPosition([lat, lng]);
    setSearchQuery(result.display_name);
    setSearchResults([]);

    const addressData = {
      address: result.display_name,
      coordinates: { lat, lng }
    };

    onAddressSelect(addressData);
    await fetchPropertyInfo(lat, lng);
  };

  const handleMapClick = useCallback(({ lat, lng }) => {
    setMarkerPosition([lat, lng]);
    reverseGeocode(lat, lng);
    fetchPropertyInfo(lat, lng);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setSearchQuery(data.display_name);
        const addressData = {
          address: data.display_name,
          coordinates: { lat, lng }
        };
        onAddressSelect(addressData);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const fetchPropertyInfo = async (lat, lng) => {
    try {
      const response = await axios.get(`/api/property/info?lat=${lat}&lng=${lng}`);
      if (response.data.success && onPropertyInfoUpdate) {
        onPropertyInfoUpdate(response.data.property, response.data.message);
      }
    } catch (error) {
      console.error('Property info fetch error:', error);
      if (onPropertyInfoUpdate) {
        onPropertyInfoUpdate(null, 'Unable to fetch property information');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="form-label">Property Address</label>
        <div className="relative">
          <input
            type="text"
            className="form-input pr-10"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for an address in Albury..."
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto">
            {searchResults.map((result, index) => (
              <button
                key={result.place_id || index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleAddressSelect(result)}
              >
                <div className="text-sm font-medium text-gray-900">
                  {result.display_name}
                </div>
                <div className="text-xs text-gray-500">
                  {result.type && `${result.type} • `}{result.addresstype || 'Address'}
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {searchQuery.length >= 3 && !loading && searchResults.length === 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl p-4">
            <p className="text-sm text-gray-500">No addresses found. Try:</p>
            <ul className="text-xs text-gray-400 mt-1">
              <li>• "123 Dean Street, Albury"</li>
              <li>• "Albury Railway Station"</li>
              <li>• Just the street name</li>
            </ul>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {markerPosition && (
            <Marker position={markerPosition} />
          )}
        </MapContainer>
      </div>

      <div className="text-sm text-gray-500">
        <p className="mb-2">Search for your property address or click on the map to select a location</p>
        <div className="text-xs">
          <strong>Try searching:</strong> "123 Dean Street, Albury" or "Albury Railway Station"
        </div>
      </div>
    </div>
  );
};

export default AddressMap;