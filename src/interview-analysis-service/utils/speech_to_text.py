import logging
import os
import shutil
import subprocess

import assemblyai as aai
from config import Config
from moviepy.editor import AudioFileClip, VideoFileClip

logger = logging.getLogger(__name__)


class TranscriptionService:
    def __init__(self, api_key):
        """
        Initialize the transcription service with the provided API key.

        Args:
            api_key (str): The AssemblyAI API key
        """
        self.api_key = api_key
        aai.settings.api_key = api_key

    def transcribe_video_file(self, video_file_path):
        """
        Transcribe audio from a video file.

        Args:
            video_file_path (str): Path to the video file

        Returns:
            tuple[str, str]: [Transcribed text from the video, audio path]
        """
        logger.info(f"Transcribing video file: {video_file_path}")

        try:
            # Extract audio from video
            audio_path = self._extract_audio_from_video(video_file_path)

            # Transcribe the audio
            transcriber = aai.Transcriber()
            config = aai.TranscriptionConfig(
                speech_models=["universal-2"]
            )
            transcript = transcriber.transcribe(
                audio_path,
                config=config,
            )

            return (transcript.text, audio_path)

        except Exception as e:
            logger.error(f"Error transcribing video: {str(e)}")
            raise

    def _extract_audio_from_video(self, video_path):
        """
        Extract audio from video file and save as WAV.

        Args:
            video_path (str): Path to the video file

        Returns:
            str: Path to the extracted audio file
        """
        try:
            os.makedirs(Config.TEMPORARY_ARTIFACTS_PATH, exist_ok=True)

            if not os.path.exists(video_path):
                raise RuntimeError(f"Uploaded video file not found: {video_path}")

            file_size = os.path.getsize(video_path)
            if file_size == 0:
                raise RuntimeError(f"Uploaded video file is empty: {video_path}")

            # Create a unique filename using the original filename plus a timestamp
            filename = os.path.basename(video_path)
            base_name = os.path.splitext(filename)[0]
            audio_path = os.path.join(
                Config.TEMPORARY_ARTIFACTS_PATH, f"temp_{base_name}.wav"
            )

            extraction_errors = []

            try:
                self._extract_audio_with_ffmpeg(video_path, audio_path)
            except Exception as ffmpeg_error:
                extraction_errors.append(f"ffmpeg extraction failed: {ffmpeg_error}")
                logger.warning(
                    "Direct ffmpeg extraction failed for %s. Falling back to moviepy. Error: %s",
                    video_path,
                    ffmpeg_error,
                )

                try:
                    self._extract_audio_with_moviepy(video_path, audio_path)
                except Exception as moviepy_error:
                    extraction_errors.append(
                        f"moviepy extraction failed: {moviepy_error}"
                    )
                    raise RuntimeError(" | ".join(extraction_errors))

            if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
                raise RuntimeError(
                    "Audio extraction completed without creating a valid WAV file."
                )

            return audio_path

        except Exception as e:
            logger.error(f"Error extracting audio: {str(e)}")
            raise

    def _extract_audio_with_ffmpeg(self, video_path, audio_path):
        ffmpeg_path = self._resolve_ffmpeg_binary()
        command = [
            ffmpeg_path,
            "-y",
            "-i",
            video_path,
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "16000",
            "-ac",
            "1",
            audio_path,
        ]

        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
        )

        if result.returncode != 0:
            error_output = self._decode_process_output(result.stderr, result.stdout)
            raise RuntimeError(
                "ffmpeg failed to extract audio from the uploaded video. "
                f"Command: {' '.join(command)}. Output: {error_output}"
            )

    def _extract_audio_with_moviepy(self, video_path, audio_path):
        video_clip = None
        audio_clip = None
        try:
            video_clip = VideoFileClip(video_path)
            if video_clip.audio is None:
                raise RuntimeError("The uploaded video does not contain an audio stream.")

            audio_clip = video_clip.audio
            audio_clip.write_audiofile(
                audio_path,
                fps=16000,
                nbytes=2,
                codec="pcm_s16le",
                ffmpeg_params=["-ac", "1"],
                logger=None,
            )
        finally:
            if audio_clip is not None:
                audio_clip.close()
            if video_clip is not None:
                video_clip.close()

    def _decode_process_output(self, stderr_bytes, stdout_bytes):
        output_chunks = []
        for chunk in (stderr_bytes, stdout_bytes):
            if not chunk:
                continue
            decoded = chunk.decode("utf-8", errors="replace").strip()
            if decoded:
                output_chunks.append(decoded)

        return " | ".join(output_chunks) if output_chunks else "No process output captured."

    def _resolve_ffmpeg_binary(self):
        """
        Resolve the ffmpeg executable path from the current environment.

        Returns:
            str: Path or executable name for ffmpeg
        """
        try:
            import imageio_ffmpeg

            return imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            pass

        ffmpeg_path = shutil.which("ffmpeg") or shutil.which("ffmpeg.exe")
        if ffmpeg_path:
            return ffmpeg_path

        raise RuntimeError(
            "ffmpeg executable was not found in PATH. Install ffmpeg in the active "
            "environment and restart the backend process."
        )
