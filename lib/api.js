var config = require('./config');
var fs = require('fs');
var generator = require('./generate_yml');
var Q = require('q');
var async = require('async');
var mkdirp = require('mkdirp');
var Compose = require('./compose');
var Machine = require('./machine');

var Strawberry = function ($, name, path, stack_name) {
  this.$ = $;
  this.path = path;
  this.name = name;
  this.stack_name = stack_name.toUpperCase();
  this.compose = new Compose(this.path);
  this.machine = new Machine(path, name);
  this.is_deployed = false;
}


Strawberry.prototype.setup = function(done) {
  var self = this;
  this.createDir()
  .then(function () {
    return self.generateComposeFile()
  })
  .then(function() {
    return self.generateProdComposeFile()
  })
  .then(function() {
    return self.generateDockerfile()
  })
  .then(function() {
    return self.buildImages()
  })
  .then(function(output) {
    return self.bootstrap()
  })
  .then(function(output) {
    return self.start()
  })
  .then(function(output) {
    done();
  }, console.log);
};

Strawberry.prototype.createDir = function() {
  var self = this;
  var deferred = Q.defer();
  mkdirp(this.path, function (err) {
    if (err) {
      console.log('Error in mkdir');
      console.error(err);
      deferred.reject(err)
    }
    else {
      console.log('created dir');
      self.$('#modal_content').html("Generated bare bones (1/8)<br/><img src=\"../public/img/loader.gif\"/>");
      deferred.resolve()
    }
  });
  return deferred.promise;
};


Strawberry.prototype.generateComposeFile = function(callback) {
  var self = this;
  var deferred = Q.defer();
  console.log('In generateComposeFile 12');
  var content;
  var abspath
  try {
    content = generator.generateYML(config[this.stack_name].DBs, config[this.stack_name].name);
    console.log('content', content);
    abspath = this.path + 'docker-compose.yml';
  } catch (e) {
    console.log('Error generating compose', e);
    deferred.reject(e);
  }
  console.log(content);
  console.log(abspath);
  fs.writeFile(abspath, content, function(err) {
    if (err) {
      console.log('Error in generateComposeFile')
      console.log(err);
      deferred.reject(err);
    } else {
      self.$('#modal_content').html("Generating configurations for awesomeness (2/8)<br/><img src=\"../public/img/loader.gif\"/>");
      console.log('generated docker-compose');
      deferred.resolve();
    }
  });
  return deferred.promise;
};


Strawberry.prototype.generateProdComposeFile = function(callback) {
  var self = this;
  var deferred = Q.defer();
  console.log('In generateComposeFile 12');
  var content;
  var abspath
  try {
    content = generator.generateProdYML(config[this.stack_name].DBs, config[this.stack_name].name);
    console.log(' prod content', content);
    abspath = this.path + 'production.yml';
  } catch (e) {
    console.log('Error generating prod compose', e);
    deferred.reject(e);
  }
  console.log(content);
  console.log(abspath);
  fs.writeFile(abspath, content, function(err) {
    if (err) {
      console.log('Error in generateComposeFile')
      console.log(err);
      deferred.reject(err);
    } else {
      self.$('#modal_content').html("Generated magicians (3/8)<br/><img src=\"../public/img/loader.gif\"/>");
      console.log('generated docker-compose');
      deferred.resolve();
    }
  });
  return deferred.promise;
};

Strawberry.prototype.generateDockerfile = function(callback) {
  var self = this;
  var deferred = Q.defer();
  console.log('In generateDockerfile');
  generator.copyDockerFile(this.stack_name, this.path, function(err) {
    if (err) {
      console.log('Error in generateDockerfile');
      console.log(err);
      deferred.reject(err);
    } else {
      self.$('#modal_content').html("Generated build config (4/8)<br/><img src=\"../public/img/loader.gif\"/>");
      console.log('generated dockerfile');
      deferred.resolve();
    }
  });
  return deferred.promise;
};

Strawberry.prototype.buildImages = function() {
  var self = this;
  var deferred = Q.defer();
  console.log('In buildImages');
  self.$('#modal_content').html("Building app (5/8)<br/><img src=\"../public/img/loader.gif\"/>");
  this.compose.build(function(err, stdout) {
    if (err) {
      console.log('Error in buildImages');
      console.log(err);
      deferred.reject(err);
    } else {
      console.log(' built Images');
      console.log(stdout);
      deferred.resolve(stdout);
    }
  });
  return deferred.promise;
};

