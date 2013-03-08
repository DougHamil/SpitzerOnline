package controllers;

import game.cards.Card;

import game.player.bot.SpitzerBotType;

import game.SpitzerDeclaration;

import game.SpitzerGameState;

import models.Game;

import models.User;

import org.codehaus.jackson.JsonNode;

import play.mvc.*;
import play.mvc.Controller;

public class StateController extends Controller
{
	
	@BodyParser.Of(BodyParser.Json.class)
    public static Result addBot(Integer gameId)
    {
    	Game game = GameController.getGameById(gameId);
    	User user = UserController.getCurrentUser();
    	
    	if(!validateGame(game, user))
    		return redirect(controllers.routes.HomeController.index());
    	
    	JsonNode json = request().body().asJson();
    	if(json.findPath("type") == null)
    		return badRequest("Missing parameter [type]");
    	
    	String botType = json.findPath("type").getTextValue();
    	
    	JsonNode error = game.getGameState().addBot(SpitzerBotType.fromName(botType));
    	if(error != null)
    		return badRequest(error);
    	
    	game.increasePlayerCount();
    	game.update();
    	
    	return ok(game.toJson(user));
    }
    
	@BodyParser.Of(BodyParser.Json.class)
	public static Result playCard(Integer gameId)
	{
		Game game = GameController.getGameById(gameId);
		User user = UserController.getCurrentUser();
		
		if(!validateGame(game, user))
			return redirect(controllers.routes.HomeController.index());
		
		JsonNode json = request().body().asJson();
		if(json.findPath("card") == null)
			return badRequest("Missing parameter [card]");
		
		String cardName = json.findPath("card").getTextValue();
		
		Card card = Card.valueOf(cardName);
		
		JsonNode error = game.getGameState().playCard(user, card);
		if(error != null)
			return badRequest(error);
		
		if(game.getGameState().stage.equals(SpitzerGameState.GameStage.POST_GAME))
			game.setState(Game.GameMode.COMPLETE);
		game.update();
		
		return ok(game.toJson(user));
	}
	
	@BodyParser.Of(BodyParser.Json.class)
	public static Result declare(Integer gameId)
	{
		Game game = GameController.getGameById(gameId);
		User user = UserController.getCurrentUser();
		
		if(!validateGame(game, user))
			return redirect(controllers.routes.HomeController.index());
		
		JsonNode json = request().body().asJson();
		if(json.findPath("declaration") == null)
			return badRequest("Missing parameter [declaration]");
		
		String declaration = json.findPath("declaration").getTextValue();
		
		if(SpitzerDeclaration.valueOf(declaration) == null)
			return badRequest("Invalid declaration: "+declaration);
		
		JsonNode error = game.getGameState().handleDeclaration(user, SpitzerDeclaration.valueOf(declaration));
		if(error != null)
			return badRequest(error);
		
		game.update();
    	
		return ok(game.toJson(user));
	}
	
    public static Result checkIn(Integer gameId)
    {
    	Game game = GameController.getGameById(gameId);
    	User user = UserController.getCurrentUser();
    	
    	if(!validateGame(game, user))
    		redirect(controllers.routes.HomeController.index());
    	
    	SpitzerGameState gameState = game.getGameState();
    	
    	JsonNode error = gameState.handleCheckin(user);
    	if(error != null)
    		return badRequest(error);

		if(gameState.stage.equals(SpitzerGameState.GameStage.POST_GAME))
			game.setState(Game.GameMode.COMPLETE);
    		
    	game.update();
    	return ok(game.toJson(user));
    }
	
    public static Result deal(Integer gameId)
    {
    	Game game = GameController.getGameById(gameId);
    	User user = UserController.getCurrentUser();
    	
    	if(!validateGame(game, user))
    		redirect(controllers.routes.HomeController.index());
    	
    	SpitzerGameState gameState = game.getGameState();
    	
    	JsonNode error = gameState.dealCards(user);
    	if(error != null)
    		return badRequest(error);
    		
    	game.update();
    	return ok(game.toJson(user));
    }
    
    private static boolean validateGame(Game game, User user)
    {
    	if(user == null || game == null || !game.containsPlayer(user))
    		return false;
    	
    	return true;
    }
}
