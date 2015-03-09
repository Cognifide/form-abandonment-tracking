var formTrackingModule = (function($){

var config = {
	inputTypesTracking : ["text", "radio", "checkbox"],
	inputEventsTracking : ["focus", "blur"],
	timeTracking : true,
	ConsoleLogging : true,
	focusCounter : true,
	mapper : {
		lastFocusName : 'eVar20',
		lastBlurName : 'eVar21',
		lastFocusValue : 'eVar22',
		lastFocusTime : 'eVar23',
		biggestInputTime : 'event20',
		biggestInputTypeName : 'eVar24'
	}
},

formTrackingAbandon = (function() {

	var api = {},
	output = {
		lastFocusName : "",
		lastBlurName : "",
		lastFocusValue : null,
		lastFocusTime : 0,
		biggestInputTime : 0,
		biggestInputTypeName : "",
		FocusCaption : null,
		v : 0
	},
	focusCount = false,
	debug = falsek
	mapper = {};

	function inputEventPrivate(event) {
		var $this = $(this);

		if (event.data.config.timeTracking) {
			inputEventWithTime(event, $this.attr('name'), $this.val());
		} else {
			inputEvent(event, $this.attr('name'), $this.val());
		}
	}

	function inputEvent(event, name, val) {
		var log;

		if (event.data.jName === 'focus') {
			focusCounter(event);
			output.lastFocusName = name;
			log = lastFocusName;
			if (debug) {
				console.log(log);
			};
		}
		if (event.data.jName === 'blur') {
			output.lastBlurName = name;
			output.lastFocusValue = val;
			log = output.lastFocusName + ' ' + output.lastFocusValue;
			if (debug) {
				console.log(log);
			};
		}

	}

	function focusCounter(event) {
		if (!focusCount) {
			return;
		}
		var name = event.target.name;

		if ($('input[name="' + name + '"]').data('focusCount') === undefined) {
			$('input[name="' + name + '"]').data('focusCount', 1);

		} else {
			var c = $('input[name="' + name + '"]').data('focusCount');
			c++;
			$('input[name="' + name + '"]').data('focusCount', c);
		}
	}

	function GetMostFocusedField() {
		var amount = 0,
		var winnerName = "",
		var $this = $(this);

		$('input').each(function() {
			if ($this.data('focusCount') != undefined && $this.data('focusCount') > amount) {
				winnerName = $this.attr('name');
				amount = $this.data('focusCount');
			}

		});
		return {
			MostFocusedField : winnerName,
			counter : amount
		};
	}

	function inputEventWithTime(event, name, val) {

		if (output.firstClickTime === 0) {
			output.firstClickTime = Date.now();
		}
		var thisTime = Date.now(),
		var log;

		log = (thisTime - output.firstClickTime) + ' ' + event.data.jName + ' ' + name + '<br/>';
		if (debug) {
			console.log(log);
		};
		if (event.data.jName === 'focus') {
			focusCounter(event);
			output.lastFocusName = name;
			output.lastFocusValue = val;
			output.lastFocusTime = thisTime - output.firstClickTime;
			log = output.lastFocusName + ' ' + output.lastFocusValue;
			if (debug) {
				console.log(log);
			};
		}

		if (event.data.jName === 'blur') {

			checkForBiggestTime(thisTime - output.firstClickTime, name);
			output.lastBlurName = name;
			output.lastFocusValue = val;
			log = output.lastFocusName + ' ' + output.lastFocusValue;
			if (debug) {
				console.log(log);
			};
		}
	}

	function checkForBiggestTime(tTime, name) {

		if (output.biggestInputTime === 0) {
			output.biggestInputTime = tTime - output.lastFocusTime;
			output.biggestInputTypeName = name;

		} else {
			tempTime = tTime - output.lastFocusTime;
			if (tempTime > output.biggestInputTime) {
				output.biggestInputTime = tempTime;
				output.biggestInputTypeName = name;
				var log = output.lastFocusName + ' ' + output.biggestInputTime;
				if (debug) {
					console.log(log);
				};
			}

		}
	}

	function markInputPrivate(config) {

		if (config.ConsoleLogging === true) {
			debug = true;
		}

		if (config.focusCounter === true) {
			focusCount = true;
		}
		mapper = config.mapper;

		config.inputTypesTracking.forEach(function(entry) {
			config.inputEventsTracking.forEach(function(jeventName) {
				$('input[type="' + entry + '"]').on(jeventName, {
					jName : jeventName,
					config : config
				}, inputEventPrivate);
			});

		});
	}

	function prepareforSCPrivate(s) {
		if (focusCount) {
			output.FocusCaption = GetMostFocusedField();
		}

		var trackVars = "";
		var trackEvents = "";
		$.each(mapper, (function(k, v) {
			if (!$.isPlainObject(v)) {

				s[v] = output[k];
				trackVars += concat(v, 'eVa');
				trackEvents += concat(v, 'eve');

			} else {
				$.each(v, (function(k2, v2) {
					s[v2] = output[k[k2]];
					trackVars += concat(v2, 'eVa');
					trackEvents += concat(v2, 'eve');
				} ));
			}

		} ));
		s.linkTrackVars = trackVars + 'events';

		s.linkTrackEvents = trackEvents;
		s.events = trackEvents;

		s.tl(true, 'o', 'form-abandonment');
	}

	function concat(name, type) {

		if (name.substring(0, 3) === type) {
			return name + ',';
		} else {
			return "";
		}
	}

	return {
		markInput : markInputPrivate,
		prepareforSC : prepareforSCPrivate,
		getTrackedDataInJSON : function() {
			if (focusCount) {
				output.FocusCaption = GetMostFocusedField();
			}
			
		},
		getFieldCounter : function(name) {
		}
	};
})();

formTrackingAbandon.markInput(config);

if (!Date.now) {
	Date.now = function() {
		return new Date().getTime();
	};
}

$('#submitAddress').on('click', function() {
	$(window).unbind('beforeunload', onleave);

	s.linkTrackEvents = 'event21';
	s.tl(true, 'o', 'subscription-form')
});

function onleave() {
	formTrackingAbandon.prepareforSC(s);
	return 'Are you sure you want to leave?';
}


$(window).bind('beforeunload', onleave);
}($));