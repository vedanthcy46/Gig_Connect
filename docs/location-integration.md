# Location-Based Search Integration

## 1. PostGIS Implementation

### Database Setup
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial indexes for performance
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_gigs_location ON gigs USING GIST (location);

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION, 
    lng1 DOUBLE PRECISION, 
    lat2 DOUBLE PRECISION, 
    lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_Point(lng1, lat1)::geography,
        ST_Point(lng2, lat2)::geography
    );
END;
$$ LANGUAGE plpgsql;
```

### Optimized Spatial Queries
```sql
-- Find freelancers within radius
SELECT 
    u.id, u.first_name, u.last_name, u.profile_image,
    fp.title, fp.hourly_rate, fp.bio,
    ST_Distance(u.location, ST_Point($1, $2)::geography) as distance_meters,
    ROUND(ST_Distance(u.location, ST_Point($1, $2)::geography)::numeric / 1000, 2) as distance_km
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE u.is_active = true 
    AND u.role IN ('freelancer', 'both')
    AND ST_DWithin(u.location, ST_Point($1, $2)::geography, $3)
ORDER BY distance_meters
LIMIT 50;

-- Find gigs within radius with category filter
SELECT 
    g.*, u.first_name, u.last_name,
    ST_Distance(g.location, ST_Point($1, $2)::geography) as distance_meters
FROM gigs g
JOIN users u ON g.client_id = u.id
WHERE g.status = 'open'
    AND ($3::text IS NULL OR g.category = $3)
    AND ($4::boolean IS NULL OR g.is_remote = $4)
    AND ST_DWithin(g.location, ST_Point($1, $2)::geography, $5)
ORDER BY 
    CASE WHEN g.urgency = 'high' THEN 1
         WHEN g.urgency = 'medium' THEN 2
         ELSE 3 END,
    distance_meters
