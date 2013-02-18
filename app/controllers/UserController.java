package controllers;

import models.User;

import play.*;
import play.api.mvc.Session;
import play.data.DynamicForm;
import play.db.ebean.Model.Finder;
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
	
	private static User createNewUser(String username)
	{
		User user = new User();
		user.name = username;
		user.save();
		
		return user;
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
