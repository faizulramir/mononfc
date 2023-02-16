import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Platform, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';
/**
 * Generated class for the PlayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-play',
  templateUrl: 'play.html',
})
export class PlayPage {

  display = '0';
  disableButton = false;
  firstval: number = null;
  operator: any = null;
  newcursor = false;
  isc = false;
  iscomma = false;
  isScan: boolean = false;
  ndeflistener: any;
  subscription: Subscription = new Subscription(); //manage on/off nfc scan --first time
  subscriptions: Array<Subscription> = new Array<Subscription>(); //manage on/off nfc scan

  constructor(private nfc: NFC, public platform: Platform, public ndef: Ndef,  public toastCtrl: ToastController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {}

  onNfc(type: any) {
    this.isScan = true;
    this.disableButton = true
    this.checkPlatform(type)
  }

  checkPlatform(type:any) {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        //console.log("nfc: running on Android!");
        this.nfc.enabled().then((flag) => {
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
      this.display = total.toString();
      this.cancelScan();
      this.disableButton = false
    } catch(e) {
      this.showToast("NFC:write_error");
      this.cancelScan();
      this.disableButton = false
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
        return this.nfcReadNdef(data, type);
        // if (type == 'read') {
        //   return this.nfcReadNdef(data);
        // } else if (type == 'write') {
        //   return this.onNfcRun(this.display);
        // } else if (type == 'writeInit') {
        //   return this.onNfcRun('1500');
        // } else if (type == 'writePassGo') {
        //   return this.onNfcRun('200');
        // }
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

  androidNdefListenerSuccess(data) {
    //console.log("androidNdefListenerSuccess: data... ", data);
    if (data && data.tag && data.tag.id) {
      //console.log("data.tag: ", data.tag);
      let tagID = this.nfc.bytesToHexString(data.tag.id);
      //console.log("data.tag.id: ", data.tag.id);

      if (tagID) {
        if (data.tag.ndefMessage){
          //console.log("data.tag.ndefMessage: ", data.tag.ndefMessage);
          let payload = data.tag.ndefMessage[0].payload; 
          //console.log("data.tag.ndefMessage.payload: ", data.tag.ndefMessage[0].payload); 
          if (payload){
            let tagContent:string = this.nfc.bytesToString(payload);
            console.log("tagContent... [", tagContent+"]");
            //this.showToast("Read ["+tagContent+"]");
            this.showToast(tagContent);
            return tagContent;
          }
          else { this.showToast('ERR: NFC_NDEF_PAYLOAD_NOT_DETECTED'); }
        }
        else { this.showToast('ERR: NFC_NDEF_MSG_NOT_DETECTED'); }
      } 
      else { this.showToast('ERR: NFC_TAG_ID_NOT_DETECTED'); }
    }
    else { this.showToast('ERR: NFC_DATA_NOT_DETECTED'); }

    //console.log("nfc: tagContent... ERR");
    return null;
  }  

  nfcReadNdef(event, type) {
    this.ionViewWillLeave();

    //console.log("nfcReadNdef: Read NDEF... ", event);
    if (event && event.tag) {
      //console.log("nfcReadNdef: Read NDEF... tag ", event.tag);
      let ref:string = this.androidNdefListenerSuccess(event);
      var newarr = ref.split("en");
      if (type == 'read') {
        this.display = newarr[1].toString();
      } else if (type == 'writeAdd') {
        return this.onNfcRun(parseInt(this.display) + parseInt(newarr[1]));
      } else if (type == 'writeDeduct') {
        return this.onNfcRun(parseInt(this.display) - parseInt(newarr[1]));
      } else if (type == 'writeInit') {
        return this.onNfcRun(1500);
      } else if (type == 'writePassGo') {
        return this.onNfcRun(200 + parseInt(newarr[1]));
      }
      
      this.disableButton = false
    }
      
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
    //console.log("cancelScan() ...");
    this.ionViewWillLeave();
    this.ionViewDidEnter();
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

  click(val: any) {
    switch (val) {
      case 'ac':
        this.display = '0';
        this.firstval = null;
        this.operator = null;
        this.newcursor = false;
        break;
      case 'c':
        this.display = '0';
        this.isc = false;
        break;
      case '+/-':
        if (Math.sign(parseInt(this.display, 0)) === 1) {
          const sign = -Math.abs(parseInt(this.display, 0));
          this.display = sign.toString();
        } else if (Math.sign(parseInt(this.display, 0)) === -1) {
          const sign = Math.abs(parseInt(this.display, 0));
          this.display = sign.toString();
        } else {
          this.display = this.display;
        }
        break;
      case '%':
        this.addpercent();
        break;
      case ':':
        this.addoperator(':');
        break;
      case 'X':
        this.addoperator('X');
        break;
      case '-':
        this.addoperator('-');
        break;
      case '+':
        this.addoperator('+');
        break;
      case '=':
        if (this.firstval !== null && this.operator !== null) {
          this.calclast();
        }
        this.operator = null;
        break;
      case '0':
        this.addnumber('0');
        break;
      case '1':
        this.addnumber('1');
        break;
      case '2':
        this.addnumber('2');
        break;
      case '3':
        this.addnumber('3');
        break;
      case '4':
        this.addnumber('4');
        break;
      case '5':
        this.addnumber('5');
        break;
      case '6':
        this.addnumber('6');
        break;
      case '7':
        this.addnumber('7');
        break;
      case '8':
        this.addnumber('8');
        break;
      case '9':
        this.addnumber('9');
        break;
      case ',':
        this.addcomma();
        break;
    }
  }

  addcomma() {
    if (this.iscomma === false) {
      this.iscomma = true;
    } else {
      this.iscomma = false;
    }
  }

  addnumber(nbr: string) {
    if (nbr === '0') {
      if (this.newcursor === true) {
        this.display = nbr;
        this.newcursor = false;
      } else if (this.display !== '0') {
        if (this.iscomma === true) {
          this.display = `${this.display.toString()}.${nbr}`;
        } else {
          this.display = this.display.toString() + nbr;
        }
      } else if (this.display === '0') {
        if (this.iscomma === true) {
          this.display = `${this.display.toString()}.${nbr}`;
        }
      }
    } else {
      if (this.newcursor === true) {
        this.display = nbr;
        this.newcursor = false;
      } else if (this.display === '0') {
        if (this.iscomma === true) {
          if (this.display.toString().indexOf('.') > -1) {
            this.display = this.display.toString() + nbr;
          } else {
            this.display = `${this.display.toString()}.${nbr}`;
          }
        } else {
          this.display = nbr;
        }
      } else {
        if (this.iscomma === true) {
          if (this.display.toString().indexOf('.') > -1) {
            this.display = this.display.toString() + nbr;
          } else {
            this.display = `${this.display.toString()}.${nbr}`;
          }
        } else {
          this.display = this.display.toString() + nbr;
        }
      }
    }
    this.isc = true;
  }

  addpercent() {
    this.iscomma = false;
    const dispval = parseInt(this.display, 0) / 100;
    this.display = dispval.toString();
  }

  addoperator(op: string) {
    if (this.newcursor === false) {
      if (this.firstval === null) {
        if (this.iscomma === true) {
          this.firstval = parseFloat(this.display);
        } else {
          this.firstval = parseInt(this.display, 0);
        }
      }
      if (this.firstval !== null && this.operator !== null) {
        this.calclast();
      }
    }
    this.iscomma = false;
    this.operator = op;
    this.newcursor = true;
  }

  calclast() {
    switch (this.operator) {
      case ':':
        if (this.iscomma === true) {
          this.firstval = (this.firstval / parseFloat(this.display));
        } else {
          this.firstval = (this.firstval / parseInt(this.display, 0));
        }
        break;
      case 'X':
        if (this.iscomma === true) {
          this.firstval = (this.firstval * parseFloat(this.display));
        } else {
          this.firstval = (this.firstval * parseInt(this.display, 0));
        }
        break;
      case '-':
        if (this.iscomma === true) {
          this.firstval = (this.firstval - parseFloat(this.display));
        } else {
          this.firstval = (this.firstval - parseInt(this.display, 0));
        }
        break;
      case '+':
        if (this.iscomma === true) {
          this.firstval = (this.firstval + parseFloat(this.display));
        } else {
          this.firstval = (this.firstval + parseInt(this.display, 0));
        }
        break;
    }
    this.display = this.firstval.toString();
  }
}
