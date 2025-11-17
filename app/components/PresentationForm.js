import styles from "./callform.module.css";
import { useState } from "react";
import { addActivity } from "../actions";



export default function PresentationForm({ onClose, onSubmit }) {

  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (value) => {
    setSelected(value);
  }

  const handleFinalSubmit = (selected, notes) => {
    addActivity(20, notes, selected);
    onSubmit();
    onClose();
  }


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>Select Presentation Result</h1>

        <div className={styles.buttonContainer}>
          <button
            onClick={() => handleSubmit("presentation")}
            className={`${styles.presentation} ${selected === "presentation" ? styles.selected : ""}`}
          >
            Just Presentation
          </button>
          <button
            onClick={() => handleSubmit("closeddeal")}
            className={`${styles.closedDeal} ${selected === "closeddeal" ? styles.selected : ""}`}
          >
            Closed Deal
          </button>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.greyButton} onClick={onClose}>Cancel</button>
          <button onClick={() => handleFinalSubmit(selected, notes)} className={styles.greyButton}>Log Activity</button>
        </div>

        <div className={styles.textarea}>
          <textarea placeholder="enter notes here" onChange={(e) => setNotes(e.target.value)} rows={3}></textarea>
        </div>

      </div>
    </div >
  )
}
