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

const formatDate = ({ unformatedDate, format = "DD-MM-YYYY"}: dateProps) => {
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

export { formatDate, getTimeFromDate };
