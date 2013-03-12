function Player(player) {
	this.isLocalPlayer = game.userId == player.userId;
	this.id = player.userId;
	this.name = player.name;
	this.gamePoints = player.gamePoints;
	this.trickPoints = player.trickPoints;
	this.declaration = player.activeDeclaration;
	this.isDealer = player.isDealer;
}

function createThisPlayer()
{
	return new Player(getPlayer());
}

function createAllPlayers()
{
	var players = [];
	
	for(var p in game.players)
	{
		players.push(new Player(game.players[p]));
	}
	
	return players;
}