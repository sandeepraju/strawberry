module.exports = {
  DJANGO : {
    name : 'DJANGO',
    bootstrap : '/bin/bash setup.sh',
    template_folder_path : process.env.HOME + '/projects/strawberry/templates/django/',
    command : 'python manage.py runserver 0.0.0.0:8000',
    port_mapping : '80:8000',
    DBs : ['postgres', 'redis']
  },
  NODEJS : {
    name : 'NODEJS',
    bootstrap : '/bin/bash setup.sh',
    template_folder_path : process.env.HOME + '/projects/strawberry/templates/nodejs/',
    command : 'npm start',
    port_mapping : '80:3000',
    DBs : ['postgres', 'redis']
  },
  RAILS : {
    name : 'RAILS',
    bootstrap : ['rails new .', 'bundle install'],
    template_folder_path : 'templates/rails/',
    command : 'bundle exec rails s -p 3000 -b 0.0.0.0',
    port_mapping : '80:3000',
    DBs : ['mysql', 'redis']
  }
}