/* global Folder */

function PrefsFile(theName) {  // eslint-disable-line no-unused-vars
  this.prefPath = Folder.userData.absoluteURI + theName + '.txt';

  this.saveToPrefs = function (data) {
    var f = new File(this.prefPath);
    f.encoding = 'UTF8';
    f.open('w');
    f.write(data.toSource());
    f.close();
  }

  this.readFromPrefs = function () {
    var f = new File(this.prefPath);
    if (f.exists){
      f.open('r');
      var data = eval(f.read()); // eslint-disable-line no-eval
      f.close();
      return data;
    } else {
      return null;
    }
  }
}
