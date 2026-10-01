from pathlib import Path
import cv2, numpy as np, json

root=Path(__file__).resolve().parents[1]
cap=cv2.VideoCapture(str(root/'jogging_timelapse_6fps.mp4'))
fps=cap.get(cv2.CAP_PROP_FPS)
stride=round(fps/6)
previous=None
samples=[]
i=0
while True:
    ok,frame=cap.read()
    if not ok: break
    if i%stride==stride//2:
        # Area averaging suppresses codec block noise; exact 1/10 source scale.
        small=cv2.resize(frame,(frame.shape[1]//10,frame.shape[0]//10),interpolation=cv2.INTER_AREA).astype(np.float32)
        distance=None if previous is None else float(np.mean(np.abs(small-previous)))
        samples.append({'frame':i,'distance':distance})
        previous=small
    i+=1
cap.release()
(root/'analysis/diary-distances.json').write_text(json.dumps(samples,indent=2),encoding='utf-8')
values=np.array([x['distance'] for x in samples[1:]])
print('quantiles',np.quantile(values,[0,.1,.25,.5,.75,.9,1]).tolist())
print('anchors',[x for x in samples if x['frame'] in [17,77,127,2277,7,12,87,2282]])
print('largest low-distance gaps',sorted([(float(b-a),float(a),float(b)) for a,b in zip(np.sort(values)[:-1],np.sort(values)[1:]) if a<1],reverse=True)[:8])
