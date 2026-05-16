import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, MapPin, Camera, CheckCircle, XCircle, Users, 
  TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';
import api from '@/api/axios';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayStats, setTodayStats] = useState({});
  const [branchLocation, setBranchLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
    fetchBranchLocation();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const [attendanceRes, statsRes] = await Promise.all([
        api.get('/attendance/attendance/'),
        api.get('/attendance/attendance/today-stats/')
      ]);

      setAttendance(attendanceRes.data);
      setTodayStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchLocation = async () => {
    try {
      const response = await api.get('/attendance/branch-location/');
      setBranchLocation(response.data);
    } catch (error) {
      console.error('Error fetching branch location:', error);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

  const gpsCheckIn = async () => {
    setCheckingIn(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      const response = await api.post('/attendance/attendance/gps-checkin/', {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy
      });

      if (response.data.success) {
        alert('GPS check-in successful!');
        fetchAttendanceData();
      } else {
        alert(response.data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Error during GPS check-in:', error);
      alert('Error during check-in: ' + (error.response?.data?.detail || error.message));
    } finally {
      setCheckingIn(false);
    }
  };

  const photoCheckIn = async () => {
    try {
      // For now, we'll simulate photo check-in
      // In a real app, you'd use camera API to capture photo
      const response = await api.post('/attendance/attendance/photo-checkin/', {
        photo_data: 'base64_photo_data_here'
      });

      if (response.data.success) {
        alert('Photo check-in successful!');
        fetchAttendanceData();
      } else {
        alert(response.data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Error during photo check-in:', error);
      alert('Error during check-in: ' + (error.response?.data?.detail || error.message));
    }
  };

  const checkout = async (attendanceId) => {
    try {
      await api.post(`/attendance/attendance/${attendanceId}/checkout/`);
      fetchAttendanceData();
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      case 'half_day': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      case 'half_day': return 'outline';
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
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{todayStats.total_staff || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold">{todayStats.present || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold">{todayStats.absent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold">{todayStats.late || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Check-in / Check-out</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">GPS Check-in</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Location-based check-in using your current GPS coordinates
                  </p>
                  {currentLocation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Current Location:</p>
                      <p className="text-sm text-blue-700">
                        Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                      </p>
                      <p className="text-sm text-blue-700">
                        Accuracy: ±{currentLocation.accuracy}m
                      </p>
                    </div>
                  )}
                  {branchLocation && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Branch Location:</p>
                      <p className="text-sm text-green-700">
                        {branchLocation.address}
                      </p>
                      <p className="text-sm text-green-700">
                        Check-in radius: 100m
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={gpsCheckIn}
                    disabled={checkingIn}
                    className="w-full"
                  >
                    {checkingIn ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        GPS Check-in
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Photo Check-in</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Check-in with photo verification for enhanced security
                  </p>
                  <Button 
                    onClick={photoCheckIn}
                    variant="outline"
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Photo Check-in
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Today's Attendance */}
        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {attendance.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(record.status)}`}></div>
                        <h3 className="font-bold">{record.user_name}</h3>
                        <Badge variant={getStatusBadge(record.status)}>
                          {record.status_display}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{record.user_role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Check-in Time</p>
                        <p className="font-medium">
                          {record.checkin_time ? new Date(record.checkin_time).toLocaleTimeString() : 'Not checked in'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Check-out Time</p>
                        <p className="font-medium">
                          {record.checkout_time ? new Date(record.checkout_time).toLocaleTimeString() : 'Not checked out'}
                        </p>
                      </div>
                    </div>

                    {record.checkin_type && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {record.checkin_type === 'gps' ? (
                          <MapPin className="h-4 w-4" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        <span>Check-in via {record.checkin_type_display}</span>
                      </div>
                    )}

                    {record.distance_from_branch && (
                      <div className="text-sm text-gray-600">
                        <p>Distance from branch: {record.distance_from_branch}m</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {record.approval_status_display}
                      </div>
                      {record.checkin_time && !record.checkout_time && (
                        <Button 
                          size="sm" 
                          onClick={() => checkout(record.id)}
                        >
                          Check-out
                        </Button>
                      )}
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
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(record.status)}`}></div>
                      <div>
                        <p className="font-medium">{record.user_name}</p>
                        <p className="text-sm text-gray-600">{record.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(record.status)}>
                        {record.status_display}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Attendance Rate</span>
                    <span className="font-bold text-green-600">{todayStats.attendance_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Punctuality Rate</span>
                    <span className="font-bold text-blue-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GPS Check-ins</span>
                    <span className="font-bold">{todayStats.gps_checkins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Photo Check-ins</span>
                    <span className="font-bold">{todayStats.photo_checkins || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monday</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tuesday</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                      <span className="text-sm">88%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Wednesday</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-sm">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Thursday</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                      <span className="text-sm">90%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Friday</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                      <span className="text-sm">87%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceDashboard;
