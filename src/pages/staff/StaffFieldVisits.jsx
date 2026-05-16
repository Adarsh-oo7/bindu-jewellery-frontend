import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import useAuth from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Navigation, Clock, CheckCircle, Navigation2, FileCheck, Phone, Map } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StaffFieldVisits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [locationError, setLocationError] = useState(null);

  // Fetch only this staff's field visits
  const { data: visitsData, isLoading } = useQuery({
    queryKey: ['staff-fieldvisits'],
    queryFn: () => api.get(`/field-visits/field-visits/?staff=${user?.id}`).then(res => res.data.results || res.data)
  });

  const visits = visitsData || [];
  const activeVisit = visits.find(v => v.status === 'active');
  const scheduledVisits = visits.filter(v => v.status === 'scheduled');
  const completedVisits = visits.filter(v => v.status === 'completed');

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    });
  };

  const startVisitMutation = useMutation({
    mutationFn: async (visitId) => {
      try {
        const coords = await getLocation();
        return api.post(`/field-visits/field-visits/${visitId}/start/`, coords);
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Field visit started!');
      queryClient.invalidateQueries(['staff-fieldvisits']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start visit. Check location permissions.');
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async ({ visitId, note }) => {
      const coords = await getLocation();
      return api.post(`/field-visits/field-visits/${visitId}/check-in/`, {
        ...coords,
        note
      });
    },
    onSuccess: () => {
      toast.success('Location check-in recorded!');
      queryClient.invalidateQueries(['staff-fieldvisits']);
    }
  });

  const endVisitMutation = useMutation({
    mutationFn: async (visitId) => {
      const coords = await getLocation();
      return api.post(`/field-visits/field-visits/${visitId}/end/`, coords);
    },
    onSuccess: () => {
      toast.success('Field visit completed!');
      queryClient.invalidateQueries(['staff-fieldvisits']);
    }
  });

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Loading your visits...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Field Visits</h2>
        <p className="text-sm text-gray-500">Manage your daily client visits</p>
      </div>

      {activeVisit && (
        <Card className="border-[#0F6E56] shadow-md border-2 overflow-hidden bg-white">
          <div className="bg-[#0F6E56] text-white p-3 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Navigation2 size={16} className="animate-pulse" /> Active Visit
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">In Progress</span>
          </div>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="font-bold text-lg">{activeVisit.lead_name}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Phone size={14} /> {activeVisit.lead_phone || 'No phone'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs">Started At</p>
                <p className="font-medium">{format(new Date(activeVisit.started_at), 'hh:mm a')}</p>
              </div>
              <Clock className="text-gray-400" />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => checkInMutation.mutate({ visitId: activeVisit.id, note: 'Regular update' })}
                className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
                variant="outline"
                disabled={checkInMutation.isPending}
              >
                <MapPin size={16} className="mr-2" /> Log Location
              </Button>
              <Button 
                onClick={() => endVisitMutation.mutate(activeVisit.id)}
                className="flex-1 bg-[#0F6E56] hover:bg-[#0a5240] text-white"
                disabled={endVisitMutation.isPending}
              >
                <CheckCircle size={16} className="mr-2" /> Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeVisit && scheduledVisits.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock size={16} /> Scheduled Visits
          </h3>
          {scheduledVisits.map(visit => (
            <Card key={visit.id} className="shadow-sm border-gray-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">{visit.lead_name}</p>
                    <p className="text-xs text-gray-500">{visit.purpose || 'Follow-up Visit'}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Scheduled</Badge>
                </div>
                <Button 
                  onClick={() => startVisitMutation.mutate(visit.id)}
                  className="w-full bg-[#C9972A] hover:bg-[#b08221] text-white"
                  disabled={startVisitMutation.isPending}
                >
                  <Navigation size={16} className="mr-2" /> Start Visit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {scheduledVisits.length === 0 && !activeVisit && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Map className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No scheduled visits</p>
          <p className="text-xs text-gray-400 mt-1">Check back later or ask your manager to assign leads.</p>
        </div>
      )}

      {completedVisits.length > 0 && (
        <div className="space-y-3 mt-8">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <FileCheck size={16} /> Completed Today
          </h3>
          {completedVisits.slice(0, 5).map(visit => (
            <Card key={visit.id} className="bg-gray-50/50 border-gray-100 shadow-none">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-gray-800">{visit.lead_name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {visit.duration_minutes ? `${visit.duration_minutes} mins` : 'Completed'}
                  </p>
                </div>
                {visit.distance_km && (
                  <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                    {visit.distance_km.toFixed(1)} km
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffFieldVisits;
