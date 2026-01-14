import React, { useEffect, useRef, useState } from 'react';

const svgPaths = {
  p11067380: 'M310.5 84.6933V106.03H300.28V84.6933H310.5Z',
  p12b9e780:
    'M58.4197 74.3173C64.6927 79.1897 68.7293 86.8043 68.7293 95.3622L68.7205 96.0497C68.5107 104.327 64.5239 111.665 58.4197 116.406V115.125C64.1057 110.423 67.7292 103.316 67.7293 95.3622C67.7293 87.4078 64.1059 80.3001 58.4197 75.5985V74.3173Z',
  p1dbf2c00: 'M10.5 84.6933V106.03H0.5V84.6933H10.5Z',
  p7ab6170:
    'M252.58 116.405C246.307 111.532 242.271 103.918 242.271 95.3599L242.279 94.6724C242.489 86.3953 246.476 79.0576 252.58 74.316L252.58 75.5972C246.894 80.2988 243.271 87.4058 243.271 95.3599C243.271 103.314 246.894 110.422 252.58 115.124L252.58 116.405Z',
};

function PitchGraphic() {
  return (
    <div className="h-[201px] relative shrink-0 w-[311px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 311 201">
        <g id="Group 2" opacity="0.3">
          <rect height="189.724" id="Rectangle 9" stroke="white" width="289.381" x="10.8094" y="0.5" />
          <rect fill="white" height="191" id="Rectangle 10" width="1" x="155" />
          <circle cx="155.5" cy="95.3618" id="Ellipse 6" r="26.1326" stroke="white" />
          <circle cx="155.5" cy="95.3619" fill="white" id="Ellipse 7" r="2.57735" />
          <rect height="117.558" id="Rectangle 11" stroke="white" width="47.1105" x="10.8094" y="36.5829" />
          <rect height="117.558" id="Rectangle 12" stroke="white" width="47.1105" x="253.08" y="36.5829" />
          <rect height="52.2652" id="Rectangle 13" stroke="white" width="16.1823" x="10.8094" y="69.2292" />
          <rect height="52.2652" id="Rectangle 14" stroke="white" width="16.1823" x="284.008" y="69.2292" />
          <path d={svgPaths.p1dbf2c00} id="Rectangle 15" stroke="white" />
          <path d={svgPaths.p11067380} id="Rectangle 16" stroke="white" />
          <path d={svgPaths.p12b9e780} fill="white" id="Subtract" />
          <path d={svgPaths.p7ab6170} fill="white" id="Subtract_2" />
        </g>
      </svg>
    </div>
  );
}

// Mock WebSocket data generator
function generateMockPlayers() {
  const players = [];

  // Team A (11 players) - positioned on left side
  for (let i = 1; i <= 11; i++) {
    players.push({
      id: i,
      team: 'A',
      number: i,
      x: Math.random() * 0.45, // 0-45% of pitch width
      y: Math.random() * 0.8 + 0.1, // 10-90% of pitch height
      vx: (Math.random() - 0.5) * 0.000125, // Realistic speed: ~12s to cross pitch
      vy: (Math.random() - 0.5) * 0.000125,
    });
  }

  // Team B (11 players) - positioned on right side
  for (let i = 12; i <= 22; i++) {
    players.push({
      id: i,
      team: 'B',
      number: i - 11,
      x: Math.random() * 0.45 + 0.55, // 55-100% of pitch width
      y: Math.random() * 0.8 + 0.1,
      vx: (Math.random() - 0.5) * 0.000125,
      vy: (Math.random() - 0.5) * 0.000125,
    });
  }

  return players;
}

function SoccerPitchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playersRef = useRef(generateMockPlayers());
  const ballRef = useRef({ x: 0.5, y: 0.5, vx: 0.0001, vy: 0.00015 });
  const animationRef = useRef<number | null>(null);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ frames: 0, lastTime: 0 });

  // Sizes (adjust these constants to change visuals)
  const PLAYER_RADIUS = 3; // player dot radius in px
  const BALL_RADIUS = 3; // ball dot radius in px
  const LABEL_OFFSET = PLAYER_RADIUS + 2; // vertical offset for number label

  useEffect(() => {
    // Initialize FPS tracking time
    fpsRef.current.lastTime = Date.now();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pitchWidth = 311;
    const pitchHeight = 201;

    // Set canvas size with proper device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = pitchWidth * dpr;
    canvas.height = pitchHeight * dpr;
    ctx.scale(dpr, dpr);

    // Simulate WebSocket updates - players move around
    const updatePlayers = () => {
      playersRef.current.forEach(player => {
        // Update position
        player.x += player.vx;
        player.y += player.vy;

        // Bounce off boundaries (with padding)
        if (player.x < 0.05 || player.x > 0.95) {
          player.vx *= -1;
          player.x = Math.max(0.05, Math.min(0.95, player.x));
        }
        if (player.y < 0.05 || player.y > 0.95) {
          player.vy *= -1;
          player.y = Math.max(0.05, Math.min(0.95, player.y));
        }

        // Occasionally change direction
        if (Math.random() < 0.01) {
          player.vx += (Math.random() - 0.5) * 0.00008;
          player.vy += (Math.random() - 0.5) * 0.00008;

          // Limit speed
          const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
          if (speed > 0.0002) {
            player.vx = (player.vx / speed) * 0.0002;
            player.vy = (player.vy / speed) * 0.0002;
          }
        }
      });

      // Update ball position
      const ball = ballRef.current;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce ball off boundaries
      if (ball.x < 0.05 || ball.x > 0.95) {
        ball.vx *= -1;
        ball.x = Math.max(0.05, Math.min(0.95, ball.x));
      }
      if (ball.y < 0.05 || ball.y > 0.95) {
        ball.vy *= -1;
        ball.y = Math.max(0.05, Math.min(0.95, ball.y));
      }
    };

    // Draw players on canvas
    const drawPlayers = () => {
      // Clear canvas
      ctx.clearRect(0, 0, pitchWidth, pitchHeight);

      // Draw ball
      const ball = ballRef.current;
      const ballX = ball.x * pitchWidth;
      const ballY = ball.y * pitchHeight;
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Draw players
      playersRef.current.forEach(player => {
        const x = player.x * pitchWidth;
        const y = player.y * pitchHeight;

        // Draw small player dot (no border)
        ctx.beginPath();
        ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = player.team === 'A' ? '#3B82F6' : '#EF4444';
        ctx.fill();

        // Draw player number underneath
        ctx.fillStyle = 'white';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(player.number.toString(), x, y + LABEL_OFFSET);
      });

      // Calculate FPS
      fpsRef.current.frames++;
      const now = Date.now();
      if (now - fpsRef.current.lastTime >= 1000) {
        setFps(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }
    };

    // Animation loop
    const animate = () => {
      updatePlayers();
      drawPlayers();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [PLAYER_RADIUS, BALL_RADIUS, LABEL_OFFSET]);

  return (
    <div className="bg-[#161616] relative flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <div className="flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Team A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-300">Team B</span>
            </div>
            <div className="text-green-400 font-mono">{fps} FPS</div>
          </div>
        </div>

        <div className="relative" style={{ width: '311px', height: '201px' }}>
          {/* SVG Pitch Background */}
          <div className="absolute inset-0">
            <PitchGraphic />
          </div>

          {/* Canvas Overlay for Players */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{
              width: '311px',
              height: '201px',
              imageRendering: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SoccerPitchCanvas;
