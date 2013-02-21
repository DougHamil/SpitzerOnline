
function setStatusMessage(msg)
{
	ui.statusMessageEl.html(msg);
}

function getPlayerGamePointHistory(userId)
{
	var player = getPlayerByUserId(userId);
	
	var lastPoints = player.gamePointHistory.length > 0 ? player.gamePointHistory[player.gamePointHistory.length - 1] : 0;
	var totalPoints = player.gamePoints;
	
	return {last:lastPoints, total:totalPoints};
}

function getPlayerNameOfTrickCard(trickIndex)
{
	if(game == null || game.trickCardPlayers.length <= trickIndex)
		return "";
	
	var playerId = game.trickCardPlayers[trickIndex];
	return getPlayerByUserId(playerId).name;
}

function isPlayerWinner()
{
	return game.gameWinners.indexOf(game.userId) != -1;
}

function getLastTrickWinnerId()
{
	return game.trickWinnerHistory[game.trickWinnerHistory.length - 1];
}

function getLastTrickPoints()
{
	return game.trickPointHistory[game.trickPointHistory.length - 1];
}

function getNumPlayers()
{
	return game.players.length;
}

function getPlayerHand()
{
	return getPlayer().hand;
}

function getPlayer()
{
	return getPlayerByUserId(game.userId);
}

function getStage()
{
	return Stages[game.stage];
}

function getPublicDeclarationUserId()
{
	return game.declarePlayer;
}

function getCurrentDealerId()
{
	return game.currentDealer;
}

function getCurrentPlayerName()
{
	return getCurrentPlayer().name;
}

function getCurrentPlayerId()
{
	return game.currentPlayer;
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
	return game.publicDeclaration;
}

function getDealerName()
{
	var dealerId = game.currentDealer;
	return getPlayerByUserId(dealerId).name;
}

function getTrickCards()
{
	return game.trickCardsOrdered;
}

function getTrickCardsAsMap()
{
	return game.trickCards;
}

function getCurrentPlayer()
{
	return getPlayerByUserId(game.currentPlayer);
}

function isCurrentPlayer()
{
	return game.currentPlayer == game.userId;
}

function isPlayersTurn()
{
	return getStage() == 'TRICK' && game.userId == game.currentPlayer;
}

function getTrickCardsHistory()
{
	return game.trickCardsHistory || [];
}

function getAllPlayers()
{
	return game.players;
}

function getPlayerByUserId(userId)
{
	for(var player in game.players)
	{
		player = game.players[player];
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
	
	return game.playerCheckins.indexOf(player.userId) != -1;
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
	return game.userId == game.currentDealer;
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
