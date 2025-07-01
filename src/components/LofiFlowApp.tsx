
"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import * as Tone from 'tone'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Music, Play, Pause, Settings, Download, PlayCircle, PauseCircle } from 'lucide-react'

type Playlist = {
  name: string
  url: string
}

const playlists: Record<string, Playlist> = {
  'lofi-chill': { name: 'Lofi Chill', url: 'https://archive.org/download/lofi_202108/lofi.mp3' },
  'ambient-focus': { name: 'Ambient Focus', url: 'https://archive.org/download/ambient-classical-guitar/track01.mp3' },
  'late-night': { name: 'Late Night', url: 'https://archive.org/download/Lofi-Beat-1/Lofi-Beat-1.mp3' },
}

export function LofiFlowApp() {
  const [text, setText] = useState('')
  const [goal, setGoal] = useState(500)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(50)
  const [currentPlaylist, setCurrentPlaylist] = useState(Object.keys(playlists)[0])

  // Pomodoro State
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break' | 'idle'>('idle')
  const [timer, setTimer] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const wordCount = useMemo(() => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }, [text])

  const progress = useMemo(() => {
    if (goal === 0) return 0
    return Math.min((wordCount / goal) * 100, 100)
  }, [wordCount, goal])
  
  // Auto-save to localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('lofiflow-text');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lofiflow-text', text)
  }, [text])

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer <= 0) {
      playNotificationSound()
      if (pomodoroMode === 'work') {
        setPomodoroMode('break')
        setTimer(5 * 60)
        setIsTimerRunning(true) 
      } else {
        setPomodoroMode('work')
        setTimer(25 * 60)
        setIsTimerRunning(false) // Pause after break
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timer, pomodoroMode])
  
  const playNotificationSound = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    const synth = new Tone.Synth().toDestination()
    synth.triggerAttackRelease('C5', '8n', Tone.now())
  }
  
  const playButtonClickSound = async (note: string) => {
    if (soundEnabled && synthRef.current) {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      synthRef.current.triggerAttackRelease(note, '16n');
    }
  };

  const handlePomodoroToggle = () => {
    if (pomodoroMode === 'idle') {
      setPomodoroMode('work');
    }
    setIsTimerRunning(!isTimerRunning)
    playButtonClickSound('E4');
  }

  const resetPomodoro = () => {
    setIsTimerRunning(false)
    setPomodoroMode('idle')
    setTimer(25 * 60)
    playButtonClickSound('D4');
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }


  useEffect(() => {
    document.body.classList.toggle('is-typing', isTyping)
  }, [isTyping])
  
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
    synthRef.current.volume.value = -12
    return () => {
      synthRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = playlists[currentPlaylist].url
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e))
        }
    }
  }, [currentPlaylist])


  const playSound = async () => {
    if (soundEnabled && synthRef.current) {
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      synthRef.current.triggerAttackRelease('C4', '8n')
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    playSound()
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000)
  }

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = parseInt(e.target.value, 10)
    setGoal(isNaN(newGoal) || newGoal < 0 ? 0 : newGoal)
  }

  const togglePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.src = playlists[currentPlaylist].url
      audioRef.current.play().catch(e => console.error("Audio play failed:", e))
    }
    setIsPlaying(!isPlaying)
    await playButtonClickSound('G4');
  }

  const exportToFile = (format: 'txt' | 'md') => {
    const blob = new Blob([text], { type: `text/${format === 'txt' ? 'plain' : 'markdown'};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lofiflow-export.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    playButtonClickSound('B4');
  }

  const handlePlaylistChange = (value: string) => {
    setCurrentPlaylist(value);
    playButtonClickSound('F4');
  };

  const handleSoundEnableChange = (checked: boolean) => {
    setSoundEnabled(checked);
    playButtonClickSound(checked ? 'C5' : 'B3');
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  const handleSettingsClick = () => playButtonClickSound('A4');
  const handleExportClick = () => playButtonClickSound('A4');
  const handleVolumeCommit = () => playButtonClickSound('E5');
  const handleExportTxt = () => exportToFile('txt');
  const handleExportMd = () => exportToFile('md');

  return (
    <div className="relative flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 font-body gap-6">
      <audio ref={audioRef} src={playlists[currentPlaylist].url} loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      
      <header className="sticky top-4 sm:top-6 z-20">
        <Card className="bg-white/10 backdrop-blur-lg shadow-lg border-white/20">
          <CardHeader className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 12C3 12 5 15 9 15C13 15 15 12 19 12C23 12 21 9 21 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15C3 15 5 18 9 18C13 18 15 15 19 15C23 15 21 12 21 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 9C3 9 5 12 9 12C13 12 15 9 19 9C23 9 21 6 21 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground">LofiFlow</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Pomodoro Timer */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10">
                  <Button variant="ghost" size="icon" onClick={handlePomodoroToggle}>
                    {isTimerRunning ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                  </Button>
                  <div className="text-center">
                    <div className="font-mono text-xl tracking-wider">{formatTime(timer)}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{pomodoroMode}</div>
                  </div>
                </div>

                {/* Music Player */}
                <div className="flex items-center gap-2">
                  <Select value={currentPlaylist} onValueChange={handlePlaylistChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(playlists).map(([key, { name }]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={togglePlayPause}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Word Count & Goal */}
                <div className="flex items-center gap-3">
                   <div className="flex items-baseline gap-2">
                    <span className="text-lg font-medium">{wordCount}</span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <Input type="number" value={goal} onChange={handleGoalChange} className="w-20 h-8 p-1 text-center" />
                    <span className="text-sm text-muted-foreground">words</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                   <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleSettingsClick}><Settings className="h-5 w-5" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound-switch">Typewriter Sound</Label>
                          <Switch id="sound-switch" checked={soundEnabled} onCheckedChange={handleSoundEnableChange} />
                        </div>
                        <div className="space-y-2">
                           <Label>Music Volume</Label>
                           <Slider defaultValue={[volume]} max={100} step={1} onValueChange={handleVolumeChange} onValueCommit={handleVolumeCommit} />
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-4 border-t">
                            <Label>Pomodoro Timer</Label>
                            <Button variant="outline" size="sm" onClick={resetPomodoro}>Reset</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleExportClick}><Download className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleExportTxt}>Export as .txt</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportMd}>Export as .md</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
             <Progress value={progress} className="w-full mt-4 h-1.5" />
          </CardHeader>
        </Card>
      </header>

      <main className="flex-grow">
        <Card className="h-[calc(100vh-11rem)] sm:h-[calc(100vh-12rem)] bg-transparent border-none shadow-none">
          <CardContent className="p-0 h-full">
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Start writing..."
              className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg leading-relaxed p-6 text-foreground/90 placeholder:text-foreground/50"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
