package models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import play.db.ebean.Model;

@Entity
@Table(name="Bots")
public class UserBot extends Model {

	@Id
	public Integer id;
	
	public String name;
	
	@Column(columnDefinition="LONGTEXT")	
	public String script;
}
