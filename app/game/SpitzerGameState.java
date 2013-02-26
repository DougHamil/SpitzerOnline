package game;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import game.cards.Card;
import game.cards.Cards;
import game.cards.Rank;
import game.cards.SpitzerDeck;
import game.cards.Suit;
import game.player.SpitzerPlayer;
import game.player.SpitzerPlayers;
import game.player.bot.SpitzerBot;
import game.player.bot.SpitzerBotType;

import models.Game;
import models.User;

import org.codehaus.jackson.JsonNode;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import play.libs.Json;
import play.mvc.Content;
import util.ErrorUtils;
import util.GameError;

public class SpitzerGameState
{
	public SpitzerPlayers players;
	public Integer maxPlayers;
	public Integer currentDealer;
	public Integer currentPlayer;
	public Set<Integer> gameWinners;
	public Set<Integer> blackTeam;
	public Set<Integer> otherTeam;
	public Map<Card, Integer> trickPointsPerCard;
	public Set<Integer> bots;
	public GameStage stage;
	public Integer trickNumber;
	public Map<Card, Integer> trickCards;
	public List<Card> trickCardsOrdered;
	public List<Integer> trickCardPlayers;
	public List<List<Card>> trickCardsHistory;
	public List<List<Integer>> trickCardPlayersHistory;
	public List<Card> trickWinningCardHistory;
	public List<Integer> trickPointHistory;
	public List<Integer> trickWinnerHistory;
	public Set<Integer> playerCheckins;
	public SpitzerDeclaration zolaDeclaration;
	public Integer zolaPlayer;
	public SpitzerDeclaration publicDeclaration;
	public Integer declarePlayer;
	public Integer userId;
	
	public static SpitzerGameState copy(SpitzerGameState state)
	{
		SpitzerGameState copied = new SpitzerGameState();

		// This performs a deep copy of the spitzer player objects
		copied.players = new SpitzerPlayers(state.players);
		copied.maxPlayers = state.maxPlayers;
		copied.currentDealer = state.currentDealer;
		copied.currentPlayer = state.currentPlayer;
		if(state.gameWinners != null)
			copied.gameWinners = Sets.newHashSet(state.gameWinners);
		if(state.blackTeam != null)
			copied.blackTeam = Sets.newHashSet(state.blackTeam);
		if(state.otherTeam != null)
			copied.otherTeam = Sets.newHashSet(state.otherTeam);
		if(state.trickPointsPerCard != null)
			copied.trickPointsPerCard = Maps.newHashMap(state.trickPointsPerCard);
		copied.stage = state.stage;
		copied.trickNumber = state.trickNumber;
		if(state.trickCards != null)
			copied.trickCards = Maps.newHashMap(state.trickCards);
		if(state.trickCardsOrdered != null)
			copied.trickCardsOrdered = Lists.newArrayList(state.trickCardsOrdered);
		if(state.trickCardPlayers != null)
			copied.trickCardPlayers = Lists.newArrayList(state.trickCardPlayers);
		if(state.trickCardsHistory != null)
			copied.trickCardsHistory = Lists.newArrayList(state.trickCardsHistory);
		if(state.trickWinningCardHistory != null)
			copied.trickWinningCardHistory = Lists.newArrayList(state.trickWinningCardHistory);
		if(state.trickPointsPerCard != null)
			copied.trickPointsPerCard = Maps.newHashMap(state.trickPointsPerCard);
		if(state.trickPointHistory != null)
			copied.trickPointHistory = Lists.newArrayList(state.trickPointHistory);
		if(state.trickWinnerHistory != null)
			copied.trickWinnerHistory = Lists.newArrayList(state.trickWinnerHistory);
		if(state.playerCheckins != null)
			copied.playerCheckins = Sets.newHashSet(state.playerCheckins);
		if(state.trickCardPlayersHistory != null)
			copied.trickCardPlayersHistory = Lists.newArrayList(state.trickCardPlayersHistory);
		copied.zolaDeclaration = state.zolaDeclaration;
		copied.zolaPlayer = state.zolaPlayer;
		copied.publicDeclaration = state.publicDeclaration;
		copied.declarePlayer = state.declarePlayer;
		copied.userId = state.userId;
		copied.bots = state.bots;

		return copied;
	}
	
