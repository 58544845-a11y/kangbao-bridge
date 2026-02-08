/**
 * 测试交互模块
 * 管理整个测试流程
 */

class BridgeQuiz {
    constructor() {
        this.currentLevel = null;
        this.questionCount = 10;
        this.currentQuestion = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.hands = [];
        this.currentHand = null;
        this.evaluation = null;
        this.bidding = new BiddingRules();
    }

    /**
     * 生成一个随机的桥牌手牌
     */
    generateHand() {
        const cards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        
        // 初始化花色
        const hand = {
            spades: [],
            hearts: [],
            diamonds: [],
            clubs: []
        };

        // 创建一副完整的牌
        const deck = [];
        suits.forEach(suit => {
            cards.forEach(card => {
                deck.push({ card, suit });
            });
        });

        // 随机排序（Fisher-Yates洗牌算法）
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // 取前13张牌
        for (let i = 0; i < 13; i++) {
            const card = deck[i];
            hand[card.suit].push(card.card);
        }

        // 对每个花色进行排序（从大到小）
        const cardOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
        suits.forEach(suit => {
            hand[suit].sort((a, b) => cardOrder[b] - cardOrder[a]);
        });

        return hand;
    }

    /**
     * 生成指定难度的问题集
     */
    generateQuestions(level) {
        this.currentLevel = level;
        this.hands = [];
        this.currentQuestion = 0;
        this.correctCount = 0;
        this.wrongCount = 0;

        for (let i = 0; i < this.questionCount; i++) {
            const hand = this.generateHand();
            this.hands.push(hand);
        }
    }

    /**
     * 显示当前问题
     */
    showCurrentQuestion() {
        if (this.currentQuestion >= this.questionCount) {
            this.showResults();
            return;
        }

        const hand = this.hands[this.currentQuestion];
        this.currentHand = hand;
        this.evaluation = new HandEvaluation(hand);

        // 清空反馈
        document.getElementById('biddingFeedback').innerHTML = '';
        document.getElementById('biddingFeedback').classList.remove('show');
        document.getElementById('biddingInput').value = '';
        document.getElementById('biddingInput').focus();

        // 显示手牌
        this.displayHand(hand);

        // 显示评估
        this.displayEvaluation(this.evaluation);

        // 更新进度条
        this.updateProgress();
    }

    /**
     * 显示手牌
     */
    displayHand(hand) {
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        const suitSymbols = {
            'spades': '♠',
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣'
        };

        suits.forEach(suit => {
            const container = document.getElementById(suit + 'Cards');
            container.innerHTML = '';

            hand[suit].forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'card';
                cardEl.textContent = card + suitSymbols[suit];
                container.appendChild(cardEl);
            });
        });
    }

    /**
     * 显示手牌评估
     */
    displayEvaluation(evaluation) {
        const eval_data = evaluation.getFullEvaluation();

        document.getElementById('hcpValue').textContent = eval_data.hcp;
        document.getElementById('dpValue').textContent = eval_data.distributionPoints;
        document.getElementById('totalValue').textContent = eval_data.totalPoints;

        const longestSuit = eval_data.longestSuit;
        const suitSymbols = { 'spades': '♠', 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣' };
        const longestSuitDisplay = longestSuit.map(s => suitSymbols[s]).join(' ');
        document.getElementById('longestSuit').textContent = `${longestSuitDisplay} (${eval_data.longestSuit.length}张)`;

        document.getElementById('handDescription').textContent = evaluation.getHandDescription();
    }

    /**
     * 提交开叫答案
     */
    submitAnswer() {
        const biddingInput = document.getElementById('biddingInput');
        const bid = biddingInput.value.trim();

        if (!bid) {
            alert('请输入开叫');
            return;
        }

        // 检查开叫
        const result = this.bidding.checkBid(bid, this.evaluation, this.currentLevel);

        // 显示反馈
        this.displayFeedback(result);

        // 更新成绩
        if (result.isCorrect) {
            this.correctCount++;
        } else {
            this.wrongCount++;
        }

        // 更新成绩显示
        this.updateStats();

        // 禁用输入和提交按钮
        biddingInput.disabled = true;
        event.target.disabled = true;

        // 2秒后进入下一题
        setTimeout(() => {
            this.currentQuestion++;
            biddingInput.disabled = false;
            event.target.disabled = false;
            this.showCurrentQuestion();
        }, 2000);
    }

    /**
     * 显示反馈
     */
    displayFeedback(result) {
        const feedbackEl = document.getElementById('biddingFeedback');
        feedbackEl.classList.remove('feedback-correct', 'feedback-wrong');
        feedbackEl.classList.add(result.isCorrect ? 'feedback-correct' : 'feedback-wrong');
        feedbackEl.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-title">${result.feedback}</div>
                <div class="feedback-explanation">${result.explanation}</div>
            </div>
        `;
        feedbackEl.classList.add('show');
    }

    /**
     * 更新成绩显示
     */
    updateStats() {
        const total = this.correctCount + this.wrongCount;
        const rate = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

        document.getElementById('correctCount').textContent = this.correctCount;
        document.getElementById('wrongCount').textContent = this.wrongCount;
        document.getElementById('correctRate').textContent = rate + '%';
    }

    /**
     * 更新进度条
     */
    updateProgress() {
        const progress = (this.currentQuestion / this.questionCount) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `已完成 ${this.currentQuestion} / ${this.questionCount}`;
    }

    /**
     * 显示最终成绩
     */
    showResults() {
        const quizPanel = document.getElementById('quizPanel');
        const completePanel = document.getElementById('completePanel');

        quizPanel.style.display = 'none';
        completePanel.style.display = 'block';

        const rate = Math.round((this.correctCount / this.questionCount) * 100);
        document.getElementById('scorePercentage').textContent = rate + '%';
        document.getElementById('finalCorrect').textContent = this.correctCount;
        document.getElementById('finalWrong').textContent = this.wrongCount;

        // 改变圆形背景颜色
        const scoreCircle = document.getElementById('scoreCircle');
        if (rate >= 80) {
            scoreCircle.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        } else if (rate >= 60) {
            scoreCircle.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else {
            scoreCircle.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        }
    }
}

// 全局测试实例
let quiz = new BridgeQuiz();

/**
 * 启动测试
 */
function startQuiz(level) {
    quiz = new BridgeQuiz();
    quiz.generateQuestions(level);

    // 隐藏难度选择，显示测试面板
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('quizPanel').style.display = 'block';
    document.getElementById('completePanel').style.display = 'none';

    // 更新难度标签
    const levelText = level === 'beginner' ? '初级' : '中级';
    document.getElementById('levelBadge').textContent = `${levelText}难度`;

    // 显示第一题
    quiz.showCurrentQuestion();
}

/**
 * 提交答案
 */
function submitBidding() {
    quiz.submitAnswer();
}

/**
 * 重新开始
 */
function resetQuiz() {
    quiz = new BridgeQuiz();

    document.getElementById('levelSelector').style.display = 'block';
    document.getElementById('quizPanel').style.display = 'none';
    document.getElementById('completePanel').style.display = 'none';

    document.getElementById('correctCount').textContent = '0';
    document.getElementById('wrongCount').textContent = '0';
    document.getElementById('correctRate').textContent = '0%';
    document.getElementById('biddingInput').value = '';
    document.getElementById('biddingFeedback').innerHTML = '';
    document.getElementById('biddingFeedback').classList.remove('show');
}