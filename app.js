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

/**
 * Class for processing the files from md to html
 * @type {Fileprocessor}
 * @example
 * currentitemdest = filearray[i].replace(src, dest);
 * const fileprocess = new Fileprocessor();
 * var filecontent = fs.readFileSync(filearray[i], 'utf-8');
 * fileprocess.contentprocess(currentitemdest, filecontent);
 */
class Fileprocessor {

  /**
   * mofidyextension gets the current filedest checks if its extension is .md and renames it to be .html in the dest
   * @param  {String} filedest The file destination string
   * @arg    {String}   currentextension This is the current extension, remaining string after last . in file name.
   * @arg    {String}   htmlextension Takes the extensionless destination file and simply adds .html to the string for use with fs.renameSync
   */
  modifyextension(filedest){

    var currentextension = filedest.substr(filedest.lastIndexOf('.'), 3);

    if(currentextension == '.md'){
      var extensionless = filedest.substr(0, filedest.lastIndexOf('.'));
      var htmlextension = extensionless + '.html';
      console.log('Changed file from', filedest,' to ', htmlextension);
      fs.renameSync(filedest, htmlextension);
    }

  };

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
        if (err) {
          console.log('Write file error.');
          console.log(err);
        }
        this.modifyextension(filedest);
      });

    });

  }

}

/**
 * Class for compiling methods including, getrecursivestructure(), clean(), and process()
 * @type {Compile}
 */
class Compile {

  /**
   * Cleans up the public folder that was generated previously
   * @param  {String} dest The destination folder that will be cleaned (removed recursively)
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
   * Get all files with their folder structure recursively from the param root passed in
   * @param  {String} root The root folder you want to receive the recursive folder file structure from
   * @return {Array}      Returns an array including each folder file item, this can/should be used as a base method for further processing
   */
  getrecursivestructure(root) {

    var dirrec = function(root) {
      var results = [];
      var list = fs.readdirSync(root);
      list.forEach(function(file) {
          file = root + '/' + file;
          var stat = fs.statSync(file)

          if (stat && stat.isDirectory()){
            results = results.concat( dirrec(file) );
          } else {
            results.push(file);
          }
      });
      return results;
    }

    return dirrec(root);

  }

  /**
   * processes the src and dest items, passing them to be compiled, cleaned, created. This is where the fileprocess.contentprocess is triggered.
   * @param  {String} src   The src folder to compile the markdown from by getting the recursive structure
   * @param  {String} dest  Destination for the files to be public, if the dest does not exist, it is created
   */
  process(src, dest) {

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    var filearray = this.getrecursivestructure(src);
    console.log('FILE ARRAY:',filearray);

    for (var i = 0; i < filearray.length; i++) {
      var currentitemdest = '';
      for (var i = 0; i < filearray.length; i++) {
        if ( filearray[i].startsWith(src) ) {
          currentitemdest = filearray[i].replace(src, dest);
          const fileprocess = new Fileprocessor();
          var filecontent = fs.readFileSync(filearray[i], 'utf-8');
          fileprocess.contentprocess(currentitemdest, filecontent);
        }
      }

    }

    return;

  }

}

module.exports = Compile;
