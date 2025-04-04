//Playability Percentage(the card is assumed in hand on calculation)


function getRandomHand(deckList, count) {
    const shuffled = [...deckList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function pickOptimalLands(lands, spellMana, spellTurn) {
    // This system isn't the most refined and often leads to dual mana cards ie: GB or WW being far off, but I'm happy with the system as is.
    //Will have to refine at a latter time.
    //I know it's overcomplicated, will try and get dual lands/ dual mana spells working in the future(might take me too long for project)
    const requiredColors = spellMana
        .filter(m => m.color !== 'any')
        .map(m => manaMap[m.color]);
    const scoredLands = lands.map(land => ({
        land,
        score: land.mana.reduce((score, m) => 
            requiredColors.includes(manaMap[m.color]) ? score + 1 : score, 0)
    }));
    return scoredLands
        .sort((a, b) => b.score - a.score)
        .slice(0, spellTurn)
        .map(item => item.land);
}

function checkManaRequirements(landsInPlay, spellMana) {
    
    const available = { W: 0, U: 0, B: 0, R: 0, G: 0, total: 0 };
    landsInPlay.forEach(land => {
        if (!land.tapped) {
            land.mana.forEach(m => {
                const symbol = manaMap[m.color];
                const amount = m.cost || 1;
                if (m.color === 'any') {
                    available.total += amount;
                } else {
                    available[symbol] += amount;
                    available.total += amount;
                }
            });
        }
    });
    //console.log(spellMana);

    //Count req.
    const required = { W: 0, U: 0, B: 0, R: 0, G: 0, total: 0 };
    spellMana.forEach(m => {
        const symbol = manaMap[m.color];
        const amount = m.cost || 1;
        if (m.color === 'any') {
            required.total += amount;
        } else {
            required[symbol] += amount;
            required.total += amount;
        }
    });


    let anyManaLeft = available.total;
    for (const type of ['W', 'U', 'B', 'R', 'G']) {
        const needed = required[type];
        if (needed > 0) {
            const covered = Math.min(available[type], needed);
            const shortfall = needed - covered;
            if (shortfall > 0) {
                if (anyManaLeft >= shortfall) {
                    anyManaLeft -= shortfall;
                } else {
                    return false;
                }
            }
        }
    }
    return anyManaLeft >= required.total;
}
function cardPlayability(spell, deckList, onTheOption) {//onTheOption to determine if you get an extra card, which improves some probabilities.
    const trials = 5; //Monte Carlo-esque system
    let playable = 0;
    const spellTurn = spell.cost;

    for (let i = 0; i < trials; i++) {
        const handSize = 6 + onTheOption + (spellTurn - 1);
        const hand = getRandomHand(deckList, handSize); //I think the 'randomness' is somewhat set, will have to look into it in the future
        const lands = hand.filter(card => card.type === 'land');
        const landsInPlay = pickOptimalLands(lands, spell.mana, spellTurn);

        if (landsInPlay.length >= spellTurn && checkManaRequirements(landsInPlay, spell.mana)) {
            playable++;
        }
    }
    return (playable / trials) * 100;
}

function calculateSpells(spellList, landList, onTheOption) {
    const deckList = [...spellList, ...landList];
    spellList.forEach(spell => {
        spell.calculated = cardPlayability(spell, deckList, onTheOption);
    });
}

//function tapLogic(landList)
    //probably gonna save this for the future, still gotta get dual costs calculating properly.
//this is just for me personally
//Pros of my website, cons compared to oncurve, and the ideas for the site's future.
//Let's start with the pros::
//#1 No external card names necessary
//#2 Easy to use system with a clean layout
//#3 Future updates that will include deck-thining algorithms and understanding tap vs. untapped lands/fetch lands

//Cons::
//#1 No direct import/ card database
//#2 Lacking general data
//#3

//Requirements met::
//
