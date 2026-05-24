import logging
import os
import pickle

import pandas as pd

from config import MEDIANS_PATH, MODEL_PATH, Config
from services.result_interpreter import ResultInterpreter
from utils.emotion import EmotionDetector
from utils.lexical_extraction import LexicalFeatureExtractor
from utils.praat_extraction import PraatFeatureExtractor
from utils.speech_to_text import TranscriptionService

# Configure logging
logger = logging.getLogger(__name__)


class PredictionService:
    """Service for making predictions on interview videos."""

    def __init__(self):
        """
        Initialize the prediction service by loading the model.
        """
        try:
            self.model = self._load_model()
            self.medians = self._load_medians()
            self.transcript_service = TranscriptionService(Config.ASSEMBLYAI_API_KEY)
            self.lexical_feature_extractor = LexicalFeatureExtractor()
            self.praat_feature_extractor = PraatFeatureExtractor()
            self.emotion_detector = EmotionDetector()
            logger.info("Prediction service initialized successfully")
        except Exception as e:
            logger.exception(f"Failed to initialize prediction service: {str(e)}")
            raise

    def _load_model(self):
        """
        Load the machine learning model.
        """
        model_path = os.path.join(MODEL_PATH, "model_custom.pkl")
        try:
            logger.info(f"Loading model from: {model_path}")
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            return model
        except FileNotFoundError:
            logger.error(f"Model file not found at: {model_path}")
            raise
        except Exception as e:
            logger.exception(f"Error loading model: {str(e)}")
            raise

    def _load_medians(self):
        """
        Load the median values for classification.
        """
        try:
            return pd.read_csv(MEDIANS_PATH)
        except FileNotFoundError:
            logger.error(f"Medians file not found at: {MEDIANS_PATH}")
            raise
        except Exception as e:
            logger.exception(f"Error loading medians: {str(e)}")
            raise

    def predict(self, video_path):
        """
        Make a prediction based on a video file.

        Args:
            video_path (str): Path to the video file.

        Returns:
            dict: Dictionary of classification results.
        """
        try:
            logger.info(f"Starting prediction for video: {video_path}")

            # Transcribe video
            logger.info("Transcribing video...")
            transcript, audio_file_path = self.transcript_service.transcribe_video_file(
                video_path
            )

            # Extract features
            logger.info("Extracting lexical features...")
            lexical_features_dict = self.lexical_feature_extractor.extract_features(
                transcript
            )

            logger.info("Extracting prosodic features...")
            prosodic_features_dict = self.praat_feature_extractor.extract_features(
                audio_file_path
            )

            # Cleanup temporary audio file
            if os.path.exists(audio_file_path):
                os.remove(audio_file_path)

            logger.info("Extracting emotion features...")
            emotions_dict = self.emotion_detector.extract_emotions(video_path)

            # Combine features
            lexical_features_dict.update(prosodic_features_dict)
            lexical_features_dict.update(emotions_dict)

            # Create DataFrame for prediction
            df = pd.DataFrame([lexical_features_dict])
            df = df.fillna(0)

            # Make prediction
            logger.info("Making prediction...")
            prediction = self.model.predict(df)

            # Map predictions to labels
            prediction_labels = [
                "Excited",
                "Paused",
                "EngagingTone",
                "Calm",
                "NoFillers",
            ]
            prediction_dict = dict(zip(prediction_labels, prediction[0]))

            result_interpreter = ResultInterpreter()
            result = result_interpreter.interpret(prediction_dict)

            logger.info("Prediction completed successfully")
            return result

        except Exception as e:
            logger.exception(f"Error in prediction process: {str(e)}")
            raise

    def get_tips(self, label):
        """
        Get tips for improving a specific aspect of interview performance.

        Args:
            label (str): The aspect to get tips for.

        Returns:
            list: A list of tips.
        """
        tips = {
            "Engaged": [
                "Maintain eye contact with the camera to convey attentiveness and interest.",
                "Use positive body language to express enthusiasm and engagement.",
                "Ask thoughtful questions and actively listen to the interviewer's prompts.",
            ],
            "EyeContact": [
                "Focus on looking directly into the camera for a virtual interview.",
                "Avoid excessive staring at notes or distractions in the room.",
                "Practice a balance between maintaining eye contact and natural blinking.",
            ],
            "Smiled": [
                "Smile naturally and periodically throughout the interview.",
                "Practice a friendly and approachable facial expression.",
                "Be mindful of not appearing overly serious or expressionless.",
            ],
            "Excited": [
                "Express genuine enthusiasm and excitement about the opportunity.",
                "Use positive and energetic language to convey your interest in the role.",
                "Share specific reasons why you are excited about the prospect of joining the company.",
            ],
            "SpeakingRate": [
                "Speak at a moderate pace to ensure clarity and comprehension.",
                "Practice using pauses strategically to emphasize key points.",
                "Avoid speaking too rapidly, which can be challenging for the interviewer to follow.",
            ],
            "NoFillers": [
                "Minimize the use of filler words such as 'um,' 'uh,' or 'like.'",
                "Practice pausing instead of using fillers to gather thoughts.",
                "Consciously focus on speaking with clarity and precision.",
            ],
            "Friendly": [
                "Project a warm and approachable tone throughout the conversation.",
                "Use positive language and expressions to convey friendliness.",
                "Express genuine interest in the role and the company.",
            ],
            "Paused": [
                "Use strategic pauses to allow the interviewer to process information.",
                "Avoid rushing through responses; take your time to formulate answers.",
                "Pausing can convey thoughtfulness and professionalism.",
            ],
            "EngagingTone": [
                "Vary your tone to add emphasis and interest to your responses.",
                "Avoid a monotonous voice by incorporating changes in pitch and intonation.",
                "Practice conveying enthusiasm and passion through your tone.",
            ],
            "StructuredAnswers": [
                "Organize your responses with a clear introduction, body, and conclusion.",
                "Use examples and anecdotes to illustrate your points.",
                "Practice concise and focused answers to showcase your communication skills.",
            ],
            "Calm": [
                "Practice mindfulness techniques to stay calm and composed.",
                "Breathe deeply to manage nervousness and stress.",
                "Remember that it's okay to take a moment to collect your thoughts.",
            ],
            "NotStressed": [
                "Prioritize self-care before the interview to reduce stress levels.",
                "Prepare thoroughly to build confidence in your knowledge and abilities.",
                "Focus on the present moment and the opportunity to showcase your skills.",
            ],
            "Focused": [
                "Demonstrate active listening by fully engaging with the interviewer's questions.",
                "Maintain a clear and concise focus on relevant details in your responses.",
                "Avoid distractions and stay present throughout the interview.",
            ],
            "NotAwkward": [
                "Practice common interview scenarios to build confidence.",
                "Maintain professional and confident body language.",
                "Remember that it's okay to acknowledge nerves and redirect them into positive energy.",
            ],
        }

        return tips.get(label, [])
