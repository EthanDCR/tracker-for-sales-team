"use client";

import { useEffect, useState } from "react";
import { getActivityDistribution, getConversionRates } from "../actions";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import styles from "./stats.module.css";

const COLORS = ['#229954', '#2ecc71', '#27ae60', '#1e8449', '#0b5d30', '#16a085'];

export default function Stats() {
  const [activityData, setActivityData] = useState([]);
  const [conversionData, setConversionData] = useState(null);
  const [timePeriod, setTimePeriod] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timePeriod]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [activities, conversions] = await Promise.all([
        getActivityDistribution(timePeriod),
        getConversionRates(timePeriod)
      ]);

      // Format activity data for pie chart
      const formattedActivities = activities.map(item => ({
        name: item.activity_type.charAt(0).toUpperCase() + item.activity_type.slice(1),
        value: parseInt(item.count)
      }));

      setActivityData(formattedActivities);
      setConversionData(conversions);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const conversionChartData = conversionData ? [
    { name: 'Calls → Leads', rate: parseFloat(conversionData.callsToLeads), count: `${conversionData.counts.calls} → ${conversionData.counts.leads}` },
    { name: 'Leads → Inspections', rate: parseFloat(conversionData.leadsToInspections), count: `${conversionData.counts.leads} → ${conversionData.counts.inspections}` },
    { name: 'Inspections → Presentations', rate: parseFloat(conversionData.inspectionsToPresent), count: `${conversionData.counts.inspections} → ${conversionData.counts.presentations}` },
    { name: 'Presentations → Closes', rate: parseFloat(conversionData.presentToClose), count: `${conversionData.counts.presentations} → ${conversionData.counts.closes}` }
  ] : [];

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Stats</h1>

      <div className={styles.periodSelector}>
        <button
          className={timePeriod === "today" ? styles.active : ""}
          onClick={() => setTimePeriod("today")}
        >
          Today
        </button>
        <button
          className={timePeriod === "week" ? styles.active : ""}
          onClick={() => setTimePeriod("week")}
        >
          Week
        </button>
        <button
          className={timePeriod === "month" ? styles.active : ""}
          onClick={() => setTimePeriod("month")}
        >
          Month
        </button>
        <button
          className={timePeriod === "all" ? styles.active : ""}
          onClick={() => setTimePeriod("all")}
        >
          All Time
        </button>
      </div>

      <div className={styles.chartsGrid}>
        {/* Activity Distribution Pie Chart */}
        <div className={styles.chartCard}>
          <h2>Activity Distribution</h2>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.noData}>No activity data for this period</p>
          )}
        </div>

        {/* Conversion Rates Bar Chart */}
        <div className={styles.chartCard}>
          <h2>Conversion Rates</h2>
          {conversionData && conversionChartData.some(d => d.rate > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={0}
                  textAnchor="middle"
                  height={40}
                  interval={0}
                  tick={{ fontSize: 14, fill: '#fff' }}
                />
                <YAxis
                  label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#fff', fontSize: 14 } }}
                  tick={{ fill: '#fff', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={styles.tooltip}>
                          <p>{payload[0].payload.name}</p>
                          <p>Rate: {payload[0].value}%</p>
                          <p>{payload[0].payload.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rate" fill="#229954" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.noData}>No conversion data for this period</p>
          )}
        </div>

        {/* Activity Counts */}
        {conversionData && (
          <div className={styles.chartCard}>
            <h2>Activity Summary</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Knocks</span>
                <span className={styles.statValue}>{conversionData.counts.knocks}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Calls</span>
                <span className={styles.statValue}>{conversionData.counts.calls}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Leads</span>
                <span className={styles.statValue}>{conversionData.counts.leads}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Inspections</span>
                <span className={styles.statValue}>{conversionData.counts.inspections}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Presentations</span>
                <span className={styles.statValue}>{conversionData.counts.presentations}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Closes</span>
                <span className={styles.statValue}>{conversionData.counts.closes}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
