function Trick(cards) {	
	
	// The cards are in the order of play
	this.cards = cards;
	
	this.getHighestPointCard = function(){
		if(this.cards.length == 0)
			return null;
		
		return this.cards.slice(0).sort(function(a,b){return a.comparePoints(b);})[0];
	};
	
	this.getLastCardPlayed = function(){
		if(this.cards.length == 0)
			return null;
		
		return this.cards[this.cards.length - 1];
	};
}

function createTrick()
{
	var cardPlayerPairs = [];
	
	for(var i = 0; i < game.trickCardsOrdered.length; i++)
	{
		var card = game.trickCardsOrdered[i];
		var player = game.trickCardPlayers[i];
		
		cardPlayerPairs.push({cardString:card, player:getPlayerData(player)});
	}
	
	return buildTrickFromCardStrings(cardPlayerPairs);
}

function buildTrickFromCardStrings(cardPlayerPairs)
{
	var cards = [];
	
	for(var c in cardPlayerPairs)
	{
		var pair = cardPlayerPairs[c];
		cards.push(new Card(pair.cardString, pair.player, false));
	}
	
	return new Trick(cards);
}