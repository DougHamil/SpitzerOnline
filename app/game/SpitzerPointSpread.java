package game;

import game.player.SpitzerPlayer;
import game.player.SpitzerPlayers;

import java.util.List;
import java.util.Set;

public enum SpitzerPointSpread 
{

	NORMAL(null, -9, -6, 3, 6, 9),
	SCHNEIDER_WITH_PARTNER(-18, -15, -12, -9, 9, 12),
	SNEAKER(null, -9, -6, 9, 12, 15),
	ZOLA(-15, -12, -9, 18, 27, 36),
	ZOLA_SCHNEIDER(-42, -36, -24, -18, 36, 39),
	ZOLA_SCHNEIDER_SCHWARTZ(-42, -42, -39, -33, -27, 42);
	
	private Integer noTricks;
	private Integer zeroToThirty;
	private Integer thirtyOneToSixty;
	private Integer sixtyOneToEightyNine;
	private Integer ninetyToOneTwenty;
	private Integer allTricks;
	
	private SpitzerPointSpread(Integer noTricks, Integer zeroToThirty, Integer thirtyOneToSixty, Integer sixtyOneToSixty, Integer ninetyToOneTwenty, Integer allTricks)
	{
		this.noTricks = noTricks;
		this.zeroToThirty = zeroToThirty;
		this.thirtyOneToSixty = thirtyOneToSixty;
		this.sixtyOneToEightyNine = sixtyOneToSixty;
		this.ninetyToOneTwenty = ninetyToOneTwenty;
		this.allTricks = allTricks;
	}
	
	public Integer determineGamePoints(Integer totalTrickPoints, Integer totalTricksWon, Integer totalTricks)
	{
		if(totalTricksWon.equals(0) && this.noTricks != null)
			return this.noTricks;
		
		if(totalTricksWon.equals(totalTricks) && this.allTricks != null)
			return this.allTricks;
		
		if(totalTrickPoints <= 30)
			return this.zeroToThirty;
		
		if(totalTrickPoints <= 60)
			return this.thirtyOneToSixty;
		
		if(totalTrickPoints <= 89)
			return this.sixtyOneToEightyNine;
		
		return this.ninetyToOneTwenty;
	}
	
	public static SpitzerPointSpread getSpreadForScenario(Set<Integer> blackTeam, SpitzerPlayers players, SpitzerDeclaration zolaDeclaration)
	{
		// If there was no zola, and no sneaker called, then normal scoring
		if(zolaDeclaration == null && !players.getDeclarations(blackTeam).contains(SpitzerDeclaration.SNEAKER))
			return NORMAL;
		else if(zolaDeclaration == null)
			return SNEAKER;
		
		// If zola was called, then zola
		if(zolaDeclaration != null)
		{
			switch(zolaDeclaration)
			{
			case ZOLA:
				return ZOLA;
			case ZOLA_SCHNEIDER:
				return ZOLA_SCHNEIDER;
			case ZOLA_SCHNEIDER_SCHWARTZ:
				return ZOLA_SCHNEIDER_SCHWARTZ;
				
			}
		}
		
		return NORMAL;
	}
}
