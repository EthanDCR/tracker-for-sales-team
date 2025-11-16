"use client";

import styles from "./leaderboard.module.css";
import { useState, useEffect } from "react";
import { getLeaderboard } from "../actions";


export default function leaderboard() {
  const [timePeriod, setTimePeriod] = useState("today");
  const [office, setOffice] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await getLeaderboard(timePeriod, office);
      setLeaderboardData(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [timePeriod, office]);

  // Filter by search query
  const filteredData = leaderboardData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get period label
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "today": return "today";
      case "week": return "this week";
      case "month": return "this month";
      case "year": return "this year";
      case "all": return "all-time";
      default: return "today";
    }
  };

  return (
    <>
      <div className={styles.page}>

        <h1>leaderboard</h1>
        <p>Company-wide performance rankings</p>
        <div className={styles.searchContainer}>
          <div>
            <h2>Time Period</h2>
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <h2>Office</h2>
            <select value={office} onChange={(e) => setOffice(e.target.value)}>
              <option value="all">All Offices</option>
              <option value="tulsa">Tulsa</option>
              <option value="stlouis">St Louis</option>
              <option value="dallas">Dallas</option>
              <option value="wichita">Wichita</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div>
            <h2>Search Rep...</h2>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
          </div>
        </div>
        <div className={styles.leaderboard}>
          <h3>Rankings</h3>
          {loading ? (
            <p>Loading...</p>
          ) : filteredData.length === 0 ? (
            <p>No rankings found.</p>
          ) : (
            <div className={styles.rankingsList}>
              {filteredData.map((user, index) => (
                <div key={user.id} className={styles.rankingItem}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.name}>{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</span>
                  <div className={styles.pointsContainer}>
                    {timePeriod !== "all" ? (
                      <>
                        <span className={styles.todayPoints}>{user.period_points} pts {getPeriodLabel()}</span>
                        <span className={styles.totalPoints}>{user.total_points} pts all-time</span>
                      </>
                    ) : (
                      <span className={styles.todayPoints}>{user.total_points} pts all-time</span>
                    )}
                  </div>
                  <span className={styles.activities}>{user.activity_count} activities</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div >
    </>

  )
}
