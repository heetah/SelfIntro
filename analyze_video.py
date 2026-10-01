"""Decode every source frame; keep exact decoded duplicates traceable."""
from pathlib import Path
import cv2, hashlib, json
from PIL import Image, ImageDraw

out = Path('analysis/video')
out.mkdir(parents=True, exist_ok=True)
cap = cv2.VideoCapture('jogging_timelapse_6fps.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
records, unique, seen = [], [], {}
index = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    digest = hashlib.sha256(frame.tobytes()).hexdigest()
    if digest not in seen:
        uid = len(unique)
        seen[digest] = uid
        path = out / f'frame-{index:04d}.jpg'
        cv2.imwrite(str(path), frame)
        unique.append({'frame': index, 'time': index / fps, 'path': str(path)})
    records.append({'frame': index, 'time': index / fps, 'unique': seen[digest], 'sha256': digest})
    index += 1
cap.release()
Path('analysis/frame-manifest.json').write_text(json.dumps({'fps': fps, 'decoded_frames': index, 'unique_frames': len(unique), 'frames': records, 'unique': unique}, indent=2), encoding='utf-8')
print(json.dumps({'fps': fps, 'decoded_frames': index, 'unique_frames': len(unique)}))
