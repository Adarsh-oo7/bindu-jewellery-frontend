import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, CheckCircle, XCircle, TrendingUp, Brain, Clock } from 'lucide-react';
import api from '@/lib/api';

const AlertsDashboard = () => {
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const fetchAlertsData = async () => {
    try {
      const [statsRes, alertsRes, suggestionsRes, subscriptionsRes] = await Promise.all([
        api.get('/alerts/dashboard/'),
        api.get('/alerts/alerts/my-alerts/'),
        api.get('/alerts/suggestions/my-suggestions/'),
        api.get('/alerts/subscriptions/')
      ]);

      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setSuggestions(suggestionsRes.data);
      setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      console.error('Error fetching alerts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await api.post(`/alerts/alerts/${alertId}/acknowledge/`);
      fetchAlertsData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await api.post(`/alerts/alerts/${alertId}/resolve/`);
      fetchAlertsData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const implementSuggestion = async (suggestionId) => {
    try {
      await api.post(`/alerts/suggestions/${suggestionId}/implement/`);
      fetchAlertsData();
    } catch (error) {
      console.error('Error implementing suggestion:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Active</p>
                <p className="text-2xl font-bold">{stats.total_active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Suggestions</p>
                <p className="text-2xl font-bold">{stats.suggestions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Recent</p>
                <p className="text-2xl font-bold">{stats.recent_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4" style={{
                borderLeftColor: alert.severity === 'critical' ? '#ef4444' : 
                                 alert.severity === 'high' ? '#f97316' : 
                                 alert.severity === 'medium' ? '#eab308' : '#3b82f6'
              }}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                          <h3 className="font-bold">{alert.title}</h3>
                          <Badge variant="outline">{alert.alert_type_category}</Badge>
                          <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                            {alert.status_display}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{alert.time_since_triggered}</span>
                          <span>Severity: {alert.severity_display}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Acknowledge</span>
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {alert.metadata && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Details:</p>
                        <pre className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(suggestion.priority)}`}></div>
                        <h3 className="font-bold">{suggestion.title}</h3>
                        <Badge variant="outline">{suggestion.category_display}</Badge>
                      </div>
                      <Badge variant={suggestion.is_implemented ? 'default' : 'secondary'}>
                        {suggestion.is_implemented ? 'Implemented' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Recommendation:</p>
                      <p className="text-sm text-blue-700">{suggestion.recommendation}</p>
                    </div>
                    {suggestion.expected_impact && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Expected Impact:</p>
                        <p className="text-sm text-green-700">{suggestion.expected_impact}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span>Confidence: {suggestion.confidence_display}</span>
                      </div>
                      <span className="text-gray-500">{suggestion.time_since_created}</span>
                    </div>
                    {!suggestion.is_implemented && (
                      <Button 
                        size="sm" 
                        onClick={() => implementSuggestion(suggestion.id)}
                        className="w-full"
                      >
                        Implement Suggestion
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(subscription.alert_type_severity)}`}></div>
                        <h3 className="font-bold">{subscription.alert_type_name}</h3>
                        <Badge variant="outline">{subscription.alert_type_category}</Badge>
                      </div>
                      <Badge variant={subscription.is_subscribed ? 'default' : 'secondary'}>
                        {subscription.is_subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{subscription.alert_type_description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Notification Channels:</p>
                      <div className="flex space-x-2">
                        <Badge variant={subscription.notification_channels.in_app ? 'default' : 'secondary'}>
                          In-App
                        </Badge>
                        <Badge variant={subscription.notification_channels.email ? 'default' : 'secondary'}>
                          Email
                        </Badge>
                        <Badge variant={subscription.notification_channels.whatsapp ? 'default' : 'secondary'}>
                          WhatsApp
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Alerts by Category</h4>
                  <div className="space-y-2">
                    {stats.by_category?.map((category) => (
                      <div key={category.alert_type__category} className="flex justify-between items-center">
                        <span className="capitalize">{category.alert_type__category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {stats.recent_alerts?.map((alert) => (
                      <div key={alert.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                          <span className="text-sm">{alert.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{alert.time_since_triggered}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsDashboard;
