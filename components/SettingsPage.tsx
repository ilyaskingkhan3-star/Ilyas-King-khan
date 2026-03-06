import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, User, Palette, MessageSquare, Languages, Zap, Volume2, BrainCircuit, Mic, MicOff, Sun, Moon } from 'lucide-react';
import { Settings, INITIAL_SETTINGS } from '../App';

interface SettingsPageProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-neon-blue/30 shadow-[0_0_50px_var(--color-neon-blue-glow)]"
      >
        {/* Header */}
        <div className="p-6 border-b border-neon-blue/10 flex justify-between items-center bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-blue/10 rounded-lg">
              <Zap className="w-5 h-5 text-neon-blue icon-glow" />
            </div>
            <h2 className="text-xl font-futuristic tracking-widest text-neon-blue text-glow-neon-blue">SYSTEM CONFIG</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* User Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <User className="w-3 h-3 icon-glow" /> User Profile
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Designation</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                className="w-full bg-black/50 border border-neon-blue/20 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                placeholder="Enter username..."
              />
            </div>
          </section>

          {/* Neural Personality */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <MessageSquare className="w-3 h-3 icon-glow" /> Neural Personality
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Core Directives</label>
                <button 
                  onClick={() => setSettings({ ...settings, systemPrompt: INITIAL_SETTINGS.systemPrompt })}
                  className="text-[9px] px-2 py-1 btn-secondary rounded-md flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-2 h-2" /> Reset
                </button>
              </div>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                className="w-full h-24 bg-black/50 border border-neon-blue/20 rounded-xl p-3 text-xs font-mono text-white/80 focus:outline-none focus:border-neon-blue/50 transition-all resize-none"
              />
            </div>
          </section>

          {/* Cognitive Engine (Model Select) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <BrainCircuit className="w-3 h-3 icon-glow" /> Cognitive Engine
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">AI Model Select</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
                  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' },
                  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro' },
                  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSettings({ ...settings, selectedModel: m.id })}
                    className={`text-[10px] p-3 rounded-xl border transition-all uppercase tracking-widest text-left flex justify-between items-center ${
                      settings.selectedModel === m.id 
                        ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                        : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                    }`}
                  >
                    {m.name}
                    {settings.selectedModel === m.id && <Zap className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Linguistic Engine */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <Languages className="w-3 h-3 icon-glow" /> Linguistic Engine
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Primary Language</label>
              <div className="flex gap-2">
                {(['en', 'ur'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setSettings({ ...settings, language: l })}
                    className={`flex-1 text-[10px] p-3 rounded-xl border transition-all uppercase tracking-widest ${
                      settings.language === l 
                        ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                        : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                    }`}
                  >
                    {l === 'en' ? 'English' : 'Urdu'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Vocal Synthesis */}
          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <Volume2 className="w-3 h-3 icon-glow" /> Vocal Synthesis
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Voice Matrix</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSettings({ ...settings, selectedVoice: v })}
                      className={`text-[10px] p-2 rounded-lg border transition-all uppercase tracking-tighter ${
                        settings.selectedVoice === v 
                          ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                          : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Voice Reply</label>
                <button
                  onClick={() => setSettings({ ...settings, voiceReply: !settings.voiceReply })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all uppercase tracking-widest text-[10px] ${
                    settings.voiceReply 
                      ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                      : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {settings.voiceReply ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {settings.voiceReply ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.voiceReply ? 'bg-black/20' : 'bg-neon-blue/20'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${settings.voiceReply ? 'right-1 bg-black' : 'left-1 bg-neon-blue'}`} />
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Voice Interaction Mode</label>
                <div className="flex gap-2">
                  {(['manual', 'continuous'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings({ ...settings, voiceMode: m })}
                      className={`flex-1 text-[10px] p-3 rounded-xl border transition-all uppercase tracking-widest ${
                        settings.voiceMode === m 
                          ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                          : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Visual Interface */}
          <section className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-2 text-neon-blue/60 font-futuristic text-xs tracking-tighter uppercase">
              <Palette className="w-3 h-3 icon-glow" /> Visual Interface
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Theme Matrix</label>
                  <button
                    onClick={() => setSettings({ ...settings, autoTheme: !settings.autoTheme })}
                    className={`text-[9px] px-2 py-1 rounded-md border transition-all uppercase tracking-widest ${
                      settings.autoTheme 
                        ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                        : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                    }`}
                  >
                    Auto: {settings.autoTheme ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'cyberpunk', 'ocean', 'forest'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSettings({ ...settings, theme: t })}
                      className={`text-[10px] p-2 rounded-lg border transition-all uppercase tracking-tighter flex items-center justify-center gap-1 ${
                        settings.theme === t 
                          ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                          : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                      }`}
                    >
                      {t === 'light' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Accent Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {['#00f2ff', '#ff00ff', '#00ff00', '#ffff00', '#ff0000', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings({ ...settings, accentColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        settings.accentColor === color 
                          ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Neural Pattern</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['grid', 'dots', 'circuit', 'none'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSettings({ ...settings, bgPattern: p })}
                      className={`text-[10px] p-2 rounded-lg border transition-all uppercase tracking-tighter ${
                        settings.bgPattern === p 
                          ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                          : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Typography Logic</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['futuristic', 'mono', 'sans', 'serif'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSettings({ ...settings, fontStyle: f })}
                      className={`text-[10px] p-2 rounded-lg border transition-all uppercase tracking-tighter ${
                        settings.fontStyle === f 
                          ? 'bg-neon-blue border-neon-blue text-black font-bold' 
                          : 'border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutral-900/50 border-t border-neon-blue/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 btn-neon font-futuristic font-bold tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_20px_var(--color-neon-blue-glow)]"
          >
            INITIALIZE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
