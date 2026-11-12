---
title: 'No model decides whether a model made something up'
description: 'How I check text an LLM drafts about me against my own records, with plain rules for names, numbers and verbs, a single redraft with the flags fed back, and then no draft at all.'
date: '2026-11-12T09:00:00+00:00'
tags:
  - engineering
  - llm
  - accuracy
draft: false
---

Cast is a system I built that drafts text in my name: replies, form answers and documents about my work. An LLM writes the draft. Then deterministic checks verify every claim against my real history before I send anything.

That last step is the part worth writing about. Text about a real person is where a language model does the most damage when it fills a gap. A plausible sentence about a tool I have never used reads exactly like a true one, and the person reading it has no way to tell.

## What went wrong first

Before the check existed, drafts claimed tools and experience my records do not support, and said I had read something I had not. That is the failure to design for. Ask a model to make someone sound credible and it will tend to supply the details a credible person would have.

## Why the checker is not a model

The claims check says it in its own docstring: deterministic on purpose, so no model decides whether a model made something up.

A second model asked to judge the first is judging whether a sentence sounds right, which is the same judgement that produced the error. A deterministic check does something narrower and more useful. It asks whether each claim traces to a record. It gives the same answer every time for the same text, and every flag comes with a reason a person can read. Each verdict carries a hash of the exact text it judged.

## Ground truth is my own records

The records are my own: my master profile, my LinkedIn experience, my own work notes, the text of this site, and a verified facts file. The rule for that file is that each fact names where it was checked, and only things read in code, in config or in my own words go in.

## What it checks

The rules are small and literal.

- Named terms. Any word that looks like a name (a capital inside the word, a digit, a dot, or a capital in the middle of a sentence) has to appear in my records. That covers frameworks, products, companies and acronyms.
- Numbers next to the same noun. A count of engineers needs that same count near the word engineer in my records, not the same digit somewhere else. A figure in millions has to appear in millions.
- Strong verbs. Words that claim more than built or worked on, such as led, managed, founded or architected, need the same stem in the source.
- A not-claimable list. Lines in my verified facts mark things I must never imply. Terms named there are refused in any sentence about me, unless the sentence says I have not done it. A few terms are claimable only in the context I gave.
- Fixed rules that need no records: no claim that I read something I have not confirmed reading, no personal detail, no proposed days or times, no links except my own sites or ones from the message being answered, and no em or en dashes.

The checker also reads who a sentence is about. A sentence with I, my or me in it is a claim about me, and may only use my records. A sentence about the other person, or a question, may also use words from their message. A sentence about what I would do next is intent rather than history, so it may use the terms of the request it answers. Anything I say I have done stays limited to my records.

## A single redraft, then no draft

Checking is half of it. The other half is what happens on a flag.

The drafter gets a single second attempt. The flags go back into its prompt with an instruction to fix each one by removing the claim, never by rewording it into a different claim, and to offer to hear more rather than invent an answer it cannot support. The redraft is checked again. If it still fails, there is no draft at all. The refusal is logged with its flags, and nothing is written for me to send.

That last rule matters most. A system that must always produce something will, under pressure, produce something wrong. Producing nothing is a valid outcome, and it is the cheapest one: a missing draft costs me a little time, while a false claim in my name costs trust that is hard to win back.

Text I have approved or edited is checked again before it is sent, with the accuracy rules only. The drafting rules, like not proposing a time, bind the machine, not my own choices.

## The cost of being literal

The checker is strict, and some of what it flags is true. A real project that is written down nowhere looks exactly like an invented one. The way to get a true claim through is to add it to the records with where it was checked, not to loosen the rule. That keeps the pressure on the records rather than on the checker: they have to be complete, and every line has to say where it came from.

## What I take from it

- Check claims against records, not against plausibility.
- Keep the checker deterministic, so the same text always gets the same verdict and every flag has a reason.
- Treat names, numbers and verbs as different kinds of claim, each with its own rule.
- Feed the flags back once, with an instruction to remove rather than reword.
- Make no draft a valid result.
- When something true is flagged, fix the records, not the rule.

This essay went through the same check before it was published.
