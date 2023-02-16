import { Component } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Platform, NavController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  name:string;
  disableButton = false;
  isScan: boolean = false;
  ndeflistener: any;
  subscription: Subscription = new Subscription(); //manage on/off nfc scan --first time
  subscriptions: Array<Subscription> = new Array<Subscription>(); //manage on/off nfc scan
  isReg  = false;
  results = [];
  constructor(private sqlite: SQLite, public navCtrl: NavController, private nfc: NFC, public platform: Platform, public ndef: Ndef,  public toastCtrl: ToastController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {}

  ionViewWillEnter (){
    this.platform.ready().then(() => {
      this.initializeApp();
    });    
  }

  initializeApp() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS bank(id INTEGER PRIMARY KEY, amount VARCHAR(255), action VARCHAR(255))', [])
          .then(() => console.log('Executed SQL'))
          .catch(e => console.log(JSON.stringify(e, null, 4)));

        db.executeSql('CREATE TABLE IF NOT EXISTS player(id INTEGER PRIMARY KEY, name VARCHAR(255))', [])
          .then(() => console.log('Executed SQL'))
          .catch(e => console.log(JSON.stringify(e, null, 4)));
        
        db.executeSql('SELECT * FROM player', [])
          .then((data) => {
            if (data) {
              let array1 = [];

              for (let i = 0; i < data.rows.length; i++) {
                let item = data.rows.item(i);
                // do something with it
                array1.push(item);
              }
              if (array1.length > 0)  {
                this.isReg = true
              }
            }
          })
          .catch(e => console.log(JSON.stringify(e, null, 4)));
      })
      .catch(e => console.log(JSON.stringify(e, null, 4)));   
  }

  onNfc(type: any) {
    this.disableButton = true
    if (type == 'register')  {
      this.checkPlatform(type)
    } else if (type == 'play') {
      this.navCtrl.push('PlayPage', { animate: true, direction: "forward" });
    }
  }

  getData() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('SELECT * FROM player', [])
          .then((data) => {
            if (data) {
              let array1 = [];

              for (let i = 0; i < data.rows.length; i++) {
                let item = data.rows.item(i);
                // do something with it
                array1.push(item);
              }
              if (array1.length > 0)  {
                this.isReg = true
              }
            }
          })
          .catch(e => console.log(JSON.stringify(e, null, 4)));
      })
      .catch(e => console.log(JSON.stringify(e, null, 4)));
  }

  createPlayer() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        let query = 'INSERT INTO player (name) VALUES ("Player")'
        if (this.name !== null && this.name !== '') {
          query = 'INSERT INTO player (name) VALUES ("'+ this.name +'")'
        }
        db.executeSql(query, [])
          .then((data) => console.log(JSON.stringify(data, null, 4)))
          .catch(e => console.log(JSON.stringify(e, null, 4)));

        db.executeSql('INSERT INTO bank (amount, action) VALUES ("1500", "INITIAL")', [])
          .then((data) => console.log(JSON.stringify(data, null, 4)))
          .catch(e => console.log(JSON.stringify(e, null, 4)));
      })
      .catch(e => console.log(JSON.stringify(e, null, 4)));  
  }

  newGame() {
    this.disableButton = false
    this.isScan = false
    this.isReg = false

    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('DELETE FROM player')
          .then((data) => console.log(JSON.stringify(data, null, 4)))
          .catch(e => console.log(JSON.stringify(e, null, 4)));

        db.executeSql('DELETE FROM bank')
          .then((data) => console.log(JSON.stringify(data, null, 4)))
          .catch(e => console.log(JSON.stringify(e, null, 4)));
      })
      .catch(e => console.log(JSON.stringify(e, null, 4)));  
  }

  checkPlatform(type:any) {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        //console.log("nfc: running on Android!");
        this.nfc.enabled().then((flag) => {
          this.isScan = true;
          this.scanNFC(type);
        }, (err) => {
          this.showToast("NFC Scanner is NOT ready ... Please check Phone settings");
          setTimeout(()=> {
            this.nfc.showSettings();
            this.cancelScan();
            this.disableButton = false
          }, 1000);  
        });        
      }
    });    
  }

  public onNfcRun(total) {
    total = total.toString();
    var message = [
      this.ndef.textRecord(total)
    ];
    
    try {
      this.nfc.write(message);
      this.showToast("NFC:Success!");
      this.cancelScan();
      this.disableButton = false;
      this.createPlayer()
      this.getData()
      // this.navCtrl.push('PlayPage', { animate: true, direction: "forward" });
      this.navCtrl.pop();
    } catch(e) {
      this.showToast("NFC:write_error");
      this.cancelScan();
      this.disableButton = false;
    }
  }

  // public writeNfc(total:any) {
  //   this.nfc.addNdefListener(, total);
  // }

  public scanNFC(type): string {
    this.ndeflistener = this.nfc.addNdefListener();

    this.subscription = this.ndeflistener.subscribe(
      (data: Event) => {
        if (this.subscription) this.subscription.unsubscribe();
        this.subscription = null;
        if (type == 'register') {
          return this.onNfcRun('1500');
        }
      },
      (err) => { 
        this.ionViewWillLeave();
        this.showToast("NFC:Scan Error... "+err);
        this.disableButton = false
        return null;
      }
    );
    //this.subscription.unsubscribe();
    return null;
  }

  public stopNFC(){
    //console.log('stopNFC()...');
    if (this.subscription) this.subscription.unsubscribe();
    if (this.subscriptions) {
      let count = 0;
      this.subscriptions.forEach(sub => { 
        ++count;
        sub.unsubscribe();
        //console.log("stopNFC: unsubscribe... ", count);
      });
      this.subscriptions = [];
    }
  }   
  
  ionViewDidEnter() {
    if (this.isScan) this.stopNFC();
    this.isScan = false;
  }

  cancelScan() {
    this.ionViewWillLeave();
    this.ionViewDidEnter();
    this.isScan = false
    this.disableButton = false
  }

  ionViewWillLeave() {
    // clearInterval(this.interval);
    // clearTimeout(this.timeout);
    this.stopNFC();
    this.isScan = false;
  }

  showToast(msg){
    //console.log('showToast()');
    let toast = this.toastCtrl.create({
        message: msg,
        duration: 1500
      });
    toast.present(); 
  }

}