package game.player.bot;

import org.codehaus.jackson.annotate.JsonSubTypes;
import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import game.SpitzerDeclaration;
import game.SpitzerGameState;
import game.cards.Card;
import game.player.SpitzerPlayer;

/**
 * Due to the use of JSON mapping, we cannot use an interface or abstract class for bots.
 * They must be concrete so that they will serialize properly
 */
public class SpitzerBot extends SpitzerPlayer
{
	public Card playCard(SpitzerGameState gameState){return null;}
	public SpitzerDeclaration declare(SpitzerGameState gameState){return null;}
}
