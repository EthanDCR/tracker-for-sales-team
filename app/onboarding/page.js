"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "../actions";
import styles from "./onboarding.module.css";

export default function Onboarding() {
  const router = useRouter();
  const [office, setOffice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!office) {
      alert("Please select an office");
      return;
    }

    setLoading(true);

    try {
      await createUser(office);
      router.push("/");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error setting up your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Welcome to Sales Tracker!</h1>
        <p>Let's get you set up. Please select your office location:</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="office">Office Location</label>
            <select
              id="office"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              required
            >
              <option value="">Select your office...</option>
              <option value="tulsa">Tulsa</option>
              <option value="stlouis">St Louis</option>
              <option value="dallas">Dallas</option>
              <option value="wichita">Wichita</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
