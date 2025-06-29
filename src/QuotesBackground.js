import React, { useState, useEffect } from "react";
import "./QuotesBackground.css";

const quotes = [
  "Love begins with you.",
  "Healing is not linear.",
  "You are allowed to feel everything.",
  "Even your scars are proof of love.",
  "Your heart knows the way.",
  "Growth takes patience.",
  "Every ending is a new beginning.",
  "Trust yourself more.",
  "Feel deeply, love boldly.",
  "It’s okay to not be okay.",
  "Release what hurts you.",
  "You deserve happiness.",
  "Vulnerability is strength.",
  "Healing is a journey.",
  "Boundaries are love too.",
  "Self-love is revolutionary.",
  "Your story matters.",
  "Embrace the unknown.",
  "Let go and grow.",
  "You are more than your past.",
  "Forgiveness frees the soul.",
  "Joy lives inside you.",
  "Choose peace daily.",
  "The heart wants what it wants.",
  "Kindness starts with you.",
  "You’re worthy of love.",
  "This too shall pass.",
  "Be gentle with yourself.",
  "Love is a practice.",
  "You are not alone.",
];

const VISIBLE_COUNT = 8;
const CYCLE_DURATION = 8000;
const MIN_GAP_PX = 188; // ~5cm gap in pixels

function generatePositions(containerWidth, containerHeight, count) {
  const positions = [];
  const cellsX = Math.floor(containerWidth / MIN_GAP_PX);
  const cellsY = Math.floor(containerHeight / MIN_GAP_PX);

  // Create a 2D array of all possible cells
  const availableCells = [];
  for (let y = 0; y < cellsY; y++) {
    for (let x = 0; x < cellsX; x++) {
      availableCells.push({ x, y });
    }
  }

  // Shuffle available cells to pick random positions without overlap
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const shuffledCells = shuffle(availableCells);

  // Pick first count cells to place quotes
  for (let i = 0; i < count && i < shuffledCells.length; i++) {
    const cell = shuffledCells[i];
    // Position in pixels within the container, plus a small random offset inside the cell for natural look
    const left = cell.x * MIN_GAP_PX + Math.random() * (MIN_GAP_PX - 100);
    const top = cell.y * MIN_GAP_PX + Math.random() * (MIN_GAP_PX - 40);
    const fontSize = 18 + Math.floor(Math.random() * 10);
    const animationDuration = 6 + Math.random() * 3;

    positions.push({
      top: `${top}px`,
      left: `${left}px`,
      fontSize: `${fontSize}px`,
      animationDuration: `${animationDuration}s`,
    });
  }
  return positions;
}

function QuotesBackground() {
  const [visibleQuotes, setVisibleQuotes] = useState([]);
  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Update container size on window resize
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let batchIndex = 0;

    const updateQuotes = () => {
      const start = (batchIndex * VISIBLE_COUNT) % quotes.length;
      const batch = quotes
        .slice(start, start + VISIBLE_COUNT)
        .map((text, index) => ({
          text,
          id: `${start + index}-${Date.now()}`,
        }));

      const positions = generatePositions(
        containerSize.width,
        containerSize.height,
        batch.length
      );

      const positionedQuotes = batch.map((q, i) => ({
        ...q,
        style: positions[i],
      }));

      setVisibleQuotes(positionedQuotes);
      batchIndex++;
    };

    updateQuotes();
    const interval = setInterval(updateQuotes, CYCLE_DURATION);

    return () => clearInterval(interval);
  }, [containerSize]);

  return (
    <div className="quotes-background">
      {visibleQuotes.map((q) => (
        <div
          key={q.id}
          className="stroke-quote animate-fade-float"
          style={q.style}
        >
          {q.text}
        </div>
      ))}
    </div>
  );
}

export default QuotesBackground;