	public SpitzerGameState sanitizeForUser(User user)
	{
		// Make a copy of this state
		SpitzerGameState copy = SpitzerGameState.copy(this);

		// Remove teams
		copy.blackTeam = null;
		copy.otherTeam = null;

		// Clear out all other players' hands
		for(SpitzerPlayer player : copy.players)
		{
			if(!player.userId.equals(user.id))
				player.sanitize();
		}
		
		// This game state belongs to this user
		copy.userId = user.id;

		return copy;
	}
	
	public JsonNode addBot(SpitzerBot bot)
	{
		if(this.players.size() >= this.maxPlayers)
			return ErrorUtils.error(GameError.GAME_IS_FULL, this.maxPlayers, this.players.size(), bot);
		
		// Add the bot
		this.addPlayer(bot);
		
		return null;
	}
	
	private void moveToStage(GameStage newStage)
	{
		switch(newStage)
		{
		case TRICK:			
			this.newTrick();
			// If there was no winner in the last trick (ie, first trick), go to left of deal, else use the last winner
			if(this.trickWinnerHistory.isEmpty())
				this.currentPlayer = getNextPlayer(this.currentDealer).userId;
			else
				this.currentPlayer = this.trickWinnerHistory.get(trickWinnerHistory.size() - 1);
			break;
		case POST_TRICK:
			this.completeTrick();
			break;
		case POST_ROUND:
			this.completeTrick();
			this.distributeGamePoints();
			break;
		case DECLARATION:
			// Declarations start with left of dealer
			this.currentPlayer = getNextPlayer(getPlayerByUser(this.currentDealer)).userId;
			evaluateDeclarations();
			break;
		case WAITING_FOR_DEAL:
			this.newRound();
			// If we just finished a round, move the dealer
			if(this.stage.equals(GameStage.POST_ROUND))
				this.currentDealer = getNextPlayer(this.currentDealer).userId;
			this.currentPlayer = this.currentDealer;
			break;
		case POST_GAME:
			// Someone won the game
			this.gameWinners = Sets.newHashSet(players.getGameWinningPlayers().getPlayerIds());
			break;
		}
		
		this.stage = newStage;
		this.resetCheckins();		
		SpitzerBot bot = this.getCurrentPlayerAsBot();
		
		// Handle any bot actions here
		if(bot != null)
		{
			switch(this.stage)
			{
			case DECLARATION:
				// If it's a bot's turn to declare, let it
				this.handleDeclaration(bot, bot.declare(this));
				break;
			case WAITING_FOR_DEAL:
				// If it's a bot's turn to deal, then deal
				this.dealCards((SpitzerPlayer)bot);
				break;
			case TRICK:
				// If it's a bot's turn to play, let it
				this.playCard((SpitzerPlayer)bot, bot.playCard(this));
				break;
			}
		}
		
		SpitzerPlayer curPlayer = this.getPlayerByUser(this.currentPlayer);
		curPlayer.validCards = SpitzerDeck.getValidCardsForTrick(this.publicDeclaration, this.declarePlayer, this.currentPlayer, curPlayer.hand, this.trickCardsOrdered);
	}
	
	private SpitzerBot getCurrentPlayerAsBot()
	{
		if(this.bots.contains(this.currentPlayer))
			return (SpitzerBot)this.getPlayerByUser(this.currentPlayer);
		return null;
	}

	private void distributeGamePoints()
	{
		// Using the point history, distribute the game points accordingly
		Integer totalTrickPoints = getTotalTrickPointsForPlayers(this.blackTeam);
		Integer totalTricksWon = getTotalTricksWonByPlayers(this.blackTeam);

		// Determine point spread to use
		SpitzerPointSpread spread = SpitzerPointSpread.getSpreadForScenario(blackTeam, players, zolaDeclaration);
		
		Integer gamePoints = spread.determineGamePoints(totalTrickPoints, totalTricksWon, this.trickPointHistory.size());
		
		// If game points are negative, give them to the other team
		if(gamePoints < 0)
			increasePlayersGamePoints(this.otherTeam, Math.abs(gamePoints));
		else
			increasePlayersGamePoints(this.blackTeam, gamePoints);
	}
	
