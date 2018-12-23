var settings = {
		'user': false,
		'mail_tracking': false,
		'show_notifications':false,
		'timezone': 'GMT'
	},
	messaging,
	base_url = env.baseUrl,
	timezones = "Africa/Abidjan,Africa/Accra,Africa/Addis_Ababa,Africa/Algiers,Africa/Asmara,Africa/Bamako,Africa/Bangui,Africa/Banjul,Africa/Bissau,Africa/Blantyre,Africa/Brazzaville,Africa/Bujumbura,Africa/Cairo,Africa/Casablanca,Africa/Ceuta,Africa/Conakry,Africa/Dakar,Africa/Dar_es_Salaam,Africa/Djibouti,Africa/Douala,Africa/El_Aaiun,Africa/Freetown,Africa/Gaborone,Africa/Harare,Africa/Johannesburg,Africa/Juba,Africa/Kampala,Africa/Khartoum,Africa/Kigali,Africa/Kinshasa,Africa/Lagos,Africa/Libreville,Africa/Lome,Africa/Luanda,Africa/Lubumbashi,Africa/Lusaka,Africa/Malabo,Africa/Maputo,Africa/Maseru,Africa/Mbabane,Africa/Mogadishu,Africa/Monrovia,Africa/Nairobi,Africa/Ndjamena,Africa/Niamey,Africa/Nouakchott,Africa/Ouagadougou,Africa/Porto-Novo,Africa/Sao_Tome,Africa/Timbuktu,Africa/Tripoli,Africa/Tunis,Africa/Windhoek,America/Adak,America/Anchorage,America/Anguilla,America/Antigua,America/Araguaina,America/Argentina/Buenos_Aires,America/Argentina/Catamarca,America/Argentina/ComodRivadavia,America/Argentina/Cordoba,America/Argentina/Jujuy,America/Argentina/La_Rioja,America/Argentina/Mendoza,America/Argentina/Rio_Gallegos,America/Argentina/Salta,America/Argentina/San_Juan,America/Argentina/San_Luis,America/Argentina/Tucuman,America/Argentina/Ushuaia,America/Aruba,America/Asuncion,America/Atikokan,America/Atka,America/Bahia,America/Bahia_Banderas,America/Barbados,America/Belem,America/Belize,America/Blanc-Sablon,America/Boa_Vista,America/Bogota,America/Boise,America/Buenos_Aires,America/Cambridge_Bay,America/Campo_Grande,America/Cancun,America/Caracas,America/Catamarca,America/Cayenne,America/Cayman,America/Chicago,America/Chihuahua,America/Coral_Harbour,America/Cordoba,America/Costa_Rica,America/Creston,America/Cuiaba,America/Curacao,America/Danmarkshavn,America/Dawson,America/Dawson_Creek,America/Denver,America/Detroit,America/Dominica,America/Edmonton,America/Eirunepe,America/El_Salvador,America/Ensenada,America/Fort_Nelson,America/Fort_Wayne,America/Fortaleza,America/Glace_Bay,America/Godthab,America/Goose_Bay,America/Grand_Turk,America/Grenada,America/Guadeloupe,America/Guatemala,America/Guayaquil,America/Guyana,America/Halifax,America/Havana,America/Hermosillo,America/Indiana/Indianapolis,America/Indiana/Knox,America/Indiana/Marengo,America/Indiana/Petersburg,America/Indiana/Tell_City,America/Indiana/Vevay,America/Indiana/Vincennes,America/Indiana/Winamac,America/Indianapolis,America/Inuvik,America/Iqaluit,America/Jamaica,America/Jujuy,America/Juneau,America/Kentucky/Louisville,America/Kentucky/Monticello,America/Knox_IN,America/Kralendijk,America/La_Paz,America/Lima,America/Los_Angeles,America/Louisville,America/Lower_Princes,America/Maceio,America/Managua,America/Manaus,America/Marigot,America/Martinique,America/Matamoros,America/Mazatlan,America/Mendoza,America/Menominee,America/Merida,America/Metlakatla,America/Mexico_City,America/Miquelon,America/Moncton,America/Monterrey,America/Montevideo,America/Montreal,America/Montserrat,America/Nassau,America/New_York,America/Nipigon,America/Nome,America/Noronha,America/North_Dakota/Beulah,America/North_Dakota/Center,America/North_Dakota/New_Salem,America/Ojinaga,America/Panama,America/Pangnirtung,America/Paramaribo,America/Phoenix,America/Port_of_Spain,America/Port-au-Prince,America/Porto_Acre,America/Porto_Velho,America/Puerto_Rico,America/Punta_Arenas,America/Rainy_River,America/Rankin_Inlet,America/Recife,America/Regina,America/Resolute,America/Rio_Branco,America/Rosario,America/Santa_Isabel,America/Santarem,America/Santiago,America/Santo_Domingo,America/Sao_Paulo,America/Scoresbysund,America/Shiprock,America/Sitka,America/St_Barthelemy,America/St_Johns,America/St_Kitts,America/St_Lucia,America/St_Thomas,America/St_Vincent,America/Swift_Current,America/Tegucigalpa,America/Thule,America/Thunder_Bay,America/Tijuana,America/Toronto,America/Tortola,America/Vancouver,America/Virgin,America/Whitehorse,America/Winnipeg,America/Yakutat,America/Yellowknife,Antarctica/Casey,Antarctica/Davis,Antarctica/DumontDUrville,Antarctica/Macquarie,Antarctica/Mawson,Antarctica/McMurdo,Antarctica/Palmer,Antarctica/Rothera,Antarctica/South_Pole,Antarctica/Syowa,Antarctica/Troll,Antarctica/Vostok,Arctic/Longyearbyen,Asia/Aden,Asia/Almaty,Asia/Amman,Asia/Anadyr,Asia/Aqtau,Asia/Aqtobe,Asia/Ashgabat,Asia/Ashkhabad,Asia/Atyrau,Asia/Baghdad,Asia/Bahrain,Asia/Baku,Asia/Bangkok,Asia/Barnaul,Asia/Beirut,Asia/Bishkek,Asia/Brunei,Asia/Calcutta,Asia/Chita,Asia/Choibalsan,Asia/Chongqing,Asia/Chungking,Asia/Colombo,Asia/Dacca,Asia/Damascus,Asia/Dhaka,Asia/Dili,Asia/Dubai,Asia/Dushanbe,Asia/Famagusta,Asia/Gaza,Asia/Harbin,Asia/Hebron,Asia/Ho_Chi_Minh,Asia/Hong_Kong,Asia/Hovd,Asia/Irkutsk,Asia/Istanbul,Asia/Jakarta,Asia/Jayapura,Asia/Jerusalem,Asia/Kabul,Asia/Kamchatka,Asia/Karachi,Asia/Kashgar,Asia/Kathmandu,Asia/Katmandu,Asia/Khandyga,Asia/Kolkata,Asia/Krasnoyarsk,Asia/Kuala_Lumpur,Asia/Kuching,Asia/Kuwait,Asia/Macao,Asia/Macau,Asia/Magadan,Asia/Makassar,Asia/Manila,Asia/Muscat,Asia/Novokuznetsk,Asia/Novosibirsk,Asia/Omsk,Asia/Oral,Asia/Phnom_Penh,Asia/Pontianak,Asia/Pyongyang,Asia/Qatar,Asia/Qyzylorda,Asia/Rangoon,Asia/Riyadh,Asia/Saigon,Asia/Sakhalin,Asia/Samarkand,Asia/Seoul,Asia/Shanghai,Asia/Singapore,Asia/Srednekolymsk,Asia/Taipei,Asia/Tashkent,Asia/Tbilisi,Asia/Tehran,Asia/Tel_Aviv,Asia/Thimbu,Asia/Thimphu,Asia/Tokyo,Asia/Tomsk,Asia/Ujung_Pandang,Asia/Ulaanbaatar,Asia/Ulan_Bator,Asia/Urumqi,Asia/Ust-Nera,Asia/Vientiane,Asia/Vladivostok,Asia/Yakutsk,Asia/Yangon,Asia/Yekaterinburg,Asia/Yerevan,Atlantic/Azores,Atlantic/Bermuda,Atlantic/Canary,Atlantic/Cape_Verde,Atlantic/Faeroe,Atlantic/Faroe,Atlantic/Jan_Mayen,Atlantic/Madeira,Atlantic/Reykjavik,Atlantic/South_Georgia,Atlantic/St_Helena,Atlantic/Stanley,Australia/ACT,Australia/Adelaide,Australia/Brisbane,Australia/Broken_Hill,Australia/Canberra,Australia/Currie,Australia/Darwin,Australia/Eucla,Australia/Hobart,Australia/LHI,Australia/Lindeman,Australia/Lord_Howe,Australia/Melbourne,Australia/North,Australia/NSW,Australia/Perth,Australia/Queensland,Australia/South,Australia/Sydney,Australia/Tasmania,Australia/Victoria,Australia/West,Australia/Yancowinna,Brazil/Acre,Brazil/DeNoronha,Brazil/East,Brazil/West,Canada/Atlantic,Canada/Central,Canada/Eastern,Canada/Mountain,Canada/Newfoundland,Canada/Pacific,Canada/Saskatchewan,Canada/Yukon,CET,Chile/Continental,Chile/EasterIsland,CST6CDT,Cuba,EET,Egypt,Eire,EST,EST5EDT,Etc/GMT,Etc/GMT+0,Etc/GMT+1,Etc/GMT+10,Etc/GMT+11,Etc/GMT+12,Etc/GMT+2,Etc/GMT+3,Etc/GMT+4,Etc/GMT+5,Etc/GMT+6,Etc/GMT+7,Etc/GMT+8,Etc/GMT+9,Etc/GMT0,Etc/GMT-0,Etc/GMT-1,Etc/GMT-10,Etc/GMT-11,Etc/GMT-12,Etc/GMT-13,Etc/GMT-14,Etc/GMT-2,Etc/GMT-3,Etc/GMT-4,Etc/GMT-5,Etc/GMT-6,Etc/GMT-7,Etc/GMT-8,Etc/GMT-9,Etc/Greenwich,Etc/UCT,Etc/Universal,Etc/UTC,Etc/Zulu,Europe/Amsterdam,Europe/Andorra,Europe/Astrakhan,Europe/Athens,Europe/Belfast,Europe/Belgrade,Europe/Berlin,Europe/Bratislava,Europe/Brussels,Europe/Bucharest,Europe/Budapest,Europe/Busingen,Europe/Chisinau,Europe/Copenhagen,Europe/Dublin,Europe/Gibraltar,Europe/Guernsey,Europe/Helsinki,Europe/Isle_of_Man,Europe/Istanbul,Europe/Jersey,Europe/Kaliningrad,Europe/Kiev,Europe/Kirov,Europe/Lisbon,Europe/Ljubljana,Europe/London,Europe/Luxembourg,Europe/Madrid,Europe/Malta,Europe/Mariehamn,Europe/Minsk,Europe/Monaco,Europe/Moscow,Europe/Nicosia,Europe/Oslo,Europe/Paris,Europe/Podgorica,Europe/Prague,Europe/Riga,Europe/Rome,Europe/Samara,Europe/San_Marino,Europe/Sarajevo,Europe/Saratov,Europe/Simferopol,Europe/Skopje,Europe/Sofia,Europe/Stockholm,Europe/Tallinn,Europe/Tirane,Europe/Tiraspol,Europe/Ulyanovsk,Europe/Uzhgorod,Europe/Vaduz,Europe/Vatican,Europe/Vienna,Europe/Vilnius,Europe/Volgograd,Europe/Warsaw,Europe/Zagreb,Europe/Zaporozhye,Europe/Zurich,GB,GB-Eire,GMT,Greenwich,Hongkong,HST,Iceland,Indian/Antananarivo,Indian/Chagos,Indian/Christmas,Indian/Cocos,Indian/Comoro,Indian/Kerguelen,Indian/Mahe,Indian/Maldives,Indian/Mauritius,Indian/Mayotte,Indian/Reunion,Iran,Israel,Jamaica,Japan,Kwajalein,Libya,MET,Mexico/BajaNorte,Mexico/BajaSur,Mexico/General,MST,MST7MDT,Navajo,NZ,NZ-CHAT,Pacific/Apia,Pacific/Auckland,Pacific/Bougainville,Pacific/Chatham,Pacific/Chuuk,Pacific/Easter,Pacific/Efate,Pacific/Enderbury,Pacific/Fakaofo,Pacific/Fiji,Pacific/Funafuti,Pacific/Galapagos,Pacific/Gambier,Pacific/Guadalcanal,Pacific/Guam,Pacific/Honolulu,Pacific/Johnston,Pacific/Kiritimati,Pacific/Kosrae,Pacific/Kwajalein,Pacific/Majuro,Pacific/Marquesas,Pacific/Midway,Pacific/Nauru,Pacific/Niue,Pacific/Norfolk,Pacific/Noumea,Pacific/Pago_Pago,Pacific/Palau,Pacific/Pitcairn,Pacific/Pohnpei,Pacific/Ponape,Pacific/Port_Moresby,Pacific/Rarotonga,Pacific/Saipan,Pacific/Samoa,Pacific/Tahiti,Pacific/Tarawa,Pacific/Tongatapu,Pacific/Truk,Pacific/Wake,Pacific/Wallis,Pacific/Yap,Poland,Portugal,PRC,PST8PDT,ROC,ROK,Singapore,Turkey,UCT,Universal,US/Alaska,US/Aleutian,US/Arizona,US/Central,US/Eastern,US/East-Indiana,US/Hawaii,US/Indiana-Starke,US/Michigan,US/Mountain,US/Pacific,US/Pacific-New,US/Samoa,UTC,WET,W-SU,Zulu";
