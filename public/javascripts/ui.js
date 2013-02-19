var lastCardHand = null;
var lastTrickCards = null;
var lastNumPlayers = 0;
var lastTrickHistorySize = 0;
var gamePointChartEl;
var playerTooltipEl;
var statusMessageEl;
var declarationMenuEl;

function initializeUI()
{
	$("#dealButton").hide();
	$("#dealButton").click(function(){
		requestDeal(onGetGameState, onDealFailed);
	});
	$("#checkInButton").click(function(){
		requestCheckIn(onGetGameState, onFailed);
	});
	$("#checkInButton").hide();
	$("#declarationMenu").hide();
	gamePointChartEl = $("#gamePointChart");
	gamePointChartEl.hide();
	playerTooltipEl = $("#playerTooltip");
	statusMessageEl = $("#statusMessage");
	declarationMenuEl = $("#declarationMenu");

	// Build the player list, we need to do this before the tooltip's width is set
	updatePlayerList(game.players);
	
	playerTooltipEl.width($(getPlayerDiv(getPlayer().userId)).width());
}

function buildTrickCardElements(trick)
{
	$("#trick .card").remove();
	
	for(var i = 0; i < getNumPlayers(); i++)
	{
		$("#trick").append('<div class="card">');
	}
	
	$("#trick .card").each(function(i, c){
		
		$(c).html(getCardHtml(trick[i]));
		
		if(trick[i])
			return;
		
		$(c).droppable({
			greedy:true,
			accept:'#hand .card',
			tolerance:'touch',
			drop:function(event, ui){
				
				var draggedImg = ui.draggable.children('img').get(0);
				var droppedImg = $(event.target).children('img').get(0);
				var ourCard = $(droppedImg).attr('card');
				var card = $(draggedImg).attr('card');
				
				if(!ourCard && card && isPlayersTurn())
				{
					requestPlayCard(card, function(data){
						$(draggedImg).parent().hide();
						onGetGameState(data);
						
					}, function(data){
						ui.draggable.animate({top:0, left:0});
						onFailed(data);
					});
				}
				else
				{
					ui.draggable.draggable('option', 'revert', true);
				}
			}
		})
	});
}

function buildCardElements(changeSet)
{
	// Remove any cards that shouldn't be shown
	$("#hand .card").each(function(i, c){
		if(changeSet.remove.indexOf($(c).attr('card')) != -1)
			$(c).remove();
	});

	// Add any new cards
	$.each(changeSet.add, function(i, c){

		var newCard = $('<div class="card">');
		newCard.attr('card', c);
		$("#hand").append(newCard);

		newCard.draggable({
			revert:true,
			stop:function(event, ui){
				$(this).draggable('option', 'revert', true);
			}
		});
		
		newCard.html(getCardHtml(c));
		
		newCard.droppable({
			greedy:true,
			accept:'#hand .card',
			tolerance:'touch',
			drop:function(event, ui){
				
				// Swap images
				var draggedImg = ui.draggable.children('img').get(0);
				var droppedImg = $(event.target).children('img').get(0);
				$(event.target).append(draggedImg);
				ui.draggable.append(droppedImg);
				

				ui.draggable.draggable('option', 'revert', true);
				$(event.target).draggable('option', 'revert', true);
			}
		});
	});
	
	// Update the size of the hand box
	var totalHeight = $("#hand h3").height() * 3;
	totalHeight += $("#hand .card").height() * Math.ceil(($("#hand .card").length / 8));
	
	$("#hand").height(totalHeight);
}

function updateUI()
{
	updatePlayerList(game.players);
		
	updateStatusMessage();
	
	$("#checkInButton").hide();
	
	// Show deal button if dealer
	if(getStage() == "DEAL" && isDealer())
		$("#dealButton").show();
	else
		$("#dealButton").hide();
	
	if(getStage() == "DECLARATION" && hasDeclarations())
		showDeclarationMenu();
	else
		declarationMenuEl.hide();
	
	if(getStage() == "POST_TRICK" && !checkedIn())
		$("#checkInButton").show();
	
	if(getStage() == "POST_ROUND" && !checkedIn())
		$("#checkInButton").show();
		
	
	updateHand();
	updateTrick();
}

function showDeclarationMenu()
{
	// If it's already shown, don't worry about it
	if(declarationMenuEl.is(":visible"))
		return;
	
	var player = getPlayer();
	var declarations = player.declarations;
	
	declarationMenuEl.show();
	declarationMenuEl.html("");
	var form = $('<form id="declarationForm">');
	$.each(declarations, function(i, d){
		form.append($('<input type="radio" value="'+d+'" name="declaration">'+d+'</input>'));
		form.append($('<br/>'));
	});
	
	form.append($('<input id="declareButton" type="button" value="Declare">').click(function(){
		requestDeclaration(onGetGameState, onFailed);
	}));
	declarationMenuEl.append(form);
}

