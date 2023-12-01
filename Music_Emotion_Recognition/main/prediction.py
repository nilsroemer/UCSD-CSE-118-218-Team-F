import os
import torch
import numpy as np
from torch.autograd import Variable
import model as Model
import mp3tonpy as mp3tonpy
import warnings
warnings.filterwarnings("ignore")
os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'

class Predict(object):
    def __init__(self, model_load_path, data_path):
        self.model_load_path = model_load_path
        self.data_path = data_path
        # self.is_cuda = torch.cuda.is_available()

        self.device = torch.device('cpu')
        self.build_model()

    def get_model(self):
        # Define audio segment length
        self.input_length = 73600
        return Model.ShortChunkCNN_Res()

    def build_model(self):
        self.model = self.get_model()

        # load model
        self.load(self.model_load_path)

        model = self.model.to(self.device)

    def load(self, filename):
        S = torch.load(filename, map_location=self.device)
        if 'spec.mel_scale.fb' in S.keys():
            self.model.spec.mel_scale.fb = S['spec.mel_scale.fb']
        self.model.load_state_dict(S)

    def to_var(self, x):
        x = x.to(self.device)
        return Variable(x)

    def get_tensor(self, npy_array):
        x = torch.Tensor(npy_array).unsqueeze(0)
        return x

    def predict(self, music_file):
        self.model.eval()

        # load and preprocess the music file
        x = self.get_tensor(music_file)

        # forward
        x = self.to_var(x)
        out = self.model(x)

        # apply activation function to output logits
        out = torch.sigmoid(out)
        predicted_class_index = np.argmax(out.data.cpu().numpy())
        category = Model.TAGS[predicted_class_index]
        return predicted_class_index, category.split('---')[1]

# Example usage
if __name__ == '__main__':
    model_load_path = 'best_model.pth'
    data_path = ''

    predictor = Predict(model_load_path, data_path)
    music_file = 'The_Deep.mp3'
    transformer = mp3tonpy.Transformer(data_path='../mp3_musics/')
    npy_array = transformer.transform(music_file)
    prediction = predictor.predict(npy_array)
    print('Prediction Index: ', prediction[0])
    print('Prediction Category: ', prediction[1])