jQuery(document).ready(function($){

	//last seen version reset(for the NEW badge)
	chrome.storage.local.set({
		'last_seen_version': chrome.app.getDetails().version
	}, function () {
		chrome.browserAction.setBadgeText({
			text: ''
		});
	});

	//populate the timezone select box
	var t_arr=timezones.split(","),options="";
	for(let i=0;i<t_arr.length;i++){
		options+="<option value='"+t_arr[i]+"'>"+t_arr[i]+"</option>";
	}
	$("#timezone_setting").append(options);
	//initialize the settings
	refresh_settings();

	//logout button
	$(".logout").on("click",function(e){
		e.preventDefault();
		settings={};
		update_settings();
	});

	//start the verification process
	$("#verify_email").on("click",function(){
		var email=$("#user_email").val();
		//pre sending validation
		if(!is_email_valid(email)){
			show_errors("The email seems to be invalid!");
			return false;
		}
		$("#verify_email").attr("disabled",true);
		
		//start the OTP sending process
		$.post(base_url+"user/login",{email:email},function(response){
			console.log(response);
			$("#verify_email").removeAttr("disabled");
			settings.user={email:email};
			update_settings();
		});
	});

	//hitting enter on the email input should also verify the email
	$("#user_email").on("keypress",function(e){
		if(e.which==13){
			e.preventDefault();
			$("#verify_email").trigger("click");
		}
	});

	//clicking on `change email` should allow the user to change email
	$("#change_email").on("click",function(){
		$("#user_email").removeAttr("disabled");
		$(this).addClass("hidden");
		$("#verify_email").removeClass("hidden");
	});

	//verify the OTP
	$("#verify_otp").on("click",function(){
		var otp=$("#otp").val();

		//OTP verification
		$.post(base_url + "user/verify", {
			email: settings.user.email,
			otp: otp
		}, function (response) {
			console.log(response);
			if(!response.user.api_token){
				show_errors("Could not verify this user!");
			}
				settings.user.api_token=response.user.api_token;
				settings.user.verified=true;
				settings.mail_tracking=true;
				settings.show_notifications=true;
			if(response.user.timezone)
				settings.timezone=response.user.timezone;
			if(response.user.hashes)
				settings.hashes=response.user.hashes;
			update_settings();
		});
	});

	$("#chk_show_notifs").on("change",function(){
		// if($(this).prop("checked")=="1")
			// getFcmPermissions();
	});

	$("#save_settings").on("click",function(){
		//show notifications?
		if ($("#chk_show_notifs").prop("checked"))
			settings.show_notifications = true;
		else
			settings.show_notifications = false;

		//tracking	
		if ($("#chk_tracking_status").prop("checked"))
			settings.mail_tracking = true;
		else
			settings.mail_tracking = false;

		$.post(base_url + "user/update_timezone", {
			timezone : $("#timezone_setting").val(),
			api_token: settings.user.api_token
		}, function (response) {
			console.log(response);
			settings.timezone = $("#timezone_setting").val();
			update_settings();
		});
	});

	//Tabs
	$(".menu").find("a").on("click",function(e){
		e.preventDefault();
		if($(this).hasClass("active") || $(this).hasClass("logout"))
			return;
		
		var index=$(this).index(".menu a");
		$(".menu").find("a").removeClass("active").eq(index).addClass("active");
		// $(this).removeClass("active");

		$("#tab_contents").find(".tab_content").removeClass("active").eq(index).addClass("active");
	})

	//modals
	$(".modal_close").on("click",function(){
		$("#modal").removeClass("visible");
		setTimeout(function(){
			$("#modal_content").html("");
		},600);
	});

	//detect escape key
	$(document).keyup(function (e) {
		if (e.key === "Escape") {
			if($("#modal").hasClass("visible")){
				$(".modal_close").first().trigger("click");
			}
		}
	});

	//dismiss button on the alerts
	$(".announcement").find(".dismiss").on("click", function (e) {
		e.preventDefault();
		$(this).parent(".announcement").slideUp(function () {
			chrome.storage.local.set({
				'alert_dismissed':true
			},function(){});
		});
	});

	// firebase.initializeApp(env.firebaseConfig);
	// window.messaging = firebase.messaging();
	// window.messaging.usePublicVapidKey(env.publicVapidKey);
	// getFcmPermissions();

	// window.messaging.onTokenRefresh(function () {
	// 	messaging.getToken().then(function (token) {
	// 		// console.log('Token refreshed.');
	// 		// console.log(token);
	// 		send_token_to_server(token, function (response) {
	// 			if (response.code == "1") {
	// 				window.settings.push_token = token;
	// 				window.settings.show_notifications = true;
	// 				$("#notifications_setting").find(".error").html("").addClass("hidden");
	// 			} else {
	// 				window.settings.show_notifications = false;
	// 				delete window.settings.push_token;
	// 				$("#notifications_setting").find(".error").html("Refresh of FCM token failed, please try again!").removeClass("hidden");
	// 			}
	// 			update_settings();
	// 		});
	// 	}).catch(function (err) {
	// 		window.settings.show_notifications = false;
	// 		delete window.settings.push_token;
	// 		$("#notifications_setting").find(".error").html("Could not get FCM token, please try again!").removeClass("hidden");
	// 		update_settings();
	// 	});
	// });

	// window.messaging.onMessage(function (payload) {
	// 	console.log('Message received. ', payload);
	// 	chrome.notifications.create("from_options",{
	// 		type:'basic',
	// 		iconUrl:'images/icon_notif.png',
	// 		title:'From Options',
	// 		message:'Test msg',
	// 		priority: 1
	// 	});
	// 	console.log("Last error:", chrome.runtime.lastError);
	// });

	//pubnub
	var pubnub = new PubNub({
		subscribeKey: env.pubnub.subscribeKey,
		ssl: true
	})


	pubnub.addListener({
		status: function (statusEvent) {
			console.log("status",statusEvent);
			// if (statusEvent.category === "PNConnectedCategory") {
			// 	var payload = {
			// 		my: 'payload'
			// 	};
			// 	pubnub.publish({
			// 			message: payload
			// 		},
			// 		function (status) {
			// 			// handle publish response
			// 		}
			// 	);
			// }
		},
		message: function (message) {
			// handle message
			console.log("message",message);
		},
		presence: function (presenceEvent) {
			// handle presence
			console.log("presence",presence);
		}
	});

	pubnub.subscribe({
		channels: ['my_channel'],
	});
});

