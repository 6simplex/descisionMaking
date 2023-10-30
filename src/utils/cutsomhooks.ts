/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
// import XLSX from "sheetjs-style";
// import * as FileSaver from "file-saver";
export const fetchData = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    return { error: error.response };
  }
};

export const PostData = async (url: string, data: any) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    return { error: error.response };
  }
};

export const DeleteItem = async (url: string) => {
  try {
    const response = await axios.delete(url);
    return response.data;
  } catch (error: any) {
    return { error: error.response };
  }
};

export const DeleteItems = async (url: string, data: object) => {
  try {
    const response = await axios.delete(url, data);
    return response.data;
  } catch (error: any) {
    return { error: error.response };
  }
};

export function clearCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

export function isWithin5Days(dateString: string) {
  // Get today's date
  const today = new Date();

  // Convert the provided date string to a Date object
  const providedDate = new Date(dateString);

  // Calculate the date range for 5 days in the past and future
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(today.getDate() + 5);

  // Compare the provided date against the date range
  return providedDate >= fiveDaysAgo && providedDate <= fiveDaysFromNow;
}
// export const exportExcelJson = (excelData: any, fileName: string) => {
//   const fileType =
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset-UTF-8";
//   const exportToExcel = async () => {
//     const ws = XLSX.utils.json_to_sheet(excelData);
//     const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: fileType });
//     FileSaver.saveAs(data, fileName);
//   };
//   exportToExcel();
// };
export function getCurrentDateDDMMYYYY(date1?: any): string {
  const currentDate = new Date();

  // Get day, month, and year components
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear().toString();

  // Concatenate the components in the DD/MM/YYYY format
  const ddmmyyyy = `${day}/${month}/${year}`;

  return ddmmyyyy;
}
export function extractTime(timestamp: any): string {
  const dateObject = new Date(timestamp);
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes().toString().padStart(2, "0"); // 28 (2 digits)
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const formattedTime = `${hours12}:${minutes} ${amOrPm}`;

  return formattedTime;
}

export function getCurrentTimestamp(date: any) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const timezoneOffsetHours = Math.floor(
    Math.abs(date.getTimezoneOffset()) / 60
  );
  const timezoneOffsetMinutes = Math.abs(date.getTimezoneOffset()) % 60;
  const timezoneSign = date.getTimezoneOffset() < 0 ? "+" : "-";

  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT${timezoneSign}${timezoneOffsetHours
    .toString()
    .padStart(2, "0")}:${timezoneOffsetMinutes.toString().padStart(2, "0")}`;

  return timestamp;
}
export function breakTextIntoLines(
  text: string,
  maxWidth: number,
  ctx: CanvasRenderingContext2D
): string[] {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const testLineWidth = ctx.measureText(testLine).width;

    if (testLineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  lines.push(currentLine);
  return lines;
}
export function dateConvertorISO(dateString: string): Date {
  // Parse the date and time string into a Date object

  const dateParts: any = dateString.match(/(\d+)/g); // Extract numeric parts
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JavaScript
  const year = parseInt(dateParts[2]);
  let hours = parseInt(dateParts[3]);
  const minutes = parseInt(dateParts[4]);

  const isPM = dateString.toLowerCase().includes("pm");
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  return new Date(year, month, day, hours, minutes);
}
