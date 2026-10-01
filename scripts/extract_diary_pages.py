"""Recover montage entries, preserving source artwork and an OCR audit trail.

The provided montage is named 6fps and stores each slide across 30fps frames.
Read the middle of each 1/6-second source slot (five container frames). OCR
header day labels groups consecutive slots of the same diary, not pixel
similarity thresholds. Keep uncertain headers as separate pages for review.
OCR is an extraction aid, not verified transcription; do not publish its text.
"""
from pathlib import Path
import cv2, json, re, time, unicodedata
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

root = Path(__file__).resolve().parents[1]
output = root / 'public' / 'diary'
output.mkdir(parents=True, exist_ok=True)
ocr = RapidOCR()
capture = cv2.VideoCapture(str(root / 'jogging_timelapse_6fps.mp4'))
fps = capture.get(cv2.CAP_PROP_FPS)
montage_fps = 6  # Provenance: supplied filename, visually reviewed slide cadence.
stride = round(fps / montage_fps)
offset = stride // 2
records, entries = [], []
previous_key = None
frame_index = 0
started = time.time()
while True:
    ok, frame = capture.read()
    if not ok:
        break
    if frame_index % stride != offset:
        frame_index += 1
        continue
    # Top third contains the diary day headers in the reviewed layouts.
    # The opening watch montage has its header below this area and is retained.
    result, _ = ocr(frame[:frame.shape[0] // 3], use_cls=False)
    text = [item[1] for item in (result or [])]
    normalized = re.sub(r'\s+', '', unicodedata.normalize('NFKC', ' '.join(text)).upper())
    days = re.findall(r'D[A4]Y[Il]?(\d+)', normalized)
    parts = re.findall(r'PART(\d+)', normalized)
    key = 'DAY:' + ','.join(days) + '/PART:' + ','.join(parts) if days else 'HEADER:' + normalized
    # Empty OCR is never evidence that two slides are equivalent.
    if not normalized:
        key = f'UNREADABLE:{frame_index}'
    record = {'frame': frame_index, 'time': frame_index / fps, 'header': text, 'key': key}
    records.append(record)
    if key != previous_key:
        number = len(entries) + 1
        name = f'entry-{number:04d}.webp'
        Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)).save(output / name, 'WEBP', quality=90)
        entries.append({'id': number, 'image': '/diary/' + name, 'sourceFrame': frame_index,
                        'sourceTime': frame_index / fps, 'headerKey': key})
        previous_key = key
    if len(records) % 50 == 0:
        print(f'{len(records)} slots / {len(entries)} entries / {time.time()-started:.1f}s', flush=True)
    frame_index += 1
capture.release()
(root / 'analysis' / 'diary-extraction.json').write_text(json.dumps({'fps': fps, 'montage_fps': montage_fps,
    'stride': stride, 'slots': records, 'entries': entries}, ensure_ascii=False, indent=2), encoding='utf-8')
# Header OCR is kept in analysis; the reader shows ordering, not uncertain dates.
public_entries = [{k: v for k, v in entry.items() if k != 'headerKey'} for entry in entries]
(output / 'pages.json').write_text(json.dumps({'entries': public_entries}, ensure_ascii=False), encoding='utf-8')
print(f'Finished: {len(records)} slots, {len(entries)} entries.', flush=True)
