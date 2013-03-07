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
		trickEl:$("#trick"),

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
			this.trickEl = $("#trick");
			
			$(window).resize(function(){
				if(game != null)
					ui.updateTooltipPosition();
			})

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
			this.updateTooltipPosition();

			if(isCurrentPlayer())
			{
				$("title").text("Spitzer Online - PLAYING");
				if(window.webkitNotifications != null)
				{
					if(window.webkitNotifications.checkPermission()==0)
					{
						var popup = window.webkitNotifications.createNotification('', 'Your turn', 'It\'s your turn to play!');
						popup.show();
					}
					else
					{
						window.webkitNotifications.requestPermission();
					}
				}
			}
			else
				$("title").text("Spitzer Online");
			
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
				if(isCurrentPlayer() && !botHasPlayCard())
				{
					setStatusMessage("Please play a card.");
				}
				else if(!isCurrentPlayer())
				{
					setStatusMessage("Waiting for "+getCurrentPlayerName()+" to play a card.");
				}
				break;
			}
		
		},
		
		// Called when the cards in the trick have changed
		onTrickChange:function(event, oldTrick, newTrick) {
			$("#trick .card").each(function(i, c){
				$(c).find(".cardImage").attr("src", getCardUrl(newTrick[i]));
				$(c).find(".cardPlayer").text(getPlayerNameOfTrickCard(i));
				$(c).find(".cardPoints").text(getTrickPointsForCard(newTrick[i]));
				// Disable any trick cards that have been dropped
				if(newTrick[i])
				{
					$(c).droppable({disabled:true});
					$(c).find(".cardPoints").show();
				}
				else
				{
					$(c).droppable({disabled:false});
					$(c).find(".cardPoints").hide();
				}
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
				this.trickEl.hide();
				this.handEl.hide();
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
				{
					setStatusMessage("You won the game!");
					this.showWinnerMessage();
				}
				else
				{
					setStatusMessage("You lost the game");
					this.showLoserMessage();
				}
				break;
				
			}
			
			switch(oldStage)
			{
			case "WAITING_FOR_PLAYERS":
				this.trickEl.show();
				this.handEl.show();
				break;
			case "DECLARATION":
				this.declarationMenuEl.hide();	
				this.updatePlayerDeclarations();
				break;
			case "POST_ROUND":
				this.gamePointChartEl.hide();
				this.trickEl.show();
				this.updatePlayerScores();
				this.updatePlayerDeclarations();
				break;
			case "WAITING_FOR_DEAL":
				this.dealButtonEl.hide();		
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
				var card = $('<div class="card">');
				card.append($('<div class="cardPlayer">'));
				card.append($('<div class="cardPoints">'));
				card.append($('<img class="cardImage">'));
				$("#trick").append(card);
				
			}
			
			var trick = getTrickCards();
			
			$("#trick .card").each(function(i, c){
				
				// Get the "no card" image
				$(c).find(".cardImage").attr("src", getCardUrl(null));
				$(c).find(".cardPoints").hide();
				
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
				var decEl = $('<input type="radio" value="'+d+'" name="declaration"/>');
				decEl.attr("id", d);
				form.append(decEl);
				var labelEl = $('<label>');
				labelEl.attr('for', d);
				labelEl.text(getDeclarationString(d));
				form.append(labelEl);
				form.append($('<br/>'));
			});
			form.append($('<input id="declareButton" type="button" value="Declare">').click(function(){
				var declaration = $("#declarationForm input[name=declaration]:checked").val();
				requestDeclaration(declaration, onGetGameState, onFailed);
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
			
			this.gamePointChartEl.show();
			this.trickEl.hide();
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
		updateTooltipPosition:function(){
			var playerDiv = getPlayerDiv(getCurrentPlayerId());
			
			var pos = playerDiv.offset();
			pos.top += playerDiv.height();
			
			this.playerTooltipEl.show();
			this.playerTooltipEl.offset(pos);
		},
		showWinnerMessage:function()
		{
			var msg = $('<div class="winnerMessage">');
			msg.text("You won the game!");
			$("body").append(msg);
			
		},
		showLoserMessage:function()
		{
			var msg = $('<div class="loserMessage">');
			msg.text("You lost");
			$("body").append(msg);
		}
}

	


