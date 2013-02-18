package game.cards;

public enum Rank {
	
	ACE(1),
	TWO(2),
	THREE(3),
	FOUR(4),
	FIVE(5),
	SIX(6),
	SEVEN(7),
	EIGHT(8),
	NINE(9),
	TEN(10),
	JACK(11),
	QUEEN(12),
	KING(13);
	
	private int id;
	
	private Rank(int id)
	{
		this.id = id;
	}
	
	public int getId()
	{
		return this.id;
	}
	
	public static Rank fromId(int id)
	{
		for(Rank face : Rank.values())
			if(face.id == id)
				return face;
		
		return null;
	}
}