	private void increasePlayersGamePoints(Collection<Integer> userIds, Integer points)
	{
		for(SpitzerPlayer player : players)
		{
			if(userIds.contains(player.userId))
			{
				if(player.gamePoints == null)
					player.gamePoints = 0;
				player.grantGamePoints(points);
			}
			else
				player.grantGamePoints(0);
		}
	}

	private Integer getTotalTricksWonByPlayers(Collection<Integer> userIds)
	{
		Integer total = 0;
		
		for(Integer winnerId : this.trickWinnerHistory)
		{
			if(userIds.contains(winnerId))
				total++;
		}

		return total;
	}

	private Integer getTotalTrickPointsForPlayers(Collection<Integer> userIds)
	{
		Integer total = 0;

		for(int i = 0; i < this.trickWinnerHistory.size(); i++)
		{
			Integer trickWinner = this.trickWinnerHistory.get(i);

			if(userIds.contains(trickWinner))
				total += this.trickPointHistory.get(i);
		}

		return total;
	}

	private void resetCheckins()
	{
		this.playerCheckins = Sets.newHashSet();
		// Add all bot checkins automatically
		for(Integer botId : this.bots)
		{
			this.handleCheckin(this.getPlayerByUser(botId));
		}
	}
	
	// Called after a trick is over, or a round is over
	private void completeTrick()
	{
		Card highestCard = SpitzerDeck.getWinningCard(trickCards.keySet());
		Integer winner = trickCards.get(highestCard);
		getPlayerByUser(winner).trickPoints += SpitzerDeck.getPointsForCards(trickCards.keySet());
		this.trickPointsPerCard = SpitzerDeck.getPointsPerCards(trickCards.keySet());
		this.trickWinnerHistory.add(trickCards.get(highestCard));
		this.trickPointHistory.add(SpitzerDeck.getPointsForCards(trickCards.keySet()));
		this.trickCardsHistory.add(trickCardsOrdered);
		this.trickCardPlayersHistory.add(trickCardPlayers);
		this.trickWinningCardHistory.add(highestCard);
		this.playerCheckins = Sets.newHashSet();
		this.currentPlayer = winner;
	}
	
	public JsonNode playCard(User user, Card card)
	{
		return this.playCard(getPlayerByUser(user), card);
	}
	
	public JsonNode playCard(SpitzerPlayer player, Card card)
	{
		if(player == null)
			return ErrorUtils.error(GameError.PLAYER_NOT_IN_GAME, player);
		if(!this.stage.equals(GameStage.TRICK))
			return ErrorUtils.error(GameError.INVALID_GAME_STAGE, this.stage);
		if(!player.hand.hasCard(card))
			return ErrorUtils.error(GameError.INVALID_CARD, player.hand,  card);
		if(!currentPlayer.equals(player.userId))
			return ErrorUtils.error(GameError.OUT_OF_TURN, player.userId, currentPlayer);
		
		// Validate the card placement
		if(!validatePlayCard(player, card))
			return ErrorUtils.error(GameError.INVALID_TRICK_PLAY, card);
		
		// Add the card to the trick Cards
		player.hand.remove(card);
		trickCards.put(card, player.userId);
		trickCardsOrdered.add(card);
		trickCardPlayers.add(player.userId);
		trickPointsPerCard = SpitzerDeck.getPointsPerCards(trickCardsOrdered);
		
		// Have all the players played a card?
		if(trickCards.size() >= players.size())
		{
			if(this.players.get(0).hand.isEmpty())
			{
				this.moveToStage(GameStage.POST_ROUND);
				// If there was a winner, go to post game
				if(!players.getGameWinningPlayers().isEmpty())
					this.moveToStage(GameStage.POST_GAME);
			}
			else
				this.moveToStage(GameStage.POST_TRICK);
		}
		else
		{
			this.currentPlayer = getNextPlayer(player).userId;

			SpitzerBot bot = this.getCurrentPlayerAsBot();
			if(bot != null)
			{
				return this.playCard((SpitzerPlayer)bot, bot.playCard(this));
			}
			else
			{
				// Set the valid cards for the player, in case client side bot is running
				SpitzerPlayer curPlayer = this.getPlayerByUser(this.currentPlayer);
				curPlayer.validCards = SpitzerDeck.getValidCardsForTrick(this.publicDeclaration, this.declarePlayer, this.currentPlayer, curPlayer.hand, this.trickCardsOrdered);
			}
		}
		
		return null;
	}
	
