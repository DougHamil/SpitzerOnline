function onDealFailed(jqXHR, textStatus, errorThrown)
{
	var error = $.parseJSON(jqXHR.responseText);
	console.log(error.error);
	console.log(error);
}

function onFailed(jqXHR, textStatus, errorThrown)
{
	var error = jqXHR;
	console.log($.parseJSON(error.responseText));
}

function onGetGameState(data){
	game = data;
	console.log(data);
	onGameStateUpdate();
}