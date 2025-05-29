import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ maskText = "FinalTake" }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dropsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeDrops();
    };

    // Movie-themed characters for the rain
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|\\:;\"'<>,.?/~`".split("");
    
    // Initialize rain drops
    const initializeDrops = () => {
      const columns = Math.floor(canvas.width / 15);
      dropsRef.current = new Array(columns).fill(0).map(() => ({
        y: Math.random() * canvas.height,
        speed: Math.random() * 3 + 2,
        char: characters[Math.floor(Math.random() * characters.length)],
        opacity: Math.random() * 0.8 + 0.2,
        depth: Math.random() * 0.5 + 0.5 // For parallax effect
      }));
    };

    // Create text mask
    const createTextMask = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Draw text
      tempCtx.font = 'bold 120px "Bebas Neue", sans-serif';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillText(maskText, canvas.width / 2, canvas.height / 2);
      
      return tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    };

    let textMask = createTextMask();

    // Check if position is inside text
    const isInsideText = (x, y) => {
      const pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
      return textMask.data[pixelIndex + 3] > 0; // Check alpha channel
    };

    // Animation loop
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw rain
      dropsRef.current.forEach((drop, i) => {
        const x = i * 15;
        
        // Parallax effect based on mouse position
        const parallaxX = x + (mouseRef.current.x - canvas.width / 2) * drop.depth * 0.01;
        const parallaxY = drop.y + (mouseRef.current.y - canvas.height / 2) * drop.depth * 0.005;

        // Skip drawing if inside text mask
        if (!isInsideText(parallaxX, parallaxY)) {
          // Set glow effect
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 10;
          
          // Set color based on depth
          const alpha = drop.opacity * drop.depth;
          const colors = ['#FFD700', '#FFAA00', '#FFC107', '#FF8F00'];
          const colorIndex = Math.floor(drop.depth * colors.length);
          ctx.fillStyle = colors[colorIndex] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          
          // Draw character
          ctx.font = `${12 + drop.depth * 8}px "Courier New", monospace`;
          ctx.fillText(drop.char, parallaxX, parallaxY);
          
          // Add trailing effect
          for (let j = 1; j <= 5; j++) {
            const trailY = parallaxY - j * 20;
            const trailAlpha = alpha * (1 - j / 5);
            if (trailY > 0 && !isInsideText(parallaxX, trailY)) {
              ctx.fillStyle = `${colors[colorIndex]}${Math.floor(trailAlpha * 255).toString(16).padStart(2, '0')}`;
              ctx.fillText(drop.char, parallaxX, trailY);
            }
          }
        }

        // Reset shadow
        ctx.shadowBlur = 0;

        // Update drop position
        drop.y += drop.speed;
        
        // Reset drop if it goes off screen
        if (drop.y > canvas.height + 100) {
          drop.y = -100;
          drop.char = characters[Math.floor(Math.random() * characters.length)];
          drop.speed = Math.random() * 3 + 2;
          drop.opacity = Math.random() * 0.8 + 0.2;
        }

        // Occasionally change character
        if (Math.random() < 0.01) {
          drop.char = characters[Math.floor(Math.random() * characters.length)];
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler for parallax
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Initialize
    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [maskText]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default MatrixRain;