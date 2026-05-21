import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import CustomerProfileDetail from '@/components/CustomerProfileDetail';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';

/**
 * Resolves a URL param that could be:
 *   - A Customer ID  → /leads/customers/{id}/  ✅
 *   - A Lead ID (lead.customer was null) → fetch lead, get customer FK
 */
const useResolvedCustomerId = (rawId) => {
  // First try it as a Customer ID directly
  const customerQuery = useQuery({
    queryKey: ['customer-resolve', rawId],
    queryFn: () => api.get(`/leads/customers/${rawId}/`).then(r => r.data),
    enabled: !!rawId,
    retry: false,           // don't retry — if 404, fall through
    staleTime: 30_000,
  });

  // If customer lookup fails, try fetching the Lead and grab its customer FK
  const leadFallbackQuery = useQuery({
    queryKey: ['lead-resolve-customer', rawId],
    queryFn: () => api.get(`/leads/leads/${rawId}/`).then(r => r.data),
    enabled: !!rawId && customerQuery.isError,
    retry: false,
    staleTime: 30_000,
  });

  if (customerQuery.isLoading) {
    return { customerId: null, customer: null, isLoading: true, isError: false };
  }

  if (!customerQuery.isError && customerQuery.data) {
    console.log('Resolved via Customer ID:', rawId);
    return {
      customerId: rawId,
      customer: customerQuery.data,
      isLoading: false,
      isError: false,
    };
  }

  // If customer lookup fails, try fetching the Lead and grab its customer FK
  const resolvedId = leadFallbackQuery.data?.customer;
  
  if (leadFallbackQuery.isLoading) {
    return { customerId: null, customer: null, isLoading: true, isError: false };
  }

  console.log('Customer lookup failed, lead fallback result:', { rawId, resolvedId, isError: leadFallbackQuery.isError });

  return {
    customerId: resolvedId ?? null,
    customer: null,
    isLoading: false,
    isError: leadFallbackQuery.isError || (!leadFallbackQuery.isLoading && !resolvedId),
  };
};

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customerId, customer, isLoading, isError } = useResolvedCustomerId(id);

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#C9972A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={13} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                {customer?.name || 'Customer Profile'}
              </p>
              {customer?.phone && (
                <p className="text-xs text-gray-400 leading-tight">{customer.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-medium">Loading profile...</p>
          </div>
        ) : isError || !customerId ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-400">
              <AlertCircle size={28} />
            </div>
            <p className="text-gray-600 font-semibold">Profile not found</p>
            <p className="text-gray-400 text-sm">This lead may not have a linked Customer profile yet.</p>
            <button onClick={() => navigate(-1)} className="mt-2 text-sm font-semibold text-[#C9972A] hover:underline">
              ← Go back
            </button>
          </div>
        ) : (
          <CustomerProfileDetail customerId={customerId} />
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
