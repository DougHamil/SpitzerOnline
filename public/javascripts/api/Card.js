function Card(cardString, player, isValid) {
	this.isValid = isValid;
	this.enum = cardString;
	this.player = player;
	this.rank = CardHelper.getRank(cardString);
	this.rankPriority = CardHelper.getRankPriority(this.rank);
	this.suit = CardHelper.getSuit(cardString);
	this.isTrump = CardHelper.isTrump(this.rank, this.suit);
	this.trumpPriority = CardHelper.getTrumpPriority(this.rank, this.suit, this.isTrump);		
	this.pointValue = CardHelper.getPointValue(this.rank);
	
	this.comparePoints = function(that) {
		return this.pointValue - that.pointValue;
	};
	
	this.compareTrumpOrder = function(that){
		if(this.isTrump && !that.isTrump)
			return 1;
		if(that.isTrump && !this.isTrump)
			return -1;
		if(this.isTrump && that.isTrump)
			return this.compareRank(that)
	};
	
	this.compareRank = function(that){
		return this.rankPriority - that.rankPriority;
	}
}