LIMIT 100;
```

## 2. Google Maps Integration

### Frontend Implementation
```javascript
// Google Maps API integration
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchRadius, setSearchRadius] = useState(25000); // 25km in meters

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation}
        zoom={12}
        onClick={handleMapClick}
      >
        {selectedLocation && (
          <>
            <Marker position={selectedLocation} />
            <Circle
              center={selectedLocation}
              radius={searchRadius}
              options={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                strokeColor: '#3B82F6',
                strokeOpacity: 0.8,
                strokeWeight: 2
              }}
            />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

// Geocoding service
class LocationService {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  static async geocodeAddress(address) {
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id
          });
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  }

  static async reverseGeocode(lat, lng) {
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formattedAddress: results[0].formatted_address,
            components: results[0].address_components
          });
        } else {
          reject(new Error('Reverse geocoding failed'));
        }
      });
    });
  }
}
```

## 3. Backend Location Services

### Location API Endpoints
```javascript
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Search freelancers by location
router.get('/freelancers/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 25, skills, minRate, maxRate, availability } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_image,
        fp.title, fp.hourly_rate, fp.bio, fp.availability,
        fp.experience_years, fp.success_rate,
        ST_Distance(u.location, ST_Point($1, $2)::geography) as distance_meters,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count,
        array_agg(DISTINCT s.name) as skills
      FROM users u
      JOIN freelancer_profiles fp ON u.id = fp.user_id
      LEFT JOIN reviews r ON u.id = r.reviewee_id AND r.review_type = 'client_to_freelancer'
      LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
      LEFT JOIN skills s ON fs.skill_id = s.id
      WHERE u.is_active = true 
        AND u.role IN ('freelancer', 'both')
        AND ST_DWithin(u.location, ST_Point($1, $2)::geography, $3)
    `;

    const params = [lng, lat, radius * 1000]; // Convert km to meters
    let paramCount = 3;

    // Add filters
    if (availability) {
      query += ` AND fp.availability = $${++paramCount}`;
      params.push(availability);
    }

    if (minRate) {
      query += ` AND fp.hourly_rate >= $${++paramCount}`;
      params.push(minRate);
    }

    if (maxRate) {
      query += ` AND fp.hourly_rate <= $${++paramCount}`;
      params.push(maxRate);
    }

    query += `
      GROUP BY u.id, fp.id
      ORDER BY distance_meters, avg_rating DESC
      LIMIT 50
    `;

    const result = await pool.query(query, params);
    
    // Filter by skills if provided
    let freelancers = result.rows;
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      freelancers = freelancers.filter(freelancer => 
        freelancer.skills && 
        skillsArray.some(skill => 
          freelancer.skills.some(fs => fs.toLowerCase().includes(skill))
        )
      );
    }

    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search gigs by location
router.get('/gigs/nearby', async (req, res) => {
  try {
    const { 
      lat, lng, radius = 25, category, minBudget, maxBudget, 
      isRemote, urgency, skills 
    } = req.query;

    let query = `
      SELECT 
        g.*, u.first_name, u.last_name,
        ST_Distance(g.location, ST_Point($1, $2)::geography) as distance_meters
      FROM gigs g
      JOIN users u ON g.client_id = u.id
      WHERE g.status = 'open'
    `;

    const params = [lng || 0, lat || 0];
    let paramCount = 2;

    // Location filter (only if coordinates provided)
    if (lat && lng) {
      query += ` AND ST_DWithin(g.location, ST_Point($1, $2)::geography, $${++paramCount})`;
      params.push(radius * 1000);
    }

    // Other filters
    if (category) {
      query += ` AND g.category = $${++paramCount}`;
      params.push(category);
    }

    if (isRemote !== undefined) {
      query += ` AND g.is_remote = $${++paramCount}`;
      params.push(isRemote === 'true');
    }

    if (urgency) {
      query += ` AND g.urgency = $${++paramCount}`;
      params.push(urgency);
    }

    if (minBudget) {
      query += ` AND g.budget_min >= $${++paramCount}`;
      params.push(minBudget);
    }

    if (maxBudget) {
      query += ` AND g.budget_max <= $${++paramCount}`;
      params.push(maxBudget);
    }

    // Skills filter using array overlap
    if (skills) {
      query += ` AND g.required_skills && $${++paramCount}`;
      params.push(skills.split(','));
    }

    query += `
      ORDER BY 
        CASE WHEN g.urgency = 'high' THEN 1
             WHEN g.urgency = 'medium' THEN 2
             ELSE 3 END,
        ${lat && lng ? 'distance_meters,' : ''}
        g.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location suggestions (autocomplete)
router.get('/locations/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Use Google Places API for autocomplete
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}&types=(cities)`
    );
    
    const data = await response.json();
    res.json(data.predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 4. Advanced Location Features

### Geofencing for Notifications
```javascript
// Geofencing service for push notifications
class GeofencingService {
  static async checkNearbyGigs(userId, userLocation, radius = 5000) {
    const query = `
      SELECT g.id, g.title, g.budget_min, g.budget_max,
             ST_Distance(g.location, ST_Point($2, $3)::geography) as distance
      FROM gigs g
      WHERE g.status = 'open'
        AND g.created_at > NOW() - INTERVAL '24 hours'
        AND ST_DWithin(g.location, ST_Point($2, $3)::geography, $4)
        AND NOT EXISTS (
          SELECT 1 FROM gig_applications ga 
          WHERE ga.gig_id = g.id AND ga.freelancer_id = $1
        )
      ORDER BY distance
      LIMIT 5
    `;

    const result = await pool.query(query, [
      userId, 
      userLocation.lng, 
      userLocation.lat, 
      radius
    ]);

    return result.rows;
  }

  static async notifyNearbyOpportunities(userId, userLocation) {
    const nearbyGigs = await this.checkNearbyGigs(userId, userLocation);
    
    if (nearbyGigs.length > 0) {
      // Send push notification
      await NotificationService.send(userId, {
        title: 'New Gigs Nearby!',
        message: `${nearbyGigs.length} new gigs found within 5km of your location`,
        type: 'location_opportunity',
        data: { gigs: nearbyGigs }
      });
    }
  }
}

// Location tracking for mobile app
class LocationTracker {
  static startTracking(userId) {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Update user location in database
          await this.updateUserLocation(userId, location);
          
          // Check for nearby opportunities
          await GeofencingService.notifyNearbyOpportunities(userId, location);
        },
        (error) => console.error('Location tracking error:', error),
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 300000 // 5 minutes
        }
      );

      return watchId;
    }
  }

  static stopTracking(watchId) {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  static async updateUserLocation(userId, location) {
    await pool.query(
      'UPDATE users SET location = ST_Point($1, $2), updated_at = NOW() WHERE id = $3',
      [location.lng, location.lat, userId]
    );
  }
}
```

## 5. Performance Optimization

### Spatial Indexing Strategy
```sql
-- Clustered index for better performance
CLUSTER users USING idx_users_location;
CLUSTER gigs USING idx_gigs_location;

-- Partial indexes for active entities
CREATE INDEX CONCURRENTLY idx_users_active_location 
ON users USING GIST (location) 
WHERE is_active = true AND role IN ('freelancer', 'both');

CREATE INDEX CONCURRENTLY idx_gigs_open_location 
ON gigs USING GIST (location) 
WHERE status = 'open';

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_gigs_category_location 
ON gigs USING GIST (location) 
INCLUDE (category, budget_min, budget_max) 
WHERE status = 'open';
```

### Caching Strategy
```javascript
// Redis caching for location-based queries
const redis = require('redis');
const client = redis.createClient();

class LocationCache {
  static generateKey(type, lat, lng, radius, filters = {}) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `location:${type}:${lat}:${lng}:${radius}:${filterString}`;
  }

  static async get(key) {
    try {
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, data, ttl = 300) { // 5 minutes default
    try {
      await client.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async invalidateArea(lat, lng, radius) {
    // Invalidate cache for overlapping areas
    const pattern = `location:*:${lat}:${lng}:*`;
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
}

// Usage in API endpoints
router.get('/freelancers/nearby', async (req, res) => {
  const { lat, lng, radius, ...filters } = req.query;
  const cacheKey = LocationCache.generateKey('freelancers', lat, lng, radius, filters);
  
  // Try cache first
  let freelancers = await LocationCache.get(cacheKey);
  
  if (!freelancers) {
    // Query database
    freelancers = await queryFreelancersNearby(lat, lng, radius, filters);
    
    // Cache results
    await LocationCache.set(cacheKey, freelancers);
  }
  
  res.json(freelancers);
});
```

This location integration provides comprehensive geospatial functionality for GigConnect, enabling efficient proximity-based matching between clients and freelancers while maintaining high performance through proper indexing and caching strategies.