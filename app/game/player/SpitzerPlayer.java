package game.player;

import game.SpitzerDeclaration;
import game.cards.Card;
import game.cards.Cards;

import java.util.List;

import com.google.common.collect.Lists;

public class SpitzerPlayer
{
	public String name;
	public Integer trickPoints;
	public Integer gamePoints;
	public boolean isDealer;
	public Integer userId;
	public Cards hand;
	public Cards capturedCards;
	public List<SpitzerDeclaration> declarations;
	public SpitzerDeclaration activeDeclaration;
	
	public void addCardToHand(Card card)
	{
		if(hand == null)
			hand = new Cards();
		
		hand.add(card);
	}
	
	public void addCardToCaptured(Card card)
	{
		if(capturedCards == null)
			capturedCards = new Cards();
		
		capturedCards.add(card);
	}
	
	@Override
	public boolean equals(Object other)
	{
		if(!(other instanceof SpitzerPlayer))
			return false;
		
		SpitzerPlayer otherPlayer = (SpitzerPlayer)other;
		if(otherPlayer.userId.equals(this.userId))
			return true;
		
		return false;
	}
}
