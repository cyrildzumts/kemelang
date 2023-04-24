define([], function(){
    'use strict';

    const START_RECORD_ID = "start-record";
    const STOP_RECORD_ID = "stop-record";

    function AudioRecorder(selectors){
        this.mediaRecorder = undefined;
        this.bytestream = [];
        this.recording = undefined;
        this.start_record_btn = undefined;
        this.stop_record_btn = undefined;
        this.play_record_btn = undefined;
        this.player = undefined;
        this.audio_input = undefined;
        this.loader = undefined;
        this.init(selectors);
    };

    AudioRecorder.prototype.init = function(selectors){
        let self = this;
        if(selectors){
            this.start_record_btn = selectors.start_btn;
            this.stop_record_btn = selectors.stop_btn;
            this.play_record_btn = selectors.play_btn;
            this.player = selectors.player;
            this.audio_input = selectors.audio_input;
            
        }else{
            this.start_record_btn = document.getElementById(START_RECORD_ID);
            this.stop_record_btn = document.getElementById(STOP_RECORD_ID);
            if(!this.start_record_btn){
                return;
            }
            this.player = document.getElementById(this.start_record_btn.dataset.player);
            this.play_record_btn = document.getElementById(this.start_record_btn.dataset.play);
            this.audio_input = document.getElementById(this.start_record_btn.dataset.input);
        }
        
        
        
        let audio_initialized = this.init_recording();
        if(!audio_initialized){
            return;
        }
        this.loader = document.getElementById('loader');
        this.start_record_btn.addEventListener('click', function(e){
            e.stopPropagation();
            self.mediaRecorder.start();
        });
        this.player.addEventListener('playing', function(e){
            e.stopPropagation();
            self.play_record_btn.classList.add('playing');
        });
        this.player.addEventListener('ended', function(e){
            e.stopPropagation();
            self.play_record_btn.classList.remove('playing');
        });
        
        this.stop_record_btn.addEventListener('click', function(e){
            e.stopPropagation();
            self.mediaRecorder.stop();
        });
        this.play_record_btn.addEventListener('click', function(e){
            e.stopPropagation();
            self.player.play();
        });
    }

    AudioRecorder.prototype.init_recording = function(){
        let self = this;
        if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
            console.warn("getUserMedia not supported on this divice");
            return false;
        }
        navigator.mediaDevices.getUserMedia({audio:true})
        .then((stream)=>{
            self.mediaRecorder = new MediaRecorder(stream);
            self.mediaRecorder.ondataavailable = (e)=>{
                self.bytestream.push(e.data);
            };
            self.mediaRecorder.onstart = (e) =>{
                self.start_record_btn.classList.add('recording');
                self.stop_record_btn.classList.remove('hidden');
                self.play_record_btn.classList.add('hidden');
                console.log("audio recorder started");
            };
            self.mediaRecorder.onstop = (e) =>{
                self.start_record_btn.classList.remove('recording');
                self.stop_record_btn.classList.add('hidden');
                self.play_record_btn.classList.remove('hidden');
                self.recording = self.bytestream;
                let blob = new Blob(self.bytestream, {'type': "audio/ogg; codecs=opus"});
                this.bytestream = [];
                let audio_url = window.URL.createObjectURL(blob);
                let file = new File(blob);
                let fileContainer = new DataTransfer();
                fileContainer.items.add(file);
                self.audio_input.files = fileContainer.files;
                self.player.src = audio_url;
                console.log("Audio Recoring stopped");
            };
        })
        .catch((err)=>{
            console.err(`Error on getUserMedia : ${err}`);
        });
        return true;
    };

    AudioRecorder.prototype.getRecording = function(){
        let blob = new Blob(this.bytestream, {'type': "audio/ogg; codecs=opus"});
        this.bytestream = [];
        let audio_url = window.URL.createObjectURL(blob);

    }
    return AudioRecorder;
});