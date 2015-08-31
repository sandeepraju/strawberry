django-admin startproject web
mv web web.temp
mv web.temp/* .
rm -r web.temp
pip freeze > requirements.txt
pip install -r requirements.txt