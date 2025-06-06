```
To generate an audio file with piper-tts, run

    model="/usr/share/piper-voices/en/en_US/ryan/high/en_US-ryan-high.onnx"
    export model
    echo "Hello world" | piper-tts --model "$model" --output_file hello.wav

To speak, run

    echo "Hello world" | piper-tts --model "$model" --output-raw | aplay -r 22050 -f S16_LE -t raw -

# ################################################################ SPEECH-DISPATCHER

To use piper and its voices as system speech dispatcher, install one of the packages
in the "piper-voices" group. Then, open

    /etc/speech-dispatcher/speechd.conf

and paste at the end the following:

    AddModule        "piper-generic" "sd_generic" "piper-generic.conf"
    DefaultModule    piper-generic
    DefaultVoiceType "MALE1"
    DefaultLanguage  "en"

You should now be able to run

    spd-say "Hello world"

Optional dependencies for piper-voices-common
    speech-dispatcher: tts support for third party apps [installed]
    piper-voices-minimal: single voice for en-us
    piper-voices: voices for all languages
```
