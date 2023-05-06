import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonApiService implements OnDestroy {
  private socket: WebSocket;
  messages: string[] = [];
  message = 'Hello';
  public liveFeed: Subject<any> = new BehaviorSubject<any>(null);
  public algos: Subject<any> = new BehaviorSubject<any>(null);
  public trades: Subject<any> = new BehaviorSubject<any>(null);

  constructor() {
    // this.createSocketServer();
  }

  createSocketServer(userId: string) {
    // this.socket = new WebSocket('wss://api.algotime.in');
    this.socket = new WebSocket('ws://localhost:443');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      // Send user ID as message
      this.socket.send(userId);
    };

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      this.liveFeed.next(data.indices);
      this.algos.next(data.algos);
      this.trades.next(data.trades);
    };

    this.socket.onclose = e => {
      console.log(`WebSocket connection closed: ${e.reason}`);
      setTimeout(() => {
        console.log('Reconnecting to WebSocket server...');
        this.createSocketServer(userId);
      }, 3000);
    };
  }

  sendMessage(userId: string) {
    // this.message = userId;
    this.createSocketServer(userId);
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
