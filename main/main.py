from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/login', methods=['GET'])
def index_validation():
    return render_template('login.html')

@app.route('/')
def index_main():
    return render_template('main.html')

@app.route('/process', methods=['POST'])
def process_form():
    username = request.form.get('username')
    password = request.form.get('password')
    
    #проверка ввода (убрать потом)
    print(f"Received username: {username}")
    print(f"Received password: {password}")
    
    if not username or not password:       
        return "aboba", 400 

    return redirect(url_for('index_main'))

if __name__ == "__main__":
    app.run(debug=True)