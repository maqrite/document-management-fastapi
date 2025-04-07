from flask import Flask
from flask_wtf.csrf import CSRFProtect
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

csrf = CSRFProtect()

app = Flask(__name__)
app.config.from_object(Config)

csrf.init_app(app)

"""
                        для Тёмы 
______________________________________________________________

db = SQLAlchemy(app)
migrate = Migrate(app, db)
______________________________________________________________


    после инициализировать бд в фласке

    $ export FLASK_APP=microblog.py    на винде: set вместо export
    $ flask db init
    $ flask db migrate

    # Сгенерированный сценарий миграции теперь является частью вашего проекта, 
    # и если вы используете git или другой инструмент управления версиями, 
    # eгo необходимо включить в качестве дополнительного исходного файла 
    # вместе co всеми другими файлами, хранящимися в каталоге migrations

    $ flask db upgrade

    также есть flask db downgrade - команда, которая отменяет последнюю миграцию
"""

from app import routes, models