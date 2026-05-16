import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/axios';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MetaCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // processing, selecting, success, error
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [integrationId, setIntegrationId] = useState(null);
  const processedRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received.');
        return;
      }

      try {
        const redirectUri = window.location.origin + '/campaigns/integrations/meta/callback';
        const res = await api.post('/campaigns/integrations/meta/callback/', {
          code, state, redirect_uri: redirectUri
        });

        const integration = res.data;
        setIntegrationId(integration.id);

        // Fetch pages for this integration
        const pagesRes = await api.get(`/campaigns/integrations/${integration.id}/meta/pages/`);
        setPages(pagesRes.data);

        if (pagesRes.data.length === 1) {
          // Auto-select if only one page
          handlePageSelect(pagesRes.data[0].id, integration.id);
        } else {
          setStatus('selecting');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.detail || 'Failed to complete connection.');
      }
    };

    processCallback();
  }, []);

  const handlePageSelect = async (pageId, id = integrationId) => {
    try {
      setStatus('processing');
      const page = pages.find(p => p.id === pageId) || pages[0];
      
      await api.patch(`/campaigns/integrations/${id}/`, {
        account_name: page.name,
        metadata: { page_id: pageId, instagram_id: page.instagram_business_account?.id }
      });

      // Trigger initial sync
      await api.post(`/campaigns/integrations/${id}/sync/`);

      setStatus('success');
      setTimeout(() => navigate('/campaigns/settings/integrations'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage('Failed to link the selected page.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg border-[#1877F2]/20">
        <CardContent className="pt-8 text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#1877F2] mx-auto" />
              <h2 className="text-xl font-semibold">Connecting to Meta...</h2>
              <p className="text-muted-foreground">
                We're securely authorizing your Facebook and Instagram accounts.
              </p>
            </div>
          )}

          {status === 'selecting' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Select your Page</h2>
                <p className="text-muted-foreground mt-2">Which Facebook Page represents Bindu Jewellery?</p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedPageId === page.id 
                        ? 'border-[#1877F2] bg-[#1877F2]/5 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                        🏠
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">{page.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {page.id}</div>
                      </div>
                    </div>
                    {selectedPageId === page.id && <CheckCircle2 className="text-[#1877F2] h-5 w-5" />}
                  </button>
                ))}
              </div>

              <Button 
                disabled={!selectedPageId || status === 'processing'}
                onClick={() => handlePageSelect(selectedPageId)}
                className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 h-12 rounded-xl font-bold text-lg"
              >
                {status === 'processing' ? <Loader2 className="animate-spin mr-2" /> : 'Connect Selected Page'}
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-green-700">Success!</h2>
              <p className="text-muted-foreground">
                Your Meta Business account has been connected.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => navigate('/campaigns/settings/integrations')}
                  className="bg-[#1877F2] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1877F2]/90 transition-colors shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">Redirecting in a moment...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-destructive">Connection Failed</h2>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
              <div className="pt-4">
                <button 
                  onClick={() => navigate('/campaigns/settings/integrations')}
                  className="text-[#1877F2] hover:underline font-medium"
                >
                  Go back and try again
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaCallback;
