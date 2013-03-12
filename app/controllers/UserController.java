package controllers;

import org.codehaus.jackson.JsonNode;

import models.User;
import models.UserBot;

import play.data.DynamicForm;
import play.libs.Json;
import play.mvc.*;

public class UserController extends Controller {
	
	public static Result check()
	{
		String username = session("username");
		
		User user = User.find.where().eq("name", username).findUnique();
		
		if(user != null)
			return ok("Session remembers you as "+user.name);
		
		return ok("You are not logged in!");
	}
	
	public static Result getBots()
	{
		User user = getCurrentUser();
		
		if(user == null)
			return badRequest("You must be logged in to do this.");

		JsonNode node = Json.toJson(user.bots);
		
		return ok(node);
	}
	
	@BodyParser.Of(BodyParser.Json.class)	
	public static Result saveBot()
	{
		User user = getCurrentUser();
		
		if(user == null)
			return badRequest("Invalid user");
		
		JsonNode json = request().body().asJson();
		if(json == null)
			return badRequest("Expecting JSON data");
		if(json.findValue("name") == null)
			return badRequest("Missing parameter [name]");
		if(json.findValue("script") == null)
			return badRequest("Missing parameter [script]");
		
		Integer botId = json.findValue("id") != null ? json.findPath("id").asInt() : null;
		String botName = json.findPath("name").getTextValue();
		String botScript = json.findPath("script").getTextValue();

		UserBot bot = null;
		
		// If no bot ID is found, then createa  new bot
		if(botId == null)
		{
			bot = new UserBot();
			user.bots.add(bot);
		}
		else
		{
			bot = user.getBotById(botId);
		}
		
		// If bot is null, then this user doesn't own this bot!
		if(bot == null)
			return badRequest("User is not owner of bot identified by [id] parameter: "+botId);
		
		// Set bot data
		bot.name = botName;
		bot.script = botScript;
		
		bot.save();
		user.save();
		
		return ok(bot.id.toString());
	}
	
	public static Result create()
	{
		String username = DynamicForm.form().bindFromRequest().get("username");
		User user = User.find.where().eq("name", username).findUnique();
		if(user != null)
			ok("Username is already in use");
		
		user = createNewUser(username);
		
		return doLogin(username);
	}
	
	private static Result doLogin(String username)
	{
		User user = User.find.where().eq("name", username).findUnique();
		
		// If this user wasn't found, create a new user
		if(user == null)
			return ok("Invalid username");
		
		session("userid", user.id.toString());
		
		return redirect(controllers.routes.HomeController.index());
	}
	
	public static Result login()
	{
		String username = DynamicForm.form().bindFromRequest().get("username");
		return doLogin(username);
	}

	public static Result logout()
	{
		session().clear();
		return redirect(controllers.routes.HomeController.index());
	}
	
	private static User createNewUser(String username)
	{
		User user = new User();
		user.name = username;
		user.save();
		
		return user;
	}

	public static User getUser(Integer id)
	{
		return User.find.byId(id);
	}
	
	public static User getCurrentUser()
	{
		String userIdString = session("userid");
		if(userIdString == null)
			return null;
		
		Integer userId = Integer.parseInt(userIdString);
		
		User user = User.find.byId(userId);
		
		return user;
	}
}
