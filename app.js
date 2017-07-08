const fs = require('fs');
const marked = require('marked');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

// TODO:
// Attempt to access folder called 'md' if error, handle
// Iterate through the md folder to get the structure and file names
// Compile locally into public folder /md
//

/**
 * Fileprocessor
 * @type {Class}
 */
class Fileprocessor {

  /**
   * contentprocess
   * @param  {String} filedest      The file destination string
   * @param  {Obj}    filecontent   Contents of the file to be processed
   */
  contentprocess(filedest, filecontent){

    marked(filecontent, (err, res) => {

      if (err) {
        console.log('Error: Mark down.');
        console.log(err);
      }

      fs.writeFile(filedest, res, (err, res) => {
        console.log('File processed to:',filedest);
      });

    });



  }

}

/**
 * [mdsource description]
 * @type {[type]}
 */
class Compile {

  /**
   * Cleans up the public folder that was generated previously
   * @param  {String} dest This is the destination folder that will be cleaned (removed recursively)
   */
  clean(dest){
    console.log('\n');
    console.log('*** *** *** *** *** *** *** *** *** *** ***');
    console.log('RUNNING RECURSIVE CLEAN');
    if( fs.existsSync(dest) ) {
      fs.readdirSync(dest).forEach(function(file,index){
        var curPath = dest + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          console.log('     Folder from dest:',curPath);
          clean(curPath);
        } else { // delete file
          console.log('     unlinkSync from dest:',curPath);
          fs.unlinkSync(curPath);
        }
      });
      console.log('     rmdirSync from dest:',dest);
      fs.rmdirSync(dest);
    }
    console.log('FINISHED CURRENT CLEAN');
    console.log('*** *** *** *** *** *** *** *** *** *** ***');
    console.log('\n');
  }

  /**
   * process processes the src and dest items, passing them to be compiled, cleaned, created
   * @param  {String} src   The src folder to compile the markdown from
   * @param  {String} dest [description]
   * @return {[type]}      [description]
   */
  process(src, dest) {

    // Check if the dest exists, if it doesn't create it
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    var files = fs.readdirSync(src);

    for (var i in files) {

      var currentitem = src + '/' + files[i];
      var currentitemdest = dest + '/' + files[i];
      var statsyncitem = fs.statSync(src + '/' + files[i]);

      if ( statsyncitem.isDirectory() ) {
        //console.log(files[i], 'is a directory');
        var subsrc = src + '/' + files[i];
        var subdest = dest + '/' + files[i];
        this.process(subsrc, subdest);
      }
      if ( statsyncitem.isFile() ) {
        //console.log(files[i], 'is a file');

        // NOTE: getting the contents of the file and passing it to the markdown processor
        const fileprocess = new Fileprocessor();
        var filecontent = fs.readFileSync(currentitem, 'utf-8');
        fileprocess.contentprocess(currentitemdest, filecontent);

      }

    }

    // TODO: Remove this after testing
    //this.clean(dest);

    return;


  }

}

module.exports = Compile;
