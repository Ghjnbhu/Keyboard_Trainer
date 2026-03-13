import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const App = () => {
  // Game settings
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [voiceGender, setVoiceGender] = useState('female');
  const [currentVoiceName, setCurrentVoiceName] = useState('Loading...');
  const [availableVoices, setAvailableVoices] = useState({ female: [], male: [] });

  // Game elements
  const [currentKey, setCurrentKey] = useState(null);
  const canvasRef = useRef(null);
  const instructionRef = useRef(null);
  const animationRef = useRef(null);
  const keys = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);
  
  // Speech synthesis
  const synth = window.speechSynthesis;
  const femaleVoiceRef = useRef(null);
  const maleVoiceRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = synth.getVoices();
      
      // Log all voices for debugging
      console.log('=== ALL AVAILABLE VOICES ===');
      voices.forEach((voice, index) => {
        console.log(`${index + 1}. Name: "${voice.name}", Lang: ${voice.lang}`);
      });

      // Separate voices by gender based on common naming patterns
      const femaleList = [];
      const maleList = [];

      voices.forEach(voice => {
        const name = voice.name.toLowerCase();
        
        // Female voice indicators
        if (name.includes('samantha') ||
            name.includes('victoria') ||
            name.includes('zira') || 
            name.includes('hazel') ||
            name.includes('helena') ||
            name.includes('sara') ||
            name.includes('moira') ||
            name.includes('tessa') ||
            name.includes('kate') ||
            name.includes('emma') ||
            name.includes('lucy') ||
            name.includes('susie') ||
            name.includes('female') ||
            name.includes('girl') ||
            name.includes('woman')) {
          femaleList.push(voice);
        }
        // Male voice indicators - expanded list
        else if (name.includes('david') || 
                 name.includes('george') ||
                 name.includes('daniel') ||
                 name.includes('alex') ||
                 name.includes('richard') ||
                 name.includes('oliver') ||
                 name.includes('harry') ||
                 name.includes('james') ||
                 name.includes('william') ||
                 name.includes('henry') ||
                 name.includes('thomas') ||
                 name.includes('charles') ||
                 name.includes('edward') ||
                 name.includes('patrick') ||
                 name.includes('michael') ||
                 name.includes('john') ||
                 name.includes('robert') ||
                 name.includes('christopher') ||
                 name.includes('matthew') ||
                 name.includes('andrew') ||
                 name.includes('joseph') ||
                 name.includes('kevin') ||
                 name.includes('brian') ||
                 name.includes('steven') ||
                 name.includes('paul') ||
                 name.includes('mark') ||
                 name.includes('peter') ||
                 name.includes('male') ||
                 name.includes('guy') ||
                 name.includes('man')) {
          maleList.push(voice);
        }
      });

      console.log('🎯 Female voices found:', femaleList.length);
      console.log('🎯 Male voices found:', maleList.length);

      setAvailableVoices({ female: femaleList, male: maleList });

      // Select voices with British preference
      const selectVoice = (list, gender) => {
        if (list.length === 0) return null;
        
        // Try to find British voice first
        const britishVoice = list.find(v => 
          v.lang === 'en-GB' || 
          v.name.toLowerCase().includes('uk') ||
          v.name.toLowerCase().includes('british')
        );

        return britishVoice || list[0];
      };

      femaleVoiceRef.current = selectVoice(femaleList, 'female');
      maleVoiceRef.current = selectVoice(maleList, 'male');

      // Fallback if no male voice found
      if (!maleVoiceRef.current && voices.length > 0) {
        console.log('⚠️ No male voice found, using first available voice as fallback');
        maleVoiceRef.current = voices.find(v => !femaleList.includes(v)) || voices[0];
      }

      // Update current voice name
      updateCurrentVoiceName();
    };

    const updateCurrentVoiceName = () => {
      if (voiceGender === 'female' && femaleVoiceRef.current) {
        setCurrentVoiceName(femaleVoiceRef.current.name);
      } else if (voiceGender === 'male' && maleVoiceRef.current) {
        setCurrentVoiceName(maleVoiceRef.current.name);
      }
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [synth, voiceGender]);

  // Update voice name when gender changes
  useEffect(() => {
    if (voiceGender === 'female' && femaleVoiceRef.current) {
      setCurrentVoiceName(femaleVoiceRef.current.name);
    } else if (voiceGender === 'male' && maleVoiceRef.current) {
      setCurrentVoiceName(maleVoiceRef.current.name);
    }
  }, [voiceGender]);

  const speakWord = useCallback((word, gender) => {
    if (!('speechSynthesis' in window)) return;

    try {
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(word);
      
      if (gender === 'female' && femaleVoiceRef.current) {
        utterance.voice = femaleVoiceRef.current;
        utterance.pitch = 1.1;
        console.log(`🔊 Speaking with FEMALE voice: ${femaleVoiceRef.current.name}`);
      } else if (gender === 'male' && maleVoiceRef.current) {
        utterance.voice = maleVoiceRef.current;
        utterance.pitch = 0.9;
        console.log(`🔊 Speaking with MALE voice: ${maleVoiceRef.current.name}`);
      } else {
        console.log(`⚠️ No ${gender} voice available`);
        return;
      }

      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.lang = 'en-GB';

      synth.speak(utterance);
      
    } catch (error) {
      console.error('Speech error:', error);
    }
  }, [synth]);

  const speakLetter = useCallback((letter) => {
    speakWord(letter, voiceGender);
  }, [speakWord, voiceGender]);

  const handleVoiceChange = useCallback((gender) => {
    setVoiceGender(gender);
    setTimeout(() => {
      speakWord(gender === 'female' ? 'Female' : 'Male', gender);
    }, 100);
  }, [speakWord]);

  const speedOptions = [
    { value: 1, label: 'Slow', pixelsPerFrame: 0.125 },
    { value: 2, label: 'Medium', pixelsPerFrame: 0.4 },
    { value: 3, label: 'Fast', pixelsPerFrame: 0.8 },
    { value: 4, label: 'Very Fast', pixelsPerFrame: 1.5 }
  ];

  const pixelsPerFrame = useMemo(() => {
    const option = speedOptions.find(opt => opt.value === speed);
    return option ? option.pixelsPerFrame : 0.125;
  }, [speed]);

  const spawnLetter = useCallback(() => {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentKey({
      key: randomKey,
      x: Math.random() * (400 - 100) + 50,
      y: 0,
      speed: pixelsPerFrame
    });
    speakLetter(randomKey);
  }, [keys, pixelsPerFrame, speakLetter]);

  const startGame = () => {
    setIsPlaying(true);
    setShowGameOver(false);
    setTimeLeft(duration);
    setScore(0);
    setMisses(0);
    spawnLetter();
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setShowGameOver(true);
    setCurrentKey(null);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (synth.speaking) synth.cancel();
  }, [synth]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, endGame]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const instruction = instructionRef.current;

    const update = () => {
      if (!isPlaying) return;

      const canvasRect = canvas.getBoundingClientRect();
      const textRect = instruction.getBoundingClientRect();
      const missThreshold = textRect.top - canvasRect.top;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentKey) {
        currentKey.y += currentKey.speed;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentKey.key, currentKey.x, currentKey.y);

        if (currentKey.y >= missThreshold) {
          setMisses(prev => prev + 1);
          spawnLetter();
          return;
        }
      }
      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, currentKey, spawnLetter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || !currentKey) return;
      if (e.key.toUpperCase() === currentKey.key) {
        setScore(prev => prev + 1);
        speakLetter(currentKey.key);
        spawnLetter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentKey, spawnLetter, speakLetter]);

  const accuracy = useMemo(() => {
    const total = score + misses;
    return total === 0 ? 0 : Math.round((score / total) * 100);
  }, [score, misses]);

  const animationStyle = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    @keyframes glow {
      0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
      50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(245, 158, 11, 0.5); }
      100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
    }

    .animate-button {
      animation: pulse 2s infinite ease-in-out, glow 3s infinite;
    }
  `;

  const inputStyle = `
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      opacity: 1;
      height: 3rem;
      width: 3rem;
      margin-left: 0.5rem;
    }
  `;

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-6">
      <style>{animationStyle}</style>
      <style>{inputStyle}</style>
      
      {/* SETUP SCREEN */}
      {!isPlaying && !showGameOver && (
        <div className="flex items-center justify-center min-h-screen">
          <div style={{ width: '500px' }} className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
            <div style={{ padding: '2rem 2.5rem 3rem 2.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }} className="font-bold text-white text-center">Keyboard Trainer</h1>
              
              {/* Voice Selection */}
              <div style={{ marginBottom: '2rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                  Voice:
                </label>
                <div className="flex flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleVoiceChange('female')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1.125rem', 
                      borderRadius: '0.5rem',
                      backgroundColor: voiceGender === 'female' ? '#EC4899' : '#4B5563',
                      color: 'white',
                      border: voiceGender === 'female' ? '2px solid #F9A8D4' : '2px solid transparent',
                      minWidth: '120px',
                      opacity: femaleVoiceRef.current ? 1 : 0.5
                    }}
                    className="font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    disabled={!femaleVoiceRef.current}
                  >
                    <span></span> Female
                    {!femaleVoiceRef.current && <span className="text-xs">(unavailable)</span>}
                  </button>
                  <button
                    onClick={() => handleVoiceChange('male')}
                    style={{
                      padding: '0.75rem 1.5rem', 
                      fontSize: '1.125rem', 
                      borderRadius: '0.5rem',
                      backgroundColor: voiceGender === 'male' ? '#3B82F6' : '#4B5563',
                      color: 'white',
                      border: voiceGender === 'male' ? '2px solid #93C5FD' : '2px solid transparent',
                      minWidth: '120px',
                      opacity: maleVoiceRef.current ? 1 : 0.5
                    }}
                    className="font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    disabled={!maleVoiceRef.current}
                  >
                    <span></span> Male
                    {!maleVoiceRef.current && <span className="text-xs">(unavailable)</span>}
                  </button>
                </div>
              </div>

              {/* Voice Status Display */}
              <div style={{ marginBottom: '2rem', padding: '0.75rem 1rem', backgroundColor: '#1F2937', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current voice:</span>
                  <span className={`text-sm font-medium ${voiceGender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                    {voiceGender === 'female' ? '' : ''} {currentVoiceName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Available: {availableVoices.female.length} female, {availableVoices.male.length} male</span>
                  <span>🇬🇧 British accent</span>
                </div>
              </div>

              {/* Speed Selection */}
              <div style={{ marginBottom: '2rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                  Speed:
                </label>
                <div className="flex flex-row gap-3 justify-between">
                  {speedOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSpeed(option.value)}
                      style={{
                        padding: '0.75rem 0.25rem', 
                        fontSize: '1rem', 
                        borderRadius: '0.5rem',
                        backgroundColor: speed === option.value ? '#9333EA' : '#374151',
                        color: 'white',
                        border: speed === option.value ? '2px solid #C084FC' : '2px solid transparent'
                      }}
                      className="flex-1 font-semibold transition-all hover:bg-gray-600"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Input */}
              <div style={{ marginBottom: '2rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                  Duration (seconds):
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{
                    padding: '0.75rem', 
                    fontSize: '1.125rem', 
                    width: '125px',
                    borderRadius: '0.5rem',
                  }}
                  className="border bg-gray-700 text-white border-gray-600 outline-none text-center"
                  min="1"
                  max="120"
                />
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={startGame}
                  style={{ padding: '0.75rem 0', fontSize: '1.5rem', borderRadius: '0.5rem', width: '250px' }}
                  className="bg-amber-500 text-black font-bold hover:bg-amber-600 transition-all animate-button"
                >
                  START
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {showGameOver && (
        <div className="flex items-center justify-center min-h-screen">
          <div style={{ width: '500px' }} className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl text-center">
            <div style={{ padding: '2rem 2.5rem 2.5rem 2.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }} className="font-bold text-white">Exercise Complete!</h1>

              <div className="grid grid-cols-2 gap-5 mb-8" style={{ maxWidth: '450px', margin: '0 auto' }}>
                <div className="p-5 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Score</p>
                  <p style={{ fontSize: '2.5rem' }} className="font-bold text-green-400">{score}</p>
                </div>
                <div className="p-5 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Misses</p>
                  <p style={{ fontSize: '2.5rem' }} className="font-bold text-red-400">{misses}</p>
                </div>
                <div className="col-span-2 p-5 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Accuracy</p>
                  <p style={{ fontSize: '3rem' }} className="font-bold text-blue-400">{accuracy}%</p>
                </div>
              </div>

              <button
                onClick={startGame}
                style={{ padding: '1rem 0', fontSize: '1.5rem', borderRadius: '0.5rem' }}
                className="w-full bg-amber-500 text-black font-bold hover:bg-amber-600 transition-all animate-button"
              >
                Try Again
              </button>
              
              <button
                onClick={() => setShowGameOver(false)}
                style={{ marginTop: '1.5rem', fontSize: '1.125rem' }}
                className="text-gray-400 font-bold hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE GAME */}
      {isPlaying && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div style={{ width: '500px', marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '0.5rem' }} 
               className="bg-gray-800 border border-gray-700 flex justify-around">
            <span className="font-bold text-gray-200">⏱️ <span className="text-blue-400">{timeLeft}s</span></span>
            <span className="font-bold text-gray-200">🎯 <span className="text-green-400">{score}</span></span>
            <span className="font-bold text-gray-200">❌ <span className="text-red-400">{misses}</span></span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ border: '4px solid yellow', borderRadius: '0.5rem' }}
            className="bg-black"
          />

          <p 
            ref={instructionRef}
            style={{ width: '500px', padding: '2rem 0', fontSize: '1.125rem' }}
            className="text-center text-gray-300 font-bold"
          >
            Press the falling key before it reaches the bottom!
          </p>

          {/* Voice indicator during gameplay */}
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
            <span>🇬🇧</span>
            <span className={voiceGender === 'female' ? 'text-pink-400' : 'text-blue-400'}>
              {voiceGender === 'female' ? '' : ''} {currentVoiceName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;