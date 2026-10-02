"""Full-page local OCR for editorial review, not a verified public transcript.

Uses installed RapidOCR defaults and keeps source page IDs, boxes and scores.
No diary pages, dates or publication ordering are modified. Resume per image hash.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import threading
import time

import cv2
import rapidocr_onnxruntime.utils as runtime
from rapidocr_onnxruntime import RapidOCR

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'analysis' / 'diary-text'
local = threading.local()

# One CPU thread per inference worker avoids nested thread pools. These are
# execution-resource settings; the detector/recognizer thresholds stay unchanged.
original_session = runtime.InferenceSession
def inference_session(*args, **kwargs):
    options = kwargs['sess_options']
    options.intra_op_num_threads = 1
    options.inter_op_num_threads = 1
    return original_session(*args, **kwargs)
runtime.InferenceSession = inference_session
cv2.setNumThreads(1)

def read(entry):
    path = ROOT / 'public' / entry['image'].lstrip('/')
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    output = OUT / f"page-{entry['id']:04d}.json"
    if output.exists():
        cached = json.loads(output.read_text(encoding='utf-8'))
        if cached.get('sha256') == digest:
            return cached
    if not hasattr(local, 'ocr'):
        local.ocr = RapidOCR()
    result, timing = local.ocr(str(path))
    record = {**entry, 'sha256': digest, 'method': 'RapidOCR full-page default models; unverified transcription',
              'lines': [{'text': item[1], 'score': float(item[2]), 'box': item[0]} for item in (result or [])]}
    output.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    return record

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--workers', type=int, default=min(4, os.cpu_count() or 1), help='CPU worker cap to leave the desktop usable')
    args = parser.parse_args()
    if args.workers < 1:
        parser.error('--workers must be positive')
    OUT.mkdir(parents=True, exist_ok=True)
    entries = json.loads((ROOT / 'public/diary/pages.json').read_text(encoding='utf-8'))['entries']
    records = []
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(read, entry) for entry in entries]
        for future in as_completed(futures):
            records.append(future.result())
            if len(records) % 25 == 0 or len(records) == len(entries):
                print(f'{len(records)}/{len(entries)} pages; {time.perf_counter()-start:.1f}s', flush=True)
    records.sort(key=lambda item: item['id'])
    text = '\n\n'.join(f"PAGE {item['id']:04d} / SOURCE FRAME {item['sourceFrame']}\n" + '\n'.join(line['text'] for line in item['lines']) for item in records)
    (OUT / 'all-pages.txt').write_text(text, encoding='utf-8')
    (OUT / 'coverage.json').write_text(json.dumps({'expected': len(entries), 'processed': len(records), 'empty': [r['id'] for r in records if not r['lines']], 'workers': args.workers}, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
