package util;

public enum GameError {
	
	NONE(0, null),
	PLAYER_NOT_DEALER(10, "Only the dealer may deal the cards"),
	GAME_NOT_FULL(11, "The game must be full before dealing."),
	PLAYER_NOT_IN_GAME(12, "You are not currently in this game."),
	GAME_IS_FULL(12, "The game is full."),
	INVALID_GAME_STAGE(13, "Action is not valid for this stage of the game."),
	INVALID_DECLARATION(14, "You are not permitted to make that declaration."),
	INVALID_CARD(15, "You do not have this card in your hand."),
	OUT_OF_TURN(16, "It is not your turn."),
	INVALID_TRICK_PLAY(17, "You cannot play that card in this trick."),
	OUTRANKED_ZOLA(18, "Someone already called Zola.");
	
	private int id;
	private String message;
	private GameError(int id, String message)
	{
		this.id = id;
		this.message = message;
	}
	
	public String getMessage()
	{
		return this.message;
	}
	
	public int getId()
	{
		return this.id;
	}
	
	public boolean isNone()
	{
		return this.equals(GameError.NONE);
	}
	
	public static GameError fromId(int id)
	{
		for(GameError error : GameError.values())
		{
			if(error.getId() == id)
				return error;
		}
		
		return null;
	}
}
