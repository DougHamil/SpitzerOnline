var gameId;
var game;

function onGameStateUpdate()
{
	eventManager.update(game);
}

function beginPoll(gid)
{
	gameId = gid;
	
	ui.init();
	
	poll();
}

function poll()
{
	requestGameState(onGetGameState);
	setTimeout(poll, 2000);
}