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

  // Fetch & Update Clock
  useEffect(() => {
    function updateClock() {
      const sunsetTime = sunsetTimeRef.current;
      if (!sunsetTime) return;

      const now = new Date();
      const clock = document.getElementById("clock");
      const timeLeft = document.getElementById("time-left");

      if (clockMode === "real") {
        if (clock) clock.textContent = now.toLocaleTimeString();
      } else {
        const adjustedSunset = new Date(sunsetTime);
        if (now < sunsetTime) {
          adjustedSunset.setDate(adjustedSunset.getDate() - 1);
        }

        const sinceSunset = now.getTime() - adjustedSunset.getTime();
        const solarSeconds = Math.floor(sinceSunset / 1000);
        const sh = Math.floor(solarSeconds / 3600) % 24;
        const sm = Math.floor((solarSeconds % 3600) / 60);
        const ss = solarSeconds % 60;

        if (clock)
          clock.textContent = `${String(sh).padStart(2, "0")}:${String(sm).padStart(
            2,
            "0"
          )}:${String(ss).padStart(2, "0")}`;
      }

      const timeLeftMs = sunsetTime.getTime() - now.getTime();
      if (timeLeftMs > 0) {
        const lh = Math.floor(timeLeftMs / 3600000);
        const lm = Math.floor((timeLeftMs % 3600000) / 60000);
        const ls = Math.floor((timeLeftMs % 60000) / 1000);
        if (timeLeft)
          timeLeft.textContent = `Time left until sunset: ${lh}h ${lm}m ${ls}s`;
      } else {
        if (timeLeft)
          timeLeft.textContent = `Sunset has already occurred today.`;
      }
    }

    function fetchSunsetTime(lat: number, lng: number) {
      const apiUrl = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          sunsetTimeRef.current = new Date(data.results.sunset);
          const status = document.getElementById("status");
          if (status)
            status.textContent =
              "Sunset time: " +
              sunsetTimeRef.current.toLocaleTimeString();

          updateClock();
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(updateClock, 1000);
        })
        .catch(() => {
          const status = document.getElementById("status");
          if (status) status.textContent = "Failed to load sunset time.";
        });
    }

    function getCity() {
      fetch("https://ipwho.is/")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLocation(`${data.city}, ${data.country}`);
          } else {
            setLocation("Unknown Location");
          }
        })
        .catch(() => {
          setLocation("Unknown Location");
        });
    }

    function createStars(count: number) {
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
    }

    function init() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchSunsetTime(latitude, longitude);
          },
          () => {
            const status = document.getElementById("status");
            if (status) status.textContent = "Location access denied.";
          }
        );
      } else {
        const status = document.getElementById("status");
        if (status) status.textContent = "Geolocation not supported.";
      }

      getCity();
      createStars(80);
    }

    init();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockMode]);

  // Background color logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (mode === "auto") {
      if (hour >= 6 && hour < 17) {
        setCurrentBg("from-sky-400 to-indigo-600");
      } else if (hour >= 17 && hour < 19) {
        setCurrentBg("from-orange-600 to-purple-800");
      } else {
        setCurrentBg("from-gray-900 to-black");
      }
    } else if (mode === "day") {
      setCurrentBg("from-sky-400 to-indigo-600");
    } else if (mode === "night") {
      setCurrentBg("from-gray-900 to-black");
    }
  }, [mode]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen overflow-hidden text-white bg-gradient-to-t ${currentBg} transition-all duration-1000`}
    >
      {/* Stars */}
      <div id="stars-container" className="absolute inset-0 z-0 overflow-hidden" />

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="bg-white/10 border border-white/30 backdrop-blur-sm text-white rounded-lg px-3 py-1 text-sm"
        >
          <option value="auto">🌓 Auto</option>
          <option value="day">🌞 Day</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      {/* Clock Mode Toggle */}
      <div className="absolute bottom-4 right-4 z-20">
        <select
          value={clockMode}
          onChange={(e) => setClockMode(e.target.value as ClockMode)}
          className="bg-white/10 border border-white/30 backdrop-blur-sm text-white rounded-lg px-3 py-1 text-sm"
        >
          <option value="solar">⏳ Solar Clock</option>
          <option value="real">🕰️ Real Clock</option>
        </select>
      </div>

      {/* Location */}
      <div className="absolute top-4 left-4 z-20 text-sm text-gray-300">
        📍 {location || "Detecting..."}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold z-10 mb-4 text-center">
        DevRatul Solar Clock
      </h1>

      {/* Clock */}
      <div
        id="clock"
        className="text-5xl md:text-7xl font-bold tracking-widest px-8 py-4 rounded-2xl bg-white/10 shadow-lg z-10 text-white text-center"
      >
        Loading...
      </div>

      {/* Time Left */}
      <div
        id="time-left"
        className="mt-4 text-lg md:text-xl text-yellow-300 z-10 text-center"
      >
        Calculating time left...
      </div>

      {/* Status */}
      <div
        id="status"
        className="mt-2 text-sm text-gray-300 z-10 text-center"
      >
        Getting your location...
      </div>

      {/* Twinkling Stars Style */}
      <style jsx>{`
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 9999px;
          opacity: 0;
          animation: twinkle 2s infinite;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
