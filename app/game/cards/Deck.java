package game.cards;

import java.util.Collections;
import java.util.List;

import com.google.common.collect.Lists;

public abstract class Deck {

	public List<Card> cards;
	
	public Deck()
	{
		cards = Lists.newArrayList();
		buildDeck();
	}
	
	protected abstract void buildDeck();
	
	public void shuffle()
	{
		Collections.shuffle(cards);
	}
	
	public Card draw()
	{
		if(cards.isEmpty())
			return null;
		
		return cards.remove(0);
	}
}
