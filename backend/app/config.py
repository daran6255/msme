# app\config.py
class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:12345@localhost:5432/msme'  # Replace if needed
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'Grow@wvf123&'

