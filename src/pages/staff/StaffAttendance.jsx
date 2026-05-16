import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogIn, LogOut, Clock, Coffee, Play, Square, 
  MapPin, CheckCircle2, AlertCircle, History, Timer 
} from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import LocationMap from '@/components/maps/LocationMap';
import useAuth from '@/hooks/useAuth';

const StaffAttendance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  // Fetch today's status
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['staff-attendance-today'],
    queryFn: () => api.get('/attendance/attendance/today/').then(res => res.data),
    refetchInterval: 30000 // Refetch every 30s to keep status in sync
  });

  const isCheckedIn = attendance?.checked_in && !attendance?.check_out_time;
  const isCheckedOut = !!attendance?.check_out_time;
  const isOnBreak = !!attendance?.on_break;

  // Track live location only during active shift
  useEffect(() => {
    if (!navigator.geolocation || !isCheckedIn) {
      setCurrentLocation(null);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          name: 'Your Current Location',
          type: 'staff',
          is_active: true,
          isHighAccuracy: pos.coords.accuracy < 20
        });
      },
      (err) => console.error('Map tracking error:', err),
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isCheckedIn]);

  // Calculate active break duration
  useEffect(() => {
    let interval;
    const activeBreak = attendance?.breaks?.find(b => !b.end_time);
    
    if (activeBreak) {
      const start = new Date(activeBreak.start_time);
      setBreakSeconds(differenceInSeconds(now, start));
      interval = setInterval(() => {
        setBreakSeconds(differenceInSeconds(new Date(), start));
      }, 1000);
    } else {
      setBreakSeconds(0);
    }
    
    return () => clearInterval(interval);
  }, [attendance, now]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    });
  };

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const coords = await getLocation().catch(() => ({ lat: null, lng: null }));
      return api.post('/attendance/attendance/gps-checkin/', coords);
    },
    onSuccess: (data) => {
      const msg = data.data.message || 'Checked in successfully!';
      toast.success(msg);
      queryClient.invalidateQueries(['staff-attendance-today']);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Check-in failed')
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const coords = await getLocation().catch(() => ({ lat: null, lng: null }));
      return api.post('/attendance/attendance/checkout/', coords);
    },
    onSuccess: () => {
      toast.success('Shift completed. Great job today!');
      queryClient.invalidateQueries(['staff-attendance-today']);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Check-out failed')
  });

  const startBreakMutation = useMutation({
    mutationFn: (reason) => api.post('/attendance/attendance/break-start/', { reason }),
    onSuccess: () => {
      toast.success('Break started. Enjoy your rest!');
      queryClient.invalidateQueries(['staff-attendance-today']);
    }
  });

  const endBreakMutation = useMutation({
    mutationFn: () => api.post('/attendance/attendance/break-end/'),
    onSuccess: () => {
      toast.success('Welcome back! Break ended.');
      queryClient.invalidateQueries(['staff-attendance-today']);
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Timer className="animate-spin text-primary" /></div>;

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Work Console</h2>
          <p className="text-gray-500 font-medium">{format(now, 'EEEE, MMMM do')}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-light text-[#C9972A] tabular-nums">{format(now, 'HH:mm:ss')}</p>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Live Server Time</span>
        </div>
      </div>

      {/* Main Action Card */}
      <Card className={cn(
        "overflow-hidden border-none shadow-xl transition-all duration-500",
        isOnBreak ? "ring-4 ring-amber-100" : isCheckedIn ? "ring-4 ring-green-100" : "ring-4 ring-gray-100"
      )}>
        <div className={cn(
          "p-8 text-center transition-colors duration-500",
          isOnBreak ? "bg-gradient-to-br from-amber-500 to-orange-600" : 
          isCheckedIn ? "bg-gradient-to-br from-[#0F6E56] to-[#1a8a6d]" : 
          "bg-gradient-to-br from-gray-700 to-gray-900"
        )}>
          <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-md mb-4 text-white">
            {isOnBreak ? <Coffee size={40} /> : isCheckedIn ? <CheckCircle2 size={40} /> : <LogIn size={40} />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {isOnBreak ? "On Break" : isCheckedIn ? "Shift Active" : isCheckedOut ? "Shift Completed" : "Ready to Start?"}
          </h3>
          <p className="text-white/80 text-sm font-medium">
            {isOnBreak ? `Resting for ${formatDuration(breakSeconds)}` : 
             isCheckedIn ? "Tracking your productivity" : 
             isCheckedOut ? "See you tomorrow!" : "Punch in to begin your workday"}
          </p>
        </div>

        <CardContent className="p-6 bg-white">
          <div className="grid grid-cols-1 gap-4">
            {!attendance?.checked_in && (
              <Button 
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                className="w-full py-10 text-xl font-bold rounded-2xl bg-[#0F6E56] hover:bg-[#0a5240] shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {checkInMutation.isPending ? <Timer className="animate-spin mr-2" /> : <LogIn className="mr-3 h-6 w-6" />}
                PUNCH IN
              </Button>
            )}

            {isCheckedIn && !isOnBreak && (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => startBreakMutation.mutate('Tea Break')}
                  disabled={startBreakMutation.isPending}
                  variant="outline"
                  className="py-8 border-2 border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl font-bold"
                >
                  <Coffee className="mr-2 h-5 w-5" /> TAKE BREAK
                </Button>
                <Button 
                  onClick={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                  className="py-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100"
                >
                  <LogOut className="mr-2 h-5 w-5" /> PUNCH OUT
                </Button>
              </div>
            )}

            {isOnBreak && (
              <Button 
                onClick={() => endBreakMutation.mutate()}
                disabled={endBreakMutation.isPending}
                className="w-full py-10 text-xl font-bold rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all"
              >
                <Play className="mr-3 h-6 w-6 fill-current" /> RESUME WORK
              </Button>
            )}

            {isCheckedOut && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <p className="font-bold text-green-800 text-lg">Workday Finished</p>
                <p className="text-green-600 text-sm">Your attendance has been recorded.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats & Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border-none shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Punch In</p>
          <p className="text-xl font-bold text-gray-800">
            {attendance?.check_in_time ? format(new Date(attendance.check_in_time), 'hh:mm a') : '--:--'}
          </p>
        </Card>
        <Card className="bg-white border-none shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Breaks</p>
          <p className="text-xl font-bold text-gray-800">
            {attendance?.total_break_time || 0} <span className="text-xs font-normal">mins</span>
          </p>
        </Card>
      </div>

      {/* Shift Timeline */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-2 border-b border-gray-50">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
            <History size={16} /> Shift Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {/* Start Event */}
            {attendance?.check_in_time && (
              <div className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100 z-10" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Shift Started</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {format(new Date(attendance.check_in_time), 'hh:mm:ss a')}
                    {attendance.distance_from_branch && (
                      <span className="ml-2 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {attendance.distance_from_branch}m from branch
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Break Events */}
            {attendance?.breaks?.map((b, i) => (
              <div key={i} className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-100 z-10" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Break Started</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(b.start_time), 'hh:mm a')} • {b.reason}
                    </p>
                  </div>
                </div>
                {b.end_time && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-400 ring-4 ring-blue-100 z-10" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Break Ended</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(b.end_time), 'hh:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* End Event */}
            {attendance?.check_out_time && (
              <div className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-gray-900 ring-4 ring-gray-200 z-10" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Shift Ended</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(attendance.check_out_time), 'hh:mm a')}
                  </p>
                </div>
              </div>
            )}

            {!attendance?.checked_in && (
              <div className="text-center py-4 text-gray-400 text-sm">
                Timeline will appear after you punch in.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Live Map Section */}
      <Card className="bg-white border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} className="text-red-500" /> 
              Live Location Map
            </div>
            {currentLocation && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  currentLocation.accuracy < 20 ? "bg-green-100 text-green-700" :
                  currentLocation.accuracy < 50 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {currentLocation.accuracy < 20 ? 'EXCELLENT SIGNAL' : 
                   currentLocation.accuracy < 50 ? 'GOOD SIGNAL' : 
                   'WEAK SIGNAL - MOVE OUTSIDE'}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <LocationMap 
              height="350px"
              zoom={15}
              center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [12.9716, 77.5946]}
              markers={currentLocation ? [currentLocation] : []}
              showLiveTracking={true}
            />
            {!currentLocation && (
              <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-[1000]">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-xs border border-gray-100">
                  {isCheckedOut ? (
                    <>
                      <div className="mb-3 mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <MapPin size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-800">Tracking Inactive</p>
                      <p className="text-xs text-gray-500 mt-1">Live tracking stopped after punch-out.</p>
                    </>
                  ) : !isCheckedIn ? (
                    <>
                      <div className="mb-3 mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Clock size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-800">Ready to Track</p>
                      <p className="text-xs text-gray-500 mt-1">Tracking will start once you punch in.</p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin mb-3 mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      <p className="text-sm font-bold text-gray-800">Acquiring GPS Signal...</p>
                      <p className="text-xs text-gray-500 mt-1">Ensuring maximum accuracy for your shift.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4 text-[11px]">
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold uppercase tracking-tighter">Current Lat/Lng</span>
              <span className="text-gray-700 font-mono">
                {currentLocation ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : 'Scanning...'}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-400 font-bold uppercase tracking-tighter">GPS Accuracy</span>
              <span className="text-gray-700">
                {currentLocation ? `±${Math.round(currentLocation.accuracy)} meters` : 'Calibrating...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendance;
