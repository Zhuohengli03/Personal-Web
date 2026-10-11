"""Assemble a time-lapse GIF from numbered PNG frames: real time at the start, sampled through the long middle, a hold on the end.
   python3 -I build-gif.py <frames dir> <out.gif> <width>"""
import sys, glob
from PIL import Image
frames_dir, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
files = sorted(glob.glob(f"{frames_dir}/*.png"))
n = len(files)
# frame plan: first 40 frames (scroll phase, 0.5 s apart) → 250 ms each; the middle sampled every 12th frame → 350 ms; last 6 frames → 400 ms; final hold 3 s
head = list(range(0, min(40, n)))
mid = list(range(40, max(40, n - 6), 12))
tail = list(range(max(40, n - 6), n))
plan = [(i, 250) for i in head] + [(i, 350) for i in mid] + [(i, 400) for i in tail]
if plan: plan[-1] = (plan[-1][0], 3000)
imgs, durs = [], []
for i, d in plan:
    im = Image.open(files[i]).convert("RGB")
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS).quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    imgs.append(im); durs.append(d)
imgs[0].save(out, save_all=True, append_images=imgs[1:], duration=durs, loop=0, optimize=True, disposal=1)
import os; print(f"{len(imgs)} frames from {n}, {os.path.getsize(out)/1e6:.2f} MB -> {out}")
