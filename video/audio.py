"""Synthesize the soundtrack, beat-locked to scene.js (128 BPM, 72 beats).

Impact times are parsed from scene.js so picture and sound share one source.
Output: out/audio.wav (48 kHz, stereo, 16-bit).
"""
import re
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

DIR = Path(__file__).parent
SR = 48000
BPM = 128
B = 60 / BPM
TOTAL_BEATS = 72
DUR = TOTAL_BEATS * B + 1.5
N = int(DUR * SR)
rng = np.random.default_rng(7)

src = (DIR / "scene.js").read_text()
IMPACTS = [(float(a), float(b)) for a, b in re.findall(r"\[(\d+(?:\.\d+)?), (\.\d+|\d+(?:\.\d+)?)\]", src.split("const IMPACTS = [")[1].split("];")[0])]
TYPE_STR = "> law.compile()"
TYPE_T0, TYPE_DT = 0.3, 0.14

dry = np.zeros((N, 2))
send = np.zeros((N, 2))  # reverb bus


def sec(beat):
    return beat * B


def place(buf, sig, t, gain=1.0, pan=0.0):
    """Add mono or stereo signal at time t (seconds) with constant-power pan."""
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], axis=1) * np.sqrt(2)
    j0 = max(0, -i)
    i0 = max(i, 0)
    n = min(len(sig) - j0, N - i0)
    buf[i0:i0 + n] += sig[j0:j0 + n] * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, f, order=2):
    if isinstance(f, (list, tuple)):
        wn = [v / (SR / 2) for v in f]
    else:
        wn = f / (SR / 2)
    return sosfilt(butter(order, wn, btype=kind, output="sos"), x, axis=0)


def noise(d):
    return rng.standard_normal(int(d * SR))


# ---------------- instruments ----------------
def kick():
    t = tt(0.45)
    f = 44 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = filt(noise(0.45), "highpass", 3000) * np.exp(-t * 300) * 0.35
    return np.tanh((body + click) * 1.6)


def clap():
    t = tt(0.35)
    n = filt(noise(0.35), "bandpass", [900, 4200])
    env = np.exp(-t * 22)
    for k, d in enumerate((0.0, 0.011, 0.022)):
        env += (t >= d) * np.exp(-np.maximum(t - d, 0) * 140) * 0.8
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3
    return n * env * 0.5 + tone


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    t = tt(d)
    return filt(noise(d), "highpass", 7500) * np.exp(-t * (14 if open_ else 90))


