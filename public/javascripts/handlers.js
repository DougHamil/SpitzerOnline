function onDealFailed(jqXHR, textStatus, errorThrown)
{
	var error = $.parseJSON(jqXHR.responseText);
	console.log(error.error);
	console.log(error);
}

function onFailed(jqXHR, textStatus, errorThrown)
{
	var error = jqXHR;
	if(!error)
		return;
	console.log($.parseJSON(error.responseText));
}

function onGetGameState(data){
	game = data;
//	console.log(data);
	onGameStateUpdate();
}

function onCardStaged(ev) {
  var image = ev.target;
  if (isCurrentPlayer()) {
    requestPlayCard($(image).attr('card'), onGetGameState, onFailed);
  }
  else {
    if (ui.staged) {
      $(ui.staged).removeClass('staged');
      if ($(ui.staged).attr('card') == $(image).attr('card')) {
        delete ui.staged;
        return;
      }
    }
    $(image).addClass('staged');
    ui.staged = image;
  }
}
