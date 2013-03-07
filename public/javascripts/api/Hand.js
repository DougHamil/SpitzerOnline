function Hand(cards) {
	this.cards = cards;
	this.cards.sort(function(a,b){return a.comparePoints(b);});
	this.get = function(index){
		return this.cards[index];
	};
	this.getValidCards = function() {
		var validCards = [];
		for(var c in this.cards)
		{
			if(this.cards[c].isValid)
				validCards.push(this.cards[c]);
		}
		
		return validCards;
	};
}

function createPlayerHand()
{
	return createHandForPlayer(game.userId);
}

function createHandForPlayer(playerId)
{
	var player = getPlayerData(playerId);
	
	return buildHandFromCardStrings(player.hand, new Player(player), player.validCards);
}

function buildHandFromCardStrings(cardStrings, player, validCards){
	var cards = [];
	
	for(var c in cardStrings)
	{
		cards.push(new Card(cardStrings[c], player, validCards == null ? false : validCards.indexOf(cardStrings[c]) != -1));
	}
	
	return new Hand(cards);
}
