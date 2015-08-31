/* Machine
 * Defines interfaces to talk to docker machine
 */

var spawn = require('child_process').spawn;


var Machine = function (path, name) {
    this.path = path;
    this.name = name;
    this.driver = 'amazonec2';
    this.aws_key = '';
    this.aws_secret = '';
    this.vpc = '';
    this.zone = 'b';
    this.region = '';
};

Machine.prototype.createMachine = function(callback) {
  var self = this;
  this.exists(function(error, flag) {
    if (flag) {
      callback(null, true);
    } else {
      self.create(function (err, output) {
        if (err) { callback(err) }
        else callback(null, output);
      });
    }
  })
};


Machine.prototype.create = function(callback) {
    this.executor(['-D', 'create',
      '--driver', this.driver,
      '--amazonec2-access-key', this.aws_key,
      '--amazonec2-secret-key', this.aws_secret,
      '--amazonec2-vpc-id', this.vpc,
      '--amazonec2-zone', this.zone,
      '--amazonec2-region', this.region,
      this.name], callback);
};

Machine.prototype.start = function(callback) {
    this.executor(['start', this.name], callback);
};

Machine.prototype.stop = function(callback) {
    this.executor(['stop', this.name], callback);
};


Machine.prototype.env = function(callback) {
    this.executor(['env', this.name], callback);
};

Machine.prototype.getEnv = function(callback) {
  var self = this;
  this.getMachineIP(function (error, ip) {
    if (error) { callback(error) }
    else {
      callback(null, {
        DOCKER_TLS_VERIFY : "1",
        DOCKER_HOST : "tcp://" + ip.replace('\n', '') + ":2376",
        DOCKER_CERT_PATH : process.env.HOME + '/.docker/machine/machines/' + self.name,
        DOCKER_MACHINE_NAME : self.name
      });
    }
  });
};

Machine.prototype.exists = function(callback) {
  var self = this;
  this.executor(['ls', '-q'], function(error, machines) {
    if (error) callback(error)
    else {
      var machine_array = machines.split('\n');
      if (machine_array.indexOf(self.name) < 0) {
        callback(null, false);
      } else {
        callback(null, true);
      }
    }
  })
};


Machine.prototype.getMachineIP = function(callback) {
  var self = this;
  this.executor(['ip', this.name], function(err, ip) {
    if (err) {
      callback(err, ip);
    } else {
      self.ip = ip.replace('\n', '');
      callback(null, self.ip);
    }
  });
};

Machine.prototype.executor = function(args, callback) {
  var options = {
    cwd : this.path
  }
  var cmd = spawn('docker-machine', args, options);
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

  cmd.on('close', function (code) {
    console.log('child process exited with code ' + code);
    // callback(output, error);
    if (code) {
      callback(error, output);
    } else {
      callback(null, output);
    }
  });
};




module.exports = Machine;
