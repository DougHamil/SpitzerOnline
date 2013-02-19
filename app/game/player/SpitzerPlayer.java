package game.player;

import game.SpitzerDeclaration;
import game.cards.Card;
import game.cards.Cards;

import java.util.List;

import com.google.common.collect.Lists;

public class SpitzerPlayer
{
	public String name;
	public Integer trickPoints = 0;
	public Integer gamePoints = 0;
	public boolean isDealer;
	public Integer userId;
	public Cards hand;
	public List<SpitzerDeclaration> declarations;
	public List<Integer> gamePointHistory = Lists.newArrayList();
	public SpitzerDeclaration activeDeclaration;
	
	// This method is called when this player is not the active player
	// Remove all information that could be used to cheat
	public void sanitize()
	{
		this.hand = null;
		this.declarations = null;
		this.activeDeclaration = null;
	}
	
	public void grantGamePoints(Integer points)
	{
		this.gamePointHistory.add(this.gamePoints);
		this.gamePoints += points;
	}
	
	public void addCardToHand(Card card)
	{
		if(hand == null)
			hand = new Cards();
		
		hand.add(card);
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
