

var allAuthors = [
    "Adam Lindsay Gordon",
    "Alan Seeger",
    "Alexander Pope",
    "Algernon Charles Swinburne",
    "Ambrose Bierce",
    "Amy Levy",
    "Andrew Marvell",
    "Ann Taylor",
    "Anne Bradstreet",
    "Anne Bronte",
    "Anne Killigrew",
    "Anne Kingsmill Finch",
    "Annie Louisa Walker",
    "Arthur Hugh Clough",
    "Ben Jonson",
    "Charles Kingsley",
    "Charles Sorley",
    "Charlotte Bronte",
    "Charlotte Smith",
    "Christina Rossetti",
    "Christopher Marlowe",
    "Christopher Smart",
    "Coventry Patmore",
    "Edgar Allan Poe",
    "Edmund Spenser",
    "Edward Fitzgerald",
    "Edward Lear",
    "Edward Taylor",
    "Edward Thomas",
    "Eliza Cook",
    "Elizabeth Barrett Browning",
    "Emily Bronte",
    "Emily Dickinson",
    "Emma Lazarus",
    "Ernest Dowson",
    "Eugene Field",
    "Francis Thompson",
    "Geoffrey Chaucer",
    "George Eliot",
    "George Gordon, Lord Byron",
    "George Herbert",
    "George Meredith",
    "Gerard Manley Hopkins",
    "Helen Hunt Jackson",
    "Henry David Thoreau",
    "Henry Vaughan",
    "Henry Wadsworth Longfellow",
    "Hugh Henry Brackenridge",
    "Isaac Watts",
    "James Henry Leigh Hunt",
    "James Thomson",
    "James Whitcomb Riley",
    "Jane Austen",
    "Jane Taylor",
    "John Clare",
    "John Donne",
    "John Dryden",
    "John Greenleaf Whittier",
    "John Keats",
    "John McCrae",
    "John Milton",
    "John Trumbull",
    "John Wilmot",
    "Jonathan Swift",
    "Joseph Warton",
    "Joyce Kilmer",
    "Julia Ward Howe",
    "Jupiter Hammon",
    "Katherine Philips",
    "Lady Mary Chudleigh",
    "Lewis Carroll",
    "Lord Alfred Tennyson",
    "Louisa May Alcott",
    "Major Henry Livingston, Jr.",
    "Mark Twain",
    "Mary Elizabeth Coleridge",
    "Matthew Arnold",
    "Matthew Prior",
    "Michael Drayton",
    "Oliver Goldsmith",
    "Oliver Wendell Holmes",
    "Oscar Wilde",
    "Paul Laurence Dunbar",
    "Percy Bysshe Shelley",
    "Philip Freneau",
    "Phillis Wheatley",
    "Ralph Waldo Emerson",
    "Richard Crashaw",
    "Richard Lovelace",
    "Robert Browning",
    "Robert Burns",
    "Robert Herrick",
    "Robert Louis Stevenson",
    "Robert Southey",
    "Robinson",
    "Rupert Brooke",
    "Samuel Coleridge",
    "Samuel Johnson",
    "Sarah Flower Adams",
    "Sidney Lanier",
    "Sir John Suckling",
    "Sir Philip Sidney",
    "Sir Thomas Wyatt",
    "Sir Walter Raleigh",
    "Sir Walter Scott",
    "Stephen Crane",
    "Thomas Campbell",
    "Thomas Chatterton",
    "Thomas Flatman",
    "Thomas Gray",
    "Thomas Hood",
    "Thomas Moore",
    "Thomas Warton",
    "Walt Whitman",
    "Walter Savage Landor",
    "Wilfred Owen",
    "William Allingham",
    "William Barnes",
    "William Blake",
    "William Browne",
    "William Cowper",
    "William Cullen Bryant",
    "William Ernest Henley",
    "William Lisle Bowles",
    "William Morris",
    "William Shakespeare",
    "William Topaz McGonagall",
    "William Vaughn Moody",
    "William Wordsworth"
];


//Handlebars compile code
var source = document.querySelector('#entry-template').innerHTML;
var template = Handlebars.compile(source);

// end Handlebars compile code
var context = {}; // for Handlebars
var wordsUsedInPoems = [];
var wordsUsedInLine = [];
var linesAsArraysOfWords = [];
var linesWithNoRepeats = [];
var requestedAuthor = "Longfellow";
var currentPoem = "";
var allPoemsByAuthor = [];
var omitLongAssPoems = true;
var lineCountMax = 1000;
var poetDropDown = document.querySelector('#all-poets');
var longAssCheckBox = document.querySelector('#omit-long-ass-poems');
var totalPoemsFromSearch = 0;

