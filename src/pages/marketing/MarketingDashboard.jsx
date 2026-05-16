import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Target, Bell, MessageSquare, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

const MarketingDashboard = () => {
  const [geofences, setGeofences] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [nearbyCustomers, setNearbyCustomers] = useState([]);
  const [proximityTargets, setProximityTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      const [geofencesRes, campaignsRes, nearbyRes, proximityRes] = await Promise.all([
        api.get('/marketing/geofences/'),
        api.get('/marketing/location-campaigns/'),
        api.get('/marketing/nearby-alerts/'),
        api.get('/marketing/proximity-targets/nearby-customers/')
      ]);

      setGeofences(geofencesRes.data);
      setCampaigns(campaignsRes.data);
      setNearbyCustomers(nearbyRes.data);
      setProximityTargets(proximityRes.data.data || []);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCampaign = async (campaignId) => {
    try {
      await api.post(`/marketing/location-campaigns/${campaignId}/test/`);
      alert('Test message sent successfully!');
    } catch (error) {
      alert('Error sending test message: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleCampaignStatus = async (campaignId) => {
    try {
      await api.post(`/marketing/location-campaigns/${campaignId}/toggle-status/`);
      fetchMarketingData();
    } catch (error) {
      alert('Error toggling campaign status: ' + (error.response?.data?.detail || error.message));
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
                <p className="text-sm text-gray-600">Active Geofences</p>
                <p className="text-2xl font-bold">{geofences.filter(g => g.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Nearby Customers</p>
                <p className="text-2xl font-bold">{nearbyCustomers.filter(c => !c.message_sent).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">{nearbyCustomers.filter(c => c.message_sent).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Customers</TabsTrigger>
          <TabsTrigger value="proximity">Proximity Targets</TabsTrigger>
        </TabsList>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status_display}
                      </Badge>
                      <Badge variant="outline">{campaign.trigger_type_display}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Geofence</p>
                      <p className="font-medium">{campaign.geofence_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Message</p>
                      <p className="text-sm line-clamp-2">{campaign.message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Delay</p>
                        <p className="font-medium">{campaign.delay_minutes} minutes</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Daily Limit</p>
                        <p className="font-medium">{campaign.max_sends_per_day}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => testCampaign(campaign.id)}
                        className="flex items-center space-x-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Test</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Geofences */}
        <TabsContent value="geofences" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {geofences.map((geofence) => (
              <Card key={geofence.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{geofence.name}</CardTitle>
                    <Badge variant={geofence.is_active ? 'default' : 'secondary'}>
                      {geofence.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-medium">{geofence.branch_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Center</p>
                        <p className="font-medium">{geofence.center_lat}, {geofence.center_lng}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Radius</p>
                        <p className="font-medium">{geofence.radius_meters}m</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Campaigns: {geofence.campaigns?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Nearby Customers */}
        <TabsContent value="nearby" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nearbyCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{customer.lead_name}</h3>
                        <p className="text-sm text-gray-600">{customer.lead_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{customer.distance_display}</p>
                        <p className="text-sm text-gray-600">from {customer.branch_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={customer.message_sent ? 'default' : 'secondary'}>
                        {customer.message_sent ? 'Message Sent' : 'Pending'}
                      </Badge>
                      {customer.message_sent && (
                        <p className="text-xs text-gray-500">
                          {new Date(customer.sent_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Proximity Targets */}
        <TabsContent value="proximity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {proximityTargets.map((target) => (
              <Card key={target.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{target.lead_name}</h3>
                      <Badge variant="outline">{target.distance_display}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{target.lead_phone}</p>
                      <p>{target.branch_name}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={target.is_active ? 'text-green-600' : 'text-gray-500'}>
                        {target.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(target.last_seen).toLocaleDateString()}
                      </span>
                    </div>
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

export default MarketingDashboard;
