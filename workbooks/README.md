# Workbook Format Guide

## Overview
This guide explains how to format questions in the markdown workbook for the French learning app.

## Basic Format
Each translation pair should follow this format:
```
- french_word → dutch_word
```

## Categories
Questions are automatically categorized based on:
- Section headers in the markdown
- Keywords in the content
- Context clues

## Gender Notation
For French nouns, indicate gender with:
- `m` or `m.` for masculine
- `f` or `f.` for feminine
- `m/f` for words that can be both

Example:
```
- le chat m → de kat
- la maison f → het huis
```

## Difficulty Levels
Difficulty is automatically calculated based on:
- Word length
- Number of words in the phrase
- Complexity of the translation

## Special Characters
French special characters are supported:
- é, è, ê, ë
- à, â
- ç
- ô
- ù, û
- ï

## Comments
Lines starting with `#` are treated as headers/comments and ignored.

## Example Section
```markdown
## Animals - Dieren

### Common Animals
- le chien m → de hond
- le chat m → de kat
- l'oiseau m → de vogel
- le poisson m → de vis
```