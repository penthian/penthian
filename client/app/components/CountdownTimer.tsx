import { useEffect, useState } from "react";

// Countdown function to calculate remaining time
const calculateTimeLeft = (endTime: number) => {
  const now = Math.floor(Date.now() / 1000); // current time in seconds
  const difference = endTime - now;

  if (difference <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  const days = Math.floor(difference / (3600 * 24));
  const hours = Math.floor((difference % (3600 * 24)) / 3600);
  const minutes = Math.floor((difference % 3600) / 60);
  const seconds = Math.floor(difference % 60);

  return {
    days: days.toString().padStart(2, "0"),
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
};

export const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [endTime]);

  return (
    <div className="font-medium text-sm sm:text-base flex gap-1">
      <span>{timeLeft.days}d</span>
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.minutes}m</span>
      <span>{timeLeft.seconds}s</span>
    </div>
  );
};