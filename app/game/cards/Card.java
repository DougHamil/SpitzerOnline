package game.cards;

import java.util.Collection;
import java.util.List;

import com.google.common.collect.Lists;

public enum Card {
	
	// Diamonds
	ACE_OF_DIAMONDS(0, Suit.DIAMOND, Rank.ACE),
	TWO_OF_DIAMONDS(1, Suit.DIAMOND, Rank.TWO),
	THREE_OF_DIAMONDS(2, Suit.DIAMOND, Rank.THREE),
	FOUR_OF_DIAMONDS(3, Suit.DIAMOND, Rank.FOUR),
	FIVE_OF_DIAMONDS(4, Suit.DIAMOND, Rank.FIVE),
	SIX_OF_DIAMONDS(5, Suit.DIAMOND, Rank.SIX),
	SEVEN_OF_DIAMONDS(6, Suit.DIAMOND, Rank.SEVEN),
	EIGHT_OF_DIAMONDS(7, Suit.DIAMOND, Rank.EIGHT),
	NINE_OF_DIAMONDS(8, Suit.DIAMOND, Rank.NINE),
	TEN_OF_DIAMONDS(9, Suit.DIAMOND, Rank.TEN),
	JACK_OF_DIAMONDS(10, Suit.DIAMOND, Rank.JACK),
	QUEEN_OF_DIAMONDS(11, Suit.DIAMOND, Rank.QUEEN),
	KING_OF_DIAMONDS(12, Suit.DIAMOND, Rank.KING),
	
	// Hearts
	ACE_OF_HEARTS(13, Suit.HEART, Rank.ACE),
	TWO_OF_HEARTS(14, Suit.HEART, Rank.TWO),
	THREE_OF_HEARTS(15, Suit.HEART, Rank.THREE),
	FOUR_OF_HEARTS(16, Suit.HEART, Rank.FOUR),
	FIVE_OF_HEARTS(17, Suit.HEART, Rank.FIVE),
	SIX_OF_HEARTS(18, Suit.HEART, Rank.SIX),
	SEVEN_OF_HEARTS(19, Suit.HEART, Rank.SEVEN),
	EIGHT_OF_HEARTS(20, Suit.HEART, Rank.EIGHT),
	NINE_OF_HEARTS(21, Suit.HEART, Rank.NINE),
	TEN_OF_HEARTS(22, Suit.HEART, Rank.TEN),
	JACK_OF_HEARTS(23, Suit.HEART, Rank.JACK),
	QUEEN_OF_HEARTS(24, Suit.HEART, Rank.QUEEN),
	KING_OF_HEARTS(25, Suit.HEART, Rank.KING),
	
	// Spades
	ACE_OF_SPADES(26, Suit.SPADE, Rank.ACE),
	TWO_OF_SPADES(27, Suit.SPADE, Rank.TWO),
	THREE_OF_SPADES(28, Suit.SPADE, Rank.THREE),
	FOUR_OF_SPADES(29, Suit.SPADE, Rank.FOUR),
	FIVE_OF_SPADES(30, Suit.SPADE, Rank.FIVE),
	SIX_OF_SPADES(31, Suit.SPADE, Rank.SIX),
	SEVEN_OF_SPADES(32, Suit.SPADE, Rank.SEVEN),
	EIGHT_OF_SPADES(33, Suit.SPADE, Rank.EIGHT),
	NINE_OF_SPADES(34, Suit.SPADE, Rank.NINE),
	TEN_OF_SPADES(35, Suit.SPADE, Rank.TEN),
	JACK_OF_SPADES(36, Suit.SPADE, Rank.JACK),
	QUEEN_OF_SPADES(37, Suit.SPADE, Rank.QUEEN),
	KING_OF_SPADES(38, Suit.SPADE, Rank.KING),
	
	// Clubs
	ACE_OF_CLUBS(39, Suit.CLUB, Rank.ACE),
	TWO_OF_CLUBS(40, Suit.CLUB, Rank.TWO),
	THREE_OF_CLUBS(41, Suit.CLUB, Rank.THREE),
	FOUR_OF_CLUBS(42, Suit.CLUB, Rank.FOUR),
	FIVE_OF_CLUBS(43, Suit.CLUB, Rank.FIVE),
	SIX_OF_CLUBS(44, Suit.CLUB, Rank.SIX),
	SEVEN_OF_CLUBS(45, Suit.CLUB, Rank.SEVEN),
	EIGHT_OF_CLUBS(46, Suit.CLUB, Rank.EIGHT),
	NINE_OF_CLUBS(47, Suit.CLUB, Rank.NINE),
	TEN_OF_CLUBS(48, Suit.CLUB, Rank.TEN),
	JACK_OF_CLUBS(49, Suit.CLUB, Rank.JACK),
	QUEEN_OF_CLUBS(50, Suit.CLUB, Rank.QUEEN),
	KING_OF_CLUBS(51, Suit.CLUB, Rank.KING);
	
	private Suit suit;
	private Rank face;
	private int id;
	
	private Card(int id, Suit suit, Rank face)
	{
		this.id = id;
		this.suit = suit;
		this.face = face;
	}
	
	public int getId()
	{
		return id;
	}
	
	public Suit getSuit()
	{
		return suit;
	}
	
	public Rank getRank()
	{
		return face;
	}
	
	public static List<Card> getCardsOfRank(Rank face)
	{
		List<Card> cards = Lists.newArrayList();
		for(Card card : Card.values())
		{
			if(card.face.equals(face))
				cards.add(card);
		}
		
		return cards;
	}
	
	public static List<Card> getAces()
	{
		return Lists.newArrayList(Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.ACE_OF_HEARTS, Card.ACE_OF_SPADES);
	}
	
	public static List<Card> getRange(Rank startFace, Rank endFace, Suit suit)
	{
		List<Card> cardRange = Lists.newArrayList();
		Rank curFace = startFace;
		while(curFace != null && curFace.getId() <= endFace.getId())
		{
			cardRange.add(fromRankAndSuit(curFace, suit));
			curFace = Rank.fromId(curFace.getId() + 1);
		}
		
		return cardRange;
	}
	
	public static Card fromRankAndSuit(Rank face, Suit suit)
	{
		for(Card card: Card.values())
		{
			if(card.face.equals(face) && card.suit.equals(suit))
				return card;
		}
		
		return null;
	}
	
	public static Card fromId(int id)
	{
		for(Card card : Card.values())
			if(card.getId() == id)
				return card;
		
		return null;
	}
}
