var bot = {
		/*
		playCard:function(validCards)
		{
			return validCards.shift();
		}
		*/
}

var botCodeMirror;
function initBotEditor()
{
	return;
	botCodeMirror = CodeMirror.fromTextArea($("#botEditorTab").get(0), 
			{
				value:"Test this is a test",
				mode:"javascript",
				lineNumbers:true,
				height:"700px",
				width:"500px"
			});
	//codeMirror.refresh();
	
	//$("#botEditorTab").show();
	
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