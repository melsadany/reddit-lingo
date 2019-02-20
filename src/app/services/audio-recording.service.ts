import { Injectable, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import * as getUserMedia from 'getusermedia';
declare var MediaRecorder: any;
export interface RecordedAudioOutput {
  blob: Blob;
  user_id: string;
}

@Injectable()
export class AudioRecordingService {
  private stream: MediaStream;
  private recorder: {
    record: () => void;
    stop: (arg0: (blob: any) => void, arg1: () => void) => void;
  };
  private interval: NodeJS.Timeout;
  private startTime: moment.MomentInput;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _currentlyRecording = false;
  public debugError = false;
  private chunks;
  private mediaRecorder;
  private audioContext: AudioContext = new (window['AudioContext'] ||
    window['webkitAudioContext'])();
  private audioNode;
  private audioInput;
  public recordedData = [];
  public displayData;
  recorderwz: WzRecorder;
  private canvasElement: ElementRef;

  constructor() {
    // if (this.audioContext.createScriptProcessor) {
    //   this.audioNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    // } else {
    //   console.log('WebAudio not supported');
    // }
    // this.audioNode.connect(this.audioContext.destination);
    // navigator.mediaDevices
    //   .getUserMedia({
    //     audio: true
    //   })
    //   .then(stream => {
    //     this.stream = stream;
    //     this.audioInput = this.audioContext.createMediaStreamSource(
    //       this.stream
    //     );
    //     this.audioInput.connect(this.audioNode);
    //     this.audioNode.onaudioprocess = this.onAudioProcess;
    //   })
    //   .catch(error => console.log(error));
  }

  public setCanvasElement(canvas: ElementRef): void {
    this.canvasElement = canvas;
    // console.log('Service canvas: ', this.canvasElement);
    this.recorderwz = new WzRecorder({
      visualizer: {
        element: this.canvasElement.nativeElement
      }
    });
    this.recorderwz.start();
  }

  public onAudioProcess(e: object): void {
    const recordedData = [];
    recordedData.push(new Float32Array(e['inputBuffer'].getChannelData(0)));
    this.recordedData = recordedData;
  }

  isCurrentlyRecording(): Boolean {
    return this._currentlyRecording;
  }

  setCurrentlyRecording(set: boolean): void {
    if (set === this._currentlyRecording) {
      console.log('error, already set to this value');
    }
    this._currentlyRecording = set;
  }

  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  startRecording(): void {
    // if (this.recorder) {
    //   return;
    // }

    this._recordingTime.next('00:00');
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        this.stream = stream;
        this.record();
        this.setCurrentlyRecording(true);
      })
      .catch(error => {
        console.log(error);
        this.debugError = true;
        this._recordingFailed.next();
      });
  }

  abortRecording(): void {
    this.stopMedia();
  }

  private record(): void {
    // this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
    //   type: 'audio',
    //   mimeType: 'audio/webm'
    // });
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start();
    console.log(this.mediaRecorder.state);
    this.mediaRecorder.ondataavailable = (e): any => this.chunks.push(e.data);

    // this.recorder.record();
    // this.startTime = moment();
    // this.interval = setInterval(() => {
    //   const currentTime = moment();
    //   const diffTime = moment.duration(currentTime.diff(this.startTime));
    //   const time =
    //     this.toString(diffTime.minutes()) +
    //     ':' +
    //     this.toString(diffTime.seconds());
    //   this._recordingTime.next(time);
    // }, 1000);
  }

  private toString(value: string | number): string | number {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  stopRecording(): void {
    // if (this.recorder) {
    //   this.setCurrentlyRecording(false);
    //   this.recorder.stop(
    //     (blob: Blob) => {
    //       if (this.startTime) {
    //         const wavName = encodeURIComponent(
    //           'audio_' + new Date().getTime() + '.wav'
    //         );
    //         this.stopMedia();
    //         this._recorded.next({ blob: blob, user_id: wavName });
    //       }
    //     },
    //     () => {
    //       this.stopMedia();
    //       this._recordingFailed.next();
    //     }
    //   );
    // }
    this.mediaRecorder.stop();
    console.log(this.mediaRecorder.state);
    console.log(this.chunks);
  }

  private stopMedia(): void {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream
          .getAudioTracks()
          .forEach((track: { stop: () => void }) => track.stop());
        this.stream = null;
      }
    }
  }
}

