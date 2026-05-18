import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { 
  RefreshCw, 
  Power, 
  Plug, 
  Unplug, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Eye,
  MousePointer2,
  Target,
  Users,
  CreditCard,
  TrendingUp,
  Trash2
} from 'lucide-react';
import SyncStatusBadge from './SyncStatusBadge';
import { Button } from '@/components/ui/button';

// Helper component for metrics
const Metric = ({ label, value, icon: IconComponent, colorClass = "text-[#C9972A]" }) => (
  <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
    <div className="flex items-center gap-2 text-gray-500 mb-1">
      <div className={`${colorClass.replace('text', 'bg')}/10 p-1 rounded-md`}>
        {React.cloneElement(IconComponent, { size: 14, className: colorClass })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
    </div>
    <div className={`text-xl font-black tracking-tight ${colorClass}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

const IntegrationCard = ({ integration, days = 7, refetch, onConnect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Platform styling config
  const platformConfig = {
    facebook_ads: { color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/5', border: 'border-[#1877F2]/20', icon: '📘' },
    instagram_insights: { color: 'text-[#E4405F]', bg: 'bg-[#E4405F]/5', border: 'border-[#E4405F]/20', icon: '📷' },
    google_analytics: { color: 'text-[#34A853]', bg: 'bg-[#34A853]/5', border: 'border-[#34A853]/20', icon: '📊' },
    google_ads: { color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/5', border: 'border-[#4285F4]/20', icon: '📣' },
    default: { color: 'text-[#C9972A]', bg: 'bg-[#C9972A]/5', border: 'border-[#C9972A]/20', icon: '🔌' }
  };

  const config = platformConfig[integration.platform] || platformConfig.default;

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['integration-analytics', integration.id, days],
    queryFn: () => api.get(`/campaigns/integrations/${integration.id}/analytics/?days=${days}`).then(res => res.data),
    enabled: integration.is_connected,
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/integrations/${integration.id}/sync/`),
    onSuccess: () => refetch(),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/integrations/${integration.id}/disconnect/`),
    onSuccess: () => refetch(),
  });

  const removeMutation = useMutation({
    mutationFn: () => api.delete(`/campaigns/integrations/${integration.id}/`),
    onSuccess: () => refetch(),
  });

  // Fetch available properties for Google Analytics property selector
  const { data: properties } = useQuery({
    queryKey: ['integration-properties', integration.id],
    queryFn: () => api.get(`/campaigns/integrations/${integration.id}/properties/`).then(res => res.data),
    enabled: integration.is_connected && integration.platform === 'google_analytics',
  });

  const selectPropertyMutation = useMutation({
    mutationFn: ({ property_id, property_name }) => 
      api.post(`/campaigns/integrations/${integration.id}/select-property/`, { property_id, property_name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      queryClient.invalidateQueries(['integration-analytics', integration.id]);
      if (refetch) refetch();
    }
  });

  const handlePropertyChange = (e) => {
    const selectedId = e.target.value;
    const selectedProp = properties?.find(p => p.id === selectedId);
    if (selectedProp) {
      selectPropertyMutation.mutate({
        property_id: selectedProp.id,
        property_name: selectedProp.name
      });
    }
  };

  const handleSync = (e) => {
    e.stopPropagation();
    syncMutation.mutate();
  };

  const handleDisconnect = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to disconnect?')) {
      disconnectMutation.mutate();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (confirm('This will delete all synced data. Are you sure?')) {
      removeMutation.mutate();
    }
  };

  return (
    <div className={`group relative bg-white border ${config.border} rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      {/* Header */}
      <div className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-4xl p-3 rounded-2xl ${config.bg} shadow-inner`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{integration.platform_name}</h3>
              <div className="flex flex-col gap-1 mt-1">
                {integration.is_connected ? (
                  <>
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active Property:
                    </span>
                    {integration.platform === 'google_analytics' && properties && properties.length > 0 ? (
                      <select
                        value={integration.account_id}
                        onChange={handlePropertyChange}
                        disabled={selectPropertyMutation.isPending}
                        className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary mt-1 max-w-[180px]"
                      >
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-gray-700 ml-2.5">
                        {integration.account_name || 'Connected'}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-400">Disconnected</span>
                )}
              </div>
            </div>
          </div>
          <SyncStatusBadge status={integration.sync_status} />
        </div>
      </div>

      {/* Analytics Grid */}
      {integration.is_connected && (
        <div className="px-5 pb-5 grid grid-cols-2 gap-3 relative">
          <Metric label="Impressions" value={analytics?.impressions || 0} icon={<Eye />} colorClass={config.color} />
          <Metric label="Engagement" value={analytics?.engagement || 0} icon={<Target />} colorClass={config.color} />
          <Metric label="Spend" value={`₹${analytics?.spend || 0}`} icon={<CreditCard />} colorClass={config.color} />
          <Metric label="Growth" value={analytics?.conversions || 0} icon={<TrendingUp />} colorClass={config.color} />
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          {integration.is_connected ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="rounded-xl h-9 px-4 border-gray-200 hover:bg-white"
              >
                {syncMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} className="mr-1.5" />}
                Sync
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDisconnect}
                className="rounded-xl h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Unplug size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                onClick={() => onConnect(integration.platform)}
                className="rounded-xl h-9 px-5 bg-black hover:bg-gray-800 text-white border-none font-bold"
              >
                Connect
              </Button>
              {integration.id && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleRemove}
                  className="rounded-xl h-9 px-3 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </>
          )}
        </div>
        
        {integration.last_sync && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Last Sync: {new Date(integration.last_sync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
