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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Music, Play, Pause, Settings, Download, Volume2, VolumeX, BookText, Wind } from 'lucide-react'

type Playlist = {
  name: string
  url: string
}

const playlists: Record<string, Playlist> = {
  'lofi-chill': { name: 'Lofi Chill', url: 'https://www.chosic.com/wp-content/uploads/2022/01/purrple-cat-dreaming-of-you.mp3' },
  'ambient-focus': { name: 'Ambient Focus', url: 'https://www.chosic.com/wp-content/uploads/2024/03/purrple-cat-through-the-looking-glass.mp3' },
  'late-night': { name: 'Late Night', url: 'https://www.chosic.com/wp-content/uploads/2021/07/purrple-cat-battle-of-the-heroes.mp3' },
}

export function LofiFlowApp() {
  const [text, setText] = useState('')
  const [goal, setGoal] = useState(500)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(50)
  const [currentPlaylist, setCurrentPlaylist] = useState(Object.keys(playlists)[0])

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

  useEffect(() => {
    document.body.classList.toggle('is-typing', isTyping)
  }, [isTyping])
  
  useEffect(() => {
    // Use PolySynth to avoid errors with rapid key presses
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
    synthRef.current.set({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 },
    })
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
  }, [currentPlaylist, isPlaying])


  const playSound = async () => {
    if (soundEnabled && synthRef.current) {
      // Ensure audio context is running
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      try {
         synthRef.current.triggerAttackRelease('C5', '32n')
      } catch (error) {
        console.error("Failed to play sound", error)
      }
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
    // Start the audio context on user interaction
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e))
    }
    setIsPlaying(!isPlaying)
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
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 font-body gap-6">
      <audio ref={audioRef} src={playlists[currentPlaylist].url} loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      
      <header className="sticky top-4 sm:top-6 z-20">
        <Card className="bg-card/75 backdrop-blur-lg shadow-lg">
          <CardHeader className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg"><Wind className="w-6 h-6 text-primary" /></div>
                <h1 className="text-2xl font-bold text-foreground">LofiFlow</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Music Player */}
                <div className="flex items-center gap-2">
                  <Select value={currentPlaylist} onValueChange={setCurrentPlaylist}>
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
                      <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound-switch">Typewriter Sound</Label>
                          <Switch id="sound-switch" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                        </div>
                        <div className="space-y-2">
                           <Label>Music Volume</Label>
                           <Slider defaultValue={[volume]} max={100} step={1} onValueChange={([v]) => setVolume(v)} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><Download className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportToFile('txt')}>Export as .txt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportToFile('md')}>Export as .md</DropdownMenuItem>
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
        <Card className="h-[calc(100vh-11rem)] sm:h-[calc(100vh-12rem)] shadow-lg">
          <CardContent className="p-1 h-full">
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Start writing..."
              className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg leading-relaxed p-6"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
