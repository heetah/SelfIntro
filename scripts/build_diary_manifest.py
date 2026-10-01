"""Publish source-ordered diary pages, merging only reviewed codec duplicates.

This is a source-specific rule. The tolerance is the maximum measured distance
of manually inspected duplicate pairs, not a universal scene-change threshold.
Uncertain changes, including pictures moving within a diary, stay separate.
"""
from pathlib import Path
import cv2, numpy as np, json
from PIL import Image

root=Path(__file__).resolve().parents[1]
distances=json.loads((root/'analysis/diary-distances.json').read_text(encoding='utf-8'))
by_frame={row['frame']:row['distance'] for row in distances}
# Paired frames f-5/f: visual review recorded in duplicate-boundaries.jpg and
# the first contact sheets. Includes the largest reviewed codec-only residual.
reviewed_duplicate_frames=[17,77,2657,2777]
tolerance=max(by_frame[f] for f in reviewed_duplicate_frames)
selected={row['frame'] for row in distances if row['distance'] is None or row['distance']>tolerance}
cap=cv2.VideoCapture(str(root/'jogging_timelapse_6fps.mp4'))
fps=cap.get(cv2.CAP_PROP_FPS)
entries=[]
output=root/'public'/'diary'
index=0
while True:
    ok,frame=cap.read()
    if not ok: break
    if index in selected:
        ordinal=len(entries)+1
        name=f'page-{ordinal:04d}.webp'
        Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).save(output/name,'WEBP',quality=90)
        entries.append({'id':ordinal,'image':'/diary/'+name,'sourceFrame':index,'sourceTime':index/fps})
        if ordinal%100==0: print(f'{ordinal} pages written',flush=True)
    index+=1
cap.release()
data={'entries':entries}
(output/'pages.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
(root/'analysis/diary-page-selection.json').write_text(json.dumps({'reviewedDuplicateFrames':reviewed_duplicate_frames,
    'tolerance':tolerance,'distanceUnit':'mean absolute BGR channel value, 8-bit, 1/10 area resize',
    'inputSlots':len(distances),'retainedPages':len(entries),'entries':entries},indent=2),encoding='utf-8')
print(f'Finished: {len(entries)} pages, tolerance derived as {tolerance}.',flush=True)
