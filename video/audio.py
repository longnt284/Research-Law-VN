"""Synthesize the soundtrack, beat-locked to scene.js (110 BPM, 92 beats, D minor).

Every event time is read from the SYNC block in scene.js, so picture and sound
share one source. Output: out/audio.wav (48 kHz, stereo, 16-bit).
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

DIR = Path(__file__).parent
SR = 48000
BPM = 110
B = 60 / BPM
TOTAL_BEATS = 92
DUR = TOTAL_BEATS * B + 1.0
N = int(DUR * SR)
rng = np.random.default_rng(11)

src = (DIR / "scene.js").read_text()
block = src.split("/*SYNC*/")[1].split("/*END*/")[0]
SYNC = json.loads(block.split("=", 1)[1].strip().rstrip(";"))

dry = np.zeros((N, 2))
send = np.zeros((N, 2))  # reverb bus


def sec(beat):
    return beat * B


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(buf, sig, t, gain=1.0, pan=0.0):
    """Add a mono or stereo signal at time t (seconds) with constant-power pan."""
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], axis=1) * np.sqrt(2)
    j0 = max(0, -i)
    i0 = max(i, 0)
    n = min(len(sig) - j0, N - i0)
    buf[i0:i0 + n] += sig[j0:j0 + n] * gain


def both(sig, t, g_dry, g_wet, pan=0.0):
    place(dry, sig, t, g_dry, pan)
    place(send, sig, t, g_wet, pan)


def filt(x, kind, f, order=2):
    wn = [v / (SR / 2) for v in f] if isinstance(f, (list, tuple)) else f / (SR / 2)
    return sosfilt(butter(order, wn, btype=kind, output="sos"), x, axis=0)


def noise(d):
    return rng.standard_normal(int(d * SR))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- instruments ----------------
def pluck(f, d=1.6, bright=1.0):
    """Piano-like tone: harmonics that decay faster the higher they sit."""
    t = tt(d)
    s = np.zeros_like(t)
    for k, a in enumerate((1.0, 0.45, 0.22, 0.12, 0.06), start=1):
        s += a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.6 / bright))
    attack = np.minimum(1, t / 0.004)
    return s * attack * 0.5


def bell(f, d=3.5):
    t = tt(d)
    s = np.zeros_like(t)
    for ratio, a, dec in ((1, 1, 1.1), (2.0, 0.5, 1.8), (2.76, 0.35, 2.4), (5.4, 0.18, 4), (8.93, 0.08, 6)):
        s += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return s * np.minimum(1, t / 0.002) * 0.35


def kick(amp=1.0):
    t = tt(0.5)
    f = 42 + 80 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = filt(noise(0.5), "highpass", 2500) * np.exp(-t * 320) * 0.18
    return np.tanh((body + click) * 1.4) * amp


def rim():
    t = tt(0.12)
    n = filt(noise(0.12), "bandpass", [1500, 5000]) * np.exp(-t * 55)
    tone = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 60) * 0.4
    return n * 0.5 + tone


def hat(open_=False):
    d = 0.16 if open_ else 0.045
    t = tt(d)
    return filt(noise(d), "highpass", 8000) * np.exp(-t * (16 if open_ else 95))


def tick(hi=True):
    t = tt(0.04)
    f = 2600 if hi else 2050
    return (np.sin(2 * np.pi * f * t) * 0.6 + filt(noise(0.04), "highpass", 5000) * 0.4) * np.exp(-t * 180)


def boom(amp):
    t = tt(2.6)
    f = 28 + 60 * np.exp(-t * 7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0)
    body = filt(noise(2.6), "bandpass", [120, 700]) * np.exp(-t * 14) * 0.7
    air = filt(noise(2.6), "lowpass", 4000) * np.exp(-t * 3.5) * 0.2
    return (np.tanh(s * 1.6) + body + air) * amp


def stamp():
    """Rubber stamp on paper: a dull thump and a papery slap."""
    t = tt(0.35)
    thump = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 22)
    slap = filt(noise(0.35), "bandpass", [300, 2500]) * np.exp(-t * 45)
    return thump * 0.8 + slap * 0.9


def sweep_noise(d, f0, f1, reverse=False, q=0.35):
    """Band-passed noise whose centre frequency sweeps f0 -> f1 (chunked)."""
    n = noise(d)
    out = np.zeros_like(n)
    hop = 1024
    for i in range(0, len(n), hop):
        fc = f0 * (f1 / f0) ** (i / len(n))
        lo, hi = max(40, fc * (1 - q)), min(SR / 2 - 100, fc * (1 + q))
        out[i:i + hop] = filt(n[max(0, i - 2048):i + hop], "bandpass", [lo, hi])[-len(n[i:i + hop]):]
    out *= np.linspace(0, 1, len(n)) ** 2
    return out[::-1] if reverse else out


def saw(f, t, detune=0.0):
    ph = f * (1 + detune) * t
    return 2 * (ph - np.floor(ph + 0.5))


# ---------------- harmony ----------------
# D minor, four-bar cycle from the first domain: Dm, Bb, F, C.
CYCLE = [(50, [0, 3, 7]), (46, [0, 4, 7]), (53, [0, 4, 7]), (48, [0, 4, 7])]
DM = (50, [0, 3, 7])


def chord_at(beat):
    if beat < 28:
        return DM
    return CYCLE[int((beat - 28) // 4) % 4]


pad = np.zeros(N)


def pad_chord(b0, beats, root, iv, amp, extra=()):
    t = tt(sec(beats) + 0.6)
    s = np.zeros_like(t)
    for k in list(iv) + list(extra):
        f = mtof(root + k)
        for dt in (-0.005, 0, 0.006):
            s += saw(f, t, dt)
    env = np.minimum(1, t / 0.5) * np.minimum(1, (t[-1] - t) / 0.6 + 0.001)
    i = int(sec(b0) * SR)
    n = min(len(s), N - i)
    pad[i:i + n] += (s * env * amp)[:n]


# ---------------- arrangement ----------------
tk = np.arange(N) / SR

# low drone and pad under the hook and the family tree
t = tt(sec(24))
drone = (np.sin(2 * np.pi * mtof(26) * t) * 0.6 + np.sin(2 * np.pi * mtof(38) * t) * 0.3)
drone *= np.minimum(1, t / 2.5) * np.minimum(1, (t[-1] - t) / 1.5)
place(dry, drone * 0.22, 0)
pad_chord(0, 12, 50, [0, 3, 7], 0.5)
pad_chord(12, 8, 46, [0, 4, 7], 0.6)
pad_chord(20, 8, 50, [0, 3, 7], 0.8, extra=[14])

# clock ticks while the lookup date runs, louder as it nears the stamp
t0, t1 = SYNC["ticks"]
for k, b in enumerate(np.arange(t0, t1, 0.25)):
    place(dry, tick(k % 2 == 0), sec(b), 0.12 + 0.18 * (b - t0) / (t1 - t0), pan=0.25 if k % 2 else -0.25)
r = sweep_noise(sec(t1 - t0), 300, 5000)
both(r, sec(t0), 0.12, 0.08)

# stamp at the moment the old law stops applying
both(stamp(), sec(8), 0.9, 0.3)

# thread to the replacing law
w = sweep_noise(sec(1.2), 500, 5000, q=0.5)
both(w, sec(9.4), 0.18, 0.12)

# tree nodes: a rising pluck each
POP_NOTES = [62, 65, 67, 69, 72, 74, 77, 79]
for b, m in zip(SYNC["pops"], POP_NOTES):
    both(pluck(mtof(m), 1.8), sec(b), 0.22, 0.18, pan=np.interp(m, [62, 79], [-0.5, 0.5]))

# swell into the brand reveal, then a bell chord
sw = sweep_noise(sec(2.2), 200, 9000, reverse=False)
both(sw, sec(17.8), 0.2, 0.15)
for m, g, p in ((74, 0.5, -0.2), (81, 0.35, 0.2), (77, 0.3, 0.0)):
    both(bell(mtof(m), 4.5), sec(20), g, 0.35, pan=p)

# riser into the domains
r = sweep_noise(sec(4), 250, 8000)
both(r, sec(24), 0.16, 0.1)
t = tt(sec(4))
place(dry, np.sin(2 * np.pi * np.cumsum(mtof(38) * 2 ** (t / sec(4) * 2)) / SR) * (t / sec(4)) ** 3 * 0.08, sec(24))

# groove under the ten domains (beats 28-68), lighter under the tools (68-80)
kick_beats = list(np.arange(28, 68, 1.0)) + list(np.arange(68, 80, 2.0))
K = kick()
for b in kick_beats:
    place(dry, K, sec(b), 0.55 if b < 68 else 0.4)
RIM = rim()
for b in np.arange(29, 68, 2.0):
    place(dry, RIM, sec(b), 0.16, pan=0.1)
    place(send, RIM, sec(b), 0.08)
H1, H2 = hat(), hat(True)
for b in np.arange(28, 80, 0.5):
    if b % 1 == 0.5:
        place(dry, H2 if int(b) % 4 == 3 else H1, sec(b), 0.1, pan=0.3)
for b in np.arange(36, 66, 0.25):
    if b % 0.5:
        place(dry, H1, sec(b), 0.045, pan=-0.3)

duck = np.ones(N)
for b in kick_beats:
    i0 = int(sec(b) * SR)
    i1 = min(N, i0 + int(0.35 * SR))
    d = tk[i0:i1] - sec(b)
    duck[i0:i1] = np.minimum(duck[i0:i1], 1 - 0.45 * np.exp(-d / 0.1))

bass = np.zeros(N)
for b in np.arange(28, 80, 0.5):
    root, _ = chord_at(b)
    f = mtof(root - 24)
    t = tt(B * 0.5)
    env = np.exp(-t * 5) * np.minimum(1, t / 0.005)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)) * env
    i = int(sec(b) * SR)
    bass[i:i + len(s)] += s[: N - i]
bass = filt(bass, "lowpass", 600) * duck
place(dry, np.tanh(bass * 1.3) * 0.32, 0)

for bar in range(13):
    b0 = 28 + bar * 4
    root, iv = chord_at(b0)
    pad_chord(b0, 4, root, iv, 0.8)

# one bell per domain, on the downbeat that brings it in
for k, b in enumerate(SYNC["domains"]):
    root, iv = chord_at(b)
    m = root + 24 + iv[k % 3]
    both(bell(mtof(m), 3.0), sec(b), 0.22, 0.25, pan=np.interp(k, [0, 9], [-0.6, 0.6]))

# arpeggio: eighth-note plucks over the chord, from the second domain on
for k, b in enumerate(np.arange(32, 80, 0.5)):
    root, iv = chord_at(b)
    pat = [0, 1, 2, 1, 2, 0, 2, 1]
    m = root + 12 + iv[pat[k % 8]] + (12 if k % 8 in (2, 4) else 0)
    both(pluck(mtof(m), 0.7, bright=0.8), sec(b), 0.07, 0.05, pan=-0.35 if k % 2 else 0.35)

# transitions
for b in (24, 68, 80):
    w = sweep_noise(sec(1.0), 400, 6000, q=0.5)
    both(w, sec(b - 1.0), 0.16, 0.1)

# interface events in the tools scene
for b in SYNC["flip"]:
    place(dry, tick(True), sec(b), 0.35)
    both(bell(mtof(86), 1.5), sec(b), 0.12, 0.12)
for b in SYNC["rows"] + SYNC["feed"]:
    place(dry, tick(False), sec(b), 0.22, pan=0.2)
    both(pluck(mtof(81), 0.6), sec(b), 0.06, 0.06)

# lockup: wide chord, then the last bell
pad_chord(80, 11.5, 50, [0, 3, 7], 1.1, extra=[14, 19])
for b, amp in SYNC["impacts"]:
    both(boom(amp), sec(b), 0.55, 0.3 * amp)
for m, g, p in ((74, 0.45, -0.25), (81, 0.3, 0.25), (86, 0.18, 0.0)):
    both(bell(mtof(m), 6), sec(84), g, 0.4, pan=p)
for k, b in enumerate(np.arange(80, 88, 0.25)):
    m = 74 + [0, 3, 7, 10, 14, 10, 7, 3][k % 8]
    both(pluck(mtof(m), 0.8, bright=1.2), sec(b), 0.04 * (1 - (b - 80) / 8), 0.05, pan=np.sin(k * 0.7) * 0.5)

pad = filt(pad, "lowpass", 1400) * 0.05
pad *= np.where((tk > sec(28)) & (tk < sec(80)), duck, 1.0)
place(dry, np.stack([pad, np.roll(pad, 360)], axis=1), 0)
place(send, np.stack([pad, pad], axis=1), 0, 0.5)

# ---------------- reverb + master ----------------
ir_t = tt(3.2)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))], axis=1) * np.exp(-ir_t * 1.9)[:, None]
ir = filt(ir, "lowpass", 5500)
ir /= np.sqrt((ir ** 2).sum(axis=0))
wet = np.stack([fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
wet = filt(wet, "highpass", 220)

mix = dry + wet * 0.6
mix = filt(mix, "highpass", 26)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
fade0, fade1 = int(sec(89.5) * SR), int(sec(91.8) * SR)
mix[fade0:fade1] *= np.linspace(1, 0, fade1 - fade0)[:, None] ** 1.5
mix[fade1:] = 0
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
mix *= 10 ** (-1 / 20) / (np.max(np.abs(mix)) + 1e-9)

out = DIR / "out" / "audio.wav"
out.parent.mkdir(exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{DUR:.2f}s", "events:", {k: len(v) for k, v in SYNC.items()})
