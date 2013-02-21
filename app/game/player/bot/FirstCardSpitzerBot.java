package game.player.bot;

import org.codehaus.jackson.annotate.JsonTypeName;

import game.SpitzerDeclaration;
import game.SpitzerGameState;
import game.cards.Card;
import game.player.SpitzerPlayer;

@JsonTypeName("FirstCardSpitzerBot")
public class FirstCardSpitzerBot extends SpitzerBot
{
	@Override
	public Card playCard(SpitzerGameState gameState) {
		// Just play the first valid card
		return gameState.getValidCardsForPlayer(this).iterator().next();
	}

	@Override
	public SpitzerDeclaration declare(SpitzerGameState gameState) {
		// Return "NONE", if available
		if(this.declarations.contains(SpitzerDeclaration.NONE))
			return SpitzerDeclaration.NONE;
		// Otherwise, return the first
		return this.declarations.get(0);
	}

}
