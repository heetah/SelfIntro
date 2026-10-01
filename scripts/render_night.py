"""Offline motion artwork. NumPy renders frames; FFmpeg encodes the loop.
All constants below are art-direction controls, not astrophysical parameters.
Periodic sine functions and wrapped light trails give an exact 12-second cycle.
"""
from pathlib import Path
import subprocess, json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/media';OUT.mkdir(exist_ok=True)
W,H,FPS,SECONDS=640,800,24,12
rng=np.random.default_rng(2026) # reproducible artwork
y,x=np.mgrid[0:H,0:W].astype(np.float32);x/=W;y/=H
base=np.zeros((H,W,3),np.float32);base[:]=[9,15,26]
mist=np.exp(-((x-.72)**2/.18+(y-.25)**2/.3))
base+=mist[...,None]*np.array([5,9,15])
stars=[]
for _ in range(52):
 sx,sy=rng.uniform(.035,.965,2);sigma=rng.uniform(.00065,.0013)
 glow=np.exp(-((x-sx)**2+(y-sy)**2)/(2*sigma*sigma))
 halo=np.exp(-((x-sx)**2+(y-sy)**2)/(2*(sigma*3)**2))*.09
 stars.append((glow+halo,rng.uniform(0,2*np.pi),int(rng.integers(1,4)),rng.uniform(40,140)))
command=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'night-sky.mp4')]
process=subprocess.Popen(command,stdin=subprocess.PIPE)
for i in range(FPS*SECONDS):
 phase=2*np.pi*i/(FPS*SECONDS)
 frame=base.copy()
 for glow,offset,speed,brightness in stars:
  twinkle=.3+.7*(.5+.5*np.sin(phase*speed+offset))**2
  frame+=glow[...,None]*brightness*twinkle*np.array([.8,.86,1.])
 # Two faint oblique light ribbons, moving on a torus so loop boundaries match.
 for origin,offset in [(.22,0),(.78,2.1)]:
  line=origin+.11*np.sin(phase+offset)+.14*(y-.5)
  ribbon=np.exp(-((x-line)/.014)**2)
  pulse=(.5+.5*np.cos(2*np.pi*y-phase+offset))**10
  frame+=(ribbon*pulse)[...,None]*np.array([4,8,13])
 pixels=np.clip(frame,0,255).astype(np.uint8)
 if i==0:Image.fromarray(pixels).save(OUT/'night-sky-poster.webp',quality=92)
 process.stdin.write(pixels.tobytes())
process.stdin.close()
if process.wait()!=0:raise RuntimeError('FFmpeg failed')
(OUT/'night-sky.json').write_text(json.dumps({'width':W,'height':H,'fps':FPS,'seconds':SECONDS,'stars':len(stars),'renderer':'NumPy + FFmpeg / libx264','seed':2026}),encoding='utf-8')
print('Rendered night-sky.mp4 and still poster')
