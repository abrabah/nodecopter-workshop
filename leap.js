var Leap = require('leapjs');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var hasTakenOff = false;
var hasExecutedCmd = false;
var c = 0;

var bounds = {
	up: 200,
	down: 100,
	left: -50,
	right: 50
};

var executeCmd = function(cmd, speed) {
	console.log(cmd);
	client[cmd](0.2);
	hasExecutedCmd = true;
}

var processFrame = function(frame){
  
  hasExecutedCmd = false;
  var hands = frame.hands.length;
  var fingers = frame.pointables.length;

  if (hands === 1 && !hasTakenOff) {
  	hasTakenOff = true;
  	console.log("Takeoff");
  	client.takeoff();
  }

  else if (hands === 1 && hasTakenOff) {

  	var x = frame.hands[0].palmPosition[0];
  	var y = frame.hands[0].palmPosition[1];

  	if (x > bounds.right) {
  		executeCmd("clockwise");
  	} else if (x < bounds.left) {
  		executeCmd("counterClockwise");
  	} 

  	if (y > bounds.up) {
  		executeCmd("up");
  	} else if (y < bounds.down) {
  		executeCmd("down");
  	}

  	if (!hasExecutedCmd) {
  		console.log("stop");
  		client.stop();
  	}
  }
}

var safetyThrottle = function(frame){
  var hands = frame.hands.length;
  var fingers = frame.pointables.length;

  if (hands === 0 && hasTakenOff) {
	console.log("Land");
  	client.land();
  	hasTakenOff = false;
  }
  	if (c<30)  {
		c++;
		return;
	} else {
		c = 0;
		processFrame(frame);
	}
}

new Leap.Controller({
    frameEventName: 'deviceFrame',
    enableGestures: true
  })
  .on('frame', safetyThrottle)
  .connect();

