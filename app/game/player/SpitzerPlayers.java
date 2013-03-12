package game.player;

import game.SpitzerDeclaration;
import game.SpitzerGameState;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

import javax.annotation.Nullable;


import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class SpitzerPlayers extends ArrayList<SpitzerPlayer>
{
	
	public static final Function<SpitzerPlayer, Integer> EXTRACT_USER_ID = new Function<SpitzerPlayer, Integer>()
	{
		@Override
		public Integer apply(SpitzerPlayer arg0) {
			return arg0.userId;
		}
	};
			
	public static final Predicate<SpitzerPlayer> IS_GAME_WINNER = new Predicate<SpitzerPlayer>()
	{
		@Override
		public boolean apply(@Nullable SpitzerPlayer arg0) {
			return arg0.gamePoints != null && arg0.gamePoints >= SpitzerGameState.GAME_WIN_POINTS;
		}
		
	};

	// Copy constructor, copy the underlying players too
	public SpitzerPlayers(SpitzerPlayers other)
	{
		super();
		for(SpitzerPlayer player : other)
		{
			this.add(new SpitzerPlayer(player));
		}
	}

	public SpitzerPlayers(Collection<SpitzerPlayer> other)
	{
		super(other);
	}
	
	public SpitzerPlayers(){super();}
	
	public void clearAllHands()
	{
		for(SpitzerPlayer player : this)
		{
			if(player.hand != null)
				player.hand.clear();
		}
	}
	
	public SpitzerPlayers getGameLosingPlayers()
	{
		SpitzerPlayers winners = this.getGameWinningPlayers();
		SpitzerPlayers all = new SpitzerPlayers(this);
		all.removeAll(winners);
		return all;
	}
	
	public SpitzerPlayers getGameWinningPlayers()
	{
		SpitzerPlayers winners = new SpitzerPlayers(Collections2.filter(this, IS_GAME_WINNER));
		
		if(winners.isEmpty() || winners.size() == 1)
			return winners;
		
		// Determine real winner(s) (could be a tie)
		Set<SpitzerPlayer> highestWinners = Sets.newHashSet();
		Integer highestPoints = 0;
		for(SpitzerPlayer player : winners)
		{
			if(player.gamePoints > highestPoints)
				highestWinners.clear();
			
			if(player.gamePoints >= highestPoints)
			{
				highestWinners.add(player);
				highestPoints = player.gamePoints;
			}
		}
		
		return new SpitzerPlayers(highestWinners);
	}
	
	public Collection<SpitzerDeclaration> getDeclarations(Collection<Integer> players)
	{
		Collection<SpitzerDeclaration> decs = Lists.newArrayList();
		for(SpitzerPlayer player : this)
		{
			if(player.activeDeclaration != null && players.contains(player.userId))
				decs.add(player.activeDeclaration);
		}
		
		return decs;
	}
	
	public Collection<SpitzerDeclaration> getDeclarations()
	{
		return getDeclarations(getPlayerIds());
	}
	
	public Collection<Integer> getPlayerIds(Predicate<SpitzerPlayer> pred)
	{
		return Collections2.transform(Collections2.filter(this, pred), EXTRACT_USER_ID);
	}
	
	public Collection<Integer> getPlayerIds()
	{
		return getPlayerIds(Predicates.<SpitzerPlayer>alwaysTrue());
	}
}