// function getFcmPermissions(){
// 	window.messaging.requestPermission().then(function () {
// 		//the user has given access
// 		window.messaging.getToken().then(function(token){
// 			if(token){
// 				console.log(token);
// 				send_token_to_server(token,function(response){
// 					if(response.code=="1"){
// 						window.settings.push_token = token;
// 						window.settings.show_notifications = true;
// 						$("#notifications_setting").find(".error").html("").addClass("hidden");
// 					}
// 					else{
// 						window.settings.show_notifications = false;
// 						delete window.settings.push_token;
// 						$("#notifications_setting").find(".error").html("Could not get FCM token, please try again!").removeClass("hidden");
// 					}
// 					update_settings();
// 				});
// 			} else {
// 				window.settings.show_notifications=false;
// 				delete window.settings.push_token;
// 				$("#notifications_setting").find(".error").html("Could not get FCM token, please try again!").removeClass("hidden");
// 				update_settings();
// 			}
// 		}).catch(function (err) {
// 			window.settings.show_notifications = false;
// 			delete window.settings.push_token;
// 			$("#notifications_setting").find(".error").html("Could not get FCM token, please try again!").removeClass("hidden");
// 			update_settings();
// 		});
// 	}).catch(function(err){
// 		delete window.settings.push_token;
// 		window.settings.show_notifications=false;
// 		$("#notifications_setting").find(".error").html("Permissions blocked!").removeClass("hidden");
// 		update_settings();
// 	});
// }

