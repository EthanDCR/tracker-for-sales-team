import styles from "./callform.module.css";
import { useState } from "react";
import { addActivity } from "../actions";



export default function CallForm({ onClose }) {

  const [callResult, setCallResult] = useState(null);
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (value) => {
    setSelected(value);
  }

  const handleFinalSubmit = (selected, notes) => {
    addActivity(1, notes, selected);
    onClose();
  }


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>Select Call Result</h1>

        <div className={styles.buttonContainer}>
          <button
            onClick={() => handleSubmit("noanswer")}
            className={`${styles.noAnswer} ${selected === "noanswer" ? styles.selected : ""}`}
          >
            No Answer
          </button>
          <button
            onClick={() => handleSubmit("notinterested")}
            className={`${styles.notInterested} ${selected === "notinterested" ? styles.selected : ""}`}
          >
            Not Interested
          </button>
          <button
            onClick={() => handleSubmit("leadset")}
            className={`${styles.leadSet} ${selected === "leadset" ? styles.selected : ""}`}
          >
            Lead Set
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
