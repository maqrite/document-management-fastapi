from flask import render_template, flash, redirect, url_for
from app import app
from app.forms import LoginForm

@app.route('/')
@app.route('/main')
def main():
    user = {'username': 'artem' } #пока выдуманный пользователь
    return render_template('main.html', title='Home', user=user)

@app.route('/login', methods = ['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash('Login requested for user {}, remember_me={}'.format(   #вывод что приложение успешно получило данные 
        form.username.data, form.remember_me.data))
        return redirect(url_for('main'))
    return render_template('login.html', title='Sign In', form=form)