	public JsonNode handleCheckin(SpitzerBot bot)
	{
		return this.handleCheckin((SpitzerPlayer)bot);
	}
	
	public JsonNode handleCheckin(User user)
	{
		return this.handleCheckin(this.getPlayerByUser(user));
	}
	
	public JsonNode handleCheckin(SpitzerPlayer player)
	{
		if(this.stage == GameStage.POST_TRICK || this.stage == GameStage.POST_ROUND || this.stage == GameStage.POST_GAME)
			this.playerCheckins.add(player.userId);
		else
			return ErrorUtils.error(GameError.INVALID_GAME_STAGE, stage);
		
		// Is everyone checked in?
		if(this.playerCheckins.size() == this.players.size())
		{
			switch(this.stage)
			{
			case POST_TRICK:
					this.moveToStage(GameStage.TRICK);
				break;
			case POST_ROUND:
					this.moveToStage(GameStage.WAITING_FOR_DEAL);
				break;
			}
			
			this.playerCheckins.clear();
		}
		
		return null;
	}
	
	public Collection<Card> getValidCardsForPlayer(SpitzerPlayer player)
	{
		return SpitzerDeck.getValidCardsForTrick(this.publicDeclaration, this.declarePlayer, player.userId, player.hand, trickCardsOrdered);
	}
	
	public boolean validatePlayCard(SpitzerPlayer player, Card card)
	{
		return SpitzerDeck.getValidCardsForTrick(this.publicDeclaration, this.declarePlayer, player.userId, player.hand, trickCardsOrdered).contains(card);
	}
	
	public JsonNode handleDeclaration(User user, SpitzerDeclaration declaration)
	{
		return this.handleDeclaration(this.getPlayerByUser(user), declaration);
	}
	
	public JsonNode handleDeclaration(SpitzerPlayer player, SpitzerDeclaration declaration)
	{
		if(player == null)
			return ErrorUtils.error(GameError.PLAYER_NOT_IN_GAME, player);
		if(!this.stage.equals(GameStage.DECLARATION))
			return ErrorUtils.error(GameError.INVALID_GAME_STAGE, this.stage);
		if(!player.declarations.contains(declaration))
			return ErrorUtils.error(GameError.INVALID_DECLARATION, declaration);
		if(!this.currentPlayer.equals(player.userId))
			return ErrorUtils.error(GameError.OUT_OF_TURN, declaration, this.currentPlayer);
		
		// If it's an "effective" declaration, then stop the declaration process
		if(!declaration.equals(SpitzerDeclaration.NONE) && !declaration.equals(SpitzerDeclaration.SNEAKER))
		{
			// if it's a zola, keep track of the zola player
			if(SpitzerDeclaration.isZola(declaration))
			{
				this.zolaDeclaration = declaration;
				this.zolaPlayer = player.userId;
			}
			
			this.publicDeclaration = declaration;
			this.declarePlayer = player.userId;
		}
		
		player.activeDeclaration = declaration;
		player.declarations.clear();
		
		// If everyone has declared, or a public declaration was made, then move to the trick
		if(this.publicDeclaration != null || this.allDeclarationsMade())
		{
			// Every player with null declaration is forced to NONE
			for(SpitzerPlayer nullplayer : players)
			{
				if(nullplayer.activeDeclaration == null)
				{
					nullplayer.activeDeclaration = SpitzerDeclaration.NONE;
					nullplayer.declarations.clear();
				}
			}
			this.determineTeams();
			this.moveToStage(GameStage.TRICK);
		}
		else
		{
			// Let the next player declare a card
			this.currentPlayer = getNextPlayer(player).userId;
			
			// Let the bots declare, too
			SpitzerBot bot = this.getCurrentPlayerAsBot();
			if(bot != null)
			{
				return this.handleDeclaration((SpitzerPlayer)bot, bot.declare(this));
			}
		}
		
		return null;
	}
	
