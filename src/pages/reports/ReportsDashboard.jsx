import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, Calendar, TrendingUp, Users, Phone, 
  DollarSign, Target, Activity, CheckCircle, Clock
} from 'lucide-react';
import { formatGrams } from '@/lib/utils';
import api from '@/api/axios';

const ReportsDashboard = () => {
  const [dailyReports, setDailyReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const [dailyRes, weeklyRes, templatesRes] = await Promise.all([
        api.get('/reports/?period=daily'),
        api.get('/reports/?period=weekly'),
        api.get('/reports/templates/')
      ]);

      setDailyReports(dailyRes.data);
      setWeeklyReports(weeklyRes.data);
      setReportTemplates(templatesRes.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/download/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const generateReport = async (templateId) => {
    try {
      await api.post(`/reports/templates/${templateId}/generate/`);
      fetchReportsData();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'generating': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getReportStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'generating': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
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
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Daily Reports</p>
                <p className="text-2xl font-bold">{dailyReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Weekly Reports</p>
                <p className="text-2xl font-bold">{weeklyReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {[...dailyReports, ...weeklyReports].filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Generating</p>
                <p className="text-2xl font-bold">
                  {[...dailyReports, ...weeklyReports].filter(r => r.status === 'generating').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily Reports</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Daily Reports */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dailyReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getReportStatusColor(report.status)}`}></div>
                        <h3 className="font-bold">{report.branch_name}</h3>
                        <Badge variant={getReportStatusBadge(report.status)}>
                          {report.status_display}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{report.date}</p>
                      </div>
                    </div>

                    {report.data && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-gray-600">Leads</p>
                              <p className="font-bold">{report.data.leads?.total || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-gray-600">Gold Weight</p>
                              <p className="font-bold">{formatGrams(report.data.sales?.weight)} g</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-gray-600">Calls</p>
                              <p className="font-bold">{report.data.calls?.total || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-gray-600">Conversion</p>
                              <p className="font-bold">{report.data.leads?.conversion_rate || 0}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Generated: {new Date(report.generated_at).toLocaleString()}</span>
                      {report.sent_at && (
                        <span>Sent: {new Date(report.sent_at).toLocaleString()}</span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {report.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => downloadReport(report.id)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Weekly Reports */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {weeklyReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getReportStatusColor(report.status)}`}></div>
                        <h3 className="font-bold">{report.branch_name}</h3>
                        <Badge variant={getReportStatusBadge(report.status)}>
                          {report.status_display}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Week of {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {report.data && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-gray-600">Total Gold Sold</p>
                              <p className="font-bold">{formatGrams(report.data.sales?.weight)} g</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-gray-600">Total Leads</p>
                              <p className="font-bold">{report.data.leads?.total || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-gray-600">Avg. Daily Sales</p>
                              <p className="font-bold">{(report.data.sales?.count || 0) / 7}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-gray-600">Conversion Rate</p>
                              <p className="font-bold">{report.data.leads?.conversion_rate || 0}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {report.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => downloadReport(report.id)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold">{template.name}</h3>
                        <Badge variant="outline">{template.template_type_display}</Badge>
                      </div>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Auto-generate: {template.auto_generate ? 'Yes' : 'No'}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(template.id)}
                        disabled={!template.is_active}
                      >
                        Generate Now
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Average Gold Weight</span>
                    <span className="font-bold">25.5 g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Growth</span>
                    <span className="font-bold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-bold">18.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="font-bold">92.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">John Doe</span>
                    <div className="text-right">
                      <p className="font-bold">45.5 g</p>
                      <p className="text-xs text-gray-600">15 sales</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Jane Smith</span>
                    <div className="text-right">
                      <p className="font-bold">38.2 g</p>
                      <p className="text-xs text-gray-600">12 sales</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mike Johnson</span>
                    <div className="text-right">
                      <p className="font-bold">32.0 g</p>
                      <p className="text-xs text-gray-600">10 sales</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report Details</h2>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium">{selectedReport.branch_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-medium">{selectedReport.period_display}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={getReportStatusBadge(selectedReport.status)}>
                    {selectedReport.status_display}
                  </Badge>
                </div>
              </div>

              {selectedReport.data && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Report Data</h3>
                  <pre className="text-sm text-gray-600">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
