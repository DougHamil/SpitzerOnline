var eventManager = {
		oldState:null,
		oldPlayerHand:null,
		update:function(state){
			
			// Check for first run
			if(this.oldState == null)
				$(this).trigger('initialize', state);
			
			// Check for player change
			if(this.oldState == null || this.oldState.players.length != state.players.length)
				this.checkForPlayerChange(state);
			
			// Check for stage change
			if(this.oldState == null || this.oldState.stage != state.stage)
				$(this).trigger('stageChange', [this.oldState ? this.oldState.stage : null, state.stage]);
			
			// Check for trick cards change
			if(this.oldState == null || this.oldState.trickCardsOrdered.length != state.trickCardsOrdered.length)
				$(this).trigger('trickChange', [this.oldState ? this.oldState.trickCardsOrdered : null, state.trickCardsOrdered]);
			
			// Check for player hand change
			if(this.oldPlayerHand == null || this.oldPlayerHand.length != getPlayerHand().length)
				$(this).trigger('handChange', this.getHandChangeSet(this.oldPlayerHand, getPlayerHand()));
			
			// Check for active player change
			if(this.oldState == null || this.oldState.currentPlayer != state.currentPlayer || this.oldState.stage != state.stage)
				this.checkForCurrentPlayerChange(state);
			
			// Check for checkIn change
			if(this.oldState == null || this.oldState.playerCheckins.length != state.playerCheckins.length)
				$(this).trigger('playerCheckedIn', [this.oldState ? this.oldState.playerCheckins : null, state.playerCheckins, state.stage]);
			
			this.oldPlayerHand = getPlayerHand();
			this.oldState = state;
		},
		checkForCurrentPlayerChange:function(state){
			var lastPlayer = this.oldState ? this.oldState.currentPlayer : null;
			var oldPlayers = [];	

			// If the last player is the current player, that means there was a state change
			if(lastPlayer == state.currentPlayer)
				oldPlayers.push(state.currentPlayer);

			if(lastPlayer != null)
			{
				// It is possible multiple players shifted, invoke the method for each change
				var lastPlayerIndex = this.getIndexOfPlayerId(state, lastPlayer); 

				while(lastPlayer != state.currentPlayer)
				{
					oldPlayers.push(lastPlayer);
					lastPlayerIndex++;
					if(lastPlayerIndex >= state.players.length)
						lastPlayerIndex = 0;
					lastPlayer = state.players[lastPlayerIndex].userId;
				}
			} else { oldPlayers.push(lastPlayer); }

			oldPlayers.push(state.currentPlayer);

			// Invoke method for each player change
			for(var p = 0; p < oldPlayers.length - 1; p++)
			{
				$(this).trigger('currentPlayerChange', [oldPlayers[p], oldPlayers[p+1], state.stage, this.oldState ? this.oldState.stage : null]);
			}
		},
		getIndexOfPlayerId:function(state, id){
			for(var p in state.players)
			{
				if(state.players[p].userId == id)
					return p;
			}
			return null;
		},
		getHandChangeSet:function(current, target)
		{
			if(!current)
				return [target||[], []];
			if(!target)
				return [[], current||[]];

			var toRemove = [];
			for(var card in current)
			{
				if(target.indexOf(current[card]) == -1)
					toRemove.push(current[card]);
			}

			var toAdd = [];
			for(var card in target)
			{
				if(current.indexOf(target[card]) == -1)
					toAdd.push(target[card]);
			}

			return [toAdd, toRemove];
		},
		checkForPlayerChange:function(state)
		{
			var newPlayersById = {};
			for(var p in state.players)
			{
				newPlayersById[state.players[p].userId] = state.players[p];
			}
			var currentPlayersById = {}
			if(this.oldState != null)
			{
				for(var p in this.oldState.players)
				{
					currentPlayersById[this.oldState.players[p].userId] = this.oldState.players[p];
				}
			}
			
			var removed = [];
			var added = [];
			for(var p in currentPlayersById)
			{
				if(newPlayersById[p] == undefined)
				{
					removed.push(currentPlayersById[p]);
				}
			}
			
			for(var p in newPlayersById)
			{
				if(currentPlayersById[p] == undefined)
				{
					added.push(newPlayersById[p]);
				}
			}
			
			$(this).trigger('playerChange', [state.players, added, removed]);
		}
}
