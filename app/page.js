"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { getTopThreeToday } from "./actions";
import CallForm from "./components/CallForm";
import KnockForm from "./components/KnockForm";
import PresentationForm from "./components/PresentationForm";
import { addActivity } from "./actions";


export default function Home() {

  const [points, setPoints] = useState(0);
  const [dailyMet, setDailyMet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [showKnockForm, setShowKnockForm] = useState(false);
  const [showPresentationForm, setShowPresentationForm] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [checkingUser, setCheckingUser] = useState(true);


  useEffect(() => {
    const checkUser = async () => {
      const response = await fetch('/api/check-user');
      const { exists } = await response.json();

      if (!exists) {
        window.location.href = '/onboarding';
      } else {
        setCheckingUser(false);
      }
    };

    checkUser();
  }, []);


  const capitalize = (str) => {
    if (!str) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  useEffect(() => {
    const getTopThree = async () => {
      const topThree = await getTopThreeToday();
      if (topThree.length === 0) {
        console.log("no results found for top 3 today");
      }
      else {
        setLeaders(topThree);
      }

    }
    getTopThree();
  }, []);


  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastDate');
    if (today !== lastDate) {
      setPoints(0);
      setDailyMet(false);
      setShowConfetti(false);
      localStorage.setItem('lastDate', today);
    } else {
      const savedPoints = localStorage.getItem('points');
      setPoints(parseInt(savedPoints));
    }
  }, []);

  const handleAction = (value) => {

    if (points >= 100) {
      return
    }

    try {
      if (value !== 5) {
        addActivity(value);
      }
    }
    catch (error) {
      console.error(error);
    }

    const newPoints = (points + value);
    setPoints(newPoints);
    localStorage.setItem('points', newPoints);
  }

  const handleReset = () => {
    setPoints(0);
    setDailyMet(false);
    setShowConfetti(false);
    localStorage.setItem('points', 0);
  }

  useEffect(() => {
    if (points >= 100) {
      setShowConfetti(true);
      setDailyMet(true);
    }
  }, [points]);


  if (checkingUser) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#000' }}>Loading...</div>;
  }

  return (
    <>
      {showConfetti && <Confetti />}
      {showCallForm && <CallForm onClose={() => setShowCallForm(false)} onSubmit={() => handleAction(5)} />}
      {showKnockForm && <KnockForm onClose={() => setShowKnockForm(false)} onSubmit={() => handleAction(1)} />}
      {showPresentationForm && <PresentationForm onClose={() => setShowPresentationForm(false)} onSubmit={() => handleAction(20)} />}
      <main className={styles.main}>


        <div id="live-tracker" className={styles.liveTracker}>
          <div className={styles.header}>
            <div className={styles.actionsHeaderSpace}>
              <h1>Quick actions</h1>
            </div>
          </div>


          <div id="quick-actions" className={styles.quickActions}>
            <div id="action-cards" className={styles.actionCards}>
              <button onClick={() => handleAction(20)}>Lead<br /><span>+20 pts</span></button>
              <button onClick={() => setShowCallForm(true)}>Call<br /><span>+5 pts</span></button>
              <button onClick={() => setShowKnockForm(true)}>Knock<br /><span>+1 pts</span></button>
              <button onClick={() => handleAction(10)}>Inspection<br /><span>+10 pts</span></button>
              <button onClick={() => setShowPresentationForm(true)}>Presentation<br /><span>+20 pts</span></button>
              <button onClick={() => handleAction(50)}>Closed Deal<br /><span>+50 pts</span></button>
            </div>

          </div>

          <div className={styles.progressSection}>
            <h3>Progress</h3>
            {dailyMet && <p className={styles.dailyMet}><strong>DAILY GOAL COMPLETE!</strong></p>}
            <div className={styles.progressStats}>
              <span className={styles.currentPoints}>{points}</span>
              <span className={styles.totalPoints}>/ 100 pts</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(points, 100)}%` }}></div>
            </div>
            <p className={styles.pointsRemaining}>{Math.max(100 - points, 0)} points to go</p>
          </div>


        </div>



        <div id="leaderBoardContainer" className={styles.leaderBoardContainer}>
          <h4>Top 3 Today</h4>

          <div className={styles.leaderNames}>
            {leaders.length > 0 && <p>{capitalize(leaders[0]?.name)} 👑<br />{leaders[0]?.total_points} points</p>}
            {leaders.length > 1 && <p>{capitalize(leaders[1]?.name)} -<br />{leaders[1]?.total_points} points</p>}
            {leaders.length > 2 && <p>{capitalize(leaders[2]?.name)} -<br />{leaders[2]?.total_points} points</p>}
          </div>
        </div>

        <div className={styles.clearBtn}>
          <button onClick={() => handleReset()} className={styles.resetButton}>Reset Points</button>
        </div>

      </main >
    </>
  );
}
