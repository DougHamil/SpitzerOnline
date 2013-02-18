package game.cards;

public enum  Suit 
{
	DIAMOND(0),
	HEART(1),
	CLUB(2),
	SPADE(3);
	
	private int id;
	
	private Suit(int id)
	{
		this.id = id;
	}
	
	public int getId()
	{
		return this.id;
	}
	
	public static Suit fromId(int id)
	{
		for(Suit suit : Suit.values())
			if(suit.id == id)
				return suit;
		
		return null;
	}
}