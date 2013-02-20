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
				$(this).trigger('trickChange', [this.oldState ? this.oldState.trickCardsOrdered.length : null, state.trickCardsOrdered]);
			
			// Check for player hand change
			if(this.oldPlayerHand == null || this.oldPlayerHand.length != getPlayerHand().length)
				$(this).trigger('handChange', this.getHandChangeSet(this.oldPlayerHand, getPlayerHand()));
			
			// Check for active player change
			if(this.oldState == null || this.oldState.currentPlayer != state.currentPlayer)
				$(this).trigger('currentPlayerChange', [this.oldState ? this.oldState.currentPlayer : null, state.currentPlayer, state.stage]);
			
			// Check for checkIn change
			if(this.oldState == null || this.oldState.playerCheckins.length != state.playerCheckins.length)
				$(this).trigger('playerCheckedIn', [this.oldState ? this.oldState.playerCheckins : null, state.playerCheckins, state.stage]);
			
			this.oldPlayerHand = getPlayerHand();
			this.oldState = state;
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