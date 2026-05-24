import logging
import os

import cv2
import numpy as np
import pandas as pd
from fer import FER

logger = logging.getLogger(__name__)


class EmotionDetector:
    def __init__(self, use_gpu=False):
        """
        Initialize the emotion detector.

        Args:
            use_gpu (bool): Whether to use GPU for emotion detection
        """
        # Set environment variable to disable GPU if not using it
        if not use_gpu:
            os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

        # Initialize the FER detector
        self.detector = FER(mtcnn=True)

    def extract_emotions(self, video_path, sample_rate=1):
        """
        Extract emotions from video frames.

        Args:
            video_path (str): Path to the video file
            sample_rate (int): Number of frames to sample per second

        Returns:
            dict: Dictionary of average emotion values
        """
        logger.info(f"Extracting emotions from video: {video_path}")

        try:
            # Load the video
            cap = cv2.VideoCapture(video_path)

            # Check if video opened successfully
            if not cap.isOpened():
                logger.error(f"Failed to open video file: {video_path}")
                raise ValueError(f"Failed to open video file: {video_path}")

            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_interval = int(
                fps / sample_rate
            )  # Extract sample_rate frames per second

            # Create a DataFrame to store emotion values
            columns = ["angry", "fear", "happy", "sad", "surprise", "neutral"]
            emotion_rows = []

            # Process each frame
            frame_count = 0
            processed_frames = 0

            while True:
                ret, frame = cap.read()

                if not ret:
                    break

                if frame_count % frame_interval == 0:
                    # Detect emotions in the frame
                    emotions = self.detector.detect_emotions(frame)

                    # If faces are found, add emotions to the list
                    if emotions:
                        emotion_rows.append(emotions[0]["emotions"])
                    else:
                        # If no faces are found, add default values
                        emotion_rows.append({col: np.nan for col in columns})

                    processed_frames += 1

                frame_count += 1

            # Release video capture
            cap.release()

            # Create DataFrame
            df = pd.DataFrame(emotion_rows, columns=columns) if emotion_rows else pd.DataFrame(columns=columns)

            # Calculate the average emotion values, ignoring NaN values
            avg_emotions = df.mean(skipna=True).fillna(0).to_dict()

            logger.info(f"Extracted emotions from {processed_frames} frames")

            return avg_emotions

        except Exception as e:
            logger.error(f"Error extracting emotions: {str(e)}")
            raise
