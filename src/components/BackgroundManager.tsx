import React, { useEffect, useRef } from "react";

interface BackgroundManagerProps {
  condition: string; // "Clear", "Rain", "Snow", "Thunderstorm", "Clouds", "Mist", "Fog", "Haze"
}

export default function BackgroundManager({ condition }: BackgroundManagerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Normalize condition
  const cond = condition ? condition.trim() : "Clear";
  const isNight = false; // We can check current time or default to daytime, but beautiful ambient day hues are amazing

  // Get background gradient styles based on the weather condition
  const getGradientClass = () => {
    switch (cond) {
      case "Clear":
        return "from-sky-400 via-blue-500 to-indigo-600";
      case "Rain":
      case "Drizzle":
        return "from-slate-700 via-slate-800 to-zinc-900";
      case "Thunderstorm":
        return "from-neutral-900 via-slate-950 to-neutral-800";
      case "Snow":
        return "from-blue-100 via-indigo-200 to-slate-300";
      case "Clouds":
        return "from-neutral-400 via-slate-500 to-blue-600";
      case "Mist":
      case "Fog":
      case "Haze":
        return "from-gray-300 via-zinc-400 to-slate-500";
      default:
        return "from-sky-400 via-blue-500 to-indigo-600";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particles array
    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
      wobble?: number;
      wobbleSpeed?: number;
    }

    let particles: Particle[] = [];
    const maxParticles = cond === "Rain" ? 180 : (cond === "Snow" ? 100 : (cond === "Clear" ? 25 : 40));

    // Initialize particles depending on weather
    const createParticle = (initRandomY = false): Particle => {
      const pY = initRandomY ? Math.random() * height : -10;
      
      if (cond === "Rain") {
        return {
          x: Math.random() * width,
          y: pY,
          radius: Math.random() * 1.5 + 0.5,
          speedY: Math.random() * 12 + 8, // fast falling rain
          speedX: Math.random() * 1 - 0.5,
          opacity: Math.random() * 0.4 + 0.2,
          color: "rgba(156, 163, 175, 0.5)"
        };
      } else if (cond === "Snow") {
        return {
          x: Math.random() * width,
          y: pY,
          radius: Math.random() * 3.5 + 1.2,
          speedY: Math.random() * 1.2 + 0.6, // slow drifting snow
          speedX: Math.random() * 1.5 - 0.75,
          opacity: Math.random() * 0.8 + 0.2,
          color: "rgba(255, 255, 255, 0.9)",
          wobble: Math.random() * 100,
          wobbleSpeed: Math.random() * 0.02 + 0.01
        };
      } else if (cond === "Clear") {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 5 + 2,
          speedY: -(Math.random() * 0.3 + 0.1), // floating solar sparks going up
          speedX: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.3 + 0.05,
          color: "rgba(253, 224, 71, 0.3)" // soft golden
        };
      } else if (cond === "Mist" || cond === "Fog" || cond === "Haze") {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 35 + 15, // huge cloud-like particles
          speedY: Math.random() * 0.1 - 0.05,
          speedX: Math.random() * 0.4 + 0.1, // drifting mist moving sideways
          opacity: Math.random() * 0.1 + 0.02,
          color: "rgba(255, 255, 255, 0.4)"
        };
      } else {
        // Clouds / Thunderstorm default light wind drift
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 20 + 8,
          speedY: Math.random() * 0.1 - 0.05,
          speedX: Math.random() * 0.3 + 0.05, // drifting clouds
          opacity: Math.random() * 0.08 + 0.01,
          color: cond === "Thunderstorm" ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.15)"
        };
      }
    };

    // Initialize list
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Thunderstorm variables
    let flashCountdown = Math.random() * 200 + 100;
    let flashActive = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle lightning flash
      if (cond === "Thunderstorm") {
        flashCountdown--;
        if (flashCountdown <= 0) {
          flashActive = Math.floor(Math.random() * 8) + 3; // flash for some frames
          flashCountdown = Math.random() * 250 + 150; // reset
        }
        if (flashActive > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.05})`;
          ctx.fillRect(0, 0, width, height);
          flashActive--;
        }
      }

      // Render & Update particles
      particles.forEach((p, index) => {
        ctx.beginPath();
        if (cond === "Rain") {
          // Render rain streaks
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 1.5);
          ctx.globalAlpha = p.opacity;
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Position update
        if (cond === "Snow" && p.wobble !== undefined && p.wobbleSpeed !== undefined) {
          p.wobble += p.wobbleSpeed;
          p.x += p.speedX + Math.sin(p.wobble) * 0.4;
          p.y += p.speedY;
        } else {
          p.x += p.speedX;
          p.y += p.speedY;
        }

        // Boundary checks
        if (cond === "Rain") {
          if (p.y > height) {
            particles[index] = createParticle(false);
          }
        } else if (cond === "Snow") {
          if (p.y > height) {
            particles[index] = createParticle(false);
          }
        } else if (cond === "Clear") {
          if (p.y < -20) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          // Drifting out of bounds
          if (p.x > width + 50) {
            p.x = -50;
            p.y = Math.random() * height;
          }
          if (p.y > height + 50) {
            p.y = -50;
            p.x = Math.random() * width;
          }
        }
      });

      // Special overlay effect details
      if (cond === "Rain") {
        // Draw elegant falling lines directly
      } else if (cond === "Mist" || cond === "Fog" || cond === "Haze") {
        // Mist gradient overlay
        const fogGrd = ctx.createLinearGradient(0, 0, 0, height);
        fogGrd.addColorStop(0, "rgba(255, 255, 255, 0.05)");
        fogGrd.addColorStop(1, "rgba(255, 255, 255, 0.2)");
        ctx.fillStyle = fogGrd;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [cond]);

  return (
    <div
      id="atmospheric-backdrop"
      className={`fixed inset-0 -z-50 bg-gradient-to-br ${getGradientClass()} transition-colors duration-1000 ease-in-out`}
    >
      {/* Mesh-gradient overlay characteristic of the Frosted Glass theme template */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)"
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-x-0 inset-y-0 pointer-events-none opacity-80 z-10" />
      <div className="absolute inset-0 bg-black/15 backdrop-brightness-95 backdrop-contrast-105 pointer-events-none z-20" />
    </div>
  );
}