def saw(f, t, detune=0.0):
    ph = (f * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def boom(amp):
    t = tt(2.2)
    f = 30 + 70 * np.exp(-t * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    crash = filt(noise(2.2), "lowpass", 5200) * np.exp(-t * 3.2) * 0.45
    hit = filt(noise(2.2), "bandpass", [150, 900]) * np.exp(-t * 18) * 0.8
    return (np.tanh(s * 1.8) * 0.9 + crash + hit) * amp


def click():
    t = tt(0.03)
    return (filt(noise(0.03), "highpass", 4000) * 0.6 + np.sin(2 * np.pi * 2300 * t) * 0.4) * np.exp(-t * 260)


def sweep_noise(d, f0, f1, reverse=False, q=0.35):
    """Band-passed noise whose center frequency sweeps f0 -> f1 (chunked)."""
    n = noise(d)
    out = np.zeros_like(n)
    hop = 1024
    for i in range(0, len(n), hop):
        p = i / len(n)
        fc = f0 * (f1 / f0) ** p
        lo, hi = max(40, fc * (1 - q)), min(SR / 2 - 100, fc * (1 + q))
        out[i:i + hop] = filt(n[max(0, i - 2048):i + hop], "bandpass", [lo, hi])[-len(n[i:i + hop]):]
    env = np.linspace(0, 1, len(n)) ** 2
    out *= env
    return out[::-1] if reverse else out


NOTE = {"A": 57, "F": 53, "C": 60, "G": 55}  # MIDI roots (A3 etc.)
CHORDS = [("A", [0, 3, 7]), ("F", [0, 4, 7]), ("C", [0, 4, 7]), ("G", [0, 4, 7])]


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def chord_at(beat):
    bar = int(np.floor((beat - 4) / 4)) % 4 if beat >= 4 else 0
    root, iv = CHORDS[bar]
    return NOTE[root], iv


# ---------------- arrangement ----------------
kick_times = [b for b in np.arange(4, 61.01, 1.0)] + [62, 62.5, 63] + list(np.arange(64, 70, 1.0))
K = kick()
for b in kick_times:
    place(dry, K, sec(b), 0.95)

C = clap()
for b in list(np.arange(5, 60, 2.0)) + list(np.arange(65, 70, 2.0)):
    place(dry, C, sec(b), 0.42, pan=0.05)
    place(send, C, sec(b), 0.25)
# snare roll build into the break
for k, b in enumerate(np.arange(58, 61.5, 0.25)):
    place(dry, C, sec(b), 0.12 + 0.3 * k / 14, pan=(-0.2 if k % 2 else 0.2))
for b in np.arange(60, 61.5, 0.125):
    place(dry, C, sec(b), 0.35, pan=0.0)

H1, H2 = hat(), hat(True)
for b in np.arange(4, 61.5, 0.5):
    if b % 1 == 0.5:
        place(dry, H2 if int(b) % 4 == 3 else H1, sec(b), 0.22, pan=0.3)
for b in np.arange(12, 61.5, 0.25):
    if b % 0.5 != 0:
        place(dry, H1, sec(b), 0.1 + 0.06 * (b >= 54), pan=-0.35)

# sidechain envelope from kicks
duck = np.ones(N)
tk = np.arange(N) / SR
for b in kick_times:
    t0 = sec(b)
    i0 = int(t0 * SR)
    i1 = min(N, i0 + int(0.4 * SR))
    d = tk[i0:i1] - t0
    duck[i0:i1] = np.minimum(duck[i0:i1], 1 - 0.75 * np.exp(-d / 0.09))

# bass: 8th-note saw + sub
bass = np.zeros(N)
for b in np.arange(4, 61.5, 0.5):
    root, _ = chord_at(b)
    f = mtof(root - 24)
    t = tt(B * 0.5)
    env = np.exp(-t * 7) * (1 - np.exp(-t * 400))
    s = (saw(f, t) * 0.6 + np.sin(2 * np.pi * f / 2 * t) * 0.8) * env
    i = int(sec(b) * SR)
    bass[i:i + len(s)] += s[: N - i]
for b in (62, 64, 66):
    t = tt(B * 2)
    s = np.sin(2 * np.pi * mtof(45 - 12) * t) * np.exp(-t * 1.2)
    i = int(sec(b) * SR)
    bass[i:i + len(s)] += s[: N - i]
bass = filt(bass, "lowpass", 900) * duck
place(dry, np.tanh(bass * 1.5) * 0.55, 0)

# pad: detuned saw chords, filtered, one per bar
pad = np.zeros(N)


def pad_chord(beat0, beats, root, iv, amp):
    t = tt(sec(beats) + 0.3)
    s = np.zeros_like(t)
    for k in iv:
        f = mtof(root + k - 12)
        for dt in (-0.006, 0, 0.007):
            s += saw(f, t, dt)
    env = np.minimum(1, t / 0.08) * np.minimum(1, (t[-1] - t) / 0.3 + 0.001)
    i = int(sec(beat0) * SR)
    n = min(len(s), N - i)
    pad[i:i + n] += (s * env * amp)[:n]


pad_chord(0, 4, 57, [0, 3, 7], 0.5)
for bar in range(14):
    b0 = 4 + bar * 4
    root, iv = CHORDS[bar % 4]
    pad_chord(b0, min(4, 61.5 - b0), NOTE[root], iv, 1.0)
pad_chord(62, 10, 57, [0, 3, 7, 10], 1.1)
pad = filt(pad, "lowpass", 1600) * 0.07
pad *= np.where(tk < sec(61.5), duck, 1.0)
place(dry, np.stack([pad, np.roll(pad, 480)], axis=1), 0)
place(send, np.stack([pad, pad], axis=1), 0, 0.6)

# arp lead: 16ths over chord tones, ping-pong
for k, b in enumerate(np.arange(20, 54, 0.25)):
    root, iv = chord_at(b)
    pat = [0, 1, 2, 1, 2, 0, 2, 1]
    step = k % 8
    note = root + iv[pat[step]] + (12 if step in (2, 4) else 0) + 12
    t = tt(0.16)
    f = mtof(note)
    s = (np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * 2 * t) * 0.3) * np.exp(-t * 26)
    s = filt(s, "lowpass", 3500)
    pan = -0.5 if k % 2 else 0.5
    place(dry, s, sec(b), 0.085, pan)
    place(send, s, sec(b), 0.07, pan)

# typing clicks
for i in range(len(TYPE_STR)):
    place(dry, click(), sec(TYPE_T0 + i * TYPE_DT), 0.5, pan=(i % 3 - 1) * 0.3)

# risers into drops
r1 = sweep_noise(sec(4), 300, 9000)
place(dry, r1, 0, 0.22)
place(send, r1, 0, 0.12)
t = tt(sec(4))
place(dry, np.sin(2 * np.pi * np.cumsum(110 * 2 ** (t / sec(4) * 3)) / SR) * (t / sec(4)) ** 3 * 0.12, 0)
r2 = sweep_noise(sec(61.3 - 55), 200, 12000)
place(dry, r2, sec(55), 0.28)
place(send, r2, sec(55), 0.15)

# whooshes (reverse swells) into transitions
for b in (10, 20, 32, 40, 46, 54):
    w = sweep_noise(sec(0.9), 400, 6000, q=0.5)
    place(dry, w, sec(b - 0.9), 0.3, pan=0.0)
    place(send, w, sec(b - 0.9), 0.15)

# impacts
for b, amp in IMPACTS:
    x = boom(amp)
    place(dry, x, sec(b), 0.8)
    place(send, x, sec(b), 0.35 * amp)

# glitch stutters
for b0, b1 in ((3.6, 4), (9.75, 10.05), (39.6, 40), (45.5, 46), (53.6, 54), (69, 70.6)):
    for k, b in enumerate(np.arange(b0, b1, 0.0625)):
        if rng.random() < 0.55:
            t = tt(0.03)
            f = 200 + rng.random() * 1800
            s = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * np.exp(-t * 60)
            s = np.round(s * 6) / 6
            place(dry, s, sec(b), 0.35, pan=rng.uniform(-0.7, 0.7))

# power-down at the end
t = tt(sec(71.4 - 70.2))
f = 900 * np.exp(-t * 4) + 30
pd = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.35
place(dry, pd, sec(70.2), 1.0)
place(send, pd, sec(70.2), 0.5)

# silence gap before the final drop (b61.5-62), except send tails fade quickly
g0, g1 = int(sec(61.5) * SR), int(sec(62) * SR)
dry[g0:g1] *= np.linspace(1, 0, g1 - g0)[:, None] ** 4
send[g0:g1] *= np.linspace(1, 0, g1 - g0)[:, None] ** 4

# ---------------- reverb + master ----------------
ir_t = tt(2.4)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))], axis=1) * np.exp(-ir_t * 2.6)[:, None]
ir = filt(ir, "lowpass", 6000)
ir /= np.sqrt((ir ** 2).sum(axis=0))
wet = np.stack([fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
wet = filt(wet, "highpass", 250)

mix = dry + wet * 0.55
mix = filt(mix, "highpass", 28)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
# fade tail after the final collapse
end = int(sec(71.6) * SR)
mix[end:] *= np.linspace(1, 0, N - end)[:, None]
mix *= 10 ** (-1 / 20) / (np.max(np.abs(mix)) + 1e-9)

out = DIR / "out" / "audio.wav"
out.parent.mkdir(exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{DUR:.2f}s", "impacts:", len(IMPACTS))