function updateTrick()
{
	var trick = getTrickCards();

	if(lastNumPlayers == getNumPlayers() && lastTrickCards != null && handMatches(trick, lastTrickCards))
		return;
	
	buildTrickCardElements(trick);
	
	lastTrickCards = trick;
	lastNumPlayers = getNumPlayers();
}

function updateHand()
{
	var hand = getPlayer().hand;
	
	var changeSet = getHandChangeSet(lastCardHand, hand);
	if(changeSet.add.length == 0 && changeSet.remove.length==0)
		return;

	buildCardElements(changeSet);
	lastCardHand = hand;
}

function updateStatusMessage()
{
	playerTooltipEl.hide();
	gamePointChartEl.hide();
	setStatusMessage("UNKNOWN STATUS");
	
	if(getStage() == "WAITING_FOR_PLAYERS")
	{
		setStatusMessage("Waiting for players to join.");
	}
	else if(getStage() == "DEAL")
	{
		setPlayerTooltip('Dealing');
		if(isDealer())
			setStatusMessage("It is your turn to deal.");
		else
			setStatusMessage("Waiting for "+getDealerName()+" to deal.");
	}
	else if(getStage() == "DECLARATION" && hasDeclarations())
	{
		setStatusMessage("Choose a declaration");
	}
	else if(getStage() == "DECLARATION")
	{
		setStatusMessage("Waiting for other players to declare.");
	}
	else if(getStage() == "TRICK" && isPlayersTurn())
	{
		setPlayerTooltip('Playing');		
		setStatusMessage("Please play a card");
	}
	else if(getStage() == "TRICK" && !isPlayersTurn())
	{
		setPlayerTooltip('Playing');				
		setStatusMessage("Waiting for "+getTrickTurnPlayer().name+" to play a card.")
	}
	else if(getStage() == "POST_TRICK")
	{
		setPlayerTooltip("Won the trick for "+getLastTrickPoints()+" points", getLastTrickWinnerId());
		
		if(!checkedIn())
			setStatusMessage("Please press continue when you're ready for the next trick.");
		else
			setStatusMessage("Waiting for other players to continue...");
			
	}
	else if(getStage() == "POST_ROUND")
	{
		showGamePointChart();
		
		if(!checkedIn())
			setStatusMessage("Please press continue when you're ready for the next game.");
		else
			setStatusMessage("Waiting for other players to continue...");
	}
	else if(getStage() == "POST_GAME")
	{
		showGamePointChart();
		
		if(isPlayerWinner())
		{
			setStatusMessage("You won the game!");
		}
		else
		{
			setStatusMessage("You lost the game");
		}
	}
}

function showGamePointChart()
{
	gamePointChartEl.children('.playerPointChart').each(function(i, c){
		var playerId = $(c).attr('playerid');
		var pointHistory = getPlayerGamePointHistory(playerId);
		
		$(c).find('.lastPoints').text(pointHistory.last);
		$(c).find('.diffPoints').text("+"+(pointHistory.total - pointHistory.last));
	});
	
	var trickEl = $("#trick");
	gamePointChartEl.show();
	gamePointChartEl.offset(trickEl.offset());
	gamePointChartEl.width(trickEl.width());
	gamePointChartEl.height(trickEl.height());
}

function updatePlayerList(players)
{
	$('#players').html("");
	gamePointChartEl.children('.playerPointChart').remove();
	$.each(players, function(i, p){
		var player = getPlayerByUserId(p.id);
		var playerDiv = $('<div class="player">');
		playerDiv.attr('playerId', p.id);
		if(p.id == getCurrentPlayerId())
			playerDiv.addClass('active');
		var scoreDiv = $('<div class="playerTrickScore">');
		scoreDiv.text(player.trickPoints||0);
		var nameDiv = $('<div class="playerName">');
		nameDiv.text(p.name);
		var gameScoreDiv = $('<div class="playerGameScore">');
		gameScoreDiv.text(player.gamePoints||0);
		var declareDiv = $('<div class="declaration">');
		if(p.id == getPublicDeclarationUserId())
			declareDiv.text(getPublicDeclarationString());
		playerDiv.append(nameDiv);
		playerDiv.append(gameScoreDiv);
		playerDiv.append(scoreDiv);
		playerDiv.append(declareDiv);
		$('#players').append(playerDiv);
		
		var pointChartDiv = $('<div class="playerPointChart">');
		pointChartDiv.attr('playerid', p.id);
		var pointChartName = $('<div class="playerName">');
		pointChartName.text(p.name);
		var pointChartLast = $('<div class="lastPoints">');
		var pointChartDiff = $('<div class="diffPoints">');
		
		pointChartDiv.append(pointChartName);
		pointChartDiv.append(pointChartLast);
		pointChartDiv.append(pointChartDiff);
		
		gamePointChartEl.append(pointChartDiv);
	});
	
}

function showOverlay(overlay)
{
	$("#mask").fadeTo(500, 0.25);
	$(overlay).show();
}
