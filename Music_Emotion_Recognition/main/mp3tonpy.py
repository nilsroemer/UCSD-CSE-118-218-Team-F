import os
import numpy as np
import librosa
import tqdm

class Transformer:
    def __init__(self, data_path):
        self.sr = 16000
        self.data_path = data_path

    def get_npy(self, fn):
        x, sr = librosa.load(fn, sr=self.sr)
        # x = librosa.util.normalize(x)
        return x

    def transform(self, music_file):
        music_path = os.path.join(self.data_path, music_file)
        if os.path.exists(music_path):
            try:
                x = self.get_npy(music_path)
                return x
            except Exception as e:
                print(f'Error processing {music_path}: {e}')
        else:
            print(f"File not found: {music_path}")
            return None