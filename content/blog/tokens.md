---
title: "Strawberry is three numbers"
description: >-
  The same sentences through the tokenisers of GPT-4, GPT-4o, Llama 3 and Gemma 3, every token drawn as a chip. Why a model cannot count the r's in strawberry, and why 2026 arrives as 202 and 6.
date: '2027-01-19T09:00:00+00:00'
tags:
  - charts
  - ai engineering
  - llms
  - tokenisation
series: "AI engineering"
chart: "tokens"
draft: false
---

Type "strawberry" to GPT-4o and the model does not receive a word. It receives three numbers: 302, 1618 and 19772. They stand for "st", "raw" and "berry". Not one of them is the letter r.

That is the whole of the strawberry problem, the famous failure of models to count the r's in the word. The letters are not in the input. Only the ids of the pieces are, and counting the letters means remembering how each piece is spelt.

The chart is at [labs.sammii.dev/charts/tokens](https://labs.sammii.dev/charts/tokens/). It puts the same sentences through four tokenisers in real use, and draws every token as a chip, exactly as each tokeniser returned it.

## What a tokeniser does

A language model never sees letters. Before your words reach it, a tokeniser cuts them into pieces from a fixed vocabulary and swaps each piece for a number. The numbers are all the model gets. Common words are one piece, rare ones are several, and a single character can be split across pieces.

The four on the chart, with the size of each vocabulary in token ids:

- **cl100k_base**, used by GPT-4 and GPT-3.5 Turbo: 100,277.
- **o200k_base**, used by GPT-4o, GPT-4.1, o3 and GPT-5: 200,019.
- **Llama 3**, used by Llama 3 and 3.1: 128,256.
- **Gemma 3**, a SentencePiece vocabulary: 262,208.

## Using it

Across the top is a row of sentences: **A plain sentence**, **The famous question**, **A line of code**, **Numbers**, **Japanese**, **Emoji**, **A Welsh place name** and **Whitespace**. Pick one and the chart shows its length in characters and in bytes, a note on what to look for, and then four rows of chips, one row per tokeniser, each with its token count.

Hover a chip (or focus it with the keyboard) and the readout underneath gives its id and how many bytes it holds (for a chip in hex, the bytes themselves). A dot stands for a space and an arrow for a newline. A chip in hex is a token that is only part of a character. Under the rows, **What GPT-4o actually receives** prints the sentence as the list of ids, which is the honest view of what the model is given.

The page opens on the famous question, "How many r's are in strawberry?". It is eight tokens to the GPT and Llama tokenisers and nine to Gemma 3's, and " strawberry", with its space, is one of them. The model is being asked about the letters inside a token it receives as a single number.

## The strawberry table

Below the sentences is a table of the word itself, six ways, through all four tokenisers. It is the part of the chart I keep going back to, because the same word comes out differently every time:

- **strawberry** on its own is three tokens in three of the tokenisers: "str", "aw", "berry" for GPT-4 and Llama 3, "st", "raw", "berry" for GPT-4o. Gemma 3 has the whole word as one piece, which hides the letters completely.
- **" strawberry"** with a space in front is one token in all four. The same word is different input depending on what comes before it.
- **STRAWBERRY** in capitals is four tokens everywhere: "ST", "RAW", "B", "ERRY" in the GPT and Llama tokenisers, "STRA", "W", "BER", "RY" in Gemma's.
- **s t r a w b e r r y**, spelt out with spaces, is ten tokens in all four, one per letter. Every r is suddenly its own token, and the count is easy.

Whatever a model knows about how its pieces are spelt, it had to learn as a fact about numbers. It cannot look.

## Where it gets stranger

**Japanese.** 月が綺麗ですね is seven characters and 21 bytes in UTF-8. GPT-4's tokeniser makes it 11 tokens, GPT-4o's and Llama 3's make it 6, and Gemma 3's makes it 4. GPT-4's has few Japanese pieces, so it falls back to raw bytes: 綺 and 麗 each become three tokens that are not characters at all. The chart draws those in hex, E7 B6 BA and E9 BA 97, because there is nothing else honest to draw.

**Numbers.** The GPT and Llama tokenisers cut digits into groups of up to three from the left. In "Order #48213 shipped on 19/10/2026 for £1,234.56." the order number arrives as 482 and 13, and the year as 202 and 6. Gemma 3 gives every digit a token of its own, so the same sentence is 21 tokens to the first three and 31 to Gemma. Arithmetic on numbers chopped like that is harder than it looks.

**Emoji.** The full moon emoji is four bytes and three tokens in cl100k, none of them a whole character. A model can emit the first byte of an emoji and not the rest. Gemma 3 has the moon as one piece.

**A Welsh place name.** Llanfairpwllgwyngyll comes out as the same nine fragments in all four: L, lan, fair, pw, ll, g, wy, ng, yll. A long word that is rare in the training data is spelt out in pieces, and the same is true of names, product names and most words in most languages that are not English.

**Code** splits on punctuation. The GPT and Llama tokenisers have ".reduce" and ".price" as single pieces, learnt from all the JavaScript they were trained on. Gemma splits the dot off each. **Whitespace** is tokens too: the GPT and Llama tokenisers glue the newline to the brace and lend the fourth space of an indent to " return", while Gemma keeps the newline and the indent as tokens of their own.

## How it is built

Nothing is tokenised in your browser, and nothing is approximated. Every token on the page was produced offline by `scripts/labs/tokens.py` on 19 October 2026 and saved to a data file the chart reads.

cl100k_base and o200k_base are OpenAI's tiktoken 0.12.0, with the BPE files checked against the SHA-256 hashes pinned in tiktoken itself. Llama 3 is tiktoken running the 128,000 ordinary tokens read out of a Llama 3.1 8B model file (Hermes 3, through Ollama) with the split pattern from Meta's llama3 tokeniser. Gemma 3 is SentencePiece's BPE, score-ordered merges with byte fallback, over the vocabulary in Ollama's gemma3:4b-it-qat.

Those last two are rebuilt rather than called directly, so I checked them against the models themselves. For ten test sentences, including the emoji, the Japanese and some whitespace, the number of prompt tokens Ollama reported was mine plus one start-of-text token, every time.

## What it does not show

It shows four tokenisers, not every model's. A model that uses a tokeniser other than these four is not on the chart, and its chips would be cut by its own vocabulary.

You cannot type your own sentence. Because the tokenising happens offline, the chart is limited to the eight sentences and the six strawberries it was built with. That was the price of being exact: no tokeniser runs in the page, so nothing on the page is a guess.

And it shows the input, not what a model does with it. Whatever a model knows about how token 19772 is spelt, it had to learn from somewhere other than the input. The chart explains why counting letters is hard for a model. It does not test any model, and it does not say that a particular one gets the question wrong today.

The chart is at [labs.sammii.dev/charts/tokens](https://labs.sammii.dev/charts/tokens/), and `?focus=strawberry`, `?focus=japanese` or `?focus=numbers` opens it on one sentence.

## Sources

- Sennrich, Haddow and Birch, Neural Machine Translation of Rare Words with Subword Units (2016).
- Kudo and Richardson, SentencePiece (2018).
- OpenAI, tiktoken.
- Meta, llama3 tokenizer.py.
