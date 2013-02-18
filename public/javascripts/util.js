
function setStatusMessage(msg)
{
	$("#statusMessage").html(msg);
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

function getDealerName()
{
	var dealerId = game.gameState.currentDealer;
	return getPlayerByUserId(dealerId).name;
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
	return getPlayerByUserId(game.gameState.trickTurnPlayer);
}

function isPlayersTurn()
{
	return getStage() == 'TRICK' && game.userId == game.gameState.trickTurnPlayer;
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
	"POST_TRICK":"POST_TRICK"
}