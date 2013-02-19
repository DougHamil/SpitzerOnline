
function setStatusMessage(msg)
{
	statusMessageEl.html(msg);
}

function getPlayerGamePointHistory(userId)
{
	var player = getPlayerByUserId(userId);
	
	var lastPoints = player.gamePointHistory.length > 0 ? player.gamePointHistory[player.gamePointHistory.length - 1] : 0;
	var totalPoints = player.gamePoints;
	
	return {last:lastPoints, total:totalPoints};
}

function isPlayerWinner()
{
	return game.gameState.gameWinners.indexOf(game.userId) != -1;
}

function setPlayerTooltip(msg, playerId)
{
	var playerId = playerId || getCurrentPlayerId();
	
	if(playerId == undefined || playerId == null)
		return;
	
	playerTooltipEl.html(msg);
	
	// Position the tooltip
	var playerDiv = getPlayerDiv(playerId);
	
	var pos = playerDiv.offset();
	pos.top += playerDiv.height();
	
	playerTooltipEl.show();
	playerTooltipEl.offset(pos);
}

function getLastTrickWinnerId()
{
	return game.gameState.trickWinnerHistory[game.gameState.trickWinnerHistory.length - 1];
}

function getLastTrickPoints()
{
	return game.gameState.trickPointHistory[game.gameState.trickPointHistory.length - 1];
}

function getNumPlayers()
{
	return game.gameState.players.length;
}

function getPlayer()
{
	return getPlayerByUserId(game.userId);
}

function getStage()
{
	return Stages[game.gameState.stage];
}

function getPublicDeclarationUserId()
{
	return game.gameState.declarePlayer;
}

function getCurrentDealerId()
{
	return game.gameState.currentDealer;
}

function getCurrentPlayerId()
{
	return game.gameState.currentPlayer;
}

function getPlayerDiv(playerId)
{
	return $('.player[playerid='+playerId+']');
}

function getPublicDeclarationString()
{
	return getPublicDeclaration();
}

function getPublicDeclaration()
{
	return game.gameState.publicDeclaration;
}

function getDealerName()
{
	var dealerId = game.gameState.currentDealer;
	return getPlayerByUserId(dealerId).name;
}

function getHandChangeSet(current, target)
{
	if(!current)
		return {add:target||[], remove:[]};
	if(!target)
		return {add:[], remove:current||[]};

	var toRemove = [];
	for(var card in current)
	{
		if(target.indexOf(current[card]) == -1)
			toRemove.push(current[card]);
	}

	var toAdd = [];
	for(var card in target)
	{
		if(current.indexOf(target[card]) == -1)
			toAdd.push(target[card]);
	}

	return {add:toAdd, remove:toRemove};
}

function getTrickCards()
{
	var trickCardMap = getTrickCardsAsMap();
	var trickCards = [];
	for(var card in trickCardMap)
	{
		trickCards.push(card);
	}
	return trickCards;
}

function getTrickCardsAsMap()
{
	return game.gameState.trickCards;
}

function getTrickTurnPlayer()
{
	return getPlayerByUserId(game.gameState.currentPlayer);
}

function isPlayersTurn()
{
	return getStage() == 'TRICK' && game.userId == game.gameState.currentPlayer;
}

function getTrickCardsHistory()
{
	return game.gameState.trickCardsHistory || [];
}

function getPlayerByUserId(userId)
{
	for(var player in game.gameState.players)
	{
		player = game.gameState.players[player];
		if(player.userId == userId)
			return player;
	}
	
	return null;
}

function handMatches(hand1, hand2)
{
	if(!hand1 && !hand2)
		return true;
	
	if(!hand1 || !hand2)
		return false;
	
	if(hand2.length > hand1.length)
	{
		var temp = hand1;
		hand1 = hand2;
		hand2 = temp;
	}
	
	for(var c in hand1)
	{
		if(hand2.indexOf(hand1[c]) == -1)
			return false;
	}
	return true;
}

function checkedIn()
{
	var player = getPlayer();
	
	return game.gameState.playerCheckins.indexOf(player.userId) != -1;
}

function getUserByUserId(userId)
{
	for(var player in game.players)
	{
		player = game.players[player];
		if(player.id == userId)
			return player;
	}
	
	return null;
}

function hasDeclarations()
{
	return getPlayer().declarations.length != 0;
}

function isDealer()
{
	return game.userId == game.gameState.currentDealer;
}

function isHost()
{
	return game.userId == game.hostUserId;
}


var Stages = 
{
	"WAITING_FOR_DEAL": "DEAL",
	"DECLARATION" :"DECLARATION",
	"TRICK":"TRICK",
	"WAITING_FOR_PLAYERS":"WAITING_FOR_PLAYERS",
	"POST_TRICK":"POST_TRICK",
	"POST_ROUND":"POST_ROUND",
	"POST_GAME":"POST_GAME"
}
