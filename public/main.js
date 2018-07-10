jQuery(function($) {

  let app = $('#app');

  let SYNTHESIS = null;
  let VOICES = null;

  let QUOTE_TEXT = null;
  let QUOTE_PERSON = null;

  let VOICE_SPEAKING = false;
  let VOICE_PAUSED = false;
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

  function showControl(control) {
    control.addClass('d-inline-block').removeClass('d-none');
  }

  function hideControl(control) {
    control.addClass('d-none').removeClass('d-inline-block');
  }

  function getVoices() {
    // Regex to match all English language tags e.g en, en-US, en-GB
    let langRegex = /^en(-[a-z]{2})?$/i;

    // Get the available voices and filter the list to only have English speakers
    VOICES = SYNTHESIS.getVoices()
      .filter(function (voice) { return langRegex.test(voice.lang) })
      .map(function (voice) {
        return { voice: voice, name: voice.name, lang: voice.lang.toUpperCase() }
      });
  }

  function resetVoice() {
    VOICE_SPEAKING = false;
    VOICE_PAUSED = false;
    VOICE_COMPLETE = false;
  }

  function fetchNewQuote() {
    app.html('');

    QUOTE_TEXT = null;
    QUOTE_PERSON = null;

    resetVoice();

    // Pick a voice at random
    let voice = (VOICES && VOICES.length > 0)
      ? VOICES[ Math.floor(Math.random() * VOICES.length) ]
      : null;

    $.get('/api/quote', function (quote) {
      renderQuote(quote.data);
      SYNTHESIS && renderVoiceControls(SYNTHESIS, voice || null);
    });
  }

  function renderQuote(quote) {

    let quotePerson = $('<h1 id="quote-person" class="mb-2 w-100"></h1>');
    let quoteText = $('<div id="quote-text" class="h3 py-5 mb-4 w-100 font-weight-light text-secondary border-bottom border-gray"></div>');

    quotePerson.html(quote.title);
    quoteText.html(quote.content);

    app.append(quotePerson);
    app.append(quoteText);

    QUOTE_TEXT = quoteText.text();
    QUOTE_PERSON = quotePerson.text();

  }

  function renderVoiceControls(synthesis, voice) {

    let controlsPane = $('<div id="voice-controls-pane" class="d-flex flex-wrap w-100 align-items-center align-content-center justify-content-between"></div>');

    let voiceControls = $('<div id="voice-controls"></div>');

    let playButton = $(iconSVG('play-circle'));
    let pauseButton = $(iconSVG('pause-circle'));
    let stopButton = $(iconSVG('stop-circle'));

    let paused = function () {
      VOICE_PAUSED = true;
      updateVoiceControls();
    };

    let resumed = function () {
      VOICE_PAUSED = false;
      updateVoiceControls();
    };

    playButton.on('click', function (evt) {
      evt.preventDefault();

      if (VOICE_SPEAKING) {

        if (VOICE_PAUSED) synthesis.resume();
        return resumed();

      } else {

        let quoteUtterance = new SpeechSynthesisUtterance(QUOTE_TEXT);
        let personUtterance = new SpeechSynthesisUtterance(QUOTE_PERSON);

        if (voice) {
          quoteUtterance.voice = voice.voice;
          personUtterance.voice = voice.voice;
        }

        quoteUtterance.onpause = paused;
        quoteUtterance.onresume = resumed;
        quoteUtterance.onboundary = updateVoiceControls;

        quoteUtterance.onstart = function (evt) {
          VOICE_COMPLETE = false;
          VOICE_SPEAKING = true;
          updateVoiceControls();
        }

        personUtterance.onpause = paused;
        personUtterance.onresume = resumed;
        personUtterance.onboundary = updateVoiceControls;

        personUtterance.onend = fetchNewQuote;

        synthesis.speak(quoteUtterance);
        synthesis.speak(personUtterance);

      }

    });

    pauseButton.on('click', function (evt) {
      evt.preventDefault();
      if (VOICE_SPEAKING) synthesis.pause();
      return paused();
    });

    stopButton.on('click', function (evt) {
      evt.preventDefault();
      if (VOICE_SPEAKING) synthesis.cancel();
      resetVoice();

      VOICE_COMPLETE = true;
      updateVoiceControls();
    });

    voiceControls.append(playButton);
    voiceControls.append(pauseButton);
    voiceControls.append(stopButton);

    controlsPane.append(voiceControls);

    if (voice) {
      let currentVoice = $('<div class="text-secondary font-weight-normal"><span class="text-dark font-weight-bold">' + voice.name + '</span> (' + voice.lang + ')</div>');

      controlsPane.append(currentVoice);
    }

    app.append(controlsPane);

    showControl(playButton);

  }

  function updateVoiceControls() {

    let playButton = $('#play-circle');
    let pauseButton = $('#pause-circle');
    let stopButton = $('#stop-circle');

    if (VOICE_SPEAKING) {

      showControl(stopButton);

      if (VOICE_PAUSED) {
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

  function initialize() {
    if ('speechSynthesis' in window) {

      SYNTHESIS = window.speechSynthesis;

      let timer = setInterval(function () {
        let voices = SYNTHESIS.getVoices();

        if (voices.length > 0) {
          getVoices();
          fetchNewQuote();
          clearInterval(timer);
        }
      }, 200);

    } else {
      let message = 'Text-to-speech not supported by your browser.';

      // Create the browser notice element
      let notice = $('<div class="w-100 py-4 bg-danger font-weight-bold text-white position-absolute text-center" style="bottom:0; z-index:10">' + message + '</div>');

      fetchNewQuote();
      console.log(message);

      // Display non-support info on DOM
      $(document.body).append(notice);
    }
  }

  initialize();

});
