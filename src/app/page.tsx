"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "day" | "night";

export default function SunsetClock() {
  const [mode, setMode] = useState<Mode>("night");
  const [currentBg, setCurrentBg] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Getting your location..."
  );
  const [timeLeftText, setTimeLeftText] = useState<string>(
    "Calculating time left..."
  );
  const [clockText, setClockText] = useState<string>("Loading...");
  const [realClockText, setRealClockText] = useState<string>("Loading...");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sunsetTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const sunsetTime = sunsetTimeRef.current;
      if (!sunsetTime) return;

      const now = new Date();
      setRealClockText(now.toLocaleTimeString());

      const adjustedSunset = new Date(sunsetTime);
      if (now < sunsetTime)
        adjustedSunset.setDate(adjustedSunset.getDate() - 1);

      const sinceSunset = now.getTime() - adjustedSunset.getTime();
      const sh = Math.floor(sinceSunset / 3600_000) % 24;
      const sm = Math.floor((sinceSunset % 3600_000) / 60_000);
      const ss = Math.floor((sinceSunset % 60_000) / 1000);

      setClockText(
        `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:${String(
          ss
        ).padStart(2, "0")}`
      );

      const nextSunset = new Date(sunsetTime);
      if (now > sunsetTime) nextSunset.setDate(nextSunset.getDate() + 1);

      const timeLeftMs = nextSunset.getTime() - now.getTime();
      const lh = Math.floor(timeLeftMs / 3600_000);
      const lm = Math.floor((timeLeftMs % 3600_000) / 60_000);
      const ls = Math.floor((timeLeftMs % 60_000) / 1000);

      setTimeLeftText(`Sunset in: ${lh}h ${lm}m ${ls}s`);
       // ⭐️ এখানে টাইম ট্যাবে দেখাবে:
  // document.title = `Sunset in: ${lh}h ${lm}m ${ls}s`;
    };

    const fetchSunsetTime = (lat: number, lng: number) => {
      fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
      )
        .then((res) => res.json())
        .then((data) => {
          sunsetTimeRef.current = new Date(data.results.sunset);
          setStatusMessage(
            `Sunset Time: ${sunsetTimeRef.current.toLocaleTimeString()}`
          );
          updateClock();
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(updateClock, 1000);
        })
        .catch(() => setStatusMessage("⚠️ Failed to load sunset time."));
    };

    const getCity = () => {
      fetch("https://ipwho.is/")
        .then((res) => res.json())
        .then((data) => {
          setLocation(
            data.success ? `${data.city}, ${data.country}` : "Unknown Location"
          );
        })
        .catch(() => setLocation("Unknown Location"));
    };

    const createStars = (count: number) => {
      const container = document.getElementById("stars-container");
      if (!container) return;
      container.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = Math.random() * 100 + "%";
        star.style.left = Math.random() * 100 + "%";
        star.style.animationDuration = `${1 + Math.random() * 2}s`;
        container.appendChild(star);
      }
    };

    const init = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchSunsetTime(pos.coords.latitude, pos.coords.longitude),
        () => setStatusMessage("🚫 Location access denied.")
      );
      getCity();
      createStars(100);
    };

    init();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setCurrentBg(
      mode === "day"
        ? "bg-gradient-to-br from-blue-200/40 to-white/10"
        : "night-radial-bg"
    );
  }, [mode]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen overflow-hidden ${currentBg} text-gray-100 backdrop-blur-2xl transition-all duration-1000`}
    >
      {/* Stars */}
      <div
        id="stars-container"
        className="absolute inset-0 z-0 overflow-hidden"
      />

      {/* Mode Selector */}
      <div className="absolute top-4 right-4 z-20">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className={`text-sm rounded-md px-3 py-1 shadow backdrop-blur-md focus:outline-none ${
            mode === "night"
              ? "!bg-gray-700 text-gray-100"
              : "bg-white/30 text-gray-900"
          }`}
        >
          <option value="day">🌞 Day</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      {/* Real Clock */}
      <div className="absolute top-4 right-32 z-20">
        <div
          className={`text-sm rounded-md px-3 py-1 shadow backdrop-blur-md ${
            mode === "night"
              ? "!bg-gray-700 text-gray-100"
              : "bg-white/30 text-gray-900"
          }`}
        >
          🕒 {realClockText}
        </div>
      </div>

      {/* Location */}
      <div
        className={`absolute bottom-4 left-4 z-20 text-sm ${
          mode === "night" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        📌 {location || "Detecting..."}
      </div>

      {/* Title */}
      <h1
        className={`text-4xl md:text-5xl font-extrabold z-10 mb-6 text-center tracking-tight drop-shadow-xl ${
          mode === "night"
            ? "bg-gradient-to-r from-[#b8fdfd] to-[#03dbfc] bg-clip-text text-transparent"
            : "bg-gradient-to-r from-[#031919] to-[#02889c] bg-clip-text text-transparent"
        }`}
      >
        DevRatul Solar Clock
      </h1>

      {/* Clock */}
      <div
        id="clock"
        className={`text-6xl md:text-7xl font-bold tracking-widest px-8 py-4 rounded-3xl backdrop-blur-lg shadow-2xl z-10 text-center border border-white/10 ${
          mode === "night" ? "text-gray-100" : "text-gray-950"
        }`}
      >
        {clockText}
      </div>

      {/* Time Left */}
      <div
        id="time-left"
        className="mt-4 text-lg md:text-xl z-10 text-center font-semibold text-[#ff5c00]"
      >
        {timeLeftText}
      </div>

      {/* Status */}
      <div
        id="status"
        className={`mt-2 md:text-sm z-10 text-center font-medium ${
          mode === "night" ? "text-gray-100" : "text-gray-950"
        }`}
      >
        {statusMessage.startsWith("Sunset Time:") ? (
          <>
            <span className="text-orange-400">Sunset Time:</span>
            {statusMessage.replace("Sunset Time:", "")}
          </>
        ) : (
          statusMessage
        )}
      </div>

      <style jsx>{`
        .night-radial-bg {
          background-image: radial-gradient(circle at center, #031919, #000c0c);
          background-size: cover;
          background-repeat: no-repeat;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 9999px;
          opacity: 0.8;
          animation: twinkle 2s infinite ease-in-out alternate;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
