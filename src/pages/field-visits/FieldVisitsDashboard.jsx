import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Clock, CheckCircle, XCircle, Users, TrendingUp, Map } from 'lucide-react';
import api from '@/api/axios';
import LocationMap from '@/components/maps/LocationMap';
import LocationMarker from '@/components/maps/LocationMarker';

const FieldVisitsDashboard = () => {
  const [visits, setVisits] = useState([]);
  const [liveTracking, setLiveTracking] = useState([]);
  const [gpsCheckins, setGpsCheckins] = useState([]);
  const [visitReports, setVisitReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore

  useEffect(() => {
    fetchFieldVisitsData();
  }, []);

  const fetchFieldVisitsData = async () => {
    try {
      const [visitsRes, trackingRes, checkinsRes, reportsRes] = await Promise.all([
        api.get('/field-visits/field-visits/'),
        api.get('/field-visits/live-tracking/'),
        api.get('/field-visits/gps-checkins/'),
        api.get('/field-visits/visit-reports/')
      ]);

      setVisits(visitsRes.data);
      setLiveTracking(trackingRes.data.locations || []);
      setGpsCheckins(checkinsRes.data);
      setVisitReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching field visits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      
      // Send location to backend
      await api.post('/field-visits/location-tracking/', {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy
      });
      
      alert('Location updated successfully!');
      fetchFieldVisitsData();
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location: ' + (error.response?.data?.detail || error.message));
    }
  };

  const startVisit = async (leadId) => {
    try {
      await api.post('/field-visits/field-visits/start/', {
        lead: leadId,
        notes: 'Field visit started'
      });
      fetchFieldVisitsData();
    } catch (error) {
      console.error('Error starting visit:', error);
    }
  };

  const checkIn = async (visitId) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await api.post(`/field-visits/field-visits/${visitId}/check-in/`, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchFieldVisitsData();
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const endVisit = async (visitId) => {
    try {
      await api.post(`/field-visits/field-visits/${visitId}/end/`, {
        notes: 'Field visit completed'
      });
      fetchFieldVisitsData();
    } catch (error) {
      console.error('Error ending visit:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'scheduled': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Visits</p>
                <p className="text-2xl font-bold">{visits.filter(v => v.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{visits.filter(v => v.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Navigation className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">GPS Check-ins</p>
                <p className="text-2xl font-bold">{gpsCheckins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visits">Active Visits</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="checkins">GPS Check-ins</TabsTrigger>
          <TabsTrigger value="reports">Visit Reports</TabsTrigger>
        </TabsList>

        {/* Field Visits */}
        <TabsContent value="visits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(visit.status)}`}></div>
                        <h3 className="font-bold">{visit.lead_name}</h3>
                        <Badge variant={getStatusBadge(visit.status)}>
                          {visit.status_display}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{visit.lead_phone}</p>
                        <p className="text-xs text-gray-500">{visit.lead_branch}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Staff</p>
                        <p className="font-medium">{visit.staff_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Purpose</p>
                        <p className="font-medium">{visit.purpose || 'General Visit'}</p>
                      </div>
                    </div>

                    {visit.started_at && (
                      <div className="text-sm text-gray-600">
                        <p>Started: {new Date(visit.started_at).toLocaleString()}</p>
                      </div>
                    )}

                    {visit.distance_km && (
                      <div className="text-sm text-gray-600">
                        <p>Distance: {visit.distance_km} km</p>
                        <p>Duration: {visit.duration_minutes} minutes</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {visit.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          onClick={() => startVisit(visit.lead)}
                          className="flex items-center space-x-1"
                        >
                          <Navigation className="h-4 w-4" />
                          <span>Start Visit</span>
                        </Button>
                      )}
                      {visit.status === 'active' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => checkIn(visit.id)}
                            className="flex items-center space-x-1"
                          >
                            <MapPin className="h-4 w-4" />
                            <span>Check-in</span>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => endVisit(visit.id)}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>End Visit</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Tracking */}
        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Live Location Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationMap
                    center={mapCenter}
                    height="400px"
                    markers={liveTracking.map(location => ({
                      latitude: location.latitude,
                      longitude: location.longitude,
                      name: location.staff_name,
                      user_name: location.staff_name,
                      lead_name: location.lead_name,
                      accuracy: location.accuracy,
                      timestamp: location.timestamp,
                      type: 'staff',
                      is_active: true
                    }))}
                    showLiveTracking={true}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Active Staff List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Staff ({liveTracking.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveTracking.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MapPin className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">No active staff locations</p>
                      </div>
                    ) : (
                      liveTracking.map((location, index) => (
                        <div key={location.staff_id || index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="font-medium text-sm">{location.staff_name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">Live</Badge>
                          </div>
                          
                          {location.lead_name && (
                            <div className="text-xs text-muted-foreground mb-1">
                              Visiting: {location.lead_name}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(location.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* GPS Check-ins */}
        <TabsContent value="checkins" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {gpsCheckins.map((checkin) => (
              <Card key={checkin.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold">{checkin.lead_name}</h3>
                      </div>
                      <Badge variant="outline">{checkin.checkin_type_display}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{checkin.location_address || 'GPS Coordinates'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time</p>
                        <p className="font-medium">{new Date(checkin.checkin_time).toLocaleString()}</p>
                      </div>
                    </div>

                    {checkin.distance_from_branch && (
                      <div className="text-sm text-gray-600">
                        <p>Distance from branch: {checkin.distance_from_branch}m</p>
                      </div>
                    )}

                    {checkin.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">{checkin.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Visit Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visitReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{report.lead_name}</h3>
                      <Badge variant="outline">{report.visit_outcome_display}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Staff</p>
                        <p className="font-medium">{report.staff_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visit Date</p>
                        <p className="font-medium">{new Date(report.visit_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Customer Feedback</p>
                        <p className="text-sm text-gray-600">{report.customer_feedback}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Products Shown</p>
                        <p className="text-sm text-gray-600">{report.products_shown}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Next Steps</p>
                        <p className="text-sm text-gray-600">{report.next_steps}</p>
                      </div>
                    </div>

                    {report.follow_up_required && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Follow-up Required</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldVisitsDashboard;
