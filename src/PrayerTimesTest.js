/*
Bismillah ir-Rahman ir-Rahim
This code pertains to the prayer times on MCECC Masjid in San Antonio, Texas.
mcecc.com
Blessings from any benefit to the muslim community is intended to go towards the Baksh and Younis family, both Past and Present Inshallah.
As Sadqa Jariah 
*/
import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
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

  const [prayerIftar, setPrayerIftar] = useState("");
  const [isRamadan, setIsRamadan] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prayerResponse, iqamaResponse] = await Promise.all([
          fetch("https://prayertimesdata.mcecc.com/").then(res => res.json()),
          fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZ26h2oufYXq0i04ioOoH7aDkOHl0pvQ9E8mbIzxpVsElIoeUq0FJhwRgHkaiRlPn6IEcoM-0vty9/pub?output=csv").then(res => res.text())
        ]);

        const todayData = prayerResponse.data.timings;
        const hijriNumber = prayerResponse.data.date.hijri.month.number;
        const rows = iqamaResponse.split("\n");

        let iqamaIndex = 1; // Default to the second row
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(",");
          const [startDate, endDate] = [parseInt(row[0]), parseInt(row[1])];
          const currentDate = moment().date();

          if (currentDate >= startDate && currentDate <= endDate) {
            iqamaIndex = i;
            break;
          }
        }

        const maghribIqamaOffset = parseInt(rows[iqamaIndex].split(",")[5]);
        const maghribTime = convertTo12HourFormat(todayData.Maghrib);
        const maghribIqamaTime = moment(maghribTime, 'h:mm A').add(maghribIqamaOffset, 'minutes').format('h:mm A');

        setPrayerData({
          date: todayData.readable,
          fajr: { time: convertTo12HourFormat(todayData.Fajr), iqama: rows[iqamaIndex].split(",")[2] },
          dhuhr: { time: convertTo12HourFormat(todayData.Dhuhr), iqama: rows[iqamaIndex].split(",")[3] },
          asr: { time: convertTo12HourFormat(todayData.Asr), iqama: rows[iqamaIndex].split(",")[4] },
          maghrib: { time: maghribTime, iqama: maghribIqamaTime },
          isha: { time: convertTo12HourFormat(todayData.Isha), iqama: rows[iqamaIndex].split(",")[6] },
        });

        setIsRamadan(hijriNumber === 9);
        setPrayerIftar(convertTo12HourFormat(todayData.Maghrib));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setCurrentTime(moment.tz("America/Chicago").format("h:mm A"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const convertTo12HourFormat = (time24) => {
    const [hour, minute] = time24.split(":");
    const period = parseInt(hour) >= 12 ? "PM" : "AM";
    const hour12 = ((parseInt(hour) + 11) % 12) + 1;
    return `${hour12}:${minute} ${period}`;
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const prayerTimes = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  return (
    <div id="prayerTimes">
      <div>
        <h2 id="dateElement">{formattedDate}</h2>
        <h3 id="currentTimeElement">Local Time: {currentTime}</h3>
        {isRamadan && (
          <>
            <h2 id="title">Ramadan Times</h2>
            <div className="ramadan_wrapper" id="pr;ayerTimes">
              <div className="ramadanItems">
                <h3>Suhoor</h3>
                <p>{prayerData.fajr.time}</p>
              </div>
              <div className="ramadanItems">
                <h3>Iftar</h3>
                <p>{prayerIftar}</p>
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        {isRamadan && <h2 id="title">Prayer Times</h2>}
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
      </div>
    </div>
  );
}

export default PrayerTimes;
