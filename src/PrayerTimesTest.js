import React, { useState, useEffect } from "react";
import moment from "moment-timezone"; // Import moment-timezone
import "./PrayerTimesTest.css";

function PrayerTimes() {
  const [prayerData, setPrayerData] = useState({
    date: "Fetching data...",
    fajr: { time: "-", iqama: "-" },
    dhuhr: { time: "-", iqama: "-" },
    asr: { time: "-", iqama: "-" },
    maghrib: { time: "-", iqama: "-" },
    isha: { time: "-", iqama: "-" },
  });
  /*
  const [hijriMonth, setHijriMonth] = useState("");
  const [hijriYear, setHijriYear] = useState("");
  const [hijriDay, setHijriDay] = useState("");
  
 */

  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    fetchPrayerData();
    const interval = setInterval(() => {
      const sanAntonioTime = moment.tz("America/Chicago");
      const formattedTime = sanAntonioTime.format("h:mm A");
      setCurrentTime(formattedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrayerData = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getFullYear()}`;

      const address = encodeURIComponent(
        "5281 Casa Bella St, San Antonio, Texas, United States"
      );
      const method = 2;

      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByAddress/${formattedDate}?address=${address}&method=${method}`
      );

      const data = await response.json();
      const todayData = data.data.timings;
      const hijriNumber = data.data.date.hijri.month.number;
      /*
      const hijriDate = data.data[0].date.hijri;
      setHijriMonth(hijriDate.month.en);
      setHijriYear(hijriDate.year);
      setHijriDay(hijriDate.day);
*/
      const iqma_response = await fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZ26h2oufYXq0i04ioOoH7aDkOHl0pvQ9E8mbIzxpVsElIoeUq0FJhwRgHkaiRlPn6IEcoM-0vty9/pub?output=csv"
      );
      const Iqma_data = await iqma_response.text();
      const rows = Iqma_data.split("\n");
      const headerRow = rows[0].split(",");

      // const date_startIndex = headerRow.indexOf("Date Start");
      const date_endIndex = headerRow.indexOf("Date End");
      const fajrIndex = headerRow.indexOf("Fajr");
      const dhuhrIndex = headerRow.indexOf("Dhur");
      const asrIndex = headerRow.indexOf("Asr");
      const maghribIndex = headerRow.indexOf("Maghrib");
      const ishaIndex = headerRow.findIndex((header) =>
        header.includes("Isha")
      );
      if (hijriNumber === 9) {
        setIsRamadan(true);
      } else {
        setIsRamadan(false);
      }

      // Extracting prayer times from the API response
      function convertTo12HourFormat(time24, offsetMinutes = 0) {
        const [hour, minute] = time24.split(":");
        let adjustedHour = parseInt(hour, 10);
        let adjustedMinute = parseInt(minute, 10) + offsetMinutes;

        if (adjustedMinute >= 60) {
          adjustedHour += Math.floor(adjustedMinute / 60);
          adjustedMinute %= 60;
        }

        const period = adjustedHour >= 12 ? "PM" : "AM";
        const hour12 = adjustedHour % 12 || 12;
        return `${hour12}:${adjustedMinute
          .toString()
          .padStart(2, "0")} ${period}`;
      }
      // const maghrib_idx = rows[1].split(",")[maghribIndex];
      const date_end = rows[1].split(",")[date_endIndex];
      let fajr_igma_time;
      let newCurrentTIme = currentDate.getDate().toString().padStart(2, "0");
      let magrib_time = rows[1].split(",")[maghribIndex];
      let int_magrib = parseInt(magrib_time)
      if (date_end >= newCurrentTIme) {
        fajr_igma_time = rows[1].split(",")[fajrIndex];
      } else {
        fajr_igma_time = rows[2].split(",")[fajrIndex];
      }
      const Maghrib_iqma = convertTo12HourFormat(
        todayData.Maghrib,
        int_magrib
      );
      setPrayerData({
        date: todayData.readable,
        fajr: {
          time: convertTo12HourFormat(todayData.Fajr),
          iqama: fajr_igma_time, // Adjust the index accordingly
        },
        dhuhr: {
          time: convertTo12HourFormat(todayData.Dhuhr),
          iqama: rows[1].split(",")[dhuhrIndex], // Adjust the index accordingly
        },
        asr: {
          time: convertTo12HourFormat(todayData.Asr),
          iqama: rows[1].split(",")[asrIndex], // Adjust the index accordingly
        },
        maghrib: {
          time: convertTo12HourFormat(todayData.Maghrib),
          iqama: Maghrib_iqma, // You may adjust this if you have Maghrib Iqama data
        },
        isha: {
          time: convertTo12HourFormat(todayData.Isha),
          iqama: rows[1].split(",")[ishaIndex], // Adjust the index accordingly
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const currentTimee = new Date();
  const currentHours = currentTimee.getHours();
  const currentMinutes = currentTimee.getMinutes();

  // Determine if it's AM or PM
  const amOrPm = currentHours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  const hours12 = currentHours % 12 || 12; // Ensure 12:00 PM, not 0:00 PM

  // Format the time as h:MM AM/PM
  const formattedTime = `${hours12}:${String(currentMinutes).padStart(
    2,
    "0"
  )} ${amOrPm}`;
  console.log("Current time in 12-hour format: " + formattedTime);

  // Define an array of prayer times in the order you want to highlight
  const prayerTimes = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const [currentTime, setCurrentTime] = useState("");

  // Function to calculate the current prayer

  const currentDate = new Date();
  // const month = currentDate.getMonth() + 1; // Adding 1 to get a 1-based index

  console.log("Month:", currentDate);
  // Function to format the date
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  // const isRamadan = true; // Change this based on your data

  // Check if the current day is Friday
  // const isFriday = moment.tz('America/Chicago').isoWeekday() === 5;
  //<h3 id="date_hijra">{hijriMonth} {hijriDay}, {hijriYear}</h3>
  // Data Display

  return (
    <div id="prayerTimes">
      <div>
        <h2 id="dateElement">{formattedDate}</h2>

        <h3 id="currentTimeElement">Local Time: {currentTime}</h3>
      </div>

      <div className="prayer-info">
        {prayerTimes.map((prayer) => (
          <div key={prayer}>
            <h3>{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</h3>
            <p>Time: {prayerData[prayer].time}</p>
            <p>Iqama: {prayerData[prayer].iqama}</p>
          </div>
        ))}
        <div className="prayer-item highlighted-yellow">
          <h2>Jummah</h2>
          <p>1st Jummah: 1:00 PM</p>
          <p>2nd Jummah: 2:00 PM</p>
        </div>
      </div>
      {isRamadan ? (
        <div id="prayerTimes">
          <h2>Ramadan Times</h2>

          <div>
            <div className="prayer-item">
              <h3>Imsak</h3>
              <p>Time: {prayerData.imsak ? prayerData.imsak : "-"}</p>
            </div>

            <div className="prayer-item">
              <h3>Iftar</h3>
              <p>Time: {prayerData.iftar ? prayerData.iftar : "-"}</p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Display Imsak and Iftar times only during Ramadan */}

      {/* ... (existing code) */}
    </div>
  );
}

export default PrayerTimes;
