import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

/**
 * Generated class for the HistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  banks = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite) {
  }

  ionViewWillEnter (){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('SELECT * FROM bank', [])
          .then((data) => {
            let bank = [];
              if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                  this.banks.push({
                    no: i + 1,
                    amount: data.rows.item(i).amount,
                    action: data.rows.item(i).action,
                  });
                }
              }

             console.log(this.banks)
          })
          .catch(e => console.log(JSON.stringify(e, null, 4)));
      })
      .catch(e => console.log(JSON.stringify(e, null, 4)));
  }

}
