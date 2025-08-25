import React, { useState, useEffect, useRef } from 'react';
import { games } from './games';
import { GameConfig, HostToGameMessage, GameToHostMessage } from './types';
import './App.css';

const GAME_DURATION_MS = 30000;
const SWIPE_THRESHOLD = 50;

const App: React.FC = () => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<number | null>(null);

  const currentGame: GameConfig | undefined = games[currentGameIndex];

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as GameToHostMessage;
      switch (message.type) {
        case 'READY':
          startGame();
          break;
        case 'SCORE':
          setCurrentScore((prev) => prev + message.value);
          break;
        case 'END':
          advanceToNextGame('right');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    setCurrentScore(0);
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(timer);
  }, [currentGameIndex]);

  const startGame = () => {
    if (iframeRef.current?.contentWindow) {
      const message: HostToGameMessage = { type: 'START', durationMs: GAME_DURATION_MS };
      iframeRef.current.contentWindow.postMessage(message, '*');
      timerRef.current = window.setTimeout(() => {
        stopGame();
        advanceToNextGame('right');
      }, GAME_DURATION_MS);
    }
  };

  const stopGame = () => {
    if (iframeRef.current?.contentWindow) {
      const message: HostToGameMessage = { type: 'STOP' };
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const advanceToNextGame = (dir: 'left' | 'right') => {
    setDirection(dir);
    setIsTransitioning(true);
    const delta = dir === 'right' ? 1 : -1;
    const nextIndex = (currentGameIndex + delta + games.length) % games.length;
    setCurrentGameIndex(nextIndex);
  };

  const handlePlayAgain = () => {
    stopGame();
    setCurrentScore(0);
    startGame();
  };

  const handleChallengeFriends = async () => {
    const shareData = {
      title: 'Short Game Challenge',
      text: `I scored ${currentScore} in Short Game! Can you beat me?`,
      url: window.location.href,
    };
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Sharing not supported on this device. Copy the link to share!');
    }
  };

  const handleFavorite = () => {
    if (currentGame) {
      const gameId = currentGame.id;
      setFavorites(prev => {
        if (prev.includes(gameId)) {
          return prev.filter(id => id !== gameId);
        } else {
          return [...prev, gameId];
        }
      });
    }
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        advanceToNextGame(deltaX < 0 ? 'right' : 'left');
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const isFavorite = currentGame ? favorites.includes(currentGame.id) : false;

  return (
    <div className="app-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <header className="app-header">
        <button className="heart-btn" onClick={handleFavorite}>{isFavorite ? '❤️' : '♡'}</button>
        <h1 className="app-title">Game Reels</h1>
        <button className="upload-btn" onClick={handleInstall}>⬆️</button>
      </header>
      {currentGame ? (
        <div className="game-wrapper">
          <button className="nav-arrow left-arrow" onClick={() => advanceToNextGame('left')}>◀️</button>
          <div className={`game-area ${isTransitioning ? `slide-${direction}` : ''}`}>
            <iframe
              ref={iframeRef}
              src={currentGame.url}
              title={currentGame.name}
              className="game-iframe"
            />
          </div>
          <button className="nav-arrow right-arrow" onClick={() => advanceToNextGame('right')}>▶️</button>
        </div>
      ) : (
        <p className="no-games">No games available.</p>
      )}
      <div className="hud">
        <span className="score-text">Score: {currentScore}</span>
        <button className="play-again-btn" onClick={handlePlayAgain}>Play Again</button>
        <button className="challenge-btn" onClick={handleChallengeFriends}>↗️ Challenge Friends</button>
      </div>
    </div>
  );
};

export default App;