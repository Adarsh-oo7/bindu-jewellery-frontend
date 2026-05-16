import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, Navigation, Save, X, Plus, Tag, 
  Phone, Mail, Building, Calendar
} from 'lucide-react';
import api from '@/lib/api';

const LocationMarker = ({ 
  onLocationSaved, 
  initialLocation = null,
  buttonText = "Mark Location"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'customer',
    phone: '',
    email: '',
    address: '',
    latitude: null,
    longitude: null,
    accuracy: null
  });

  const locationTypes = [
    { value: 'customer', label: 'Customer', color: 'bg-green-500' },
    { value: 'lead', label: 'Lead', color: 'bg-blue-500' },
    { value: 'branch', label: 'Branch', color: 'bg-yellow-500' },
    { value: 'competitor', label: 'Competitor', color: 'bg-red-500' },
    { value: 'supplier', label: 'Supplier', color: 'bg-purple-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' }
  ];

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get current location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latitude, longitude) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
      accuracy: null
    }));
    setCurrentLocation({ latitude, longitude, accuracy: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map or get current location');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a location name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/field-visits/location-markers/', formData);
      
      if (response.data) {
        alert('Location marked successfully!');
        setIsOpen(false);
        resetForm();
        if (onLocationSaved) {
          onLocationSaved(response.data);
        }
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error saving location: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'customer',
      phone: '',
      email: '',
      address: '',
      latitude: null,
      longitude: null,
      accuracy: null
    });
    setCurrentLocation(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mark Location
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span className="font-medium">Location Selection</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Navigation className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                  {loading ? 'Getting Location...' : 'Use Current Location'}
                </Button>
                
                {currentLocation && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    {currentLocation.accuracy && (
                      <span>(±{Math.round(currentLocation.accuracy)}m)</span>
                    )}
                  </div>
                )}
              </div>
              
              {!currentLocation && (
                <p className="text-sm text-muted-foreground">
                  Click on the map or use current location to select a point
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Basic Information</span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Location Type *</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {locationTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${type.color} mr-1`}></span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter location name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter location description"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="font-medium">Contact Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    type="tel"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    type="email"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </div>

            {/* Hidden coordinates */}
            <input type="hidden" name="latitude" value={formData.latitude || ''} />
            <input type="hidden" name="longitude" value={formData.longitude || ''} />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.latitude || !formData.longitude}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationMarker;
