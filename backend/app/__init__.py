from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import timedelta
import os
from dotenv import load_dotenv

from .database import db
from .extensions import jwt

from .models.candidates import Candidate
from .models.assessment import Assessment
from .models.attendance import Attendance
from .models.business import Business

from .api.candidate import candidate_bp
from .api.attendance import attendance_bp
from .api.assessment import assessment_bp
from .api.business import business_bp


load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config.from_object('app.config.Config')
    app.config['DEBUG'] = True
    app.config['JWT_SECRET_KEY'] = os.environ.get("SECRET_KEY", "supersecretkey")
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

    CORS(app, origins="*", supports_credentials=True)

    # Init extensions
    db.init_app(app)
    Migrate(app, db)
    jwt.init_app(app)

    # Register API Blueprints here
    app.register_blueprint(candidate_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(business_bp)
    # from .api.candidate import candidate_bp
    # app.register_blueprint(candidate_bp)

    return app
