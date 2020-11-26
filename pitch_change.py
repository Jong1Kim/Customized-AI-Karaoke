import librosa
import wave
import numpy as np
import soundfile as sf
n_steps = +2
# load .wav file you want to change the pitch
y, sr = librosa.load('.../original.wav', sr=16000) # y is a numpy array of the wav file, sr = sample rate
y_shifted = librosa.effects.pitch_shift(y, sr, n_steps) # shifted by 4 half steps
# save .wav file
sf.write('.../pitch_shifted' + str(n_steps) + '.wav', y_shifted, sr)