export class WzRecorder {
  audioInput;
  audioNode;
  recordedData = [];
  recording = false;
  recordingLength = 0;
  startDate;
  audioCtx;
  bufferSize;
  config;
  blob;
  sampleRate;
  duration;
  canvas;
  canvasCtx;
  source;
  analyser;
  bufferLength;
  dataArray;

  constructor(config: object) {
    this.config = config || {};
    this.bufferSize = config['bufferSize'] || 4096;
  }
  toggleRecording(): void {
    this.recording ? this.stop() : this.start();
  }
  start(): void {
    // reset any previous data
    this.recordedData = [];
    this.recordingLength = 0;
    // webkit audio context shim
    this.audioCtx = new (window['AudioContext'] ||
      window['webkitAudioContext'])();
    if (this.audioCtx.createJavaScriptNode) {
      this.audioNode = this.audioCtx.createJavaScriptNode(
        this.bufferSize,
        1,
        1
      );
    } else if (this.audioCtx.createScriptProcessor) {
      this.audioNode = this.audioCtx.createScriptProcessor(
        this.bufferSize,
        1,
        1
      );
    } else {
      console.log('WebAudio not supported!');
    }
    this.audioNode.connect(this.audioCtx.destination);
    // navigator.mediaDevices
    //   .getUserMedia({
    //     audio: true,
    //     video: false
    //   })
    //   .then(stream => this.onMicrophoneCaptured(stream))
    //   .catch(this.onMicrophoneError);
    getUserMedia({ audio: true, video: false }, (err, stream) => {
      if (err) {
        this.onMicrophoneError(err);
      } else {
        this.onMicrophoneCaptured(stream);
      }
    });
  }
  stop(): void {
    this.stopRecording(
      blob => this.config.onRecordingStop && this.config.onRecordingStop(blob)
    );
  }
  upload(url: any, params: any, callback: any): void {
    const formData = new FormData();
    formData.append(
      'audio',
      this.blob,
      this.config.filename || 'recording.wav'
    );
    for (const i of params) {
      formData.append(i, params[i]);
    }
    const request = new XMLHttpRequest();
    request.upload.addEventListener('progress', function(e: any): void {
      callback('progress', e, request);
    });
    request.upload.addEventListener('load', function(e: any): void {
      callback('load', e, request);
    });
    request.onreadystatechange = function(e: any): void {
      let status = 'loading';
      if (request.readyState === 4) {
        status = request.status === 200 ? 'done' : 'error';
      }
      callback(status, e, request);
    };
    request.open('POST', url);
    request.send(formData);
  }

  stopRecording(callback: Function): void {
    // stop recording
    this.recording = false;
    // to make sure onaudioprocess stops firing
    window['localStream'].getTracks().forEach(track => {
      track.stop();
    });
    this.audioInput.disconnect();
    this.audioNode.disconnect();
    this.exportWav(
      {
        sampleRate: this.sampleRate,
        recordingLength: this.recordingLength,
        data: this.recordedData
      },
      function(buffer: any, view: any): void {
        this.blob = new Blob([view], {
          type: 'audio/wav'
        });
        callback && callback(this.blob);
      }
    );
  }

  onMicrophoneCaptured(microphone: any): void {
    if (this.config.visualizer) {
      // console.log('seting up visualize');
      this.visualize(microphone);
    }
    // save the stream so we can disconnect it when we're done
    window['localStream'] = microphone;
    this.audioInput = this.audioCtx.createMediaStreamSource(microphone);
    this.audioInput.connect(this.audioNode);
    this.audioNode.onaudioprocess = this.onAudioProcess;
    this.recording = true;
    this.startDate = new Date();
    this.config.onRecordingStart && this.config.onRecordingStart();
    this.sampleRate = this.audioCtx.sampleRate;
  }

  onMicrophoneError(e: any): any {
    console.log(e);
    alert('Unable to access the microphone.' + e);
  }

  onAudioProcess(e: any): any {
    if (!this.recording) {
      return;
    }
    this.recordedData.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    this.recordingLength += this.bufferSize;
    this.duration = new Date().getTime() - this.startDate.getTime();
    this.config.onRecording && this.config.onRecording(this.duration);
  }

