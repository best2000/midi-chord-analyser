<script>
    import "../style.css";
    import { WebMidi } from "webmidi";
    import { Midi, Interval, Chord } from "tonal";

    let log_midi, log_var;
    log_midi = log_var = "";
    let midiInputs = [];
    let selectedMidiInput = "";
    $: if (selectedMidiInput)
        console.log("selectedMidiInput: " + selectedMidiInput);
    let noteOn = new Set([]);
    let noteSustain = new Set([]);
    let pedal = false;
    $: if (pedal) console.log("pedal: " + pedal);
    let chordNotes = [];
    let chordNotesText = "";
    let chord = "";
    let showLog = true;
    let autoP5 = true;

    WebMidi.enable()
        .then(onEnabled)
        .catch((err) => (log += err));

    function onEnabled() {
        midiInputs = WebMidi.inputs;
        if (midiInputs.length != 0) {
            selectedMidiInput = midiInputs[0].name;
            listenMidiInput();
        }
    }

    function calulateChord() {
        let notes = Array.from(new Set([...noteOn, ...noteSustain]));
        notes.sort();
        chordNotes = notes;
        if (notes.length == 2) {
            chord = `${Midi.midiToNoteName(notes[0], { pitchClass: true })} ${Interval.fromSemitones(notes[1] - notes[0])}`;
        } else {
            let chordArr = Chord.detect(
                notes.map((n) => Midi.midiToNoteName(n)),
                { assumePerfectFifth: autoP5 },
            );
            chord = chordArr.join(" ");
            if (chordArr.length == 0) {
                chord = "";
            }
        }
        chordNotesText = ""
        notes.forEach((n) => {
            chordNotesText+=Midi.midiToNoteName(n, { pitchClass: true })+" "
        })
    }

    function listenMidiInput() {
        //listen to all midi channels
        const midiInput = WebMidi.getInputByName(selectedMidiInput);
        midiInput.addListener("noteon", (e) => {
            noteOn.add(e.note.number);
            calulateChord();

            log_midi += `note on  : ${e.note.name}${e.note.octave} : raw[${e.message.data.map(n => n).join(',')}]\n`;
            log_var += `on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes} ]\n`;

            document.getElementById(e.note.number).style["background-color"] =
                "red";

            let logMidiTextArea = document.getElementById("log_midi");
            if (
                logMidiTextArea.selectionStart == logMidiTextArea.selectionEnd
            ) {
                logMidiTextArea.scrollTop = logMidiTextArea.scrollHeight;
            }
            let logVarTextArea = document.getElementById("log_var");
            if (logVarTextArea.selectionStart == logVarTextArea.selectionEnd) {
                logVarTextArea.scrollTop = logVarTextArea.scrollHeight;
            }
        });
        midiInput.addListener("noteoff", (e) => {
            noteOn.delete(e.note.number);
            if (pedal) {
                noteSustain.add(e.note.number);
            } else {
                let key = document.getElementById(e.note.number);
                if (key.className == "piano-keys white-key")
                    key.style["background-color"] = "white";
                else key.style["background-color"] = "black";
            }
            calulateChord();

            log_midi += `note off : ${e.note.name}${e.note.octave} : raw[${e.message.data.map(n => n).join(',')}]\n`;
            log_var += `on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes}]\n`;

            let logMidiTextArea = document.getElementById("log_midi");
            if (
                logMidiTextArea.selectionStart == logMidiTextArea.selectionEnd
            ) {
                logMidiTextArea.scrollTop = logMidiTextArea.scrollHeight;
            }
            let logVarTextArea = document.getElementById("log_var");
            if (logVarTextArea.selectionStart == logVarTextArea.selectionEnd) {
                logVarTextArea.scrollTop = logVarTextArea.scrollHeight;
            }
        });
        midiInput.addListener("controlchange", (e) => {
            if (e.subtype == "damperpedal") {
                if (e.value) {
                    pedal = true;
                    log_midi += `pedal on      : raw[${e.message.data.map(n => n).join(',')}]\n`;
                } else {
                    pedal = false;
                    noteSustain.forEach((n) => {
                        noteOn.delete(n);
                        let key = document.getElementById(n);
                        if (key.className == "piano-keys white-key")
                            key.style["background-color"] = "white";
                        else key.style["background-color"] = "black";
                    });
                    noteSustain.clear();
                    log_midi += `pedal off     : raw[${e.message.data.map(n => n).join(',')}]\n`;
                }
                calulateChord();
                log_var += `on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes}]\n`;

                let logMidiTextArea = document.getElementById("log_midi");
                if (
                    logMidiTextArea.selectionStart ==
                    logMidiTextArea.selectionEnd
                ) {
                    logMidiTextArea.scrollTop = logMidiTextArea.scrollHeight;
                }
                let logVarTextArea = document.getElementById("log_var");
                if (
                    logVarTextArea.selectionStart == logVarTextArea.selectionEnd
                ) {
                    logVarTextArea.scrollTop = logVarTextArea.scrollHeight;
                }
            }
        });
    }
    function clear() {
        log_midi = "";
        log_var = "";
    }

    function updateMidiInputs() {
        midiInputs = WebMidi.inputs;
        WebMidi.inputs.forEach((input) => {
            console.log(input.manufacturer, input.name);
        });
    }
</script>

<label  for="midi_input">MIDI Input:</label>
<select
    name="midi_input"
    bind:value={selectedMidiInput}
    on:focus={updateMidiInputs}
    on:change={listenMidiInput}
