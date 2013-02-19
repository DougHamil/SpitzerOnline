package game.cards;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import javax.annotation.Nullable;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.Sets;

public class Cards extends ArrayList<Card> 
{
	public Cards(){super();}

	public Cards(Cards other)
	{
		super(other);
	}

	public boolean hasBothQueens()
	{
		return this.contains(Card.QUEEN_OF_CLUBS) && this.contains(Card.QUEEN_OF_SPADES);
	}
	
	public boolean hasTrump()
	{
		return !getTrumps().isEmpty();
	}
	
	public Collection<Card> getTrumps()
	{
		return Collections2.filter(this, SpitzerDeck.IS_TRUMP);
	}
	
	public boolean hasFailOfSuit(Suit suit)
	{
		return !getFailCardsOfSuit(suit).isEmpty();
	}
	
	public Collection<Suit> getFailSuits()
	{
		Set<Suit> suits = Sets.newHashSet();
		
		for(Card card : this)
		{
			if(SpitzerDeck.IS_FAIL.apply(card))
				suits.add(card.getSuit());
		}
		
		return suits;
	}
	
	public Collection<Card> getTrumpCardsOfSuit(Suit suit)
	{
		return Collections2.filter(getCardsOfSuit(suit), SpitzerDeck.IS_TRUMP);
	}
	
	public Collection<Card> getFailCardsOfSuit(Suit suit)
	{
		return Collections2.filter(getCardsOfSuit(suit), SpitzerDeck.IS_FAIL);
	}
	
	public boolean hasCard(final Rank rank, final Suit suit)
	{
		return !this.getCardsOfRankAndSuit(rank, suit).isEmpty();
	}
	
	public boolean hasCard(Card card)
	{
		return !this.getCardsOfRankAndSuit(card.getRank(), card.getSuit()).isEmpty();
	}
	
	public Collection<Card> getCardsOfRankAndSuit(final Rank rank, final Suit suit)
	{
		return Collections2.filter(this, new Predicate<Card>(){
			@Override
			public boolean apply(Card card)
			{
				return card.getRank().equals(rank) && card.getSuit().equals(suit);
			}
		});
	}
	
	public Collection<Card> getCardsOfSuit(final Suit suit)
	{
		return Collections2.filter(this, new Predicate<Card>(){
			@Override
			public boolean apply(Card card)
			{
				return card.getSuit().equals(suit);
			}
		});
	}
	
	public Collection<Card> getCardsOfRank(final Rank rank)
	{
		return Collections2.filter(this, new Predicate<Card>(){

			@Override
			public boolean apply(@Nullable Card arg0) {
				return arg0.getRank().equals(rank);
			}
		});
	}
	
}
