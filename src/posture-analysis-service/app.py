import os

from api.routes import posture_bp
from config import get_config
from flask import Flask
from flask_cors import CORS


def create_app(config_obj=None):
    """
    Create and configure the Flask application.

    Args:
        config_obj: Configuration object to use

    Returns:
        Flask application instance
    """
    # Create Flask app
    app = Flask(__name__)
    CORS(app)

    # Load configuration
    if config_obj is None:
        app.config.from_object(get_config())
    else:
        app.config.from_object(config_obj)

    # Register blueprints
    app.register_blueprint(posture_bp)

    # Create upload folder if it doesn't exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
