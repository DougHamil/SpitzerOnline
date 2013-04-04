var botManager = {
		aiEditorEl:null,
		aiEditorCodeMirror:null,
		bots:null,
		activeBot:null,
		init:function(){
			this.aiEditorEl = $("aiEditorTextArea");
			
			// Events
			$(eventManager).on('stageChange', $.proxy(this.onStageChange, this));
			$(eventManager).on('playerChange', $.proxy(this.onPlayerChange, this));
			$(eventManager).on('trickChange', $.proxy(this.onTrickChange, this));
			$(eventManager).on('handChange', $.proxy(this.onHandChange, this));
			$(eventManager).on('currentPlayerChange', $.proxy(this.onCurrentPlayerChanged, this));
			$(eventManager).on('playerCheckedIn', $.proxy(this.onPlayersCheckIn, this));
			
			this.initEditor();
		},
		onStageChange:function(event, oldStage, newStage){
			
			if(!bot)
				return;
			
			switch(newStage)
			{
			case "POST_ROUND":
				var trick = createTrick();
				var hand = createHandForPlayer(getPlayer().userId);
				var players = createAllPlayers();
				if(playerWonLastTrick() && bot.onWonTrick)
					bot.onWonTrick(trick, hand, players, createThisPlayer());
				if(!playerWonLastTrick() && bot.onLostTrick)
					bot.onLostTrick(trick, hand, players, createThisPlayer());
				if(bot.onTrickEnd)
					bot.onTrickEnd(trick, hand, players, createThisPlayer());
				if(playerWonLastRound() && bot.onWonRound)
					bot.onWonRound(trick, players, createThisPlayer());
				if(!playerWonLastRound() && bot.onLostRound)
					bot.onLostRound(trick, players, createThisPlayer());
				if(bot.onRoundEnd)
					bot.onRoundEnd(trick, players, createThisPlayer());
				
				break;
			case "POST_TRICK":
				var trick = createTrick();
				var hand = createHandForPlayer(getPlayer().userId);
				var players = createAllPlayers();
				if(playerWonLastTrick() && bot.onWonTrick)
					bot.onWonTrick(trick, hand, players, createThisPlayer());
				if(!playerWonLastTrick() && bot.onLostTrick)
					bot.onLostTrick(trick, hand, players, createThisPlayer());
				if(bot.onTrickEnd)
					bot.onTrickEnd(trick, hand, players, createThisPlayer());
				break;
			case "WAITING_FOR_DEAL":
				if(isCurrentPlayer() && bot && bot.autoDeal)
					requestDeal(onGetGameState, onFailed);
				break;
			case "TRICK":
				if(oldStage == "DEAL")
					this.invokeBotMethod("onDeal", [createPlayerHand(), createThisPlayer()]);
				break;
			}
		},
		onPlayerChange:function(event, players, added, removed){
			
		},
		onTrickChange:function(event, oldTrick, newTrick){
			
		},
		onHandChange:function(event, oldHand, newHand){
			
		},
		onCurrentPlayerChanged:function(event, oldCurrentPlayer, currentPlayer, stage, oldStage){
			if(!bot)
				return;

			var isCurrentPlayer = getPlayerId() == currentPlayer;
			
			switch(stage)
			{
			case "DECLARATION":
				if(isCurrentPlayer && bot.declare)
				{
					var hand = createHandForPlayer(currentPlayer);
					
					requestDeclaration(bot.declare(getPlayer().declarations, hand, createThisPlayer()), onGetGameState, function(data){
							onFailed(data);
							ui.showNotification('', 'Bot failed to declare!', 'Your bot failed to declare, please declare');
							console.log("Your bot failed to make a valid declaration");
							setStatusMessage("Bot declaration failed, please declare.");
						}
					);
				}
				break;
			case "TRICK":
				if (!isCurrentPlayer) break;

				var hand = createHandForPlayer(currentPlayer);
				var staged = ui.staged;
				delete ui.staged;
				$(staged).removeClass('staged');
				if (staged) {
					if (hand.getValidCards().map(function(c){return c.enum}).indexOf($(staged).attr('card')) > -1) {
						requestPlayCard($(staged).attr('card'), onGetGameState, onFailed);
						break;
					}
					else if (!bot.playCard) {
						ui.showNotification('','Staged card failed', "It's your turn to play a card!");
						setStatusMessage("Please play a card.");
					}
				}
				// Let the bot pick a card
				if(bot.playCard)
				{
					var trick = createTrick();
					
					requestPlayCard(bot.playCard(trick, hand.getValidCards(), hand, createThisPlayer()), onGetGameState, function(data){
						onFailed(data);
						ui.showNotification('', 'Your bot failed!', 'Your bot failed to play a card, please play a card');
						console.log("Your bot failed to play a valid card!");
						setStatusMessage("Bot failed, please play a card.");
					});
				}
				break;
			}
			
			switch(oldStage)
			{
			case "DECLARATION":
				if(bot.onDeclarationMade)
				{
					// A declaration was made
					var playerData = getPlayerData(getLastCheckedInPlayer());
					bot.onDeclarationMade(getPublicDeclaration(), new Player(playerData));
				}
				break;
			case "TRICK":
				// A player must have played a card
				var trick = createTrick();
				if(bot.onCardPlayed)
					bot.onCardPlayed(trick.getLastCardPlayed(), trick, createPlayerHand());
				break;
			}
		},
		onPlayersCheckIn:function(event, oldPlayerCheckins, playerCheckins, stage){
			
		},
		invokeBotMethod:function(methodName, arguments)
		{
			if(bot && bot[methodName] != undefined)
				bot[methodName].apply(bot, arguments);
		},
		saveBot:function()
		{
			if(this.activeBot == null)
				return;
			
			if(this.activeBot.id < 0)
				delete this.activeBot.id;
			
			this.activeBot.script = this.aiEditorCodeMirror.getValue();
			
			// Request a save of the active bot, and update the bots if it succeeds
			requestSaveBot(this.activeBot, function(data){
					// Assign the active bot id
					botManager.activeBot.id = parseInt(data);
					eval('bot = '+botManager.activeBot.script);
					requestGetBots($.proxy(this.updateEditor, this), onFailed);
					ui.showNotification('', 'Bot Saved', 'Your bot was successfully saved!');
				},
				function(){
					console.log("Bot failed to save!");
					ui.showNotification('', 'Bot Failed to Save', 'Your bot could not be saved!');
			});
		},
		updateEditor:function(bots){
			var selectEl = $("#botSelect");
			selectEl.html("");
			
			for(var b in bots)
			{
				b = bots[b];
				var optionEl = $("<option>");
				if(b.id != undefined)
					optionEl.attr("value", b.id);
				optionEl.text(b.name);
				selectEl.append(optionEl);
			}
			
			this.bots = bots;
			
			// Make sure the last active bot is selected
			if(this.activeBot != null)
			{
				$("#botSelect option").eq(this.activeBot.id).attr('selected', 'selected');
			}
			else
			{
				$("#botSelect option").attr('selected', 'selected');
			}
			
			$("#botSelect").trigger('change');
			
		},
		getBotById:function(id) {
			for(var bot in this.bots)
			{
				bot = this.bots[bot];
				
				if(bot.id == id)
					return bot;
			}
			return null;
		},
		newBot:function(){
			var bot = {name:"New Bot", script:"{\n// Define your bot here!\n\tplayCard:function(trick, valid, hand){\n\t}\n}"};
			bot.id = -1;
			this.bots.push(bot);
			this.setActiveBot(-1);
			this.updateEditor(this.bots);
		},
		setActiveBot:function(botId){
			var bot = this.getBotById(botId);
			this.activeBot = bot;
			if(bot)
				this.aiEditorCodeMirror.setValue(bot.script);
		},
		initEditor:function(){
			this.aiEditorEl = $("#aiEditor");
			this.aiEditorCodeMirror = CodeMirror.fromTextArea(this.aiEditorEl.get(0),
					{
						theme:'eclipse',
						mode:'javascript',
						lineNumbers:true,
					}
			);
			var panelEl = $('.panel');
			var triggerEl = $('.trigger');
			//Bind a click handler to the trigger
			triggerEl.bind('click' , function() {
				//If the panel isn't out
				if(!panelEl.hasClass('out')){
					//Animate it to left 0px
					panelEl.animate({
						'left' : '0px'
					});
					//Add the out class
					panelEl.addClass('out');
				}
				else {
					//Otherwise, animate it back in
					panelEl.animate({
						'left' : '-580px'
					});
					//Remove the out class
					panelEl.removeClass('out');
				}
			});
			
			$("#botSelect").change(function() {
				botManager.setActiveBot($(this).find("option:selected").attr("value"));
			});
			
			requestGetBots($.proxy(this.updateEditor, this), onFailed);
		}
}
