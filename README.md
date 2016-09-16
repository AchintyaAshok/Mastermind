# Mastermind

## What is Mastermind?
Mastermind is a game similar to hangman. In mastermind, like hangman, the objective is to guess the word or phrase. The difference, however, is that the only response you get for a guess is a value indicating the 'number' of correct letters in the guess (no positional information is given).

For instance, let's suppose the secret phrase is 'hello world'. You guess 'hhhhh hhhhh' => response => 1. 1 indicates that exactly one character in your guess was a correct letter in the correct position (no indication as to which position).

Another difference is that you are not limited to guessing letters -- you can also guess a phrase or string of letters. For instance, my guess could be 'hello jello' or 'hello world', the latter case being an instance of me winning the game outlined previously.
