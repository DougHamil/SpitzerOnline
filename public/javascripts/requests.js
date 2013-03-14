function requestGetBots(suc, fail)
{
	$.ajax({
		url:routes.requestGetBots,
		type:'GET',
		dataType:'json',
		success:suc,
		error:fail
	});
}

function requestSaveBot(bot, suc, fail)
{
	console.log("Saving bot: ");
	console.log(bot);
	$.ajax({
		url:routes.requestSaveBot,
		type:'POST',
		contentType:'application/json; charset=utf-8',		
		data:JSON.stringify(bot),
		dataType:'json',
		success:suc,
		error:fail
	});
}

function requestCheckIn(suc, fail)
{
	$.ajax({
		url:routes.requestCheckIn,
		type:'POST',
		dataType:'json',
		success:suc,
		error:fail
	});
}

function requestAddBot(botType, suc, fail)
{
	var data = {type:botType};
	$.ajax({
		url:routes.requestAddBot,
		type:'POST',
		dataType:'json',
		contentType:'application/json; charset=utf-8',
		data:JSON.stringify(data),
		success:suc,
		error:fail
	});
}

function requestLogout()
{
	window.location = routes.requestLogout;
}

function requestPlayCard(card, suc, fail)
{
	if(!card)
		fail(card);

	if(card == undefined)
		return;
	// Handle either the Card object, or card enum
	if(card.enum)
		card = card.enum;
	
	var data = {card:card};
	$.ajax({
		url:routes.requestPlayCard,
		type:'POST',
		dataType:'json',
		contentType:'application/json; charset=utf-8',
		data:JSON.stringify(data),
		success:suc,
		error:fail
	});
}

function requestDeclaration(declaration, suc, fail)
{
	var data = {declaration:declaration};
	$.ajax({
		url:routes.requestDeclaration,
		type:'POST',
		dataType:'json',
		contentType:'application/json; charset=utf-8',
		data:JSON.stringify(data),
		success:suc,
		error:fail
	});
}

function requestDeal(suc, fail)
{
	$.ajax({
		url:routes.requestDeal,
		type:'POST',
		dataType:'json',
		success: suc,
		error:fail
	})
}

function requestGameState(suc, fail)
{
	$.ajax({
		url:routes.getGameState,
		type:'GET',
		dataType:'json',
		success: suc,
		error:fail
	})
}

