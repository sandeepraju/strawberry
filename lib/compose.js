/* Compose
 * Defines interfaces to talk to docker compose
 */

var spawn = require('child_process').spawn;
// var console.log = require('console.log')('strawberry:compose');

var Compose = function (path) {
  this.path = path;
  this.is_prod = false;
};

Compose.prototype.appendIfProd = function(args) {
  if (this.is_prod) { args = ['-f', 'production.yml'].concat(args) };
  return args;
};

Compose.prototype.setupProdOpts = function(env) {
  this.is_prod = true;
  this.prod_env = env;
};

Compose.prototype.up = function(callback) {
  var args = this.appendIfProd(['up', '-d', 'web']);
  this.executor(args, callback);
};

Compose.prototype.build = function(callback) {
  var args = this.appendIfProd(['build']);
  this.executor(args, callback);
};

Compose.prototype.pull = function(callback) {
  var args = this.appendIfProd(['pull']);
  this.executor(args, callback);
};

Compose.prototype.stop = function(callback) {
  var args = this.appendIfProd(['stop']);
  this.executor(args, callback);
};

Compose.prototype.run = function(servicename, command, callback) {
  console.log('servicename', servicename);
  console.log('command', command);


  var args = ['run', servicename].concat(command.split(' '));
  args = this.appendIfProd(args);
  console.log('args', args);
  this.executor(args, callback)
};

Compose.prototype.executor = function(args, callback) {
  var options = {
    cwd : this.path
  }
  if (this.is_prod) {
    // options.env = this.prod_env;
    options.env = process.env;
    options.env.DOCKER_CERT_PATH = this.prod_env.DOCKER_CERT_PATH;
    options.env.DOCKER_HOST = this.prod_env.DOCKER_HOST;
    options.env.DOCKER_MACHINE_NAME = this.prod_env.DOCKER_MACHINE_NAME;
    options.env.DOCKER_TLS_VERIFY = this.prod_env.DOCKER_TLS_VERIFY;
  };
  console.log('options', options);
  var cmd = spawn('docker-compose', args, options);
  var output = '',
    error = '';

  cmd.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    output += data;
  });

  cmd.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
    error += data;
  });

  cmd.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code) {
      callback(error, output);
    } else {
      callback(null, output);
    }
  });
};




module.exports = Compose;