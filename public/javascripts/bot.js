function saveBot()
{
	var text = ui.aiEditorCodeMirror.getValue();
	
	eval("bot = "+text);
}

var bot = {
		playCard:function(validCards)
		{
			console.log(validCards);
			return validCards.shift();
		}
}

function botHasPlayCard()
{
	return bot && bot.playCard;
}

function getBotTrickCards()
{
	// Return a card object with a player
	var players = [];
	for(var i in game.trickCardPlayers)
	{
		players.push(getPlayerByUserId(game.trickCardPlayers[i]));
	}
	
	var cardPlayerPairs = [];
	for(var c in game.trickCardsOrdered)
	{
		var cardPlayerPair = {card:game.trickCardsOrdered[c], player:players.shift()};
		cardPlayerPairs.push(cardPlayerPair);
	}
	return cardPlayerPairs;
}