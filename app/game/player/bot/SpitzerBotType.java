package game.player.bot;

public enum SpitzerBotType {

	BOT_FIRST_CARD("FirstCard", new FirstCardSpitzerBot());
	
	private String name;
	private SpitzerBot bot;
	
	private SpitzerBotType(String name, SpitzerBot bot)
	{
		this.name = name;
		this.bot = bot;
	}
	
	public static SpitzerBot fromName(String name)
	{
		for(SpitzerBotType type : SpitzerBotType.values())
			if(type.name.equals(name))
				return type.bot;
		
		return null;
	}
	
	public static String getNameOfBot(SpitzerBot bot)
	{
		for(SpitzerBotType type : SpitzerBotType.values())
			if(type.bot.equals(bot))
				return type.name;
		
		return null;
	}
}
