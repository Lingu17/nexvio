import logging
import os
import pickle
import statistics

import pandas as pd
import parselmouth
from parselmouth.praat import call
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class PraatFeatureExtractor:
    def __init__(self, pca_model_path=None):
        """
        Initialize the Praat feature extractor.

        Args:
            pca_model_path (str): Path to the PCA model file
        """
        self.pca_model_path = pca_model_path or os.path.join("models", "pca_model.pkl")

    def extract_features(self, audio_path):
        """
        Extract prosodic features from an audio file using Praat.

        Args:
            audio_path (str): Path to the audio file

        Returns:
            dict: Dictionary of extracted prosodic features
        """
        logger.info(f"Extracting Praat features from: {audio_path}")

        try:
            sound = parselmouth.Sound(audio_path)

            # Measure pitch features
            pitch_features = self._measure_pitch(sound, 75, 300, "Hertz")

            # Measure formant features
            formant_features = self._measure_formants(sound, 75, 300)

            # Run PCA on Jitter and Shimmer
            jitter_shimmer_features = {
                "localJitter": pitch_features["localJitter"],
                "localabsoluteJitter": pitch_features["localabsoluteJitter"],
                "rapJitter": pitch_features["rapJitter"],
                "ppq5Jitter": pitch_features["ppq5Jitter"],
                "ddpJitter": pitch_features["ddpJitter"],
                "localShimmer": pitch_features["localShimmer"],
                "localdbShimmer": pitch_features["localdbShimmer"],
                "apq3Shimmer": pitch_features["apq3Shimmer"],
                "apq5Shimmer": pitch_features["apq5Shimmer"],
                "apq11Shimmer": pitch_features["apq11Shimmer"],
                "ddaShimmer": pitch_features["ddaShimmer"],
            }

            pca_features = self._run_pca(jitter_shimmer_features)

            # Calculate vocal-tract length estimates
            vocal_tract_features = self._calculate_vocal_tract_features(
                formant_features
            )

            # Combine all features
            all_features = {}
            all_features.update(pitch_features)
            all_features.update(formant_features)
            all_features.update(pca_features)
            all_features.update(vocal_tract_features)

            return all_features

        except Exception as e:
            logger.error(f"Error extracting Praat features: {str(e)}")
            raise

    def _measure_pitch(self, sound, f0min, f0max, unit):
        """
        Measure pitch-related features using Praat.

        Args:
            sound: Parselmouth Sound object
            f0min (float): Minimum fundamental frequency
            f0max (float): Maximum fundamental frequency
            unit (str): Unit for pitch measurements

        Returns:
            dict: Dictionary of pitch-related features
        """
        # Create a Praat pitch object
        pitch = call(sound, "To Pitch", 0.0, f0min, f0max)

        # Get pitch statistics
        duration = call(sound, "Get total duration")
        meanF0 = call(pitch, "Get mean", 0, 0, unit)
        stdevF0 = call(pitch, "Get standard deviation", 0, 0, unit)

        # Calculate harmonicity
        harmonicity = call(sound, "To Harmonicity (cc)", 0.01, f0min, 0.1, 1.0)
        hnr = call(harmonicity, "Get mean", 0, 0)

        # Calculate jitter
        pointProcess = call(sound, "To PointProcess (periodic, cc)", f0min, f0max)
        localJitter = call(pointProcess, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
        localabsoluteJitter = call(
            pointProcess, "Get jitter (local, absolute)", 0, 0, 0.0001, 0.02, 1.3
        )
        rapJitter = call(pointProcess, "Get jitter (rap)", 0, 0, 0.0001, 0.02, 1.3)
        ppq5Jitter = call(pointProcess, "Get jitter (ppq5)", 0, 0, 0.0001, 0.02, 1.3)
        ddpJitter = call(pointProcess, "Get jitter (ddp)", 0, 0, 0.0001, 0.02, 1.3)

        # Calculate shimmer
        localShimmer = call(
            [sound, pointProcess], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6
        )
        localdbShimmer = call(
            [sound, pointProcess],
            "Get shimmer (local_dB)",
            0,
            0,
            0.0001,
            0.02,
            1.3,
            1.6,
        )
        apq3Shimmer = call(
            [sound, pointProcess], "Get shimmer (apq3)", 0, 0, 0.0001, 0.02, 1.3, 1.6
        )
        apq5Shimmer = call(
            [sound, pointProcess], "Get shimmer (apq5)", 0, 0, 0.0001, 0.02, 1.3, 1.6
        )
        apq11Shimmer = call(
            [sound, pointProcess], "Get shimmer (apq11)", 0, 0, 0.0001, 0.02, 1.3, 1.6
        )
        ddaShimmer = call(
            [sound, pointProcess], "Get shimmer (dda)", 0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        return {
            "duration": duration,
            "meanF0Hz": meanF0,
            "stdevF0Hz": stdevF0,
            "HNR": hnr,
            "localJitter": localJitter,
            "localabsoluteJitter": localabsoluteJitter,
            "rapJitter": rapJitter,
            "ppq5Jitter": ppq5Jitter,
            "ddpJitter": ddpJitter,
            "localShimmer": localShimmer,
            "localdbShimmer": localdbShimmer,
            "apq3Shimmer": apq3Shimmer,
            "apq5Shimmer": apq5Shimmer,
            "apq11Shimmer": apq11Shimmer,
            "ddaShimmer": ddaShimmer,
        }

    def _measure_formants(self, sound, f0min, f0max):
        """
        Measure formant-related features using Praat.

        Args:
            sound: Parselmouth Sound object
            f0min (float): Minimum fundamental frequency
            f0max (float): Maximum fundamental frequency

        Returns:
            dict: Dictionary of formant-related features
        """
        # Create pitch and formant objects
        pitch = call(
            sound,
            "To Pitch (cc)",
            0,
            f0min,
            15,
            "no",
            0.03,
            0.45,
            0.01,
            0.35,
            0.14,
            f0max,
        )
        pointProcess = call(sound, "To PointProcess (periodic, cc)", f0min, f0max)
        formants = call(sound, "To Formant (burg)", 0.0025, 5, 5000, 0.025, 50)

        # Get number of glottal pulses
        numPoints = call(pointProcess, "Get number of points")

        # Initialize formant lists
        f1_list = []
        f2_list = []
        f3_list = []
        f4_list = []

        # Measure formants at each glottal pulse
        for point in range(0, numPoints):
            t = call(pointProcess, "Get time from index", point + 1)
            f1 = call(formants, "Get value at time", 1, t, "Hertz", "Linear")
            f2 = call(formants, "Get value at time", 2, t, "Hertz", "Linear")
            f3 = call(formants, "Get value at time", 3, t, "Hertz", "Linear")
            f4 = call(formants, "Get value at time", 4, t, "Hertz", "Linear")

            # Only add valid formant values
            if str(f1) != "nan":
                f1_list.append(f1)
            if str(f2) != "nan":
                f2_list.append(f2)
            if str(f3) != "nan":
                f3_list.append(f3)
            if str(f4) != "nan":
                f4_list.append(f4)

        # Calculate mean formants
        f1_mean = statistics.mean(f1_list) if f1_list else 0
        f2_mean = statistics.mean(f2_list) if f2_list else 0
        f3_mean = statistics.mean(f3_list) if f3_list else 0
        f4_mean = statistics.mean(f4_list) if f4_list else 0

        # Calculate median formants
        f1_median = statistics.median(f1_list) if f1_list else 0
        f2_median = statistics.median(f2_list) if f2_list else 0
        f3_median = statistics.median(f3_list) if f3_list else 0
        f4_median = statistics.median(f4_list) if f4_list else 0

        return {
            "f1_mean": f1_mean,
            "f2_mean": f2_mean,
            "f3_mean": f3_mean,
            "f4_mean": f4_mean,
            "f1_median": f1_median,
            "f2_median": f2_median,
            "f3_median": f3_median,
            "f4_median": f4_median,
        }

    def _run_pca(self, features):
        """
        Run PCA on Jitter and Shimmer features.

        Args:
            features (dict): Dictionary of jitter and shimmer features

        Returns:
            dict: Dictionary of PCA components
        """
        try:
            # Convert features to DataFrame
            df = pd.DataFrame([features])
            df = df.fillna(0)

            # Define measures for PCA
            measures = [
                "localJitter",
                "localabsoluteJitter",
                "rapJitter",
                "ppq5Jitter",
                "ddpJitter",
                "localShimmer",
                "localdbShimmer",
                "apq3Shimmer",
                "apq5Shimmer",
                "apq11Shimmer",
                "ddaShimmer",
            ]

            # Extract values and standardize
            x = df.loc[:, measures].values
            x = StandardScaler().fit_transform(x)

            # Load PCA model
            if os.path.exists(self.pca_model_path):
                with open(self.pca_model_path, "rb") as f:
                    pca = pickle.load(f)
            else:
                logger.warning(
                    f"PCA model not found at {self.pca_model_path}, using default PCA"
                )
                pca = PCA(n_components=2)
                pca.fit(x)

            # Transform features using PCA
            principal_components = pca.transform(x)

            return {
                "JitterPCA": principal_components[0, 0],
                "ShimmerPCA": principal_components[0, 1],
            }

        except Exception as e:
            logger.error(f"Error in PCA calculation: {str(e)}")
            # Return default values if PCA fails
            return {"JitterPCA": 0, "ShimmerPCA": 0}

    def _calculate_z_score(self, x, mean, std):
        """
        Calculate z-score of a value.

        Args:
            x (float): Input value
            mean (float): Mean value
            std (float): Standard deviation

        Returns:
            float: Z-score
        """
        if std == 0:
            return 0
        return (x - mean) / std

    def _calculate_vocal_tract_features(self, formant_features):
        """
        Calculate vocal-tract length estimates and related features.

        Args:
            formant_features (dict): Dictionary of formant measurements

        Returns:
            dict: Dictionary of vocal tract features
        """
        f1_median = formant_features["f1_median"]
        f2_median = formant_features["f2_median"]
        f3_median = formant_features["f3_median"]
        f4_median = formant_features["f4_median"]

        # Calculate position in the F1-F4 space (z-scored)
        pF = (
            self._calculate_z_score(f1_median, 496.0428522921353, 41.80788949595729)
            + self._calculate_z_score(f2_median, 1626.9758909632872, 89.54888245840672)
            + self._calculate_z_score(f3_median, 2603.7923145976265, 107.64036595614571)
            + self._calculate_z_score(f4_median, 3660.265503495315, 145.75539455320262)
        ) / 4

        # Calculate formant dispersion
        fdisp = (f4_median - f1_median) / 3

        # Calculate average formant
        avgFormant = (f1_median + f2_median + f3_median + f4_median) / 4

        # Calculate mean formant frequency
        mff = (f1_median * f2_median * f3_median * f4_median) ** 0.25

        # Calculate Fitch's estimate of vocal tract length
        fitch_vtl = (
            (1 * (35000 / (4 * f1_median)))
            + (3 * (35000 / (4 * f2_median)))
            + (5 * (35000 / (4 * f3_median)))
            + (7 * (35000 / (4 * f4_median)))
        ) / 4

        # Calculate delta F
        xysum = (
            (0.5 * f1_median)
            + (1.5 * f2_median)
            + (2.5 * f3_median)
            + (3.5 * f4_median)
        )
        xsquaredsum = (0.5**2) + (1.5**2) + (2.5**2) + (3.5**2)
        delta_f = xysum / xsquaredsum

        # Calculate vocal tract length using delta F
        vtl_delta_f = 35000 / (2 * delta_f)

        return {
            "pF": pF,
            "fdisp": fdisp,
            "avgFormant": avgFormant,
            "mff": mff,
            "fitch_vtl": fitch_vtl,
            "delta_f": delta_f,
            "vtl_delta_f": vtl_delta_f,
        }
