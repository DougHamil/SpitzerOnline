package models;

import java.util.List;

import javax.persistence.*;

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
	
	public static Finder<Integer, User> find = new Finder<Integer, User>(Integer.class, User.class);
	
}
