import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { Filter, Plus, MessageSquareText, ChevronDown } from 'lucide-react';
import { formatGrams } from '../lib/utils';
import api from '../api/axios';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        weight: 0,
        conversions: 0,
        signups: 0
    });
    const [funnelData, setFunnelData] = useState([
        { name: 'Visits', value: 103600, label: '103.6k', pct: '100%' },
        { name: 'Engagement', value: 64200, label: '64.2k', pct: '-38.03%' },
        { name: 'Intent', value: 43500, label: '43.5k', pct: '-32.24%' },
        { name: 'Action', value: 31600, label: '31.6k', pct: '-27.36%' },
        { name: 'Conversion', value: 15400, label: '15.4k', pct: '-51.27%' }
    ]);
    const [loading, setLoading] = useState(true);

    const visitsData = [
        { name: 'Nov', curr: 3000, prev: 2000 },
        { name: 'Dec', curr: 2500, prev: 1800 },
        { name: 'Jan', curr: 5500, prev: 3200 },
        { name: 'Feb', curr: 2100, prev: 1500 },
        { name: 'Mar', curr: 1900, prev: 1300 },
        { name: 'Apr', curr: 2800, prev: 1600 }
    ];

    const conversionTrend = Array.from({length: 30}, (_, i) => ({ day: i, val: Math.floor(Math.random() * 50) + 10 }));

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch actual data to blend with UI
                const leadsRes = await api.get('/leads/leads/');
                const leads = leadsRes.data.results || [];
                
                const salesRes = await api.get('/sales/sales/');
                const sales = salesRes.data.results || [];
                const totalWeight = sales.reduce((acc, sale) => acc + (parseFloat(sale.weight_grams || sale.amount) || 0), 0);

                // If we have actual data, let's update some metrics
                setStats({
                    weight: totalWeight || 0,
                    conversions: sales.length || 0,
                    signups: leads.length || 0
                });

                if (leads.length > 0) {
                    // Calculate actual funnel from leads stage
                    const stageCounts = { new: 0, contacted: 0, interested: 0, scheduled: 0, converted: 0 };
                    leads.forEach(l => { if (stageCounts[l.stage] !== undefined) stageCounts[l.stage]++; });
                    
                    if (stageCounts.new > 0) { // Only override if we have real data
                        setFunnelData([
                            { name: 'New (Visits)', value: stageCounts.new, label: stageCounts.new.toString() },
                            { name: 'Contacted', value: stageCounts.contacted, label: stageCounts.contacted.toString() },
                            { name: 'Interested', value: stageCounts.interested, label: stageCounts.interested.toString() },
                            { name: 'Scheduled', value: stageCounts.scheduled, label: stageCounts.scheduled.toString() },
                            { name: 'Converted', value: stageCounts.converted, label: stageCounts.converted.toString() }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="animate-fade-in" style={{ paddingTop: '1rem' }}>
            <div className="page-header">
                <h1 className="page-title">Data Insights</h1>
                <div className="header-actions">
                    <button className="btn-outline">
                        Filter <ChevronDown size={14} />
                    </button>
                    <button className="btn-outline">
                        Jan 01 - Jan 31 <ChevronDown size={14} />
                    </button>
                    <button className="btn-outline">
                        Add Widget <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                
                {/* Funnel Breakdown - 8 cols */}
                <div className="card" style={{ gridColumn: 'span 8', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <div className="card-title">Funnel Conversion Breakdown</div>
                        <div className="card-subtitle">...</div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 40px', zIndex: 10 }}>
                            {funnelData.map((d, i) => (
                                <div key={i} style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))' }}>{d.name}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{d.label}</div>
                                    {d.pct && <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))' }}>{d.pct}</div>}
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '240px', marginTop: '40px' }}>
                            <ResponsiveContainer width="100%" height={240} minWidth={0}>
                                <AreaChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#30d158" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#0a84ff" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="stepAfter" dataKey="value" stroke="#30d158" fillOpacity={1} fill="url(#colorFunnel)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Total Monthly Weight - 4 cols */}
                <div className="card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <div className="card-title">Total Monthly Weight</div>
                        <div className="card-subtitle">Gold grams sold</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="metric-value">{formatGrams(stats.weight)} g</div>
                        <div className="metric-badge positive">+12%</div>
                    </div>
                    
                    <div className="progress-group">
                        <div className="progress-item">
                            <div className="progress-label">
                                <span>Bridal Sales</span>
                                <span>{formatGrams(stats.weight * 0.7)} g</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: '70%', background: 'linear-gradient(90deg, #C9972A, #F0C84A)' }}></div>
                            </div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-label">
                                <span>Daily Wear</span>
                                <span>{formatGrams(stats.weight * 0.2)} g</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: '20%', background: 'linear-gradient(90deg, #C9972A, #F0C84A)' }}></div>
                            </div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-label">
                                <span>Investment</span>
                                <span>{formatGrams(stats.weight * 0.1)} g</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: '10%', background: 'linear-gradient(90deg, #C9972A, #F0C84A)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unique Visits - 4 cols */}
                <div className="card" style={{ gridColumn: 'span 4', height: '280px' }}>
                    <div className="card-header">
                        <div>
                            <div className="card-title">Lead Growth</div>
                            <div className="card-subtitle" style={{fontSize: '0.65rem'}}>compared to last year</div>
                        </div>
                    </div>
                    <div style={{ height: '180px' }}>
                        <ResponsiveContainer width="100%" height={180} minWidth={0}>
                            <LineChart data={visitsData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8e8e93', fontSize: 10}} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2c2c2e', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Line type="monotone" dataKey="curr" stroke="#ff453a" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="prev" stroke="#8e8e93" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversions & Signups - 4 cols */}
                <div className="card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem', height: '280px' }}>
                    <div style={{ flex: 1, borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem' }}>
                        <div className="card-title" style={{ fontSize: '0.85rem' }}>Total Conversions</div>
                        <div className="card-subtitle" style={{ fontSize: '0.65rem' }}>this week</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <div className="metric-value" style={{ fontSize: '1.5rem' }}>{stats.conversions.toLocaleString()}</div>
                            <div style={{ width: '120px', height: '40px' }}>
                                <ResponsiveContainer width="100%" height={40} minWidth={0}>
                                    <BarChart data={conversionTrend}>
                                        <Bar dataKey="val" fill="#0a84ff" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="card-title" style={{ fontSize: '0.85rem' }}>New Leads Generated</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <div className="metric-value" style={{ fontSize: '1.5rem' }}>{stats.signups.toLocaleString()}</div>
                            <div style={{ width: '120px', height: '40px' }}>
                                <ResponsiveContainer width="100%" height={40} minWidth={0}>
                                    <BarChart data={conversionTrend.slice().reverse()}>
                                        <Bar dataKey="val" fill="#0a84ff" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights - 4 cols */}
                <div className="card" style={{ gridColumn: 'span 4', height: '280px', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            AI Insights <MessageSquareText size={14} color="hsl(var(--muted-foreground))" />
                        </div>
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '1rem' }}>
                        +35.2% Unique Leads
                    </div>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', lineHeight: 1.6, flex: 1 }}>
                        Distributed reach marketing is paying off. Unique leads made through untracked channels led to +35.2% increased traffic, with unique buyers increasingly interested in product in the Bridal Collection.
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '1rem' }}>
                        <div style={{ height: '2px', flex: 1, background: 'hsl(var(--primary))' }}></div>
                        <div style={{ height: '2px', flex: 1, background: 'hsl(var(--border))' }}></div>
                        <div style={{ height: '2px', flex: 1, background: 'hsl(var(--border))' }}></div>
                        <div style={{ height: '2px', flex: 1, background: 'hsl(var(--border))' }}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
