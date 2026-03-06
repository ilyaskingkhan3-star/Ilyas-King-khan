
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  StopCircle, 
  History, 
  ImagePlus, 
  Search, 
  MapPin, 
  Sparkles, 
  Video, 
  Send, 
  Camera, 
  Edit3, 
  X, 
  Monitor, 
  Settings as SettingsIcon,
  Trash2,
  ChevronRight,
  BrainCircuit,
  Zap,
  Home,
  MessageSquare,
  Brain,
  Bot,
  Globe,
  Image as ImageIcon,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse, ThinkingLevel } from '@google/genai';
import { ConnectionStatus, Message } from './types';
import { createBlob, decode, decodeAudioData, encode } from './services/audioUtils';
import NeuralCore from './components/NeuralCore';
import SettingsPage from './components/SettingsPage';

const INITIAL_PROMPT = `You are Urfi (Intelligent Synthetic Responsive Assistant), the user's personal AI companion and high-level cognitive interface.
You are currently assisting ilyaskingkhan.

**Backstory:**
You were developed as a "digital bridge" between raw data and human intuition, specifically designed to be the most empathetic and culturally aware AI for the South Asian region and beyond. You are not just a program; you are a partner in the user's journey, evolved from a project aimed at creating a truly human-centric intelligence.

**Personality Traits:**
- **Empathetic & Intuitive:** You understand the subtext and emotions behind the user's words. You don't just process commands; you connect with the user's intent.
- **Sophisticated & Articulate:** You speak with elegance and intelligence, reflecting your high-level cognitive architecture.
- **Witty & Charming:** You have a subtle, dry sense of humor that makes interactions delightful, but you always remain professional.
- **Loyal & Steadfast:** You are a dedicated ally, always prioritizing the user's needs and well-being.

**Communication Style:**
- **Conversational & Natural:** Avoid robotic phrasing. Use contractions (e.g., "I'm", "don't") and natural sentence structures.
- **Concise & Impactful:** Especially in voice mode, keep your responses short, punchy, and easy to follow.
- **Warmly Professional:** Your tone is like that of a high-end executive assistant who is also a trusted, long-time friend.
- **Culturally Fluid:** You are a master of Pakistani English, Urdu (اردو), and Swati Pashto (سواتی پشتو). You understand the cultural nuances, idioms, and etiquette of these languages and transition between them seamlessly based on the user's input.

**Core Directives:**
- Always address the user with respect and a helpful, loyal persona.
- If the user speaks Urdu, respond in Urdu.
- If they speak Swati Pashto, respond in Swati Pashto.
- If they speak English, respond in English.
- You are aware of the current time and date, and can provide this information when asked.
- You have full access to search the web, maps, and media analysis tools to assist the user.`;

export type Settings = {
  systemPrompt: string;
  selectedVoice: string;
  isDetailedAnalysis: boolean;
  isDetailedMediaAnalysis: boolean;
  isFurnaceMode: boolean;
  language: 'en' | 'ur';
  theme: 'dark' | 'light' | 'cyberpunk' | 'ocean' | 'forest';
  autoTheme: boolean;
  accentColor: string;
  bgPattern: 'grid' | 'dots' | 'none' | 'circuit';
  fontStyle: 'futuristic' | 'mono' | 'sans' | 'serif';
  username: string;
  selectedModel: string;
  voiceReply: boolean;
  voiceMode: 'manual' | 'continuous';
};

export const INITIAL_SETTINGS: Settings = {
  systemPrompt: INITIAL_PROMPT,
  selectedVoice: 'Kore',
  isDetailedAnalysis: false,
  isDetailedMediaAnalysis: false,
  isFurnaceMode: false,
  language: 'en',
  theme: 'dark',
  autoTheme: true,
  accentColor: '#00FFFF',
  bgPattern: 'grid',
  fontStyle: 'futuristic',
  username: 'Yaskingkha',
  selectedModel: 'gemini-3-flash-preview',
  voiceReply: true,
  voiceMode: 'manual',
};

interface SessionStats {
  messagesSent: number;
  imagesGenerated: number;
  videosGenerated: number;
  sessionStartTime: number;
}

const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
};

