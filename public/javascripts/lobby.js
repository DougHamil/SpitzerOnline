var gameId;
var game;

function onGameStateUpdate()
{
	updateUI();
}




function beginPoll(gid)
{
	gameId = gid;
	initializeUI();
	poll();
}

function poll()
{
	requestGameState(onGetGameState);

	
	setTimeout(poll, 2000);
}