	private void determineTeams()
	{
		this.blackTeam = Sets.newHashSet();
		this.otherTeam = Sets.newHashSet();
		
		// If a zola declaration was made, then that player is on the black team
		if(this.zolaDeclaration != null)
		{
			// Zolas are always public
			this.blackTeam.add(this.zolaPlayer);
		}
		else
		{
			// If no zola declaration was made, then a sneaker could be played by 
			// the queens player
			for(SpitzerPlayer player : players)
			{
				if(player.activeDeclaration.equals(SpitzerDeclaration.SNEAKER))
				{
					this.blackTeam.add(player.userId);
					break;
				}
			}
			
			// If no sneaker was played, check for an ace call
			if(this.blackTeam.isEmpty())
			{
				for(SpitzerPlayer player : players)
				{
					Suit suit = SpitzerDeclaration.getSuitOfDeclaration(player.activeDeclaration);
					if(suit != null)
					{
						// Find player with the suit
						SpitzerPlayer acePlayer = null;
						for(SpitzerPlayer playerAce : players)
						{
							if(playerAce.hand.hasCard(Rank.ACE, suit))
							{
								acePlayer = playerAce;
								break;
							}
						}
						
						this.blackTeam.add(player.userId);
						this.blackTeam.add(acePlayer.userId);
						break;
					}
				}
			}
			
			// If no ace was called for, check for call for winner of first trick
			if(this.blackTeam.isEmpty())
			{
				for(SpitzerPlayer player : players)
				{
					if(player.activeDeclaration.equals(SpitzerDeclaration.CALL_FOR_FIRST_TRICK_WINNER))
					{
						this.blackTeam.add(player.userId);
						this.blackTeam.add(trickWinnerHistory.get(0));
						break;
					}
				}
			}
			
			// If no calls were made at all, then the queens must be separated
			if(this.blackTeam.isEmpty())
			{
				for(SpitzerPlayer player : players)
				{
					if(player.hand.hasCard(Card.QUEEN_OF_CLUBS) || player.hand.hasCard(Card.QUEEN_OF_SPADES))
						this.blackTeam.add(player.userId);
				}
			}
		}
		
		this.otherTeam.addAll(getOtherPlayers(this.blackTeam));
	}
	
	private Collection<Integer> getOtherPlayers(Collection<Integer> playerIds)
	{
		Collection<Integer> allPlayers = Sets.newHashSet();
		
		for(SpitzerPlayer player : players)
		{
			allPlayers.add(player.userId);
		}
		
		allPlayers.removeAll(playerIds);
		
		return allPlayers;
	}
	
	public JsonNode dealCards(User user)
	{
		return this.dealCards(getPlayerByUser(user));
	}
	
	public JsonNode dealCards(SpitzerPlayer player)
	{
		if(player == null)
			return ErrorUtils.error(GameError.PLAYER_NOT_IN_GAME, player);
		
		if(!player.userId.equals(currentDealer))
			return ErrorUtils.error(GameError.PLAYER_NOT_DEALER, Lists.newArrayList(currentDealer, player));
		
		if(!this.stage.equals(GameStage.WAITING_FOR_DEAL))
			return ErrorUtils.error(GameError.GAME_NOT_FULL, player);
		
		SpitzerDeck deck = new SpitzerDeck();
		deck.shuffle();
		
		players.clearAllHands();
		
		// Deal all cards
		while(!deck.cards.isEmpty())
		{
			for(SpitzerPlayer aPlayer : players)
			{
				if(deck.cards.isEmpty())
					break;
				aPlayer.addCardToHand(deck.draw());
			}
		}
		
		for(SpitzerPlayer aPlayer : players)
		{
			aPlayer.orderCards();
		}
		
		this.moveToStage(GameStage.DECLARATION);
		
		return null;
	}
	
	public SpitzerPlayer getNextPlayer(Integer userId)
	{
		return getNextPlayer(getPlayerByUser(userId));
	}
	
	public SpitzerPlayer getNextPlayer(SpitzerPlayer player)
	{
		int index = players.indexOf(player);
		if(index == players.size() - 1)
			index = 0;
		else
			index++;
		return players.get(index);
	}
	
	public boolean allDeclarationsMade()
	{
		for(SpitzerPlayer player : players)
		{
			if(player.activeDeclaration == null)
				return false;
		}
		
		return true;
	}
	
	public void evaluateDeclarations()
	{
		// Build each player's possible declarations, given their hand
		for(SpitzerPlayer player : players)
		{
			// If ZOLA SCHNEIDER SCHWARTZ was declared, it is permanent for the entire game
			if(player.activeDeclaration != null && player.activeDeclaration.equals(SpitzerDeclaration.ZOLA_SCHNEIDER_SCHWARTZ))
			{
				player.declarations = Lists.newArrayList(player.activeDeclaration);
				continue;
			}
			
			player.declarations = SpitzerDeclaration.buildFromHand(player.hand, this);
		}
	}
	
