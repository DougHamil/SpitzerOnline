var ui = {
		// Constants
		CHECKIN_TIMEOUT:5000,
		// DOM Elements
		statusMessageEl:$("#statusMessage"),
		declarationMenuEl:$("#declarationMenu"),
		playerTooltipEl:$("#playerTooltip"),
		dealButtonEl:$("#dealButton"),
		checkInButtonEl:$("#checkInButton"),
		gamePointChartEl:$("#gamePointChart"),
		playersEl:$("#players"),
		handEl:$("#hand"),
		// Variables
		checkInTimer:null,
		
		init:function(){
			
			this.dealButtonEl = $("#dealButton");
			this.statusMessageEl = $("#statusMessage");
			this.declarationMenuEl = $("#declarationMenu");
			this.playerTooltipEl = $("#playerTooltip");
			this.checkInButtonEl = $("#checkInButton");
			this.gamePointChartEl = $("#gamePointChart");
			this.playersEl = $("#players");
			this.handEl = $("#hand");

			this.buildCardTable();
			
			// UI events
			this.dealButtonEl.hide();
			this.dealButtonEl.click(function(){
				requestDeal(onGetGameState, onFailed);
				$(this).hide();
			});
			
			this.checkInButtonEl.hide();
			this.checkInButtonEl.click(function(){
				if(ui.checkInTimer != null)
				{
					clearTimeout(ui.checkInTimer);
					ui.checkInTimer = null;
				}
				requestCheckIn(onGetGameState, onFailed);
				$(this).hide();
			});
			
			this.declarationMenuEl.hide();
			this.gamePointChartEl.hide();
			
			$(eventManager).on('stageChange', $.proxy(this.onStageChange, this));
			$(eventManager).on('playerChange', $.proxy(this.onPlayerChange, this));
			$(eventManager).on('trickChange', $.proxy(this.onTrickChange, this));
			$(eventManager).on('handChange', $.proxy(this.onHandChange, this));
			$(eventManager).on('currentPlayerChange', $.proxy(this.onCurrentPlayerChanged, this));
			$(eventManager).on('playerCheckedIn', $.proxy(this.onPlayersCheckIn, this));
		},
		
		// Called when the current player has changed
		onCurrentPlayerChanged:function(event, oldPlayerId, newPlayerId, stage) {

			// Add the active attribute to the active player
			this.playersEl.children('.player').each(function(i,c){
					var pEl = $(c);
					
					var id = pEl.attr('playerId');
					if(id == newPlayerId)
						pEl.addClass('active');
					else
						pEl.removeClass('active');
			});
			
			// Move the tooltip
			var playerDiv = getPlayerDiv(newPlayerId);
			
			var pos = playerDiv.offset();
			pos.top += playerDiv.height();
			
			this.playerTooltipEl.show();
			this.playerTooltipEl.offset(pos);
			
			// Depending on the current stage, we may need to change the UI
			switch(stage)
			{
			case "DECLARATION":
				if(isCurrentPlayer())
				{
					setStatusMessage("Please choose a declaration.");
					this.declarationMenuEl.show();
				}
				else
				{
					setStatusMessage("Waiting for "+getCurrentPlayerName()+" to declare...");
					this.declarationMenuEl.hide();
				}
				break;
			case "TRICK":
				if(isCurrentPlayer())
				{
					setStatusMessage("Please play a card.");
				}
				else
				{
					setStatusMessage("Waiting for "+getCurrentPlayerName()+" to play a card.");
				}
				break;
			}
		
		},
		
		// Called when the cards in the trick have changed
		onTrickChange:function(event, oldTrick, newTrick) {
			$("#trick .card").each(function(i, c){
				$(c).html(getCardHtml(newTrick[i]));
				
				// Disable any trick cards that have been dropped
				if(newTrick[i])
					$(c).droppable({disabled:true});
				else
					$(c).droppable({disabled:false});
			});
		},
		
		onPlayersCheckIn:function(event, oldCheckins, newCheckins, stage)
		{
			switch(stage)
			{
			case "POST_ROUND":
				if(checkedIn())
					setStatusMessage("Waiting for other players to continue...");				
				break;
			case "POST_TRICK":
				if(checkedIn())
					setStatusMessage("Waiting for other players to continue...");
				break;
			}
		},
		
		// Called when the game stage changes
		onStageChange:function(event, oldStage, newStage) {
			switch(newStage)
			{
			case "WAITING_FOR_PLAYERS":
				this.setPlayerTooltip('Hosting');
			break;
			case "WAITING_FOR_DEAL":
				this.setPlayerTooltip('Dealing');
				if(isDealer())
				{
					this.dealButtonEl.show();
					setStatusMessage("It's your turn to deal");
				}
				else
				{
					this.dealButtonEl.hide();
					setStatusMessage("Waiting for "+getCurrentPlayerName()+" to deal...");
				}
				break;
			case "DECLARATION":
				this.setPlayerTooltip("Declaring");
				this.buildDeclarationMenu();
				break;
			case "TRICK":
				this.setPlayerTooltip("Playing");
				if(isCurrentPlayer())
					setStatusMessage("Please play a card.");
				else
					setStatusMessage("Waiting for "+getCurrentPlayerName()+" to play a card.");
				break;
			case "POST_TRICK":
				this.updatePlayerScores();
				this.setPlayerTooltip("Won the trick for "+getLastTrickPoints()+" points");
				this.requireCheckIn();
				setStatusMessage("Please press continue when you're ready for the next trick.");
				break;
			case "POST_ROUND":
				this.updatePlayerScores();
				this.showGamePointChart();
				this.requireCheckIn();
				setStatusMessage("Please press continue when you're ready for the next game.");
				break;
			case "POST_GAME":
				this.updatePlayerScores();				
				this.showGamePointChart();
				if(isPlayerWinner())
					setStatusMessage("You won the game!");
				else
					setStatusMessage("You lost the game");
				break;
				
			}
			
			switch(oldStage)
			{
			case "DECLARATION":
				this.updatePlayerDeclarations();
				break;
			case "POST_ROUND":
				this.gamePointChartEl.hide();
				this.updatePlayerScores();
				break;
			}
		},
		
		// Called when the players in the game have changed
		onPlayerChange:function(event, allPlayers){

			this.playersEl.html("");
			this.gamePointChartEl.children('.playerPointChart').remove();
			
			$.each(allPlayers, function(i, player){
				var playerDiv = $('<div class="player">');
				playerDiv.attr('playerId', player.userId);
				if(player.userId == getCurrentPlayerId())
					playerDiv.addClass('active');
				var scoreDiv = $('<div class="playerTrickScore">');
				scoreDiv.text(player.trickPoints||0);
				var nameDiv = $('<div class="playerName">');
				nameDiv.text(player.name);
				var gameScoreDiv = $('<div class="playerGameScore">');
				gameScoreDiv.text(player.gamePoints||0);
				var declareDiv = $('<div class="declaration">');
				if(player.userId == getPublicDeclarationUserId())
					declareDiv.text(getPublicDeclarationString());
				playerDiv.append(nameDiv);
				playerDiv.append(gameScoreDiv);
				playerDiv.append(scoreDiv);
				playerDiv.append(declareDiv);
				ui.playersEl.append(playerDiv);
				
				var pointChartDiv = $('<div class="playerPointChart">');
				pointChartDiv.attr('playerid', player.userId);
				var pointChartName = $('<div class="playerName">');
				pointChartName.text(player.name);
				var pointChartLast = $('<div class="lastPoints">');
				var pointChartDiff = $('<div class="diffPoints">');
				
				pointChartDiv.append(pointChartName);
				pointChartDiv.append(pointChartLast);
				pointChartDiv.append(pointChartDiff);
				
				ui.gamePointChartEl.append(pointChartDiv);
			});
			this.playerTooltipEl.width($(getPlayerDiv(getPlayer().userId)).width());
			
			this.buildTrickCardElements(allPlayers);
		},
		
		onHandChange:function(event, added, removed) {
			// Remove any cards that shouldn't be shown
			this.handEl.children('.card').each(function(i, c){
				if(removed.indexOf($(c).attr('card')) != -1)
					$(c).remove();
			});

			// Add any new cards
			$.each(added, function(i, c){

				var newCard = $('<div class="card">');
				newCard.attr('card', c);
				ui.handEl.append(newCard);

				newCard.draggable({
					revert:true,
				});
				
				newCard.html(getCardHtml(c));

			});
			
			// Update the size of the hand box
			var totalHeight = $("#hand h3").height() * 3;
			totalHeight += $("#hand .card").height() * Math.ceil(($("#hand .card").length / 8));
			
			this.handEl.height(totalHeight);
		},
		
		// Builds the trick card elements (called whenever the player count changes)
		buildTrickCardElements:function(players){
			$("#trick .card").remove();
			
			for(var p in players)
			{
				$("#trick").append('<div class="card">');
			}
			
			var trick = getTrickCards();
			
			$("#trick .card").each(function(i, c){
				
				// Get the "no card" image
				$(c).html(getCardHtml(null));
				
				// Make all trick cards droppable
				$(c).droppable({
					greedy:true,
					accept:'#hand .card',
					tolerance:'pointer',
					drop:function(event, ui){
						
						var draggedImg = ui.draggable.children('img');
						var draggedCard = ui.draggable;
						var droppedImg = $(event.target).children('img');
						var ourCard = $(droppedImg).attr('card');
						var card = $(draggedImg).attr('card');
						var thisDraggable = ui.draggable;
						if(!ourCard && card && isPlayersTurn())
						{
							requestPlayCard(card, function(data){
								draggedCard.hide();
								onGetGameState(data);
								
							}, function(data){
								thisDraggable.animate({top:0, left:0});
								onFailed(data);
							});
						}
						else
						{
							ui.draggable.draggable('option', 'revert', true);
						}
					}
				});
			});
		},
		buildDeclarationMenu:function() {
			var player = getPlayer();
			var declarations = player.declarations;
			this.declarationMenuEl.html("");
			var form = $('<form id="declarationForm">');
			$.each(declarations, function(i, d){
				form.append($('<input type="radio" value="'+d+'" name="declaration">'+d+'</input>'));
				form.append($('<br/>'));
			});
			form.append($('<input id="declareButton" type="button" value="Declare">').click(function(){
				requestDeclaration(onGetGameState, onFailed);
				ui.declarationMenuEl.hide();
			}));
			this.declarationMenuEl.append(form);
		},
		updatePlayerDeclarations:function()
		{
			this.playersEl.children(".player").each(function(i,p){
				var playerEl = $(p);
				var playerId = playerEl.attr('playerId');
				var declareDiv = $(playerEl.find('.declaration'));
				if(playerId == getPublicDeclarationUserId())
					declareDiv.text(getPublicDeclarationString());
				else
					declareDiv.text("");
			});
		},
		updatePlayerScores:function()
		{
			this.playersEl.children(".player").each(function(i,p){
				var playerEl = $(p);
				var playerId = playerEl.attr('playerId');
				var trickDiv = $(playerEl.find('.playerTrickScore'));
				var player = getPlayerByUserId(playerId);
				trickDiv.text(player.trickPoints||0);
				var gameDiv = $($(playerEl).find('.playerGameScore'));
				gameDiv.text(player.gamePoints||0);
			});
		},
		setPlayerTooltip:function(msg)
		{
			this.playerTooltipEl.html(msg);
		},
		showGamePointChart:function()
		{
			
			this.gamePointChartEl.children('.playerPointChart').each(function(i, c){
				var playerId = $(c).attr('playerid');
				var pointHistory = getPlayerGamePointHistory(playerId);
				
				$(c).find('.lastPoints').text(pointHistory.last);
				$(c).find('.diffPoints').text("+"+(pointHistory.total - pointHistory.last));
			});
			
			var trickEl = $("#trick");
			this.gamePointChartEl.show();
			this.gamePointChartEl.offset(trickEl.offset());
			this.gamePointChartEl.width(trickEl.width());
			this.gamePointChartEl.height(trickEl.height());
		},
		requireCheckIn:function()
		{
			if(this.checkInTimer == null)
			{
				this.checkInButtonEl.show();
				this.checkInTimer = setTimeout(function(){
					requestCheckIn(onGetGameState, onFailed);
					ui.checkInTimer = null;	
					ui.checkInButtonEl.hide();
				},
				this.CHECKIN_TIMEOUT);
			}
		},
		buildCardTable:function(){

		}
}

	