function send_token_to_server(token,callback){
	$.post(base_url+"user/devices/new",{
		api_token:window.settings.user.api_token,
		push_token:token,
		name:'chrome'
	},function(response){
		callback(response);
	});
}

function update_settings(do_refresh,cb){

	//if the user wants to show notifications, butdoesn't have any push_token
	//Then we simply switch off the show_notifications toggle
	if (settings.show_notifications && !settings.push_token) {
		settings.show_notifications = false;
	}

	chrome.storage.local.set({
		'zmt_settings': JSON.stringify(settings)
	}, function () {
		if(do_refresh===undefined || do_refresh)
			refresh_settings();
		if(cb!==undefined)
			cb();
	});
}

function refresh_settings(){
	chrome.storage.local.get("zmt_settings", function (result) {
		// console.log(result);
		if(result.zmt_settings!==undefined){
			console.log(result.zmt_settings);
			window.settings = JSON.parse(result.zmt_settings);
		}

		if(!settings.user){
			$("#user_email").removeAttr("disabled").val("");
			$("#verify_email").removeClass("hidden");
			$("#change_email").addClass("hidden");
		}

		if(settings.user && settings.user.email){
			$("#user_email").attr("disabled",true).val(settings.user.email);
			$("#verify_email").addClass("hidden");
			$("#change_email").removeClass("hidden");
		}

		if(!settings.user || (settings.user.email && settings.user.verified)){
			$(".otp_input").addClass("hidden");
		}
		else if(settings.user && settings.user.email && !settings.user.verified){
			$(".otp_input").removeClass("hidden");
		}

		if(settings.user && settings.user.email && settings.user.verified){
			$(".extra_settings").removeClass("hidden");
		}
		else{
			$(".extra_settings").addClass("hidden");
		}

		if(settings.mail_tracking){
			$("#chk_tracking_status").prop("checked",true);
		}
		else{
			$("#chk_tracking_status").prop("checked", false);
		}

		if(settings.show_notifications && settings.push_token!==undefined){
			$("#chk_show_notifs").prop("checked",true);
		}
		else{
			$("#chk_show_notifs").prop("checked", false);
		}

		var selected_tz=settings.timezone===undefined?"GMT":settings.timezone
		$("#timezone_setting").find("option[value='" + selected_tz + "']").attr("selected",true);

		load_history();

		$("body").on("click", ".show_email_views",function(e){
			e.preventDefault();
			var hash=$(this).attr("data-email");
			$.post(base_url + `emails/${hash}/details`, {
				api_token: settings.user.api_token
			}, function (response) {
				let html=`
					<div class='email_subject'><strong>Email: </strong> ${response.subject}</div>
					<table class="email_views">
						<thead>
							<tr>
								<td>S.No.</td>
								<td>IP</td>
								<td>Device</td>
								<td>Location</td>
								<td>User Agent</td>
								<td>Time</td>
							</tr>
						</thead>
						<tbody>
				`;
				if(response.details.length==0)
					html+="<tr><td colspan=6 style='text-align:center;'>This email hasn't been viewed yet!</td></tr>";
				else{
					for(let i=0;i<response.details.length;i++){
						let row=response.details[i];
						html+=`
							<tr class="email_view">
								<td>${(i+1)}</td>
								<td>${row.user_ip}</td>
								<td>${row.device}</td>
								<td>${row.location}</td>
								<td>${row.user_agent}</td>
								<td><div class="time">${row.viewed_at}</div></td>
							</tr>
						`;
					}
				}
				html+=`</tbody></table>`;
				show_modal(html,'success','Success!');
			});
		});
	});

	//
	chrome.storage.local.get('alert_dismissed',function(result){
		if(!result.alert_dismissed){
			$(".announcement").slideDown();
		}
	});
}

function load_history(){
	if(!settings.user || !settings.user.verified || !settings.user.api_token){
		$("#history_div").html("<tr><td colspan=7>You need to log in before seeing the history!</td></tr>");
		return;
	}

	$.post(base_url + "user/history", {
		api_token:settings.user.api_token
	}, function (response) {
		if(!response.history || response.history.length==0){
			$("#history_table").find("tbody").html("<tr><td colspan=7>No emails being tracked!</td></tr>");
			return;
		}

		var html="";
		for(let i=0;i<response.history.length;i++){
			let row=response.history[i];
			html+=`<tr>
						<td>${(i+1)}</td>
						<td><a href='#' data-email='${row.hash}' class='show_email_views'>Details</a></td>
						<td>${row.subject}</td>
						<td>${row.views_count}</td>
						<td>${row.to_field}</td>
						<td>${row.cc_field}</td>
						<td>${row.bcc_field}</td>
					</tr>`;
		}
		$("#history_table").find("tbody").html(html);

	});
}

function is_email_valid(email){
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function show_errors(str){
	// show_modal(str,'error','Errors!');
	alert(str);
}

function show_modal(str,type,title){
	$("#modal_content").html(str);
	$("#modal").addClass("visible");
}