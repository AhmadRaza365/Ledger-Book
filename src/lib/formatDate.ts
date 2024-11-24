type dateProps = {
  unformatedDate: string;
  format: "DD-MM-YYYY" | "DD/MM/YYYY" | "DD MMM YYYY";
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = ({ unformatedDate, format = "DD-MM-YYYY" }: dateProps) => {
  const date = new Date(unformatedDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (format === "DD-MM-YYYY") {
    return `${day}-${month}-${year}`;
  } else if (format === "DD/MM/YYYY") {
    return `${day}/${month}/${year}`;
  } else if (format === "DD MMM YYYY") {
    return `${day} ${months[month - 1]} ${year}`;
  }
};

const getTimeFromDate = (unformatedDate: string) => {
  const date = new Date(unformatedDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const formateIntoReadableText = (unformatedDate: string) => {

  if (!unformatedDate) {
    return "A while ago";
  }

  // Format the date into a readable format
  // 1 minute ago
  // 1 hour ago
  // 1 day ago

  // Get the current date
  const currentDate = new Date();
  const date = new Date(unformatedDate);

  // Get the difference between the current date and the date
  const difference = currentDate.getTime() - date.getTime();

  // Get the difference in minutes
  const minutes = difference / 1000 / 60;

  // Get the difference in hours
  const hours = minutes / 60;

  // Get the difference in days
  const days = hours / 24;


  // If the difference is less than 1 minute
  if (minutes < 1) {
    return "Just now";
  }

  // If the difference is less than 1 hour
  if (hours < 1) {
    return `${Math.floor(minutes)} minutes ago`;
  }

  // If the difference is less than 1 day
  if (days < 1) {
    return `${Math.floor(hours)} hours ago`;
  }

  // If the difference is less than 2 days
  if (days < 2) {
    return "Yesterday";
  }

  // If the difference is less than 7 days
  if (days < 7) {
    return `${Math.floor(days)} days ago`;
  }

  // If the difference is more than 7 days
  return formatDate({ unformatedDate, format: "DD MMM YYYY" });

};

export { formatDate, getTimeFromDate, formateIntoReadableText };
