package controllers;

import java.util.List;

import models.Game;
import models.User;
import play.mvc.Controller;
import play.*;
import play.mvc.*;

import views.html.*;

public class HomeController extends Controller
{
	public static Result index()
	{
		User user = UserController.getCurrentUser();
		
		// If user not logged in, render the login page
		if(user == null)
			return ok(login.render());
		
		// If logged in, present game list
		List<Game> openGames = GameController.getOpenGames();
		
		return ok(index.render(openGames));
	}
}
