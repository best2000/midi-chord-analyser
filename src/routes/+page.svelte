<script>
    import "../styles.css";
    import { WebMidi } from "webmidi";
    import { removeSameElementFromSet } from "../lib/index"
    import { Note, Interval } from "tonal";

    let log_midi, log_var;
    log_midi = log_var = ""
    let midiInputs = [];
    let selectedMidiInput = "";
    $: if (selectedMidiInput) console.log("selectedMidiInput: "+selectedMidiInput)
    let noteOn = new Set([]);
    let noteSustain = new Set([]);
    let pedal = false;
    $: if (pedal) console.log("pedal: "+pedal)
    let chordNotes = []
    let chord = "?"

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
        let notes = Array.from(new Set([...noteOn,...noteSustain]))
        notes.sort()
        chordNotes = notes
        switch (notes.length) {
            case 1:
                chord = `${Note.fromMidi(notes[0], { pitchClass: true })}` 
                break
            case 2:
                chord = `${Note.fromMidi(notes[0], { pitchClass: true })} ${Interval.fromSemitones(notes[1]-notes[0])}`;
                break
            default:
                chord = "?"
                break
        }
    }

    function listenMidiInput() {
        //listen to all midi channels
        const midiInput = WebMidi.getInputByName(selectedMidiInput);
        midiInput.addListener("noteon", (e) => {
            noteOn.add(e.note.number)
            console.log(noteOn)
            calulateChord()
            
            log_midi+= `note on  : ${e.note.name}${e.note.octave} : ${e.message.statusByte.toString(2)} : ${e.note.number}\n`;
            log_var+=`on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes}]\n`
                
            document.getElementById(e.note.number).style["fill"] = "red"

            let logMidiTextArea = document.getElementById("log_midi");
            if (logMidiTextArea.selectionStart == logMidiTextArea.selectionEnd) {
                logMidiTextArea.scrollTop = logMidiTextArea.scrollHeight;
            }
            let logVarTextArea = document.getElementById("log_var");
            if (logVarTextArea.selectionStart == logVarTextArea.selectionEnd) {
                logVarTextArea.scrollTop = logVarTextArea.scrollHeight;
            }
        });
        midiInput.addListener("noteoff", (e) => {
            noteOn.delete(e.note.number) 
            if (pedal) {
                noteSustain.add(e.note.number)
            }
            calulateChord()

            log_midi += `note off : ${e.note.name}${e.note.octave} : ${e.message.statusByte.toString(2)} : ${e.note.number}\n`;
            log_var+=`on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes}]\n`
                
            let key = document.getElementById(e.note.number)
            // console.log(key.className.baseVal)
            if (key.className.baseVal == "white-key") 
                key.style["fill"] = "white"
            else 
                key.style["fill"] = "black"
            
            let logMidiTextArea = document.getElementById("log_midi");
            if (logMidiTextArea.selectionStart == logMidiTextArea.selectionEnd) {
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
                    pedal = true
                    log_midi += `pedal on\n`;
                } else {
                    pedal = false
                    removeSameElementFromSet(noteOn,noteSustain)
                    noteSustain.clear()
                    log_midi += `pedal off\n`;
                }
                calulateChord()
                log_var+=`on[${Array.from(noteOn)}] : sustain[${Array.from(noteSustain)}] : chord[${chordNotes}]\n`
                
                let logMidiTextArea = document.getElementById("log_midi");
                if (logMidiTextArea.selectionStart == logMidiTextArea.selectionEnd) {
                    logMidiTextArea.scrollTop = logMidiTextArea.scrollHeight;
                }
                let logVarTextArea = document.getElementById("log_var");
                if (logVarTextArea.selectionStart == logVarTextArea.selectionEnd) {
                    logVarTextArea.scrollTop = logVarTextArea.scrollHeight;
                }
            }
        });
    }
    function clear() {
        log_midi = ""
        log_var = ""
    }

    function updateMidiInputs() {
        midiInputs = WebMidi.inputs;
        WebMidi.inputs.forEach((input) => {
            console.log(input.manufacturer, input.name);
        });
    }
    
</script>

<div>
    <h1>MIDI Chord Analyser</h1>
    <h2>{chord}</h2>
</div>
<label for="midi_input">MIDI Input:</label>
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
<button on:focus={clear}>clear</button>
<br/>
<textarea id="log_midi" style="width: 20%; height:200px; font-size:xx-small">
{log_midi}
</textarea>
<textarea id="log_var" style="width: 75%; height:200px; font-size:xx-small">
{log_var}
</textarea>
<br/>
<p>pedal: {pedal}</p>
<!-- This keyboard has following properties (x=octave width).
     1. All white keys have equal width in front (W=x/7).
     2. All black keys have equal width (B=x/12).
     3. The narrow part of white keys C, D and E is W - B*2/3
     4. The narrow part of white keys F, G, A, and B is W - B*3/4 -->
     <svg xml:space="preserve" width="100%" height="125">
        <!--  White keys   -->
        <rect id=60 class="white-key"  x="0" y="0" width="23" height="120"/>
        <rect id=62 class="white-key"  x="23" y="0" width="23" height="120"/>
        <rect id=64 class="white-key"  x="46" y="0" width="23" height="120"/>
        <rect id=65 class="white-key"  x="69" y="0" width="23" height="120"/>
        <rect id=67 class="white-key"  x="92" y="0" width="23" height="120"/>
        <rect id=69 class="white-key"  x="115" y="0" width="23" height="120"/>
        <rect id=71 class="white-key"  x="138" y="0" width="23" height="120"/>
        <!--  Black keys (overlap with the white keys)  -->
        <rect id=61 class="black-key"  x="14.33333" y="0" width="13" height="80"/>
        <rect id=63 class="black-key"  x="41.66666" y="0" width="13" height="80"/>
        <rect id=66 class="black-key"  x="82.25" y="0" width="13" height="80"/>
        <rect id=68 class="black-key"  x="108.25" y="0" width="13" height="80"/>
        <rect id=70 class="black-key"  x="134.75" y="0" width="13" height="80"/>
    </svg>


