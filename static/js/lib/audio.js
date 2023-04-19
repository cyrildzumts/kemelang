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
        this.init(selectors);
    };

    AudioRecorder.prototype.init = function(selectors){
        let self = this;
        if(selectors){
            this.start_record_btn = selectors.start_btn;
            this.stop_record_btn = selectors.stop_btn;
            this.play_record_btn = selectors.play_btn;
            this.player = selectors.player;
            
        }else{
            this.start_record_btn = document.getElementById(START_RECORD_ID);
            this.stop_record_btn = document.getElementById(STOP_RECORD_ID);
            if(!this.start_record_btn){
                return;
            }
            this.player = document.getElementById(this.start_record_btn.dataset.player);
            this.play_record_btn = document.getElementById(this.start_record_btn.dataset.play);
        }
        
        
        
        let audio_initialized = this.init_recording();
        if(!audio_initialized){
            return;
        }
        this.start_record_btn.addEventListener('click', function(even){
            self.mediaRecorder.start();
            self.stop_record_btn.classList.remove('hidden');
            self.start_record_btn.classList.add('recording');
            console.log("audio recorder started");
        });
        this.player.addEventListener('playing', function(e){
            self.play_record_btn.classList.add('playing');
        });
        this.player.addEventListener('ended', function(e){
            self.play_record_btn.classList.remove('playing');
        });
        this.start_record_btn.addEventListener('click', function(even){
            if(self.player){
                self.play_record_btn.classList.add('playing');
                console.log("audio is playing");
            }else{
                self.player;
                self.play_record_btn.classList.remove('playing');
                console.log("audio is playing");
            }
            
        });
        this.stop_record_btn.addEventListener('click', function(even){
            self.mediaRecorder.stop();
            console.log("audio recorder stopped");
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
            self.mediaRecorder.onstop = (e) =>{
                self.start_record_btn.classList.remove('recording');
                self.stop_record_btn.classList.add('hidden');
                self.recording = self.bytestream;
                let blob = new Blob(self.bytestream, {'type': "audio/ogg; codecs=opus"});
                this.bytestream = [];
                let audio_url = window.URL.createObjectURL(blob);
                self.player.src = audio_url;
                self.play_record_btn.classList.remove('hidden');
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