"""
This script is used to transform mp3 files to npy files (16k HZ).
"""

import os
import numpy as np
import glob
import librosa
import tqdm

class Transformer:
    def __init__(self, data_path, save_path):
        self.sr = 16000
        self.data_path = data_path
        self.save_path = save_path

    def get_paths(self):
        self.mp3_paths = glob.glob(os.path.join(self.data_path, '*.mp3'))
        self.npy_paths = os.path.join(self.save_path, 'npy')

        if not os.path.exists(self.save_path):
            os.makedirs(self.save_path)

    def get_npy(self, fn):
        x, sr = librosa.load(fn, sr=self.sr)
        x = librosa.util.normalize(x)
        return x

    def Transformation(self):
        self.get_paths()
        for fn in tqdm.tqdm(self.mp3_paths):
            output_fn = os.path.join(self.save_path, os.path.basename(fn)[:-4] + '.npy')
            if not os.path.exists(output_fn):
                try:
                    x = self.get_npy(fn)
                    np.save(open(output_fn, 'wb'), x)
                except Exception as e:
                    print(f'Error processing {fn}: {e}')
                    continue

if __name__ == '__main__':
    transformer = Transformer(data_path='./mp3_musics', save_path='./npy')
    transformer.Transformation()
