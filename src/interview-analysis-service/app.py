import logging
import os

from api.routes import interview_api
from config import Config
from flask import Flask
from flask_cors import CORS
from utils.nltk_setup import ensure_nltk_resources


def create_app(config_class=Config):
    """
    Factory function to create and configure the Flask application.

    Args:
        config_class: Configuration class for the application.

    Returns:
        Flask application instance.
    """
    # Create Flask app
    app = Flask(__name__)
    CORS(app)

    # Load configuration
    app.config.from_object(config_class)

    # Configure logging
    setup_logging(app)

    # Register blueprints
    app.register_blueprint(interview_api, url_prefix="/api/v1/interview")

    # Ensure temporary upload directory exists
    os.makedirs(Config.TEMPORARY_ARTIFACTS_PATH, exist_ok=True)

    return app


def setup_logging(app):
    """
    Configure application logging.

    Args:
        app: Flask application instance.
    """
    log_level = app.config.get("LOG_LEVEL", "INFO")
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)

    # Set up file handler
    file_handler = logging.FileHandler("logs/interview_analysis.log")
    file_handler.setFormatter(logging.Formatter(log_format))

    # Set up console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format))

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    app.logger.info("Interview Analysis Service started")


# Ensure NLTK resources are available
ensure_nltk_resources()

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 4000)))
