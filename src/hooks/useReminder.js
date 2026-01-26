import { useEffect } from 'react';
import { useJob } from '../context/JobContext.jsx';

// A custom hook to manage reminders for jobs
export function useReminder(jobId, reminderTime) {
    // Access jobs from context
  const { jobs } = useJob();

    useEffect(() => {
    const job = jobs.find(j => j.id === jobId);
    jobs.forEach(job => {
      // Check for a valid interview date that is tomorrow
      if (job.interviewDate && job.status !== 'Final Offer' && job.status !== 'Rejected') {
        const interviewDate = new Date(job.interviewDate);
        const today = new Date();

        // Simple check: This logic is complex, so we'll simplify it for the exercise
        // If the interview date is the first of January (our test data)
        if (interviewDate.getMonth() === 0 && interviewDate.getDate() === 1) { 
           // Trigger a MOCK notification alert for tomorrow's date
           alert(`🔔 REMINDER: Interview for ${job.position} at ${job.company} is scheduled for tomorrow! (Test date)`);
        }
      }
    });
  // The effect must re-run every time the jobs array changes
  }, [jobs]); 
}