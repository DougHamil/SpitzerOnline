var gameId;
var game;
var firstPoll = true;

function onGameStateUpdate()
{
	if(firstPoll)
	{
		initializeUI();
		firstPoll = false;
	}
	updateUI();
}

function beginPoll(gid)
{
	gameId = gid;
	
	poll();
}

function poll()
{
	requestGameState(onGetGameState);
	setTimeout(poll, 2000);
}