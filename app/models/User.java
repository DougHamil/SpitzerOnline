package models;

import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import play.data.validation.Constraints.Required;
import play.db.ebean.Model;

@Entity
@Table(name="Users")
public class User extends Model
{
	@Id
	public Integer id;
	
	@Required
	@Column(unique=true)
	public String name;
	
	@ManyToMany(cascade={CascadeType.ALL})
	public Set<UserBot> bots;
	
	
	public UserBot getBotById(Integer id)
	{
		if(id == null)
			return null;
		
		for(UserBot bot : bots)
		{
			if(bot.id.equals(id))
				return bot;
		}
		
		return null;
	}
	
	public static Finder<Integer, User> find = new Finder<Integer, User>(Integer.class, User.class);
	
}
