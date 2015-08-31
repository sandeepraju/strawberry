var gui = require('nw.gui');
var Strawberry = require('../lib/api');
var index = 0;
var strawberry;

function add_to_stack(name) {
    $("#stack_list").append("<a href='#' class='list-group-item'>" + name + "</a>");
}

function launchStack (name) {
    console.log('Launching stack');

  strawberry = new Strawberry(
      $,
      'test-instance1',
      '/home/shri/projects/strawberry-apps/app-' + name + '/',
      name
  ); // TODO : Remove hardcoded stuffs!!!

  index = index + 1;
    strawberry.setup(function() {
	console.log('DONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

	// update the status in the modal
	   $('#modal_content').html("Your stack was created successfully. See it in action at <br><h2><a onclick='gui.Shell.openExternal(\"http://localhost\")'>localhost</a></h2>");
    })
}

function modal_click_deploy() {
    // deploy the code to your remote cloud (aws / do / etc.)
    $('#modal_content').html("Deploying...<br/><img src=\"../public/img/loader.gif\"/>");
    strawberry.deploy(function(error, ip) {
      // if (error) { console.log('error in deploying', error)};
	console.log('DEPLOYED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	if (ip) {
	    // update the status in the modal
	    $('#modal_content').html("Your stack was deployed successfully at <br><h2><a onclick='gui.Shell.openExternal(\"http://" + ip + "\")'>" + ip+ "</a></h2>");
	} else {
	    // update the status in the modal
	    $('#modal_content').html('Looks like there was some problem deploying your stack.');
	}
    })

}


function cleanup() {
  strawberry.cleanup().then(function() {
    console.log('done with cleanup');
  }, console.log)

}