>
    {#each midiInputs as input}
        <option>{input.name}</option>
    {/each}
</select>
<label>
	<input type="checkbox" bind:checked={showLog}/>Log
</label>
<button on:click={clear} disabled={!showLog}> clear </button>
<label>
	<input type="checkbox" bind:checked={autoP5} />
	AutoP5
</label>
<div class="log-container" style="display:{showLog ? "block": "none"}">
<textarea id="log_midi" class="log" style="width: 39%; height:95%;" readonly>
{log_midi}
</textarea>
<textarea id="log_var" class="log" style="width: 59%; height:95%;" readonly>
{log_var}
</textarea>
</div>
<div class="chord-note-container" style="height: {showLog ? "fit-content" : "40vh"}">
    <div class="chord">
        {chord}
    </div>
    <div class="note">
        {chordNotesText}
    </div>
</div>
<div class="piano-container">
    <ul class="piano-keys-list">
        <li class="piano-keys white-key" id="21"></li>
        <li class="piano-keys black-key" id="22"></li>
        <li class="piano-keys white-key" id="23"></li>
        <li class="piano-keys white-key" id="24"></li>
        <li class="piano-keys black-key" id="25"></li>
        <li class="piano-keys white-key" id="26"></li>
        <li class="piano-keys black-key" id="27"></li>
        <li class="piano-keys white-key" id="28"></li>
        <li class="piano-keys white-key" id="29"></li>
        <li class="piano-keys black-key" id="30"></li>
        <li class="piano-keys white-key" id="31"></li>
        <li class="piano-keys black-key" id="32"></li>
        <li class="piano-keys white-key" id="33"></li>
        <li class="piano-keys black-key" id="34"></li>
        <li class="piano-keys white-key" id="35"></li>
        <li class="piano-keys white-key" id="36"></li>
        <li class="piano-keys black-key" id="37"></li>
        <li class="piano-keys white-key" id="38"></li>
        <li class="piano-keys black-key" id="39"></li>
        <li class="piano-keys white-key" id="40"></li>
        <li class="piano-keys white-key" id="41"></li>
        <li class="piano-keys black-key" id="42"></li>
        <li class="piano-keys white-key" id="43"></li>
        <li class="piano-keys black-key" id="44"></li>
        <li class="piano-keys white-key" id="45"></li>
        <li class="piano-keys black-key" id="46"></li>
        <li class="piano-keys white-key" id="47"></li>
        <li class="piano-keys white-key" id="48"></li>
        <li class="piano-keys black-key" id="49"></li>
        <li class="piano-keys white-key" id="50"></li>
        <li class="piano-keys black-key" id="51"></li>
        <li class="piano-keys white-key" id="52"></li>
        <li class="piano-keys white-key" id="53"></li>
        <li class="piano-keys black-key" id="54"></li>
        <li class="piano-keys white-key" id="55"></li>
        <li class="piano-keys black-key" id="56"></li>
        <li class="piano-keys white-key" id="57"></li>
        <li class="piano-keys black-key" id="58"></li>
        <li class="piano-keys white-key" id="59"></li>
        <li class="piano-keys white-key" id="60"></li>
        <li class="piano-keys black-key" id="61"></li>
        <li class="piano-keys white-key" id="62"></li>
        <li class="piano-keys black-key" id="63"></li>
        <li class="piano-keys white-key" id="64"></li>
        <li class="piano-keys white-key" id="65"></li>
        <li class="piano-keys black-key" id="66"></li>
        <li class="piano-keys white-key" id="67"></li>
        <li class="piano-keys black-key" id="68"></li>
        <li class="piano-keys white-key" id="69"></li>
        <li class="piano-keys black-key" id="70"></li>
        <li class="piano-keys white-key" id="71"></li>
        <li class="piano-keys white-key" id="72"></li>
        <li class="piano-keys black-key" id="73"></li>
        <li class="piano-keys white-key" id="74"></li>
        <li class="piano-keys black-key" id="75"></li>
        <li class="piano-keys white-key" id="76"></li>
        <li class="piano-keys white-key" id="77"></li>
        <li class="piano-keys black-key" id="78"></li>
        <li class="piano-keys white-key" id="79"></li>
        <li class="piano-keys black-key" id="80"></li>
        <li class="piano-keys white-key" id="81"></li>
        <li class="piano-keys black-key" id="82"></li>
        <li class="piano-keys white-key" id="83"></li>
        <li class="piano-keys white-key" id="84"></li>
        <li class="piano-keys black-key" id="85"></li>
        <li class="piano-keys white-key" id="86"></li>
        <li class="piano-keys black-key" id="87"></li>
        <li class="piano-keys white-key" id="88"></li>
        <li class="piano-keys white-key" id="89"></li>
        <li class="piano-keys black-key" id="90"></li>
        <li class="piano-keys white-key" id="91"></li>
        <li class="piano-keys black-key" id="92"></li>
        <li class="piano-keys white-key" id="93"></li>
        <li class="piano-keys black-key" id="94"></li>
        <li class="piano-keys white-key" id="95"></li>
        <li class="piano-keys white-key" id="96"></li>
        <li class="piano-keys black-key" id="97"></li>
        <li class="piano-keys white-key" id="98"></li>
        <li class="piano-keys black-key" id="99"></li>
        <li class="piano-keys white-key" id="100"></li>
        <li class="piano-keys white-key" id="101"></li>
        <li class="piano-keys black-key" id="102"></li>
        <li class="piano-keys white-key" id="103"></li>
        <li class="piano-keys black-key" id="104"></li>
        <li class="piano-keys white-key" id="105"></li>
        <li class="piano-keys black-key" id="106"></li>
        <li class="piano-keys white-key" id="107"></li>
        <li class="piano-keys white-key" id="108"></li>
    </ul>
</div>
