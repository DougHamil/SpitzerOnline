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