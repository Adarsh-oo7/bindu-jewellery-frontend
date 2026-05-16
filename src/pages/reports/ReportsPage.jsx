import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import useAuth from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Download, 
  FileText, 
  Activity, 
  Filter, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Weight, 
  Calendar as CalendarIcon,
  ChevronRight,
  Search,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, subDays, startOfToday } from 'date-fns';
import { formatGrams } from '@/lib/utils';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

const ReportsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Fetch Branches
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches/').then(res => {
      const data = res.data.results || res.data;
      return Array.isArray(data) ? data : [];
    })
  });

  // Fetch Historical Reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', selectedBranch, dateRange.from, dateRange.to, selectedPeriod],
    queryFn: () => {
      let params = `?from=${dateRange.from}&to=${dateRange.to}`;
      if (selectedBranch !== 'all') params += `&branch=${selectedBranch}`;
      if (selectedPeriod !== 'all') params += `&period=${selectedPeriod}`;
      return api.get(`/reports/${params}`).then(res => {
        const data = res.data.results || res.data;
        return Array.isArray(data) ? data : [];
      });
    }
  });

  // Fetch Today's Snapshot
  const { data: snapshotData } = useQuery({
    queryKey: ['reports-snapshot', selectedBranch],
    queryFn: () => api.get(`/reports/snapshot/?branch_id=${selectedBranch === 'all' ? '' : selectedBranch}&period=daily`)
      .then(res => res.data)
      .catch(error => {
        if (error.response?.status === 404) return null;
        throw error;
      })
  });

  // Filter reports by branch (frontend safeguard)
  const filteredReports = useMemo(() => {
    if (!reportsData || selectedBranch === 'all') return reportsData || [];
    return reportsData.filter(report => {
      if (!report.branch) return false;
      const branchId = typeof report.branch === 'object' ? report.branch.id : report.branch;
      return String(branchId) === String(selectedBranch);
    });
  }, [reportsData, selectedBranch]);

  // Prevent double counting (Daily reports only for global stats if period is 'all')
  const summaryReports = useMemo(() => {
    if (!filteredReports) return [];
    if (selectedPeriod !== 'all') return filteredReports;
    return filteredReports.filter(r => r.period === 'daily');
  }, [filteredReports, selectedPeriod]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalGold = summaryReports.reduce((acc, r) => acc + parseFloat(r.data?.sales?.weight || r.data?.sales_weight || 0), 0);
    const totalSales = summaryReports.reduce((acc, r) => acc + (r.data?.sales?.count || r.data?.sales_count || 0), 0);
    const totalRevenue = summaryReports.reduce((acc, r) => acc + parseFloat(r.data?.sales?.revenue || 0), 0);
    const totalLeads = summaryReports.reduce((acc, r) => acc + (r.data?.leads?.total || 0), 0);
    
    return {
      totalGold,
      totalSales,
      totalRevenue,
      totalLeads,
      avgSalesPerReport: summaryReports.length > 0 ? (totalSales / summaryReports.length).toFixed(1) : 0,
      reportCount: filteredReports.length
    };
  }, [summaryReports, filteredReports]);

  // Chart data
  const trendData = useMemo(() => {
    if (!summaryReports || summaryReports.length === 0) return [];
    return [...summaryReports]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10)
      .map(r => ({
        date: format(new Date(r.date), 'MMM dd'),
        sales: r.data?.sales?.count || 0,
        weight: parseFloat(r.data?.sales?.weight || 0),
        leads: r.data?.leads?.total || 0
      }));
  }, [summaryReports]);

  const triggerEodMutation = useMutation({
    mutationFn: (periodData) => api.post('/reports/eod/trigger/', periodData),
    onSuccess: (res) => {
      toast.success(res.data.status === 'completed' ? 'Reports generated successfully' : 'Reports queued for generation');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-snapshot'] });
    },
    onError: () => toast.error('Failed to trigger report generation')
  });

  const handleTriggerPreset = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    
    triggerEodMutation.mutate({
      period: days === 0 ? 'daily' : `${days}d`,
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
      branch_id: selectedBranch === 'all' ? null : selectedBranch
    });
  };

  const exportToCSV = (report) => {
    if (!report || !report.data) return;
    const data = report.data;
    const branchName = report.branch_name || 'Branch';
    
    const rows = [
      ['Metric', 'Value'],
      ['Date', report.date],
      ['Branch', branchName],
      ['Leads', data.leads?.total || 0],
      ['Sales Count', data.sales?.count || 0],
      ['Gold Weight (g)', data.sales?.weight || 0],
      ['Revenue', data.sales?.revenue || 0],
      ['Calls', data.calls?.total || 0],
      ['Attendance Rate', `${data.attendance?.rate || 0}%`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `report_${branchName}_${report.date}.csv`;
    link.click();
  };

  const getMetricPreview = (data, path) => {
    if (!data) return 0;
    if (typeof data[path] !== 'object' && data[path] !== undefined) return data[path];
    if (path === 'leads') return data.leads?.total || 0;
    if (path === 'calls') return data.calls?.total || 0;
    if (path === 'sales_count') return data.sales?.count || 0;
    if (path === 'sales_weight') return data.sales?.weight || 0;
    return 0;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Business Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Monitor branch performance and sales velocity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()} size="icon" className="rounded-full">
            <RefreshCcw size={18} />
          </Button>
          <Button onClick={() => handleTriggerPreset(0)} disabled={triggerEodMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
            {triggerEodMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Activity size={18} className="mr-2" />}
            Sync Today's Data
          </Button>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-background to-muted/30 overflow-visible">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Branch Focus</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer border-border/50 shadow-sm"
                >
                  <option value="all">All Operations</option>
                  {branchesData?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Date From</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange(p => ({ ...p, from: e.target.value }))}
                  className="pl-10 rounded-xl border-border/50 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Date To</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange(p => ({ ...p, to: e.target.value }))}
                  className="pl-10 rounded-xl border-border/50 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Reporting Period</Label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none border-border/50 shadow-sm"
              >
                <option value="all">All Cycles</option>
                <option value="daily">Daily EOD</option>
                <option value="weekly">Weekly Summaries</option>
                <option value="monthly">Monthly Audits</option>
              </select>
            </div>

            <div className="lg:col-span-2 xl:col-span-1 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleTriggerPreset(7)} className="flex-1 rounded-lg h-10 border border-border/50">Last 7d</Button>
              <Button variant="secondary" size="sm" onClick={() => handleTriggerPreset(30)} className="flex-1 rounded-lg h-10 border border-border/50">Last 30d</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Gold Volume', value: `${formatGrams(metrics.totalGold)} g`, icon: Weight, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12%' },
          { label: 'Sales Velocity', value: metrics.totalSales, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5.4%' },
          { label: 'Revenue Streams', value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8%' },
          { label: 'Lead Throughput', value: metrics.totalLeads, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+15%' },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-6 relative">
              <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} opacity-30 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform`} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                   <ArrowUpRight size={12} /> {kpi.trend}
                </div>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-3xl font-black mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Visuals */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Performance Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Gold volume vs Sales count velocity</p>
            </div>
            <BarChart3 className="text-muted-foreground/30 h-8 w-8" />
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9972A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C9972A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A5490" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1A5490" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#C9972A', strokeWidth: 1 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#C9972A" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} name="Sales" />
                  <Area yAxisId="right" type="monotone" dataKey="weight" stroke="#1A5490" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} name="Gold (g)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                <div className="p-4 bg-muted rounded-full"><BarChart3 size={32} /></div>
                <p>Generating visualizations...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" /> Today's Snapshot
            </CardTitle>
            <p className="text-primary-foreground/70 text-sm">Real-time branch activity preview</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {[
              { label: 'Inbound Leads', val: getMetricPreview(snapshotData?.data, 'leads'), max: 20 },
              { label: 'Interactions', val: getMetricPreview(snapshotData?.data, 'calls'), max: 50 },
              { label: 'Sales Count', val: getMetricPreview(snapshotData?.data, 'sales_count'), max: 10 },
              { label: 'Gold Output', val: `${formatGrams(getMetricPreview(snapshotData?.data, 'sales_weight'))}g`, max: 100 },
            ].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{s.label}</span>
                  <span>{s.val}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, (parseInt(s.val) || 0) * 5)}%` }} 
                  />
                </div>
              </div>
            ))}
            <div className="pt-4">
               <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl h-11">
                 View Detailed Logs <ChevronRight size={18} className="ml-1" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Table */}
      <Card className="border-none shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Historical Audit Logs</CardTitle>
              <p className="text-sm text-muted-foreground">Certified branch performance records</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." className="pl-10 rounded-xl bg-background border-none shadow-inner h-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                <TableHead className="font-bold py-4 px-6">Record Date</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Branch</TableHead>
                <TableHead className="font-bold">Performance Summary</TableHead>
                <TableHead className="text-right font-bold py-4 px-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin inline-block mr-2" /> Auditing data...</TableCell></TableRow>
              ) : filteredReports.length > 0 ? filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/20 border-border/50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText size={16} /></div>
                      <span className="font-bold">{format(new Date(report.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      report.period === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {report.period}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {report.branch_name || 'Global HQ'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <TrendingUp size={14} /> {report.data?.sales_count || 0} Sales
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Weight size={14} /> {formatGrams(report.data?.sales?.weight || 0)}g
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToCSV(report)}
                      className="rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all gap-2 h-9"
                    >
                      <Download size={16} /> Export
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    No historical records matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
