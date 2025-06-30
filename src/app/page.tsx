"use client";
import { useEffect, useRef, useState } from "react";

type Mode = "auto" | "day" | "night";
type ClockMode = "solar" | "real";

export default function SunsetClock() {
  const [mode, setMode] = useState<Mode>("auto");
  const [clockMode, setClockMode] = useState<ClockMode>("solar");
  const [currentBg, setCurrentBg] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sunsetTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const sunsetTime = sunsetTimeRef.current;
      if (!sunsetTime) return;

      const now = new Date();
      const clock = document.getElementById("clock");
      const timeLeft = document.getElementById("time-left");

      if (clockMode === "real") {
        if (clock) clock.textContent = now.toLocaleTimeString();
      } else {
        const adjustedSunset = new Date(sunsetTime);
        if (now < sunsetTime) adjustedSunset.setDate(adjustedSunset.getDate() - 1);
        const sinceSunset = now.getTime() - adjustedSunset.getTime();
        const sh = Math.floor(sinceSunset / 3600_000) % 24;
        const sm = Math.floor((sinceSunset % 3600_000) / 60_000);
        const ss = Math.floor((sinceSunset % 60_000) / 1000);
        if (clock)
          clock.textContent = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
      }

      const timeLeftMs = sunsetTime.getTime() - now.getTime();
      if (timeLeftMs > 0) {
        const lh = Math.floor(timeLeftMs / 3600_000);
        const lm = Math.floor((timeLeftMs % 3600_000) / 60_000);
        const ls = Math.floor((timeLeftMs % 60_000) / 1000);
        if (timeLeft)
          timeLeft.textContent = `🌇 Sunset in: ${lh}h ${lm}m ${ls}s`;
      } else {
        if (timeLeft) timeLeft.textContent = `🌙 Sunset already passed today.`;
      }
    };

    const fetchSunsetTime = (lat: number, lng: number) => {
      fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`)
        .then((res) => res.json())
        .then((data) => {
          sunsetTimeRef.current = new Date(data.results.sunset);
          const status = document.getElementById("status");
          if (status)
            status.textContent = `🌅 Sunset Time: ${sunsetTimeRef.current.toLocaleTimeString()}`;

          updateClock();
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(updateClock, 1000);
        })
        .catch(() => {
          const status = document.getElementById("status");
          if (status) status.textContent = "⚠️ Failed to load sunset time.";
        });
    };

    const getCity = () => {
      fetch("https://ipwho.is/")
        .then((res) => res.json())
        .then((data) => {
          setLocation(data.success ? `${data.city}, ${data.country}` : "Unknown Location");
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
        () => {
          const status = document.getElementById("status");
          if (status) status.textContent = "🚫 Location access denied.";
        }
      );
      getCity();
      createStars(100);
    };

    init();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [clockMode]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (mode === "auto") {
      if (hour >= 6 && hour < 17)
        setCurrentBg("bg-gradient-to-br from-blue-200/40 to-white/10");
      else if (hour >= 17 && hour < 19)
        setCurrentBg("bg-gradient-to-br from-orange-400/50 via-pink-400/40 to-purple-500/30");
      else
        setCurrentBg("bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-black/80");
    } else if (mode === "day") {
      setCurrentBg("bg-gradient-to-br from-blue-200/40 to-white/10");
    } else if (mode === "night") {
      setCurrentBg("bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-black/80");
    }
  }, [mode]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen overflow-hidden ${currentBg} text-gray-100 backdrop-blur-2xl transition-all duration-1000`}
    >
      {/* Stars */}
      <div id="stars-container" className="absolute inset-0 z-0 overflow-hidden" />

      {/* Mode Selector */}
      <div className="absolute top-4 right-4 z-20">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="bg-white/30 text-gray-900 text-sm border border-white/30 rounded-md px-3 py-1 shadow backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="auto">🌓 Auto</option>
          <option value="day">🌞 Day</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      {/* Clock Mode Selector */}
      <div className="absolute bottom-4 right-4 z-20">
        <select
          value={clockMode}
          onChange={(e) => setClockMode(e.target.value as ClockMode)}
          className="bg-white/30 text-gray-900 text-sm border border-white/30 rounded-md px-3 py-1 shadow backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="solar">⏳ Solar Clock</option>
          <option value="real">🕰️ Real Clock</option>
        </select>
      </div>

      {/* Location */}
      <div className="absolute top-4 left-4 z-20 text-sm text-gray-700">
       📌 {location || "Detecting..."}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold z-10 mb-6 text-center tracking-tight drop-shadow-xl bg-gradient-to-r from-[#031919]  to-[#02889c] bg-clip-text text-transparent">
        DevRatul Solar Clock
      </h1>

      {/* Clock */}
      <div
        id="clock"
        className="text-6xl md:text-7xl font-bold tracking-widest px-8 py-4 rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl z-10 text-gray-600 text-center border border-white/10"
      >
        Loading...
      </div>

      {/* Time Left */}
      <div
        id="time-left"
        className="mt-4 text-lg md:text-2xl text-gray-950 z-10 text-center"
      >
        Calculating time left...
      </div>

      {/* Status */}
      <div
        id="status"
        className="mt-2  md:text-xl text-gray-950 z-10 text-center italic"
      >
        Getting your location...
      </div>

      <style jsx>{`
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
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
