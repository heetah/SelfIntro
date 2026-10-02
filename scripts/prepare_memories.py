"""Prepare public web copies; keep the supplied memory_pics originals untouched."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'memory_pics'
DESTINATION = ROOT / 'public' / 'memories'
# Presentation choices for web delivery, rather than inferred image content.
MAX_EDGE = 1600
WEBP_QUALITY = 88
FILES = {
    '系學會1.jpg': 'association-01', '系學會2.jpg': 'association-02',
    '系學會3.jpg': 'association-03', '系學會4.jpg': 'association-04',
    '資工營_大合照.JPG': 'camp-group', '資工營_狂歡.jpg': 'camp-celebration',
    '資工營_晚會.jpg': 'camp-evening', '資工營_颱風.jpg': 'camp-typhoon',
    '資工營_廠商.JPG': 'camp-sponsor', 'AIESEC.jpg': 'aiesec',
    'EF.jpg': 'ef-01', 'EF2.jpg': 'ef-02', 'EF3.jpg': 'ef-03',
    '香舞.jpg': 'camp-dance', '啦啦隊_正式.jpg': 'cheer',
    'Sliding_demo.png': 'sliding-demo',
    '冬返_大合照.jpg': 'winter-service-01', '冬返_小合照.jpg': 'winter-service-02',
    '香舞_2.jpg': 'camp-dance-02', '資工營_技術組.png': 'camp-tech-01',
    '資工營_技術組2.jpg': 'camp-tech-02', '資工營_技術組3.jpg': 'camp-tech-03',
    '資工營_技術組4.jpg': 'camp-tech-04', '資工營_技術組5.jpg': 'camp-tech-05',
    '資工營_夥伴.jpg': 'camp-partners', '資工營_籌備一.jpg': 'camp-preparation-01',
    '資工營_籌備二.jpg': 'camp-preparation-02', '資工營_籌備三.jpg': 'camp-preparation-03',
    'AIESEC_2.jpg': 'aiesec-02', 'CloudMile 實習.jpg': 'cloudmile',
    'AIESEC_3.png': 'aiesec-03', 'Sliding.jpg': 'sliding-presentation',
    '資工營_籌備四.JPG': 'camp-preparation-04', '資工營_慶功.jpg': 'camp-reunion',
    '系學會5.jpeg': 'association-05', '系學會6.jpg': 'association-06',
    '系學會_交接.jpg': 'association-handover',
    '冬返_籌會.jpg': 'winter-preparation', '冬返_後話.jpg': 'winter-reunion',
    '啦啦隊_籌備.jpg': 'cheer-preparation', '啦啦隊_正式2.jpg': 'cheer-performance-02',
    '啦啦隊_慶功.jpg': 'cheer-reunion',
    'EF1.jpg': 'ef-table', 'EF4.jpg': 'ef-outing-04', 'EF5.jpg': 'ef-outing-05',
    'EF6.jpg': 'ef-outing-06', 'EF7.jpg': 'ef-outing-07', 'EF8.jpg': 'ef-outing-08',
    'EF9.jpg': 'ef-outing-09', 'EF_gradu.jpg': 'ef-graduation',
    '軟體工程1.jpg': 'software-01', '軟體工程2.jpg': 'software-02',
    '軟體工程3.png': 'software-03', '軟體工程4.jpg': 'software-04',
    'heetah.jpg': 'heetah', 'FESHx.BIPA.png': 'bipa-01',
    'FESHx.BIPA0.jpg': 'bipa-02', 'FESHx.BIPA2.png': 'bipa-03',
    'FESHx.BIPA3.png': 'bipa-04', 'FESHx.BIPA4.png': 'bipa-05',
    'FESHx.BIPA5.jpg': 'bipa-06',
}

def main():
    missing = [name for name in FILES if not (SOURCE / name).is_file()]
    if missing:
        raise FileNotFoundError(f'Missing source photographs: {missing}')
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for name, output in FILES.items():
        with Image.open(SOURCE / name) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            image.thumbnail((MAX_EDGE, MAX_EDGE))  # Never enlarge a small original.
            image.save(DESTINATION / f'{output}.webp', 'WEBP', quality=WEBP_QUALITY, method=6)
    print(f'Prepared {len(FILES)} web images. Originals remain unchanged.')

if __name__ == '__main__':
    main()
