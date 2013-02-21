package game.cards;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Set;

import javax.annotation.Nullable;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;

public class Cards extends ArrayList<Card> 
{
	private static final ImmutableMap<Card, Integer> CARD_ORDER_PRIORITY = ImmutableMap.<Card, Integer>builder()
			.put(Card.QUEEN_OF_CLUBS, 32)
			.put(Card.SEVEN_OF_DIAMONDS, 31)
			.put(Card.QUEEN_OF_SPADES, 30)
			.put(Card.QUEEN_OF_HEARTS, 29)
			.put(Card.QUEEN_OF_DIAMONDS, 28)
			.put(Card.JACK_OF_CLUBS, 27)
			.put(Card.JACK_OF_SPADES, 26)
			.put(Card.JACK_OF_HEARTS, 25)
			.put(Card.JACK_OF_DIAMONDS, 24)
			.put(Card.ACE_OF_DIAMONDS, 23)
			.put(Card.TEN_OF_DIAMONDS, 22)
			.put(Card.KING_OF_DIAMONDS,21)
			.put(Card.NINE_OF_DIAMONDS, 20)
			.put(Card.EIGHT_OF_DIAMONDS, 19)
			.put(Card.ACE_OF_CLUBS, 18)
			.put(Card.TEN_OF_CLUBS, 17)
			.put(Card.KING_OF_CLUBS, 16)
			.put(Card.NINE_OF_CLUBS, 15)
			.put(Card.EIGHT_OF_CLUBS, 14)
			.put(Card.SEVEN_OF_CLUBS, 13)
			.put(Card.ACE_OF_SPADES, 12)
			.put(Card.TEN_OF_SPADES, 11)
			.put(Card.KING_OF_SPADES, 10)
			.put(Card.NINE_OF_SPADES, 9)
			.put(Card.EIGHT_OF_SPADES, 8)
			.put(Card.SEVEN_OF_SPADES, 7)
			.put(Card.ACE_OF_HEARTS, 6)
			.put(Card.TEN_OF_HEARTS, 5)
			.put(Card.KING_OF_HEARTS, 4)
			.put(Card.NINE_OF_HEARTS, 3)
			.put(Card.EIGHT_OF_HEARTS, 2)
			.put(Card.SEVEN_OF_HEARTS, 1)
			.build();
	
	public Cards(){super();}

	public Cards(Cards other)
	{
		super(other);
	}

	public void orderBySuit()
	{
		PriorityQueue<Card> orderedQueue = new PriorityQueue<Card>(this.size(), new Comparator<Card>(){
			@Override
			public int compare(Card o1, Card o2) {
				return CARD_ORDER_PRIORITY.get(o2).compareTo(CARD_ORDER_PRIORITY.get(o1));
			}
		});
		orderedQueue.addAll(this);
		
		this.clear();
		while(!orderedQueue.isEmpty())
			this.add(orderedQueue.poll());
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
