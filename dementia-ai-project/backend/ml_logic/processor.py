import librosa
import numpy as np
import os

class AudioProcessor:
    def __init__(self, sample_rate=22050, n_mfcc=40):
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc

    def extract_features(self, file_path):
        """
        Converts raw audio into a numerical feature vector.
        """
        try:
            # 1. Load the audio file
            # Kaiser_fast is used for high-speed processing during real-time API calls
            audio, sr = librosa.load(file_path, sr=self.sample_rate, res_type='kaiser_fast')

            # 2. Extract MFCCs 
            # These represent the 'texture' and 'coherence' of speech
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=self.n_mfcc)
            
            # 3. Normalize the data
            # We take the mean across the time axis so the model gets 
            # a consistent 1D array regardless of how long the user spoke.
            mfccs_scaled = np.mean(mfccs.T, axis=0)
            
            return mfccs_scaled

        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return None

    def get_audio_duration(self, file_path):
        """
        Calculates duration to detect pauses or hesitations (Dementia markers).
        """
        try:
            duration = librosa.get_duration(path=file_path)
            return duration
        except:
            return 0

# Test logic (Optional)
if __name__ == "__main__":
    processor = AudioProcessor()
    # Replace with a real path to test locally
    # print(processor.extract_features("data/raw_audio/test.wav"))