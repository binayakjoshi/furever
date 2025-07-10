// Haversine formula to calculate distance between two points , sorting ko lagi 
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

exports.getNearbyVets = async (req, res, next) => {
  const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  const { lat, lng, radius, sortBy = 'distance' } = req.body;
  
  // Validate input parameters
  if (!lat || !lng || !radius) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters: lat, lng, and radius are required'
    });
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180'
    });
  }

  // Validate radius (max 50km for performance)
  if (radius < 100 || radius > 50000) {
    return res.status(400).json({
      success: false,
      message: 'Invalid radius: must be between 100 and 50000 meters'
    });
  }
  
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
      node["healthcare"="veterinary"](around:${radius},${lat},${lng});
      node["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
      way["amenity"="veterinary"](around:${radius},${lat},${lng});
      way["healthcare"="veterinary"](around:${radius},${lat},${lng});
      way["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
      rel["amenity"="veterinary"](around:${radius},${lat},${lng});
      rel["healthcare"="veterinary"](around:${radius},${lat},${lng});
      rel["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  try {
    const osres = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!osres.ok) throw new Error(`OSM error ${osres.status}`);
    
    const { elements } = await osres.json();
    
    const data = elements.map((el) => {
      const { id, tags = {}, lat: nLat, lon: nLon, center } = el;
      
      // For ways/relations use center coordinates
      const itemLat = nLat ?? center?.lat;
      const itemLon = nLon ?? center?.lon;
      
      // Skip if no coordinates available
      if (!itemLat || !itemLon) return null;
      
      // Calculate accurate distance from user location
      const distance = calculateDistance(lat, lng, itemLat, itemLon);
      
      // Extract name with fallback options
      const name = tags.name || 
                  tags['name:en'] || 
                  tags.brand || 
                  tags['healthcare:speciality'] || 
                  'Unnamed Veterinary Clinic';
      
      // Build comprehensive address string
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:neighbourhood'],
        tags['addr:suburb'],
        tags['addr:city'],
        tags['addr:state'],
        tags['addr:postcode'],
        tags['addr:country']
      ].filter(Boolean);
      
      const address = addressParts.length > 0 ? addressParts.join(', ') : null;
      
      // Extract additional useful information
      const phone = tags.phone || tags['contact:phone'] || null;
      const website = tags.website || tags['contact:website'] || null;
      const email = tags.email || tags['contact:email'] || null;
      const openingHours = tags.opening_hours || null;
      
      // Determine facility type for better categorization
      let facilityType = 'Veterinary Clinic';
      if (tags.healthcare === 'animal_hospital' || tags.name?.toLowerCase().includes('hospital')) {
        facilityType = 'Animal Hospital';
      } else if (tags.healthcare === 'veterinary' || tags.amenity === 'veterinary') {
        facilityType = 'Veterinary Clinic';
      }
      
      // Emergency services indicator
      const isEmergency = tags.emergency === 'yes' || 
                         tags['healthcare:speciality']?.includes('emergency') ||
                         tags.name?.toLowerCase().includes('emergency') ||
                         tags.name?.toLowerCase().includes('24') ||
                         tags.opening_hours?.includes('24/7') ||
                         false;
      
      // Service specialties
      const specialties = [];
      if (tags['healthcare:speciality']) {
        specialties.push(...tags['healthcare:speciality'].split(';').map(s => s.trim()));
      }
      if (tags.veterinary) {
        specialties.push(tags.veterinary);
      }
      
      return {
        id: `${el.type}/${id}`,
        name,
        address,
        lat: itemLat,
        lon: itemLon,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        distanceText: distance < 1 
          ? `${Math.round(distance * 1000)}m` 
          : `${Math.round(distance * 10) / 10}km`,
        phone,
        website,
        email,
        openingHours,
        facilityType,
        isEmergency,
        specialties,
        tags: {
          amenity: tags.amenity,
          healthcare: tags.healthcare,
          operator: tags.operator,
          brand: tags.brand
        }
      };
    })
    .filter(item => item !== null && item.lat && item.lon) // Filter out invalid items
    .sort((a, b) => {
      
      switch (sortBy) {
        case 'distance':
          
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
          
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
          return (a.name || '').localeCompare(b.name || '');
          
        case 'emergency':
          
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
          return a.distance - b.distance;
          
        case 'name':
          
          return (a.name || '').localeCompare(b.name || '');
          
        default:
          // Default to distance sorting
          return a.distance - b.distance;
      }
    });

   

    return res.json({
      success: true,
      message: `Found ${data.length} veterinary facilities within ${radius/1000}km`,
      data,
      searchParams: {
        lat,
        lng,
        radius,
        sortBy
      }
    });
    
  } catch (err) {
    console.error('Error fetching nearby vets:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch nearby veterinary services',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
exports.calculateDistance = calculateDistance;