  visualize(stream: any): void {
    this.canvas = this.config.visualizer.element;
    if (!this.canvas) {
      console.log('visualize: not recording');
      return;
    }
    this.canvasCtx = this.canvas.getContext('2d');
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.source.connect(this.analyser);
    this.draw();
  }

  draw(): void {
    // get the canvas dimensions
    const width = this.canvas.width;
    const height = this.canvas.height;
    // ask the browser to schedule a redraw before the next repaint
    requestAnimationFrame(() => this.draw());
    // clear the canvas
    this.canvasCtx.fillStyle = this.config.visualizer.backcolor || '#fff';
    this.canvasCtx.fillRect(0, 0, width, height);
    if (!this.recording) {
      return;
    }
    this.canvasCtx.lineWidth = this.config.visualizer.linewidth || 2;
    this.canvasCtx.strokeStyle = this.config.visualizer.forecolor || '#f00';
    this.canvasCtx.beginPath();
    const sliceWidth = (width * 1.0) / this.bufferLength;
    let x = 0;
    this.analyser.getByteTimeDomainData(this.dataArray);
    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * height) / 2;
      i === 0 ? this.canvasCtx.moveTo(x, y) : this.canvasCtx.lineTo(x, y);
      x += sliceWidth;
    }
    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasCtx.stroke();
  }

  exportWav(config: any, callback: any): void {
    function inlineWebWorker(config: any, cb: any): void {
      let data = config.data.slice(0);
      const sampleRate = config.sampleRate;
      data = joinBuffers(data, config.recordingLength);

      function joinBuffers(channelBuffer: any, count: any): Float64Array {
        const result = new Float64Array(count);
        let offset = 0;
        const lng = channelBuffer.length;
        for (let i = 0; i < lng; i++) {
          const buffer = channelBuffer[i];
          result.set(buffer, offset);
          offset += buffer.length;
        }
        return result;
      }

      function writeUTFBytes(view: any, offset: any, string: any): void {
        const lng = string.length;
        for (let i = 0; i < lng; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }
      const dataLength = data.length;
      // create wav file
      const buffer = new ArrayBuffer(44 + dataLength * 2);
      const view = new DataView(buffer);
      writeUTFBytes(view, 0, 'RIFF'); // RIFF chunk descriptor/identifier
      view.setUint32(4, 44 + dataLength * 2, true); // RIFF chunk length
      writeUTFBytes(view, 8, 'WAVE'); // RIFF type
      writeUTFBytes(view, 12, 'fmt '); // format chunk identifier, FMT sub-chunk
      view.setUint32(16, 16, true); // format chunk length
      view.setUint16(20, 1, true); // sample format (raw)
      view.setUint16(22, 1, true); // mono (1 channel)
      view.setUint32(24, sampleRate, true); // sample rate
      view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align)
      view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
      view.setUint16(34, 16, true); // bits per sample
      writeUTFBytes(view, 36, 'data'); // data sub-chunk identifier
      view.setUint32(40, dataLength * 2, true); // data chunk length
      // write the PCM samples
      let index = 44;
      for (let i = 0; i < dataLength; i++) {
        view.setInt16(index, data[i] * 0x7fff, true);
        index += 2;
      }
      if (cb) {
        return cb({
          buffer: buffer,
          view: view
        });
      }
      postMessage(
        {
          buffer: buffer,
          view: view
        },
        '*'
      );
    }
    const webWorker = this.processInWebWorker(inlineWebWorker);
    webWorker.onmessage = function(event: any): void {
      callback(event.data.buffer, event.data.view);
      // release memory
      URL.revokeObjectURL(webWorker['workerURL']);
    };
    webWorker.postMessage(config);
  }

  processInWebWorker(_function: Function): Worker {
    const workerURL = URL.createObjectURL(
      new Blob(
        [
          _function.toString(),
          ';this.onmessage = function (e) {' + _function.name + '(e.data);}'
        ],
        {
          type: 'application/javascript'
        }
      )
    );
    const worker = new Worker(workerURL);
    worker['workerURL'] = workerURL;
    return worker;
  }
}
