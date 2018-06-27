jQuery(function($) {

		let app = $('#app');

    let QUOTE_TEXT = null;
		let QUOTE_PERSON = null;
		let QUOTE_TIMEOUT = null;

		let VOICE_COMPLETE = false;

    let iconProps = {
        'stroke-width': 1,
        'width': 48,
        'height': 48,
				'class': 'text-secondary d-none',
				'style': 'cursor: pointer'
    };

    function iconSVG(icon) {
        let props = $.extend(iconProps, { id: icon });
        return feather.icons[icon].toSvg(props);
    }

    function resetAppState() {
        app.html('');
        QUOTE_TEXT = null;
        QUOTE_PERSON = null;
		}

		function showControl(control) {
			control.addClass('d-inline-block').removeClass('d-none');
		}

		function hideControl(control) {
			control.addClass('d-none').removeClass('d-inline-block');
		}

		function renderVoiceControls(synthesis, voice) {

			let playButton = $(iconSVG('play-circle'));
			let pauseButton = $(iconSVG('pause-circle'));
			let stopButton = $(iconSVG('stop-circle'));

			playButton.on('click', function (evt) {
				evt.preventDefault();

				if (synthesis.speaking) {

					if (synthesis.paused) {
						return synthesis.resume();
					}

				} else {

					let utteranceEventHandler = function (evt) {
						updateVoiceControls(synthesis);
					};

					let quoteUtterance = new SpeechSynthesisUtterance(QUOTE_TEXT);
					let personUtterance = new SpeechSynthesisUtterance(QUOTE_PERSON);

					quoteUtterance.voice = voice;
					personUtterance.voice = voice;

					quoteUtterance.onpause = utteranceEventHandler;
					quoteUtterance.onresume = utteranceEventHandler;
					quoteUtterance.onboundary = utteranceEventHandler;

					quoteUtterance.onstart = function (evt) {
						updateVoiceControls(synthesis);
						VOICE_COMPLETE = false;
					}

					quoteUtterance.onend = function (evt) {
						updateVoiceControls(synthesis);

						if (!VOICE_COMPLETE) {
							QUOTE_TIMEOUT = setTimeout(function () {
								synthesis.speak(personUtterance);
							}, 1000);
						}
					};

					personUtterance.onend = function(evt) {
						QUOTE_TIMEOUT && clearTimeout(QUOTE_TIMEOUT);
					};

					synthesis.speak(quoteUtterance);

				}

			});

			pauseButton.on('click', function (evt) {
				evt.preventDefault();
				if (synthesis.speaking) return synthesis.pause();
			});

			stopButton.on('click', function (evt) {
				evt.preventDefault();
				VOICE_COMPLETE = true;

				QUOTE_TIMEOUT && clearTimeout(QUOTE_TIMEOUT);

				if (synthesis.speaking) {
					return synthesis.cancel();
				}
			});

			app.append(playButton);
			app.append(pauseButton);
			app.append(stopButton);

			showControl(playButton);

		}

		function updateVoiceControls(synthesis) {

			let playButton = $('#play-circle');
			let pauseButton = $('#pause-circle');
			let stopButton = $('#stop-circle');

			if (synthesis.speaking) {

				showControl(stopButton);

				if (synthesis.paused) {
					showControl(playButton);
					hideControl(pauseButton);
				} else {
					hideControl(playButton);
					showControl(pauseButton);
				}

			} else {
				showControl(playButton);
				hideControl(pauseButton);
				hideControl(stopButton);
			}

		}

    function renderQuote(quote) {

        let quotePerson = $('<h1 id="quote-person" class="mb-2 w-100"></h1>');
        let quoteText = $('<div id="quote-text" class="h3 py-5 mb-4 w-100 font-weight-light text-secondary border-bottom border-gray"></div>');

        quotePerson.html(quote.data.title);
        quoteText.html(quote.data.content);

        app.append(quotePerson);
        app.append(quoteText);

        QUOTE_TEXT = quoteText.text();
        QUOTE_PERSON = quotePerson.text();

		}

    $.get('/api/quote', function(quote) {

        renderQuote(quote);

        if ('speechSynthesis' in window) {

            let synthesis = window.speechSynthesis;

            // Regex to match all English language tags e.g en, en-US, en-GB
            let langRegex = /^en(-[a-z]{2})?$/i;

            // Get the available voices and filter the list to only have English speakers
            let voices = synthesis.getVoices().filter(function(voice) {
                return langRegex.test(voice.lang);
						});

						// Pick a voice at random
						let voice = voices[ Math.floor(Math.random() * voices.length) ];

						renderVoiceControls(synthesis, voice);

        } else {
            console.log('Text-to-speech not supported.');
        }

    });

    resetAppState();

});
