// all of our quotes
const quotes = [
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
  "Nothing clears up a case so much as stating it to another person.",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
];
// store the list of words and the index of the word the player is currently typing
let words = [];
let wordIndex = 0;
localStorage.setItem("bestSc", Infinity);
// the starting time
let startTime = Date.now();
// page elements
const quoteElement = document.getElementById("quote");
const messageElement = document.getElementById("message");
const typedValueElement = document.getElementById("typed-value");

document.getElementById("start").addEventListener("click", game_start);
function game_start() {
  // get a quote
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  // Put the quote into an array of words
  words = quote.split(" ");
  // reset the word index for tracking
  wordIndex = 0;

  // UI updates
  // Create an array of span elements so we can set a class
  const spanWords = words.map(function (word) {
    return `<span>${word} </span>`;
  });
  // Convert into string and set as innerHTML on quote display
  quoteElement.innerHTML = spanWords.join("");
  // Highlight the first word
  quoteElement.childNodes[0].className = "highlight";
  // Clear any prior messages
  messageElement.innerText = "";
  // Setup the textbox
  // Clear the textbox
  typedValueElement.value = "";
  typedValueElement.disabled = false;
  // set focus
  typedValueElement.focus();
  // set the event handler
  typedValueElement.addEventListener("input", check_input);
  // Start the timer
  startTime = new Date().getTime();
}

function check_input() {
  // Get the current word
  const currentWord = words[wordIndex];
  // get the current value
  const typedValue = typedValueElement.value;

  if (typedValue === currentWord && wordIndex === words.length - 1) {
    // end of sentence
    // Display success
    const elapsedTime = new Date().getTime() - startTime;
    const message = `CONGRATULATIONS! You finished in ${
      elapsedTime / 1000
    } seconds.`;
    bestSc = localStorage.getItem("bestSc");
    // console.log("Before:", bestSc, typeof bestSc);
    bestSc = Math.min(elapsedTime / 1000, parseFloat(bestSc));
    // console.log("After:", bestSc, typeof bestSc);
    localStorage.setItem("bestSc", bestSc);
    messageElement.innerHTML = `Best Score: <b>${bestSc}</b>`;

    typedValueElement.disabled = true;
    typedValueElement.removeEventListener("input", check_input);

    // Display a modal dialog box with the success message
    const dialog = document.querySelector("dialog");
    document.querySelector("dialog p").innerText = message;
    const closeButton = document.querySelector("dialog button");
    // "Show the dialog" button opens the dialog modally
    dialog.showModal();

    // "Close" button closes the dialog
    closeButton.addEventListener("click", () => {
      dialog.close();
    });
  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    // end of word
    // clear the typedValueElement for the new word
    typedValueElement.value = "";
    // reset the class name for all elements in quote
    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }
    // highlight the new word
    quoteElement.childNodes[++wordIndex].className = "highlight";
  } else if (currentWord.startsWith(typedValue)) {
    // currently correct
    // highlight the next word
    typedValueElement.className = "";
  } else {
    // error state
    typedValueElement.className = "error";
  }
}