Strawberry.prototype.pullImages = function() {
  var self = this;
  var deferred = Q.defer();
  console.log('In pullImages');
  this.compose.pull(function(err, stdout) {
    if (err) {
      console.log('Error in pullImages');
      console.log(err);
      deferred.reject(err);
    } else {
      console.log(' pulled Images');
      console.log(stdout);
      deferred.resolve(stdout);
    }
  });
  return deferred.promise;
};

Strawberry.prototype.bootstrap = function() {
  var self = this;
  var deferred = Q.defer();
  console.log(config[this.stack_name].bootstrap);

  var bootstrap_command = config[this.stack_name].bootstrap;
  console.log('In bootstrap', bootstrap_command);
  self.$('#modal_content').html("Running initial setup (6/8)<br/><img src=\"../public/img/loader.gif\"/>");

  // async.each(bootstrap_commands, function(command, next) {
  self.compose.run('web', bootstrap_command, function(err, stdout) {
    if (err) {
      console.log('Error in a bootstrap command', err);
      // next(err);
      deferred.reject(err);
    } else {
      console.log('Done executing bootstrap command', bootstrap_command);
      deferred.resolve();
    }
  });
  // }, function(error) {
  //   if (error) {
  //     console.log('Error in bootstrap async');
  //     console.log(error);
  //     deferred.reject(error);
  //   } else {
  //     console.log('successfully bootstrapped');
  //     deferred.resolve();
  //   }
  // });

  return deferred.promise;
};


Strawberry.prototype.start = function() {
  var self = this;
  var deferred = Q.defer();
  console.log('In start');
  self.$('#modal_content').html("Launching app (7/8)<br/><img src=\"../public/img/loader.gif\"/>");

  this.compose.up(function(err, stdout) {
    if (err) {
      console.log('Error in start');
      console.log(err);
      deferred.reject(err);
    } else {
      console.log('successfully start');
      console.log(stdout);
      deferred.resolve(stdout);
    }
  });

  return deferred.promise;
};


Strawberry.prototype.deploy = function(done) {
  var self = this;
  if (this.is_deployed) {
    if (!this.compose.prod_env) {
      self.machine.getEnv(function(error, env) {
        if (error) { done(error, null) }
        else {
          self.compose.setupProdOpts(env);
          self.is_deployed = true;
          self.useProd();
          self.buildImages()
          .then(function () {
            return self.start();
          })
          .then(function () {
            done(null, self.machine.ip);
          }, done);
        }
      });
    } else {
      self.useProd();
      self.buildImages()
      .then(function () {
        return self.start();
      })
      .then(function () {
        done(null, self.machine.ip);
      }, done);
    }
  } else {
    this.machine.createMachine(function (err, success) {
      if (err) {
        done(err, null);
      }
      else if (success) {
        self.machine.getEnv(function(error, env) {
          if (error) { done(error, null) }
          else {
            self.compose.setupProdOpts(env);
            self.is_deployed = true;
            self.useProd();
            self.buildImages()
            .then(function () {
              return self.start();
            })
            .then(function () {
              done(null, self.machine.ip);
            }, done);
          }
        })
      } else {
        done(success, null);
      }
    });
  }
};

Strawberry.prototype.useProd = function() {
  this.compose.is_prod = true;
};

Strawberry.prototype.useLocal = function() {
  this.compose.is_prod = false;
};

Strawberry.prototype.cleanup = function() {
  var self = this;
  var deferred = Q.defer();

  this.useLocal();

  self.compose.stop(function (err, stdout) {
    if (err) {
      console.log('Error in stopping', err);
      // next(err);
      deferred.reject(err);
    } else {
      console.log('Done purging files', stdout);
      self.compose.run("web", "rm -r /code/", function (err2, stdout2) {
        if (err2) {
          console.log('Error in a purging files', err2);
          // next(err);
          deferred.reject(err2);
        } else {
          console.log('Done purging files', stdout2);
          deferred.resolve();
        }
      })
    }
  })

  return deferred.promise;
};


module.exports = Strawberry;
