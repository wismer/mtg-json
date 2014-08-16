
Magic: the Gathering Viz
==============

I always get nostalgic whenever I see the ochre/brown background of Magic cards. It's an expensive
hobby, so I haven't played in a long time but I am endlessly fascinated with the relative merits and demerits of the various colors people can play with (especially when I was a kid). I know intuitively from experience that green is usually filled with cheap and very expensive creatures, usually with the former doing some of the heavy lifting for bringing out the latter. Blue is weak on creatures, but strong on tricky "agile" cards; cards that can be brought out cheaply and that can be played at any time during the game.

Partly out of curiosity and partly as a desire to learn more about (d3.js/Backbone/JS in general) and partly because I wanted to see if some of my perceptions were on the money about certain colors and their relative strengths/weaknesses, I took advantage of [MTGJson](http://www.mtgjson.com)'s json files by data mining all magic cards in existence. I used a very, _very_ simple algorithm of determining the score of every solid-color card WITHOUT factoring in the unique abilities/effects each card has. What you see in the image at the bottom represents the "cost" of the card, relative to the average "cost" of every card in a particular set. Every set that came with booster cards was measured.

* Creatures are what I would consider as a "slow" card. Usually can't use them right away on your turn, but on the other hand they are "durable", and carry a special value due to whatever their power/toughness is.
* Instants are "quick" and can be used at any time, but have no permanence.
* Enchantments are "slow", but have more durable than creatures.
* Sorceries are "slow", are usually expensive (2,3 converted mana cost or more).

Anywho, I hope to eventually build up to making a card drafter. If you look at `app.js`, the function `randomizeBooster` returns a list of cards (about 75-90 of them) that are randomly picked from an expansion set, and the chances of getting a rare card are the same as one would in real life.

Wow I really miss opening those packs as a kid. Joy in every unwrapping.

Anyway, this is definitely a work in progress. I'd really like to make the game playable online, but that would be in obivous violation of some copyrights.

![Cost Differential](/public/diff.png)