//Main DOM handling and rendering

class MTGDeckManager {

    constructor() {
        this.deck = { spells: [], lands: [], totalCards: 0 };
        this.currentMana = [];
        this.elements = this.getDOMElements();
        this.initializeEventListeners();
        this.renderDeck();
    }

    getDOMElements() {
        return {
            typeSelect: document.getElementById('card-type'),
            manaButtons: document.querySelectorAll('.mana-button'),
            anyInputContainer: document.getElementById('any-input-container'),
            anyCostInput: document.getElementById('any-cost'),
            anyConfirmButton: document.getElementById('any-confirm'),
            manaSlots: document.getElementById('mana-slots'),
            tapCheck: document.getElementById('tap-check'), //for future update
            amountToAdd: document.getElementById('amount-to-add'),
            addToDeckButton: document.getElementById('add-to-deck'),
            clearDeckButton: document.getElementById('clear-deck'),
            calculateButton: document.getElementById('calculate'),
            playSelect: document.getElementById('playOrDraw'),
            deckDisplay: document.getElementById('deck-display'),
            results: document.getElementById('results')
        };
    }
    initializeEventListeners() {
        this.elements.typeSelect.addEventListener('change', () => 
            this.elements.tapCheck.parentElement.style.display = 
                this.elements.typeSelect.value === 'land' ? 'block' : 'none');

        this.elements.manaButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.id === 'any') {
                    this.elements.anyInputContainer.style.display = 'inline-block';
                    this.elements.anyCostInput.focus();
                } else {
                    this.addMana(button.id);
                }
            });
        });

        this.elements.anyConfirmButton.addEventListener('click', () => {
            const cost = parseInt(this.elements.anyCostInput.value) || 1;
            if (cost >= 1 && cost <= 15) {
                this.addMana('any', cost);
                this.elements.anyInputContainer.style.display = 'none';
                this.elements.anyCostInput.value = '';
            } else {
                alert('Please enter a number between 1 and 15');
            }
        });

        this.elements.addToDeckButton.addEventListener('click', () => this.addCardToDeck());
        this.elements.clearDeckButton.addEventListener('click', () => this.clearDeck());
        this.elements.calculateButton.addEventListener('click', () => this.calculateDeck());
    }

    addMana(color, cost = 1) {
        if (this.currentMana.length >= 10 || this.calculateManaValue() + cost > 15) return;
        this.currentMana.push({ color, cost });
        this.updateManaSlots();
    }

    calculateManaValue() {
        return this.currentMana.reduce((sum, mana) => sum + (mana.cost || 1), 0);
    }
    updateManaSlots() {
        this.elements.manaSlots.innerHTML = this.renderManaSymbols(this.currentMana, true);
    }

    addCardToDeck() {
        if (!this.currentMana.length) return;
        const card = {
            type: this.elements.typeSelect.value,
            mana: [...this.currentMana],
            cost: this.calculateManaValue(),
            key: this.currentMana.map(m => `${m.color}${m.cost || ''}`).join('-') + (this.elements.tapCheck.checked ? '-tapped' : '')
        };
        if (card.type === 'land' && this.elements.tapCheck.checked) card.tapped = true;


        const amount = parseInt(this.elements.amountToAdd.value) || 1;
        for (let i = 0; i < amount; i++) {
            (card.type === 'spell' ? this.deck.spells : this.deck.lands).push({ ...card });
            this.deck.totalCards++;
        }
        this.currentMana = [];
        this.elements.tapCheck.checked = false;
        this.elements.amountToAdd.value = '1';
        this.updateManaSlots();
        this.renderDeck();
    }
    clearDeck() {
        this.deck = { spells: [], lands: [], totalCards: 0 };
        this.renderDeck();
        this.elements.results.innerHTML = '';
    }

    calculateDeck() {
        const onTheOption = this.elements.playSelect.value === 'onThePlay' ? 0 : 1;
        calculateSpells(this.deck.spells, this.deck.lands, this.deck.totalCards, onTheOption);
        this.renderDeck();
    }

    groupCards(cards) {
        const map = new Map();
        cards.forEach(card => {
            const key = card.key;
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }

    renderManaSymbols(manaArray, includeRemoveButton = false) {
        return manaArray.map((mana, index) => {
            const symbol = mana.color === 'any' ? `A${mana.cost === 1 ? '' : mana.cost}` : manaMap[mana.color];
            return `
                <div class="mana-slot" style="background-image: url('images/${symbol}.png'); width: 20px; height: 20px; display: inline-block; margin: 0 2px;">
                    ${includeRemoveButton ? `<button class="remove-mana" onclick="deckManager.currentMana.splice(${index}, 1); deckManager.updateManaSlots();">X</button>` : ''}
                </div>`;
        }).join('');
    }

    renderDeck() {
        const spellMap = this.groupCards(this.sortSpellsByCost(this.deck.spells));
        const landMap = this.groupCards(this.deck.lands);
        this.elements.deckDisplay.innerHTML = `
            <h3>Spells (${this.deck.spells.length})</h3>
            ${Array.from(spellMap, ([key, count]) => {
                const manaSymbols = getManaSymbols(key);
                const playability = this.deck.spells.find(s => s.key === key)?.calculated;
                return `
                    <div style="display: flex; align-items: center;">
                        <span>${count}x</span>
                        ${this.renderManaSymbols(this.deck.spells.find(s => s.key === key).mana)}
                        ${playability !== undefined ? `<span style="margin-left: 10px;">${playability.toFixed(1)}%</span>` : ''}
                    </div>`;
            }).join('')}
            <h3>Lands (${this.deck.lands.length})</h3>
            ${Array.from(landMap, ([key, count]) => {
                const manaSymbols = getManaSymbols(key);
                return `
                    <div style="display: flex; align-items: center;">
                        <span>${count}x</span>
                        ${this.renderManaSymbols(this.deck.lands.find(l => l.key === key).mana)}
                        ${key.includes('-tapped') ? '<span>(Tapped)</span>' : ''}
                    </div>`;
            }).join('')}
        `;
    }

    sortSpellsByCost(spells) {
        return [...spells].sort((a, b) => a.cost - b.cost || a.key.localeCompare(b.key));
    }
}
function getManaSymbols(key) {
    let cleanKey = key;
    if (key.includes('-tapped')) {
        cleanKey = key.split('-tapped')[0];
    }
    const parts = cleanKey.split('-');
    const symbols = [];
    for (let part of parts) {
        if (manaMap[part]) {
            symbols.push(manaMap[part]);
        } else {
            const number = part.match(/\d+/) ? part.match(/\d+/)[0] : '';
            symbols.push('A' + number);
        }
    }
    return symbols;
}

let deckManager;
document.addEventListener('DOMContentLoaded', () => {
    deckManager = new MTGDeckManager();
});
