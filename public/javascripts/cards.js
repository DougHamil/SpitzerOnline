var CardHelper = {
		isTrump:function(rank, suit){
			if(suit == "DIAMONDS")
				return true;
			
			switch(rank)
			{
			case "QUEEN":
			case "JACK":
				return true;
			}
			
			return false;
		},
		getTrumpPriority:function(rank, suit, isTrump)
		{
			if(!isTrump)
				return this.getRankPriority(rank) - 12;
			
			if(rank == "QUEEN" && suit == "CLUBS")
				return 12;
			if(rank == "SEVEN" && suit == "DIAMONDS")
				return 11;
			if(rank == "QUEEN" && suit == "SPADES")
				return 10;
			if(rank == "QUEEN" && suit == "HEARTS")
				return 9;
			if(rank == "QUEEN" && suit == "DIAMONDS")
				return 8;
			if(rank == "JACK" && suit == "CLUBS")
				return 7;
			if(rank == "JACK" && suit == "SPADES")
				return 6;
			if(rank == "JACK" && suit == "HEARTS")
				return 5;
			if(rank == "JACK" && suit == "DIAMONDS")
				return 4;
			if(rank == "ACE" && suit == "DIAMONDS")
				return 3;
			if(rank == "TEN" && suit == "DIAMONDS")
				return 2;
			if(rank == "KING" && suit == "DIAMONDS")
				return 1;
			if(rank == "NINE" && suit == "DIAMONDS")
				return 0;
			if(rank == "EIGHT" && suit == "DIAMONDS")
				return -1;
			
			return -100;
		},
		getRankPriority:function(rank)
		{
			switch(rank)
			{
			case "ACE":
				return 11;
			case "TEN":
				return 10;
			case "KING":
				return 9;
			case "QUEEN":
				return 8;
			case "JACK":
				return 7;
			case "TEN":
				return 6;
			case "NINE":
				return 5;
			case "EIGHT":
				return 4;
			case "SEVEN":
				return 3;
			}
			return 0;
		},
		getPointValue:function(rank)
		{
			switch(rank)
			{
			case "ACE":
				return 11;
			case "TEN":
				return 10;
			case "KING":
				return 4;
			case "QUEEN":
				return 3;
			case "JACK":
				return 2;
			default:
				return 0;
			}
		},
		getSuit:function(card)
		{
			if(!card)
				return null;
			var tokens = card.split("_");
			return tokens[2];
		},
		getRank:function(card)
		{
			if(!card)
				return null;
			
			var tokens = card.split("_");
			
			return tokens[0];
		}
}

function getCardHtml(cardName)
{
	
	if(!cardName)
		return $('<img class="cardImage" src="'+CARD_IMAGE_PATH+'nocard.'+IMAGE_EXTENSION+'"></img>');
	
	return $('<img class="cardImage" card="'+cardName+'" src="'+CARD_IMAGE_PATH+cardName.toLowerCase()+'.'+IMAGE_EXTENSION+'"></img>');
}

function getCardUrl(cardName)
{
	if(!cardName)
		return CARD_IMAGE_PATH+'nocard.'+IMAGE_EXTENSION;
	
	return CARD_IMAGE_PATH+cardName.toLowerCase()+'.'+IMAGE_EXTENSION;
}

