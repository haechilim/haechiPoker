var cards = [];

// 카드 모양
module.exports.shapes = {
    SPADE: 0,
    DIAMOND: 1,
    HEART: 2,
    CLUB: 3
};

module.exports.init = function() {
    cards = [];

    for(var key in this.shapes) {
        for(var number = 2; number <= 14; number++) {
            cards.push({
                number: number,
                shape: this.shapes[key]
            });
        }
    }
};

module.exports.select = function() {
    var index = Math.floor(Math.random() * cards.length);
    var card = cards[index];
    cards.splice(index, 1);
    return card;
};