function addListeners() {

  /* may use this for a 'twee selection' feature...
  document.addEventListener('mouseup', function() {

          console.log(getSelectionText());
      });*/

    poetDropDown.addEventListener('change', function() {

        requestNewAuthor(this.value);

    });


    longAssCheckBox.addEventListener('change', function() {
        if (longAssCheckBox.checked) {
            omitLongAssPoems = true;
            lineCountMax = 50;

        } else if (!longAssCheckBox.checked) {
            omitLongAssPoems = false;
            lineCountMax = 1000;
        }

requestNewAuthor(poetDropDown.value); // to update the results... better if we used what's already loaded but since that structure isn't set in stone yet I'm doing it this way.


    });


}

for (var i = 0; i < allAuthors.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = allAuthors[i];
    opt.value = allAuthors[i];
    poetDropDown.appendChild(opt);
}

addListeners();


// start xhr within a promise
function getJSON(url) {

    var urlForPoetryDB = encodeURI(url);
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'poem-getter.php', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function() {
            if (xhr.status === 200) {
              resolve(context.lines = JSON.parse(xhr.responseText));
              //window.alert(xhr.responseText);
            } else {
                reject(Error('Request failed, status was ' + xhr.statusText));

            }
        };
        xhr.send("urlForPoetryDB="+urlForPoetryDB); //this part tripped me up for a minute

    })
}
// end xhr




function requestNewAuthor(author) {
        document.querySelector('#template-output').innerHTML += '<div class="poem-panel loading">Loading & desecrating classic poetry ...</div>';
    context.author = author;
    linesWithNoRepeats = [];
    wordsUsedInPoems = [];
    getJSON('http://poetrydb.org/author/' + author + '/lines,title,linecount').then(function() {
        //searchAndUpdate(''); // returns ALL THE LINES
        splitLinesIntoWords();
        html = template(context); // also for Handlebars
        document.querySelector('#template-output').innerHTML = html;

    });
}


// this function can be called from the page to return any lines that match a search term and update the div based on that.
function searchAndUpdate(newSearchTerm) {
    context.matchingLines = [];
    pullLinesThatMatchSearchTerm(newSearchTerm);
    var html = template(context); // also for Handlebars
    document.querySelector('#template-output').innerHTML = html;
}

function pullLinesThatMatchSearchTerm(searchTerm) {

    for (var i = 0; i < context.lines.length; i++) {

        for (var j = 0; j < context.lines[i]['lines'].length; j++) {

            if (context.lines[i]['lines'][j].indexOf(searchTerm) !== -1) {

                context.matchingLines.push(context.lines[i]['lines'][j]);

            }
        }
    }
}




function splitLinesIntoWords() {

totalPoemsFromSearch = 0;

    var indexForNoRepeats = 1; // this and the next line fix some silly concatenation stuff.
    linesWithNoRepeats[0] = "";

    for (var i = 0; i < context.lines.length; i++) {

        if (context.lines[i]['linecount'] <= lineCountMax) {

          totalPoemsFromSearch++;

            for (var j = 0; j < context.lines[i]['lines'].length; j++) {

                linesWithNoRepeats[indexForNoRepeats] = []; // initializes array for push later.


                wordsUsedInLine = context.lines[i]['lines'][j].split(' ');
                linesAsArraysOfWords.push(wordsUsedInLine);

                for (var k = 0; k < wordsUsedInLine.length; k++) {

                    if (wordsUsedInPoems.indexOf(wordsUsedInLine[k]) === -1) {

                        wordsUsedInPoems.push(wordsUsedInLine[k]);
                        linesWithNoRepeats[indexForNoRepeats].push(wordsUsedInLine[k]);

                        if (k === wordsUsedInLine.length - 1) {
                            linesWithNoRepeats[indexForNoRepeats] = linesWithNoRepeats[indexForNoRepeats].join(' ');
                            indexForNoRepeats++;
                        }

                    }

                }
                wordsUsedInLine = [];

                if (j === 0) {
                    currentPoem = context.lines[i]['title'];
                    allPoemsByAuthor.push(currentPoem + ': ' + indexForNoRepeats);
                    linesWithNoRepeats[indexForNoRepeats - 2] += '</div><div class="poem-panel"><b>From: ' + currentPoem + '</b>'
                }


            }



        }




        context.noRepeats = linesWithNoRepeats;

        context.allPoemsByAuthor = allPoemsByAuthor;

        context.numberOfPoems = totalPoemsFromSearch;

        if (context.numberOfPoems > 1) {
          context.pluralPoems = true;

    }
        else {
          context.pluralPoems = false;

}
    }
}
requestNewAuthor('Christina Rossetti');


function getSelectionText() {
    var text = '';
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}
