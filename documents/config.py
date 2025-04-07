import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'Tema-Tema-Kostya-documenti-v-norme'

CSRF_ENABLED = True  #активирует предотвращение поддельных межсайтовых запросов

"""
                        для Тёмы 
______________________________________________________________
SQLALCHEMY_DATABASE_URL = os.environ.get('DATABASE_URL') or \
'sqlite:///' + os.path.join(basedir, 'app.db') 

#имя бд которая хранится в basedir - app.db 

"""