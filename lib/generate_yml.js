
var config = require('./config');
var executor = require('child_process').exec;

function generateYML(data_input, web_input){
    var db = data_input;
    var web = web_input;
    var db_counter=0;
    var db_yml="";
    for (var i = 0; i < db.length; i++) {
        db_yml=db_yml+"db"+i+":\n"+"  "+"image: "+db[i]+"\n";
    };
    var command = config[web_input.toUpperCase()].command;
    var port = config[web_input.toUpperCase()].port_mapping;
    var web_yml = "web:\n  build: .\n  command: "+command+"\n  volumes:\n    - .:/code\n  ports:\n    - "+port+"\n  links:\n";
    db.forEach(function(element, index, array){
	web_yml=web_yml+"    - db"+index+"\n"
    });
    var final_yml = db_yml+web_yml;
    return final_yml;
}


function generateProdYML(data_input, web_input){
    var db = data_input;
    var web = web_input;
    var db_counter=0;
    var db_yml="";
    for (var i = 0; i < db.length; i++) {
        db_yml=db_yml+"db"+i+":\n"+"  "+"image: "+db[i]+"\n";
    };
    var command = config[web_input.toUpperCase()].command;
    var port = config[web_input.toUpperCase()].port_mapping;
    var web_yml = "web:\n  build: .\n  command: "+command+"\n  ports:\n    - "+port+"\n  links:\n";
    db.forEach(function(element, index, array){
    web_yml=web_yml+"    - db"+index+"\n"
    });
    var final_yml = db_yml+web_yml;
    return final_yml;
}



function copyDockerFile(web_input, path, callback) {
    var path_to_dockerfile = config[web_input.toUpperCase()].dockerfile_name;
    var fs = require('fs');
    // var write_stream = fs.createWriteStream(path + 'Dockerfile');
    // console.log('web_input', web_input);
    // console.log('path', path);
    // console.log('path_to_dockerfile', path_to_dockerfile);
    // fs.createReadStream(path_to_dockerfile).pipe(write_stream);

    // write_stream.on('finish', function(chunk) {
    //     console.log('Wrote all of the file');
    //     callback();
    // });

    // write_stream.on('error', function(err, data) {
    //     console.log('There was an error while copying the docker file to the path specified' + err);
    //     callback(err);
    // });
    var bootstrap_files_path = config[web_input.toUpperCase()].template_folder_path + '*';
    var destination = path

    console.log('bootstrap_files_path', bootstrap_files_path);
    console.log('destination', destination);

    var cmd = executor('cp ' + bootstrap_files_path + ' ' + destination)
    var output, error;

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
}


exports.generateYML = generateYML;
exports.generateProdYML = generateProdYML;
exports.copyDockerFile = copyDockerFile;
