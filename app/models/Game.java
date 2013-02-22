package models;

import game.SpitzerGameState;
import java.util.List;
import javax.persistence.*;

import org.codehaus.jackson.JsonNode;

import play.data.validation.Constraints.Required;
import play.db.ebean.Model;
import play.libs.Json;
import play.mvc.Controller;

import java.util.Set;
@Entity
@Table(name = "games")
public class Game extends Model {
	
	public static final Integer NUM_PLAYERS = 4;
	
	@Id
	public Integer id;
	
	@Required
	public Integer hostUserId;
	
	@Required
	public Integer state;
	
	@ManyToMany(cascade={CascadeType.ALL})
	public Set<User> players;
	
	@Column(columnDefinition="LONGTEXT")	
	public String gameStateString;
	
	public String name;
	
	@Transient
	private SpitzerGameState gameState;
	
	@Transient
	public Integer userId;
	
	public Integer playerCount = 0;
	
	public boolean containsPlayer(User user)
	{
		for(User player : players)
		{
			if(player.id == user.id)
				return true;
		}
		
		return false;
	}
	
	public JsonNode toJson(User user)
	{
		if(user == null)
			return null;
		this.userId = user.id;

		JsonNode node = null;
		if(this.getGameState() != null)
			node = Json.toJson(this.getGameState().sanitizeForUser(user));
		return node;
	}
	
	public boolean onPlayerJoin(User player)
	{	
		if(this.playerCount >= NUM_PLAYERS)
			return false;
		
		if(players.contains(player))
			return false;
		
		players.add(player);
		this.increasePlayerCount();
		
		return true;
	}
	
	@Override
	public void save()
	{
		this.gameStateString = Json.stringify(Json.toJson(this.getGameState()));
		super.save();
	}
	
	@Override
	public void update()
	{
		this.gameStateString = Json.stringify(Json.toJson(this.getGameState()));
		super.update();
	}
	
	@Override
	public void refresh()
	{
		super.refresh();
		this.gameState = Json.fromJson(Json.parse(this.gameStateString), SpitzerGameState.class);
	}
	
	public void increasePlayerCount()
	{
		this.playerCount++;
		
		if(this.playerCount == NUM_PLAYERS)
			this.state = GameMode.FULL.getId();
	}
	
	public SpitzerGameState getGameState()
	{
		if(gameState == null)
			gameState = SpitzerGameState.fromJson(gameStateString);
		return gameState;
	}
	
	public void setGameState(SpitzerGameState gameState)
	{
		this.gameState = gameState;
	}
	
	public Integer getNumberOfPlayers()
	{
		return this.playerCount;
	}
	
	public GameMode getState()
	{
		return GameMode.fromId(state);
	}
	
	public static enum GameMode
	{
		OPEN(0),
		FULL(1),
		IN_PROGRESS(2),
		COMPLETE(3);
		
		private int id;
		
		private GameMode(int id)
		{
			this.id = id;
		}
		
		public int getId()
		{
			return this.id;
		}
		
		public static GameMode fromId(int id)
		{
			for(GameMode state : GameMode.values())
			{
				if(state.id == id)
					return state;
			}
			
			return null;
		}
	}
	
	public static Finder<Integer, Game> find = new Finder<Integer, Game>(Integer.class, Game.class);
}
