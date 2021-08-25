function init(){
    checkStatus();
}

async function checkStatus(){
    // we see a success block, that means the login passed
    if(document.getElementById("success")!==null){
        const apiToken = document.getElementById("apiToken").value;

        chrome.runtime.sendMessage({
			action: 'login_successful',
			token: apiToken
		}, function (response) {
            window.location.href = env.dashboardUrl + '?api_token=' + apiToken;
			log('runtime.sendMessage callback', response);
		});
    } 

    // the user failed to login via oauth
    else if(document.getElementById("error")!==null){
        chrome.runtime.sendMessage({
			action: 'login_failed'
		}, function (response) {
			log('runtime.sendMessage callback', response);
		});
    }
}

init();