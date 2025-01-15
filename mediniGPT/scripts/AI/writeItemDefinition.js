load('./.lib/AI/util.js');

function getDescription(){
	return selection[0].description;
}

function updateDescription(content){
	selection[0].description = selection[0].description + '\n' + content;
}

function addAIinfo(){
	/* 
	<AI generated>
	Date, Time
	</AI generated>
	*/
}