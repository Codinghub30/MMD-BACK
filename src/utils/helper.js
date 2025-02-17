export const formatDate = (date) => {
  if (!date) return "";

  const formattedDate = new Date(date);

  const day = String(formattedDate.getDate()).padStart(2, "0");
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const year = formattedDate.getFullYear();

  return `${day}.${month}.${year}`;
};

export const formatTime = (time) => {
  if (!time || typeof time !== "string") return null;

  try {
    const [hourMinute, period] = time.trim().split(" ");
    const [hour, minute] = hourMinute.split(":");

    let hours = parseInt(hour, 10);
    if (period?.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (period?.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(parseInt(minute, 10));
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Invalid time format:", time, error);
    return null;
  }
};