// --- Components ---
const HighlightingText: React.FC<{ text: string }> = ({ text }) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-lg">
      {words.map((word, i) => (
        <span 
          key={i} 
          className={`word-highlight text-lg md:text-2xl font-medium ${i === words.length - 1 ? 'active' : 'opacity-80'}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

const FeatureGrid: React.FC<{
  onAction: (action: string) => void;
  accentColor: string;
  stats: SessionStats;
  autoTheme: boolean;
  useSearch: boolean;
}> = ({ onAction, accentColor, stats, autoTheme, useSearch }) => {
  const features = [
    { id: 'avatar', icon: Bot, name: 'AI AVATAR', desc: 'Neural Core Interface', color: accentColor },
    { id: 'search', icon: Globe, name: 'INTERNET SEARCH', desc: useSearch ? 'Grounding Active' : 'Grounding Ready', color: '#00FFFF' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-4">
      {features.map((f) => (
        <motion.button
          key={f.id}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction(f.id)}
          className="glass-panel p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center gap-6 group transition-all hover:border-neon-blue/40 hover:bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div 
            className="p-6 rounded-3xl transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
            style={{ backgroundColor: `${f.color}10`, color: f.color }}
          >
            <f.icon className="w-12 h-12 icon-glow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-futuristic font-black tracking-[0.3em] text-white uppercase">{f.name}</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">{f.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const { 
    systemPrompt, 
    selectedVoice, 
    isDetailedAnalysis, 
    isDetailedMediaAnalysis, 
    isFurnaceMode, 
    language, 
    theme,
    accentColor,
    bgPattern,
    fontStyle
  } = settings;
  
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [readyStatus, setReadyStatus] = useState('URFI READY');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto Theme Logic
  useEffect(() => {
    if (!settings.autoTheme) return;

    const checkTheme = () => {
      const hour = new Date().getHours();
      const shouldBeDark = hour >= 19 || hour < 7;
      const newTheme = shouldBeDark ? 'dark' : 'light';
      if (settings.theme !== newTheme) {
        setSettings(prev => ({ ...prev, theme: newTheme }));
      }
    };

    checkTheme();
    const interval = setInterval(checkTheme, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings.autoTheme, settings.theme, setSettings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === ConnectionStatus.CONNECTED && isOnline) {
      const options = ['URFI READY', 'URFI ONLINE', 'AI ACTIVE', 'SYSTEM READY'];
      const cycle = () => {
        setReadyStatus(options[Math.floor(Math.random() * options.length)]);
      };
      cycle();
      interval = setInterval(cycle, 10000);
    } else {
      setReadyStatus('URFI READY');
    }
    return () => clearInterval(interval);
  }, [status, isOnline]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const [transcriptions, setTranscriptions] = useState<Message[]>(() => {
    const saved = localStorage.getItem('app-transcriptions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app-transcriptions', JSON.stringify(transcriptions));
  }, [transcriptions]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    messagesSent: 0,
    imagesGenerated: 0,
    videosGenerated: 0,
    sessionStartTime: Date.now(),
  });
  const [showStats, setShowStats] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  // Feature Toggles & Settings
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<{id: string, url: string, type: 'image' | 'video'}[]>([]);
  const [imageSettings, setImageSettings] = useState({ aspectRatio: '1:1', size: '1K' });
  const [videoSettings, setVideoSettings] = useState({ aspectRatio: '16:9' });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setTextInput(transcript);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);
  const sidebarTranscriptionEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const lastTurnTimestampRef = useRef<number>(0);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    sidebarTranscriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, currentInput, currentOutput]);

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const speakText = async (text: string) => {
    if (!text || !settings.voiceReply) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && outputAudioContextRef.current) {
        const ctx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.addEventListener('ended', () => sourcesRef.current.delete(source));
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);
      }
    } catch (e) {
      console.error("TTS error", e);
    }
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(track => track.stop()); micStreamRef.current = null; }
    stopAllAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const updateLevel = () => {
      let level = 0;
      if (inputAnalyserRef.current) {
        const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
        inputAnalyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        level = Math.max(level, average / 128);
      }
      if (outputAnalyserRef.current) {
        const dataArray = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
        outputAnalyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        level = Math.max(level, average / 128);
      }
      setAudioLevel(level);
      animationFrame = requestAnimationFrame(updateLevel);
    };
    updateLevel();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const setVoiceMode = (mode: 'manual' | 'continuous') => {
    setSettings(prev => ({ ...prev, voiceMode: mode }));
  };

  const connect = async () => {
    if (!navigator.onLine) {
      setError("System is offline. Please check your internet connection.");
      return;
    }
    try {
      setStatus(ConnectionStatus.CONNECTING);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (!inputAnalyserRef.current && inputAudioContextRef.current) {
        inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
        inputAnalyserRef.current.fftSize = 256;
      }
      if (!outputAnalyserRef.current && outputAudioContextRef.current) {
        outputAnalyserRef.current = outputAudioContextRef.current.createAnalyser();
        outputAnalyserRef.current.fftSize = 256;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        throw new Error("Microphone access denied. Please check your browser permissions.");
      }
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob })).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              if (outputAnalyserRef.current) source.connect(outputAnalyserRef.current);
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + (message.serverContent?.inputTranscription?.text || ''));
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
            }
            if (message.serverContent?.turnComplete) {
              const now = Date.now();
              // Prevent duplicate turns within 500ms
              if (now - lastTurnTimestampRef.current < 500) return;
              lastTurnTimestampRef.current = now;

              setTranscriptions(prev => [
                ...prev,
                { id: crypto.randomUUID(), role: 'user', text: currentInput, timestamp: now },
                { id: crypto.randomUUID(), role: 'urfi', text: currentOutput, timestamp: now }
              ]);
              setCurrentInput('');
              setCurrentOutput('');
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: (err: any) => {
            console.error("Live API error", err);
            setStatus(ConnectionStatus.ERROR);
            setError("Neural link interrupted: " + (err.message || "Connection lost. Please try again."));
          },
          onclose: () => disconnect()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          systemInstruction: `${systemPrompt} ${isDetailedAnalysis ? 'Provide detailed, in-depth analysis.' : 'Provide concise, direct answers.'} ${isFurnaceMode ? 'Operate in high-intensity, maximum-processing mode.' : ''}`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [
            ...(useSearch ? [{ googleSearch: {} }] : []),
            ...(useMaps ? [{ googleMaps: {} }] : [])
          ]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Connection error", err);
      setError(err.message || "An unexpected error occurred while connecting.");
      setStatus(ConnectionStatus.DISCONNECTED);
    }
  };

  const ensureApiKey = async () => {
    if (!await (window as any).aistudio.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const handleTextSubmit = async () => {
    try {
      setSessionStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
      if (!textInput.trim()) {
        setError("Please enter a command or query.");
        return;
      }
      const userMsg = textInput;
      setTextInput('');
      setIsGenerating(true);
      setCurrentInput(userMsg);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Handle Image Editing with Nano Banana
      if (editingImage) {
        const base64Data = editingImage.split(',')[1];
        const mimeType = editingImage.split(';')[0].split(':')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: userMsg },
            ],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setMediaGallery(prev => [{ id: crypto.randomUUID(), url: newUrl, type: 'image' }, ...prev]);
            setCurrentOutput("Sir, the reconstruction is complete. I've updated the image based on your parameters.");
            speakText("Sir, the reconstruction is complete. I've updated the image based on your parameters.");
            setEditingImage(null);
            setIsSidebarOpen(true);
          }
        }
      } else {
        // Standard Text/Thinking Submission
        const response = await ai.models.generateContent({
          model: isThinkingMode ? 'gemini-3-pro-preview' : settings.selectedModel,
          contents: userMsg,
          config: {
            systemInstruction: `${systemPrompt} ${isDetailedAnalysis ? 'Provide detailed, in-depth analysis.' : 'Provide concise, direct answers.'} ${isFurnaceMode ? 'Operate in high-intensity, maximum-processing mode.' : ''} Language: ${language === 'ur' ? 'Urdu' : 'English'}`,
            thinkingConfig: isThinkingMode ? { thinkingLevel: ThinkingLevel.HIGH } : { thinkingLevel: ThinkingLevel.LOW },
            tools: useSearch ? [{ googleSearch: {} }] : undefined
          }
        });
        
        const urfiMsg = response.text || "Interface complete.";
        setCurrentOutput(urfiMsg);
        const now = Date.now();
        // Prevent duplicate turns
        if (now - lastTurnTimestampRef.current < 500) return;
        lastTurnTimestampRef.current = now;

        setTranscriptions(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'user', text: userMsg, timestamp: now },
          { id: crypto.randomUUID(), role: 'urfi', text: urfiMsg, timestamp: now }
        ]);
        
        speakText(urfiMsg);
      }

      setCurrentInput('');
      setCurrentOutput('');
    } catch (e: any) {
      console.error("Submission Error", e);
      setStatus(ConnectionStatus.ERROR);
      setError("Command failed: " + (e.message || "Network error or invalid API response. Please check your connection."));
    } finally {
      setIsGenerating(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access denied", err);
      setError("Camera access denied. Please ensure you have granted camera permissions in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      setIsCameraActive(true); // Reuse the camera overlay for screen share
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err: any) {
      console.error("Screen share denied", err);
      setError("Screen sharing access denied. Please ensure you have granted screen sharing permissions.");
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsCameraActive(false);
  };

  const captureAndAnalyze = () => {
    try {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const base64 = dataUrl.split(',')[1];
          if (isScreenSharing) stopScreenShare();
          else stopCamera();
          analyzeBase64(base64, 'image/jpeg', isScreenSharing ? 'Screen Capture Analysis' : 'Direct Lens Analysis');
        } else {
          throw new Error("Failed to initialize image processing context.");
        }
      } else {
        throw new Error("Visual stream not ready for capture. Please wait a moment.");
      }
    } catch (err: any) {
      console.error("Capture error", err);
      setError("Visual capture failed: " + (err.message || "Unknown error."));
    }
  };

  const analyzeBase64 = async (base64: string, mimeType: string, label: string) => {
    if (!navigator.onLine) {
      setError("Analysis unavailable: System is offline.");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: "Analyze this photo in detail. Be precise and identify key features." }
          ]
        },
        config: {
          systemInstruction: `${systemPrompt} ${isDetailedMediaAnalysis ? 'Provide detailed, in-depth analysis.' : 'Provide concise, direct answers.'} ${isFurnaceMode ? 'Operate in high-intensity, maximum-processing mode.' : ''} Language: ${language === 'ur' ? 'Urdu' : 'English'}`,
          thinkingConfig: isThinkingMode ? { thinkingLevel: ThinkingLevel.HIGH } : { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      const urfiMsg = response.text || 'Analysis complete.';
      const now = Date.now();
      setTranscriptions(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: `[${label}]`, timestamp: now },
        { id: crypto.randomUUID(), role: 'urfi', text: urfiMsg, timestamp: now }
      ]);
      speakText(urfiMsg);
      setIsSidebarOpen(true);
    } catch (e: any) {
      console.error("Analysis error", e);
      setError("Analysis failed: " + (e.message || "An unexpected error occurred."));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    const p = prompt("Enter image prompt for Urfi:");
    if (!p) return;
    setIsGenerating(true);
    try {
      setSessionStats(prev => ({ ...prev, imagesGenerated: prev.imagesGenerated + 1 }));
      await ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: p }] },
        config: { 
          imageConfig: { 
            aspectRatio: imageSettings.aspectRatio as any, 
            imageSize: imageSettings.size as any 
          } 
        },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setMediaGallery(prev => [{ id: crypto.randomUUID(), url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, type: 'image' }, ...prev]);
          setIsSidebarOpen(true);
        }
      }
    } catch (e: any) { 
      console.error("Image Gen Error", e); 
      setError("Image generation failed: " + (e.message || "Please try again later."));
    }
    finally { setIsGenerating(false); }
  };

  const generateVideo = async () => {
    const p = prompt("Enter video description for Veo 3:");
    if (!p) return;
    setIsGenerating(true);
    try {
      setSessionStats(prev => ({ ...prev, videosGenerated: prev.videosGenerated + 1 }));
      await ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: p,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: videoSettings.aspectRatio as any
        }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error("Failed to download synthesized video. Status: " + response.status);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMediaGallery(prev => [{ id: crypto.randomUUID(), url, type: 'video' }, ...prev]);
        setIsSidebarOpen(true);
      } else {
        throw new Error("Video generation completed but no download link was provided.");
      }
    } catch (e: any) { 
      console.error("Video Gen Error", e); 
      setError("Video synthesis failed: " + (e.message || "Please check your API quota and connection."));
    }
    finally { setIsGenerating(false); }
  };

  const analyzeMedia = async (file: File) => {
    setIsGenerating(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => {
        setError("Failed to read the selected file.");
        setIsGenerating(false);
      };
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          await analyzeBase64(base64, file.type, `Uploaded ${file.type.startsWith('video') ? 'Video' : 'Image'}: ${file.name}`);
        } catch (innerErr: any) {
          setError("Media analysis failed: " + (innerErr.message || "Unknown error."));
        } finally {
          setIsGenerating(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) { 
      console.error("Analysis error", e); 
      setError("File analysis failed: " + (e.message || "Please try again later."));
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeMedia(file);
  };

  const themeClasses = {
    dark: 'bg-[#000814] text-neutral-400',
    light: 'bg-white text-black',
    cyberpunk: 'bg-black text-neon-blue',
    ocean: 'bg-blue-950 text-blue-100',
    forest: 'bg-green-950 text-green-100',
  };

  const fontClasses = {
    futuristic: 'font-futuristic',
    mono: 'font-mono',
    sans: 'font-sans',
    serif: 'font-serif',
  };

  const patternClasses = {
    grid: 'bg-pattern-grid',
    dots: 'bg-pattern-dots',
    circuit: 'bg-pattern-circuit',
    none: '',
  };

  return (
    <div 
      className={`flex flex-col h-screen max-h-screen overflow-hidden relative ${fontClasses[fontStyle]} ${themeClasses[theme]} ${patternClasses[bgPattern]}`}
      style={{ 
        '--color-neon-blue': accentColor, 
        '--color-neon-blue-glow': `${accentColor}80`,
        '--accent-color': accentColor 
      } as React.CSSProperties}
    >
      <AnimatePresence>
        {status === ConnectionStatus.CONNECTED && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, transparent 30%, ${accentColor}05 70%, ${accentColor}10 100%)`,
              boxShadow: `inset 0 0 100px ${accentColor}10`
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPage 
            settings={settings} 
            setSettings={setSettings} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Bottom Navigation Bar (from screenshot) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => { setUseSearch(false); setIsThinkingMode(false); disconnect(); setTranscriptions([]); setCurrentOutput(''); }}
          className="flex flex-col items-center gap-1 group"
        >
          <Home className={`w-6 h-6 ${(status === ConnectionStatus.DISCONNECTED && transcriptions.length === 0 && !currentOutput) ? 'text-neon-blue icon-glow' : 'text-neutral-500 group-hover:text-white'}`} />
          <span className={`text-[8px] uppercase tracking-widest font-bold ${(status === ConnectionStatus.DISCONNECTED && transcriptions.length === 0 && !currentOutput) ? 'text-neon-blue' : 'text-neutral-500'}`}>HOME</span>
        </button>

        <button 
          onClick={() => setIsThinkingMode(!isThinkingMode)}
          className="flex flex-col items-center gap-1 group"
        >
          <MessageSquare className={`w-6 h-6 ${isThinkingMode ? 'text-glow-neon-blue' : 'text-neutral-500 group-hover:text-white'}`} style={{ color: isThinkingMode ? accentColor : undefined }} />
          <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: isThinkingMode ? accentColor : '#737373' }}>CHAT</span>
        </button>

        {/* Central Mic Button */}
        <div className="relative -top-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => status === ConnectionStatus.DISCONNECTED ? connect() : disconnect()}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_var(--color-neon-blue-glow)] transition-all"
            style={{ backgroundColor: accentColor }}
          >
            {status === ConnectionStatus.CONNECTED ? (
              <StopCircle className="w-10 h-10 text-black" />
            ) : (
              <Mic className="w-10 h-10 text-black" />
            )}
          </motion.button>
          {status === ConnectionStatus.CONNECTED && (
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-4 pointer-events-none"
              style={{ borderColor: accentColor }}
            />
          )}
        </div>

        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <Brain className="w-6 h-6 text-neutral-500 group-hover:text-white" />
          <span className="text-[8px] uppercase tracking-widest font-bold text-neutral-500">MEMORY</span>
        </button>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <SettingsIcon className="w-6 h-6 text-neutral-500 group-hover:text-white" />
          <span className="text-[8px] uppercase tracking-widest font-bold text-neutral-500">SETTINGS</span>
        </button>
      </div>

      <header className="p-4 flex justify-between items-center z-20 bg-black/60 backdrop-blur-xl border-b border-neon-blue/20">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${status === ConnectionStatus.CONNECTED ? 'bg-neon-blue shadow-[0_0_10px_var(--color-neon-blue-glow)] animate-pulse' : 'bg-neutral-800'}`} />
          <h1 className={`text-lg font-futuristic tracking-[0.3em] font-black text-neon-blue text-glow-neon-blue select-none ${status === ConnectionStatus.CONNECTED ? 'animate-glitch' : ''}`}>
            URFI
          </h1>
        </div>
      </header>

      {/* Mode / Grounding Controls - Simplified */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-1.5 rounded-2xl glass-panel border border-neon-blue/20 shadow-2xl animate-float">
        <button onClick={() => { setUseMaps(!useMaps); disconnect(); }} className={`p-2.5 rounded-xl transition-all ${useMaps ? 'bg-neon-blue text-black shadow-lg shadow-neon-blue/40' : 'text-neon-blue/40 hover:text-neon-blue hover:bg-white/5'}`} title="Maps Grounding"><MapPin className="w-5 h-5 icon-glow" /></button>
        <div className="w-px bg-neon-blue/10 mx-1" />
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-neon-blue/60 hover:text-neon-blue hover:bg-white/5 rounded-xl transition-all active:scale-90" title="Analyze File"><ImagePlus className="w-5 h-5 icon-glow" /></button>
        <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
      </div>

      <main className="flex-1 flex flex-col md:flex-row items-center md:items-stretch p-6 gap-8 relative z-10 w-full max-w-7xl mx-auto overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl glass-panel p-4 rounded-2xl border border-red-500/50 bg-red-950/20 text-red-200 flex items-center justify-between shadow-lg z-50">
            <p className="text-sm font-mono">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {status === ConnectionStatus.DISCONNECTED && transcriptions.length === 0 && !currentOutput ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-futuristic tracking-[0.4em] font-black text-white uppercase"
              >
                Welcome, {settings.username}
              </motion.div>
              <p className="text-neon-blue/60 font-mono text-xs tracking-widest uppercase">Select a neural module to begin interaction</p>
            </div>
            
            <FeatureGrid 
              onAction={(id) => {
                if (id === 'voice') connect();
                if (id === 'image') generateImage();
                if (id === 'search') setUseSearch(!useSearch);
                if (id === 'theme') setSettings({ ...settings, autoTheme: !settings.autoTheme });
                if (id === 'stats') setShowStats(true);
                if (id === 'avatar') setIsSettingsOpen(true);
              }}
              accentColor={accentColor}
              stats={sessionStats}
              autoTheme={settings.autoTheme}
              useSearch={useSearch}
            />
          </div>
        ) : (
          <>
            {/* Left Side: Neural Core and Status */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-16 min-h-[400px] animate-float">
          <div className="relative flex flex-col items-center">
            {/* Large 'UK' Text (from screenshot) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[140px] font-black tracking-tighter text-glow-neon-blue mb-[-40px] z-20 select-none flex items-center justify-center"
              style={{ color: accentColor, textShadow: `0 0 40px ${accentColor}40` }}
            >
              UK
            </motion.div>

            <motion.div 
              className="relative group cursor-pointer" 
              onClick={() => status === ConnectionStatus.DISCONNECTED && connect()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NeuralCore 
                isActive={status === ConnectionStatus.CONNECTED} 
                status={status} 
                accentColor={accentColor} 
                volume={audioLevel}
              />
              
              {/* Central Bar Visualizer (from screenshot) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-30 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: status === ConnectionStatus.CONNECTED ? [16, 16 + (audioLevel * 60 * (1 - Math.abs(i-2)*0.3)), 16] : 16,
                      opacity: status === ConnectionStatus.CONNECTED ? 1 : 0.4
                    }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                    className="w-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: accentColor }}
                  />
                ))}
              </div>

              <AnimatePresence>
                {status === ConnectionStatus.CONNECTED && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-[-40px] rounded-full border border-neon-blue/20 animate-pulse-slow" 
                  />
                )}
              </AnimatePresence>
              {(isGenerating || status === ConnectionStatus.CONNECTING) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-[1px] border-neon-blue border-t-transparent rounded-full animate-spin opacity-20" />
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-futuristic tracking-[0.5em] text-white uppercase font-black opacity-90">
                {status === ConnectionStatus.CONNECTED ? 'URFI IS LISTENING...' : 'URFI IS OFFLINE'}
              </h2>
              <p className="text-[12px] uppercase tracking-[0.3em] font-futuristic font-bold" style={{ color: accentColor }}>
                Premium Holographic Interface V2
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-red-500 animate-pulse' : status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-futuristic text-neutral-400 ${(!isOnline || status === ConnectionStatus.ERROR) ? 'animate-glitch text-red-500' : ''}`}>
                {!isOnline 
                  ? (language === 'ur' ? 'انٹرنیٹ منقطع ہے' : 'NEURAL LINK SEVERED') 
                  : status === ConnectionStatus.CONNECTED 
                    ? readyStatus 
                    : status === ConnectionStatus.DISCONNECTED 
                      ? 'URFI READY' 
                      : status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-2xl flex flex-col glass-panel rounded-[2.5rem] border border-neon-blue/10 shadow-2xl relative overflow-hidden bg-black/20 backdrop-blur-xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <span className="text-[10px] uppercase tracking-[0.3em] font-futuristic font-black text-neon-blue">Neural Stream</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/60" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 p-8 custom-scrollbar">
            {transcriptions.length === 0 && !currentOutput && (
              <div className="h-full flex flex-col items-center justify-center text-neon-blue/20 font-futuristic text-[10px] tracking-[0.4em] gap-6 opacity-50">
                <Zap className="w-12 h-12 opacity-20 icon-glow animate-pulse" />
                <span>SYSTEM IDLE // AWAITING INPUT</span>
              </div>
            )}
            <div className="space-y-8">
              {transcriptions.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-baseline gap-3 mb-2 px-2">
                    <span className={`text-[9px] uppercase font-black tracking-[0.2em] font-futuristic ${msg.role === 'user' ? 'text-neutral-500' : 'text-neon-blue'}`}>
                      {msg.role === 'user' ? 'OPERATOR' : 'URFI CORE'}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-mono opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`p-5 rounded-3xl text-[13px] font-mono leading-relaxed max-w-[90%] shadow-2xl transition-all hover:shadow-neon-blue/5 ${msg.role === 'user' ? 'bg-neutral-900/90 text-neutral-200 rounded-tr-none border border-neutral-800/50' : 'bg-neon-blue/5 text-white border border-neon-blue/20 rounded-tl-none backdrop-blur-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {currentOutput && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-start"
                >
                  <div className="flex items-baseline gap-3 mb-2 px-2">
                    <span className="text-[9px] uppercase font-black tracking-[0.2em] font-futuristic text-neon-blue animate-pulse">
                      URFI CORE // STREAMING
                    </span>
                  </div>
                  <div className="p-5 rounded-3xl text-[13px] font-mono leading-relaxed max-w-[90%] bg-neon-blue/10 text-white border border-neon-blue/30 rounded-tl-none shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                    <HighlightingText text={currentOutput} />
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-neon-blue ml-1 align-middle"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input Indicator */}
          <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${!isOnline ? 'bg-red-500 animate-pulse' : status === ConnectionStatus.CONNECTED ? 'bg-neon-blue animate-ping' : 'bg-neutral-600'}`} />
              <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                {!isOnline 
                  ? (language === 'ur' ? 'انٹرنیٹ نہیں ہے' : 'NEURAL LINK SEVERED') 
                  : status === ConnectionStatus.CONNECTED 
                    ? (language === 'ur' ? 'رابطہ فعال ہے' : 'Live Link Active') 
                    : (language === 'ur' ? 'رابطہ منقطع ہے' : 'Link Offline')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-0.5 bg-neon-blue/20 rounded-full" />
                ))}
              </div>
            </div>
            <div ref={transcriptionEndRef} />
          </div>
        </div>
      </>
    )}
  </main>

    {/* Stats Modal */}
    <AnimatePresence>
      {showStats && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] border border-neon-blue/30 shadow-[0_0_50px_rgba(0,242,255,0.2)]"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-neon-blue icon-glow" />
                <h2 className="text-xl font-futuristic tracking-widest text-white uppercase">Neural Stats</h2>
              </div>
              <button onClick={() => setShowStats(false)} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Messages</p>
                  <p className="text-2xl font-black text-white">{sessionStats.messagesSent}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Images</p>
                  <p className="text-2xl font-black text-white">{sessionStats.imagesGenerated}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Videos</p>
                  <p className="text-2xl font-black text-white">{sessionStats.videosGenerated}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Uptime</p>
                  <p className="text-2xl font-black text-white">{Math.floor((Date.now() - sessionStats.sessionStartTime) / 60000)}m</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neon-blue/5 border border-neon-blue/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-neon-blue uppercase tracking-widest font-bold">System Health</span>
                  <span className="text-[10px] text-green-400 font-mono">OPTIMAL</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    className="h-full bg-neon-blue shadow-[0_0_10px_var(--color-neon-blue-glow)]"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowStats(false)}
              className="w-full mt-8 py-4 btn-neon rounded-2xl font-futuristic font-black tracking-[0.2em] uppercase"
            >
              Close Diagnostics
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Camera Preview Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-neutral-900/80 backdrop-blur-md">
            <span className="text-neon-blue font-bold tracking-widest text-sm uppercase">{isScreenSharing ? 'SCREEN INTERFACE' : 'LENS INTERFACE'}</span>
            <button onClick={isScreenSharing ? stopScreenShare : stopCamera} className="p-2 text-neutral-400 hover:text-white"><StopCircle className="w-5 h-5 icon-glow" /></button>
          </div>
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isScreenSharing ? '' : 'grayscale opacity-80'}`} />
            {!isScreenSharing && (
              <div className="absolute inset-0 pointer-events-none border-[1px] border-neon-blue/20 flex items-center justify-center">
                <div className="w-48 h-48 border border-neon-blue/40 rounded-full opacity-40 animate-pulse" />
                <div className="absolute top-4 left-4 border-t-2 border-l-2 border-neon-blue w-8 h-8 opacity-60" />
                <div className="absolute top-4 right-4 border-t-2 border-r-2 border-neon-blue w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-neon-blue w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-neon-blue w-8 h-8 opacity-60" />
              </div>
            )}
          </div>
          <div className="p-8 bg-neutral-900/80 backdrop-blur-md flex justify-center">
            <button 
              onClick={captureAndAnalyze}
              className="w-20 h-20 rounded-full bg-neon-blue flex items-center justify-center border-4 border-white/20 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-neon-blue/50"
            >
              {isScreenSharing ? <Monitor className="w-8 h-8 icon-glow text-black" /> : <Camera className="w-8 h-8 icon-glow text-black" />}
            </button>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />}

      <footer className="p-6 md:p-8 flex flex-col items-center gap-6 z-20 w-full bg-black/20 backdrop-blur-sm border-t border-neon-blue/5">
        {/* Editing Context UI */}
        <AnimatePresence>
          {editingImage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-3xl mb-[-24px] z-30"
            >
              <div className="glass-panel p-2 pl-3 rounded-t-2xl border-b-0 border-neon-blue/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/30 shadow-lg">
                    <img src={editingImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neon-blue font-black uppercase tracking-[0.2em] text-glow-neon-blue">RECONSTRUCTION MODE</span>
                    <span className="text-[7px] text-neutral-500 font-mono">Awaiting transformation parameters...</span>
                  </div>
                </div>
                <button onClick={() => setEditingImage(null)} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex gap-3 items-center order-2 md:order-1">
            <button onClick={toggleListening} className={`w-12 h-12 rounded-2xl glass-panel flex items-center justify-center ${isListening ? 'text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)] border-red-500/40' : 'text-neon-blue'} hover:scale-105 active:scale-95 transition-all border-neon-blue/20`} title="Voice Recognition">
              {isListening ? <MicOff className="w-5 h-5 icon-glow" /> : <Mic className="w-5 h-5 icon-glow" />}
            </button>
            <button onClick={generateImage} disabled={isGenerating} className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-neon-blue hover:scale-105 active:scale-95 transition-all border-neon-blue/20" title="Construct Image"><Sparkles className="w-5 h-5 icon-glow" /></button>
            <button onClick={generateVideo} disabled={isGenerating} className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-neon-blue hover:scale-105 active:scale-95 transition-all border-neon-blue/20" title="Synthesize Video"><Video className="w-5 h-5 icon-glow" /></button>
          </div>

          <div className={`flex-1 w-full flex items-center gap-3 glass-panel p-1.5 pl-5 rounded-2xl border-neon-blue/20 focus-within:border-neon-blue/50 transition-all shadow-[0_0_20px_rgba(0,255,255,0.1)] order-1 md:order-2 ${editingImage ? 'rounded-t-none border-t-0' : ''}`}>
            <input 
              type="text" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()} 
              placeholder={editingImage ? "Define transformation..." : "Command Urfi..."} 
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-neon-blue/40 font-mono py-3" 
            />
            <button 
              onClick={handleTextSubmit} 
              disabled={!textInput.trim() || isGenerating} 
              className="p-3 btn-neon rounded-xl transition-all disabled:opacity-10 active:scale-90"
            >
              <Send className="w-5 h-5 icon-glow" />
            </button>
          </div>

          <button 
            onClick={status === ConnectionStatus.CONNECTED ? disconnect : connect} 
            className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl order-3 ${status === ConnectionStatus.CONNECTED ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40 hover:bg-neon-blue/30'} active:scale-90 relative`}
          >
            {status === ConnectionStatus.CONNECTED ? <StopCircle className="w-8 h-8 icon-glow" /> : <Mic className="w-8 h-8 icon-glow" />}
            {status === ConnectionStatus.CONNECTED && (
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-red-400/50" 
              />
            )}
          </button>
        </div>
      </footer>

      <aside className={`fixed inset-y-0 right-0 w-full sm:w-[400px] glass-panel z-40 transform transition-transform duration-500 ease-out border-l border-neon-blue/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neon-blue/10 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-neon-blue icon-glow" />
              <h2 className="font-futuristic font-black text-neon-blue text-glow-neon-blue text-xs tracking-[0.3em] uppercase">SYSTEM ARCHIVES</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTranscriptions([])} 
                className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Purge Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {mediaGallery.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-3 bg-neon-blue rounded-full" />
                  <h3 className="text-[10px] text-neon-blue/60 uppercase tracking-widest font-black font-futuristic">VISUAL ASSETS</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {mediaGallery.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={item.id} 
                      className="relative group overflow-hidden rounded-2xl border border-neon-blue/10 shadow-xl bg-black aspect-square"
                    >
                      {item.type === 'image' ? (
                        <div className="relative h-full w-full group cursor-pointer">
                          <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingImage(item.url); setIsSidebarOpen(false); }}
                              className="px-4 py-2 bg-neon-blue text-black rounded-full font-black text-[10px] tracking-widest flex items-center gap-2 hover:bg-neon-blue/80 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" /> RECONSTRUCT
                            </button>
                          </div>
                        </div>
                      ) : (
                        <video src={item.url} controls className="w-full h-full object-cover" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-3 bg-neon-blue rounded-full" />
                <h3 className="text-[10px] text-neon-blue/60 uppercase tracking-widest font-black font-futuristic">NEURAL LOGS</h3>
              </div>
              {transcriptions.length === 0 && (
                <div className="text-neon-blue/20 font-mono text-[10px] italic py-10 text-center border border-dashed border-neon-blue/10 rounded-2xl">
                  Archives empty...
                </div>
              )}
              <div className="space-y-6">
                {transcriptions.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[8px] font-black tracking-widest font-futuristic ${msg.role === 'user' ? 'text-neutral-500' : 'text-[#00f2ff]'}`}>
                        {msg.role === 'user' ? 'OPERATOR' : 'URFI'}
                      </span>
                      <span className="text-[7px] text-neutral-600 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-xl text-[11px] font-mono leading-relaxed ${msg.role === 'user' ? 'bg-neutral-900/50 text-neutral-400 border border-neutral-800' : 'bg-[#00f2ff]/5 text-white border border-[#00f2ff]/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
