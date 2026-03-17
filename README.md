# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


This code implements a Keyboard Trainer Game with voice pronunciation features. Here's a comprehensive analysis:

🎮 Core Functionality
Game Objective
Letters fall from the top of the screen

Player must press the corresponding key before the letter reaches the bottom

Tracks score, misses, and accuracy

🏗️ Main Components
1. Game State Management
javascript
const [speed, setSpeed] = useState(1);        // Game speed (1-4)
const [duration, setDuration] = useState(30); // Game duration in seconds
const [isPlaying, setIsPlaying] = useState(false); // Game active state
const [timeLeft, setTimeLeft] = useState(0);  // Countdown timer
const [score, setScore] = useState(0);        // Correct key presses
const [misses, setMisses] = useState(0);      // Letters that reached bottom
2. Voice System (Main feature)
Dual voice support: Female and Male voice selection

British accent preference: Prioritizes en-GB voices

Fallback mode: Works on Android Edge where voice selection is limited

Voice detection: Automatically identifies voices by name patterns

Pronunciation triggers:

When a letter spawns at the top

When player presses correct key

When switching between female/male voices

3. Canvas-based Graphics
Uses HTML5 Canvas for rendering falling letters

400x400 pixel game area

Real-time animation with requestAnimationFrame

Collision detection for miss threshold

🎯 Key Features
Game Mechanics
Speed levels: Slow (0.125px/frame) to Very Fast (1.5px/frame)

Adjustable duration: 1-120 seconds

Real-time scoring: Tracks correct hits and misses

Accuracy calculation: Percentage of correct presses

Voice System Details
javascript
// Voice gender detection based on name patterns
Female indicators: samantha, victoria, zira, hazel, emma, etc.
Male indicators: david, george, daniel, alex, oliver, etc.

// British voice preference
Prioritizes voices with: en-GB language, "uk", or "british" in name
Cross-platform Support
✅ Windows Edge: Full voice selection

✅ Android Edge: Fallback mode with device TTS

✅ Android Chrome: Full voice selection

✅ Desktop browsers: Full voice selection

🎨 User Interface
Setup Screen
Voice gender selection (Female/Male buttons)

Voice status display (shows current voice name)

Speed selection (4 levels)

Duration input with large arrows

Animated START button

Game Screen
Timer, Score, Misses display

Canvas with falling letters

Instruction text

Voice indicator (shows current voice)

Game Over Screen
Final score display

Total misses count

Accuracy percentage

Try Again button

Back to Menu button

🔧 Technical Implementation
Animation Loop
javascript
const update = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentKey) {
    currentKey.y += currentKey.speed;
    ctx.fillText(currentKey.key, currentKey.x, currentKey.y);
    
    // Check if letter reached bottom
    if (currentKey.y >= missThreshold) {
      setMisses(prev => prev + 1);
      spawnLetter();
    }
  }
  animationRef.current = requestAnimationFrame(update);
};
Speech Synthesis
javascript
const speakWord = (word, gender) => {
  const utterance = new SpeechSynthesisUtterance(word);
  if (gender === 'female' && femaleVoiceRef.current) {
    utterance.voice = femaleVoiceRef.current;
    utterance.pitch = 1.1; // Higher pitch for feminine
  } else if (gender === 'male' && maleVoiceRef.current) {
    utterance.voice = maleVoiceRef.current;
    utterance.pitch = 0.9; // Lower pitch for masculine
  }
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.lang = 'en-GB'; // British accent
  synth.speak(utterance);
};
📱 Android Edge Fallback
The code detects Android Edge browsers and switches to a fallback mode:

javascript
const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.includes('android');
const isEdge = ua.includes('edg') || ua.includes('edge');
const isMobileEdge = isAndroid && isEdge;

if (isMobileEdge) {
  setUseFallback(true); // Use default device TTS
}
🎯 Purpose
This is a typing practice game that helps improve:

Keyboard familiarity

Typing speed

Letter recognition

Hand-eye coordination

The voice feature adds an audio learning dimension, helping users associate letter shapes with their sounds, which is particularly useful for language learners or early readers.