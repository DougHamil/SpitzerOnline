package game.player;

import game.SpitzerDeclaration;

import java.util.ArrayList;
import java.util.Collection;

import javax.annotation.Nullable;


import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;

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
			return arg0.gamePoints != null && arg0.gamePoints >= 21;
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
	
	public SpitzerPlayers getGameWinningPlayers()
	{
		return new SpitzerPlayers(Collections2.filter(this, IS_GAME_WINNER));
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