	private void newTrick()
	{
		this.trickNumber++;
		this.trickCards = Maps.newHashMap();
		this.trickCardsOrdered = Lists.newArrayList();
		this.trickCardPlayers = Lists.newArrayList();
	}
	
	// Called when all tricks have been played for a dealing, set up a new dealing
	public void newRound()
	{
		this.trickNumber = 0;
		
		// ZOLA SCHNEIDER SCHWARTZ runs through all games
		if(zolaDeclaration == null || !zolaDeclaration.equals(SpitzerDeclaration.ZOLA_SCHNEIDER_SCHWARTZ))
		{
			this.zolaDeclaration = null;
			this.zolaPlayer = null;
		}
		
		if(this.zolaDeclaration == null)
		{
			this.publicDeclaration = null;
			this.declarePlayer = null;
			
			for(SpitzerPlayer player : players)
				player.activeDeclaration = null;
		}
		
		// Reset all trick histories
		this.trickWinnerHistory = Lists.newArrayList();
		this.trickPointHistory = Lists.newArrayList();
		this.trickCardsHistory = Lists.newArrayList();
		this.trickWinningCardHistory = Lists.newArrayList();
		this.trickCardPlayersHistory = Lists.newArrayList();
		
		// Reset all trick points
		for(SpitzerPlayer player : players)
		{
			player.trickPoints = 0;
		}
		
		// Prepare the trick data structures;
		newTrick();
	}
	
	// Called when an entirely new game is created
	public void startGame(Game game)
	{
		this.players = new SpitzerPlayers();
		this.stage = GameStage.WAITING_FOR_PLAYERS;
		this.maxPlayers = Game.NUM_PLAYERS;

		this.playerCheckins = Sets.newHashSet();
		this.bots = Sets.newHashSet();
		newRound();
		
		for(User userPlayer : game.players)
		{
			addPlayer(userPlayer);
		}

		// Host will be dealer to begin
		this.currentDealer = game.hostUserId;
		this.currentPlayer = this.currentDealer;
	}
	
	public SpitzerPlayer getPlayerByUser(Integer id)
	{
		for(SpitzerPlayer player : players)
		{
			if(player.userId.equals(id))
				return player;
		}
		
		return null;
	}
	
	public SpitzerPlayer getPlayerByUser(User user)
	{
		return getPlayerByUser(user.id);
	}
	
	public void addPlayer(SpitzerPlayer player)
	{
		this.players.add(player);
		
		if(this.players.size() >= Game.NUM_PLAYERS)
			this.moveToStage(GameStage.WAITING_FOR_DEAL);
	}
	
	public void addPlayer(User user)
	{
		if(getPlayerByUser(user) != null)
			return;
		
		SpitzerPlayer player = new SpitzerPlayer();
		player.userId = user.id;
		player.name = user.name;
		
		this.addPlayer(player);
	}
	
	public void addPlayer(SpitzerBot bot)
	{
		SpitzerPlayer player = (SpitzerPlayer)bot;
		player.userId = -(this.bots.size() + 1);
		player.name = SpitzerBotType.getNameOfBot(bot) + "("+player.userId+")";
		this.bots.add(player.userId);
		this.addPlayer(player);
	}

	public static SpitzerGameState fromJson(String jsonString)
	{
		JsonNode node = Json.parse(jsonString);
		return Json.fromJson(node, SpitzerGameState.class);
	}
	
	public static enum GameStage
	{
		WAITING_FOR_PLAYERS(1),
		WAITING_FOR_DEAL(2),
		DECLARATION(3),
		TRICK(4),
		POST_TRICK(5),
		POST_GAME(6),	// After a winner is found
		POST_ROUND(7);	// After all tricks are played for a single deal
		
		private int id;
		
		private GameStage(int id)
		{
			this.id = id;
		}
		
		public int getId()
		{
			return id;
		}
		
		public static GameStage fromId(int id)
		{
			for(GameStage state : GameStage.values())
				if(state.getId() == id)
					return state;
			
			return null;
		}
	}
}
