class HandEvaluation {
    constructor(hand) {
        this.hand = hand;
    }

    // Calculate HCP (High Card Points)
    calculateHCP() {
        let hcp = 0;
        const hcpValues = {A: 4, K: 3, Q: 2, J: 1};
        for (let card of this.hand) {
            hcp += hcpValues[card.rank] || 0;
        }
        return hcp;
    }

    // Distribution points calculation
    calculateDistributionPoints() {
        const suits = {S: 0, H: 0, D: 0, C: 0};
        this.hand.forEach(card => {
            suits[card.suit] += 1;
        });
        let points = 0;
        for (let suit in suits) {
            if (suits[suit] === 5) points += 1;
            if (suits[suit] === 6) points += 2;
            if (suits[suit] === 7) points += 3;
        }
        return points;
    }

    // Checks for balanced hand
    isBalanced() {
        const suitsCount = this.hand.reduce((acc, card) => {
            acc[card.suit] = (acc[card.suit] || 0) + 1;
            return acc;
        }, {});
        const counts = Object.values(suitsCount);
        return counts.includes(4) || (counts.includes(3) && counts.includes(2));
    }

    // Honors checks
    checkHonors() {
        const honors = ['A', 'K', 'Q', 'J'];
        let honorsCount = 0;
        this.hand.forEach(card => {
            if (honors.includes(card.rank)) honorsCount++;
        });
        return honorsCount;
    }

    // Helper methods
    getHand() {
        return this.hand;
    }
}

module.exports = HandEvaluation;