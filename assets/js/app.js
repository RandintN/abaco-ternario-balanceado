document.addEventListener('DOMContentLoaded', () => {
    const numRods = 7;
    const abacusRodsContainer = document.getElementById('abacus-rods-container');
    const totalValueDisplay = document.getElementById('total-value');
    const mathNotationDisplay = document.getElementById('math-notation');
    const rodValues = Array(numRods).fill(0);
    const tutorialToggleBtn = document.getElementById('tutorial-toggle');
    const tutorialContentDiv = document.getElementById('tutorial-content');
    const sumToggleBtn = document.getElementById('sum-toggle');
    const sumContentDiv = document.getElementById('sum-content');
    const subToggleBtn = document.getElementById('sub-toggle');
    const subContentDiv = document.getElementById('sub-content');
    const sorobanToggleBtn = document.getElementById('soroban-toggle');
    const sorobanContentDiv = document.getElementById('soroban-content');
    const clearButton = document.getElementById('clear-button');
    const translationBtn = document.getElementById('translation-button');
    const githubLink = document.querySelector('.github-link');

    // Hide top-corner icons when the page is scrolled down; show them only at the very top
    const updateTopIconsVisibility = () => {
        const atTop = (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0) <= 0;
        if (translationBtn) translationBtn.style.display = atTop ? '' : 'none';
        if (githubLink) githubLink.style.display = atTop ? '' : 'none';
    };
    // Initialize and bind scroll listener
    updateTopIconsVisibility();
    window.addEventListener('scroll', updateTopIconsVisibility, { passive: true });

    // Constants for bead colors (keep exact colors to preserve behavior)
    const COLOR_DEFAULT = '#48bb78';
    const COLOR_TOP_ACTIVE = 'rgb(0, 0, 255)';
    const COLOR_BOTTOM_ACTIVE = 'rgb(197, 48, 48)';
    const COLOR_BOTH_ACTIVE = 'white';

    // Precompute powers of 3 to avoid repeated Math.pow in updates
    const POW3 = Array.from({ length: numRods }, (_, i) => 3 ** i);

    // Helper to apply the visual/logic state of a rod after a click
    const applyRodState = (i, topBead, bottomBead) => {
        const isTopActive = topBead.classList.contains('active');
        const isBottomActive = bottomBead.classList.contains('active');

        if (isTopActive && isBottomActive) {
            topBead.style.borderTopColor = COLOR_BOTH_ACTIVE;
            bottomBead.style.borderBottomColor = COLOR_BOTH_ACTIVE;
            rodValues[i] = 0;
        } else if (isTopActive) {
            topBead.style.borderTopColor = COLOR_TOP_ACTIVE;
            bottomBead.style.borderBottomColor = COLOR_DEFAULT;
            rodValues[i] = 1;
        } else if (isBottomActive) {
            bottomBead.style.borderBottomColor = COLOR_BOTTOM_ACTIVE;
            topBead.style.borderTopColor = COLOR_DEFAULT;
            rodValues[i] = -1;
        } else {
            topBead.style.borderTopColor = COLOR_DEFAULT;
            bottomBead.style.borderBottomColor = COLOR_DEFAULT;
            rodValues[i] = 0;
        }
    };

    // Lazy-load MathJax and typeset only needed containers
    let mathJaxLoaded = false;
    const loadMathJax = () => {
        if (mathJaxLoaded || window.MathJax) return Promise.resolve();
        return new Promise((resolve, reject) => {
            window.MathJax = {
                startup: { typeset: false }
            };
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            s.async = true;
            s.onload = () => { mathJaxLoaded = true; resolve(); };
            s.onerror = reject;
            document.head.appendChild(s);
        });
    };
    const typesetElements = async (elements) => {
        await loadMathJax();
        const arr = Array.isArray(elements) ? elements : [elements];
        return window.MathJax.typesetPromise(arr);
    };

    // Utility to wire a simple show/hide toggle and typeset MathJax when shown
    const wireToggle = (btn, content) => {
        btn.addEventListener('click', async () => {
            content.classList.toggle('hidden');
            if (!content.classList.contains('hidden')) {
                await typesetElements(content);
            }
        }, { passive: true });
    };

    const translations = {
        'pt': {
            'main-title': 'Ábaco Ternário Balanceado',
            'description': 'Clique nas contas para somar (+1) ou subtrair (-1) e ver a representação matemática.',
            'total-title': 'Valor Total',
            'tutorial-toggle': '👉 Tutorial de como usar o ábaco',
            'sum-toggle': '➕ Como somar',
            'sub-toggle': '➖ Como subtrair',
            'tutorial-title': 'Tutorial do Ábaco de Lógica Ternária Balanceada',
            'tutorial-p1': 'Este guia rápido explica como usar o ábaco interativo de lógica ternária balanceada, que utiliza os valores <b>1</b> (positivo), <b>0</b> (neutro) e <b>-1</b> (negativo) para representar números.',
            'tutorial-p2': 'O ábaco é composto por várias hastes, onde cada uma representa uma potência de 3. As hastes são organizadas da direita para a esquerda, começando com \\(3^0\\).',
            'tutorial-li1': '<strong class="text-teal-300">Primeira haste (da direita):</strong> \\(3^0\\) (valor 1)',
            'tutorial-li2': '<strong class="text-teal-300">Segunda haste:</strong> \\(3^1\\) (valor 3)',
            'tutorial-li3': '<strong class="text-teal-300">Terceira haste:</strong> \\(3^2\\) (valor 9)',
            'tutorial-li4': 'e assim por diante...',
            'tutorial-h3-1': 'Representando Valores com as Contas',
            'tutorial-p3': 'Cada haste tem duas contas: uma na parte superior e outra na inferior. A barra horizontal central é a referência.',
            'tutorial-li5': 'Para representar o valor <b>1</b> (positivo): Clique na conta superior para que ela encoste na barra central.',
            'tutorial-li6': 'Para representar o valor <b>-1</b> (negativo): Clique na conta inferior para que ela encoste na barra central.',
            'tutorial-li7': 'Para representar o valor <b>0</b> (neutro): Deixe as contas distantes da barra central.',
            'tutorial-li8': 'Uma característica especial do seu ábaco é que você pode representar o <b>0</b> de duas maneiras:',
            'tutorial-li9': '<strong class="text-teal-300">Forma "vazia":</strong> Nenhuma conta toca a barra central.',
            'tutorial-li10': '<strong class="text-teal-300">Forma "balanceada":</strong> Ambas as contas (a superior e a inferior) tocam a barra, já que a soma de \\(1 + (-1)\\) resulta em \\(0\\).',
            'tutorial-h3-2': 'Lendo o Valor Total',
            'tutorial-p4': 'O valor total do ábaco é a soma dos valores de cada haste. A aplicação calcula e exibe automaticamente o valor na base 10 (decimal). A notação matemática, como \\(1 \\cdot 3^1 + (-1) \\cdot 3^0\\), também é mostrada para ajudar a visualizar o cálculo.',

            'footer-sum-title': 'Como somar no ábaco',
            'footer-sum-p1': 'Para somar dois números, você pode usar o ábaco como uma calculadora manual: primeiro represente o primeiro número; depois aplique o segundo número haste a haste.',
            'footer-sum-li1': '<strong class="text-teal-300">1) Configure o primeiro número:</strong> Clique nas contas para formar o valor desejado. O total em decimal aparece acima.',
            'footer-sum-li2': '<strong class="text-teal-300">2) Adicione o segundo número:</strong> Comece pela haste da direita (\\(3^0\\)). Para cada unidade a somar, ative a conta de cima (\\(+1\\)); para cada unidade a subtrair, ative a de baixo (\\(-1\\)).',
            'footer-sum-li3': '<strong class="text-teal-300">3) Ajuste os "vai-um" balanceados:</strong> Se uma haste ficar com duas contas ativas do mesmo lado (equivalente a \\(+2\\) ou \\(-2\\)), troque por um dígito balanceado e carregue para a próxima haste: \\(+2 = -1 + 1\\cdot 3\\) e \\(-2 = 1 - 1\\cdot 3\\).',
            'footer-sum-note': 'Dica: quando ambas as contas tocam a barra na mesma haste, o valor local é \\(0\\) — isso ajuda a enxergar combinações como \\(1 + (-1) = 0\\). Você pode conferir o resultado na leitura em decimal e na notação matemática.',

            'footer-sum-table-title': 'Tabela de combinações para somar',
            'footer-sum-col1': 'Alvo (+n)',
            'footer-sum-col2': 'Combinação em potências de 3',

            'footer-sub-title': 'Como subtrair no ábaco',
            'footer-sub-p1': 'Para subtrair \\(B\\) de \\(A\\), você pode pensar como soma com o oposto: some \\(-B\\). Outra forma é aplicar as unidades a subtrair haste a haste.',
            'footer-sub-li1': '<strong class="text-teal-300">1) Configure o minuendo \\(A\\):</strong> Represente \\(A\\) no ábaco. O total em decimal aparece acima.',
            'footer-sub-li2': '<strong class="text-teal-300">2) Subtraia o subtraendo \\(B\\):</strong> Comece pela haste da direita (\\(3^0\\)). Para cada unidade a subtrair, ative a conta de baixo (\\(-1\\)); para desfazer uma unidade, ative a de cima (\\(+1\\)).',
            'footer-sub-li3': '<strong class="text-teal-300">3) Ajuste os "empresta" balanceados:</strong> Se uma haste chegar a \\(-2\\) ou \\(+2\\), converta usando os dígitos balanceados e faça o empréstimo/transporte: \\(-2 = 1 - 1\\cdot 3\\) (empresta \\(1\\) para a próxima haste) e \\(+2 = -1 + 1\\cdot 3\\) (carrega \\(1\\) para a próxima haste).',
            'footer-sub-note': 'Dica: subtrair é o mesmo que somar o negativo. Para formar \\(-B\\), inverta os sinais dos dígitos de \\(B\\) (\\(1 \\leftrightarrow -1\\)) e então some.',

            'footer-sub-table-title': 'Tabela de combinações para subtrair',
            'footer-sub-col1': 'Alvo (-n)',
            'footer-sub-col2': 'Combinação em potências de 3',

            /* Soroban-inspired tips */
            'soroban-toggle': '💡 Dicas do Heisanban',
            'soroban-title': 'Dicas inspiradas no Soroban (ábaco japonês)',
            'soroban-p1': 'O Soroban traz práticas úteis de ergonomia e leitura que também servem para este ábaco ternário balanceado.',
            'soroban-li1': '<strong class="text-teal-300">Agrupamento visual:</strong> As hastes são separadas em grupos de 3 para facilitar a leitura de potências de 3.',
            'soroban-li2': '<strong class="text-teal-300">Céu e Terra:</strong> A área superior e a inferior têm um leve contraste, lembrando as regiões do Soroban e ajudando na referência visual.',
            'soroban-li3': '<strong class="text-teal-300">Botão de limpeza:</strong> Use o botão “Limpar” para zerar rapidamente o ábaco, como um movimento de varredura no Soroban.',
            'soroban-li4': '<strong class="text-teal-300">Leitura da direita para a esquerda:</strong> Comece sempre pela haste de \\(3^0\\) (direita) ao somar/subtrair, tal como se procede no Soroban.',
            'soroban-li5': '<strong class="text-teal-300">Fluxo de transporte/empresta:</strong> Ao atingir \\(+2\\) ou \\(-2\\) numa haste, converta para um dígito balanceado e transporte/empreste para a próxima haste.',
            'clear-button': 'Limpar'
        },
        'en': {
            'main-title': 'Balanced Ternary Abacus',
            'description': 'Click the beads to add (+1) or subtract (-1) and see the mathematical representation.',
            'total-title': 'Total Value',
            'tutorial-toggle': '👉 How to use the abacus tutorial',
            'sum-toggle': '➕ How to add',
            'sub-toggle': '➖ How to subtract',
            'tutorial-title': 'Balanced Ternary Abacus Tutorial',
            'tutorial-p1': 'This quick guide explains how to use the interactive balanced ternary abacus, which uses the values <b>1</b> (positive), <b>0</b> (neutral), and <b>-1</b> (negative) to represent numbers.',
            'tutorial-p2': 'The abacus consists of several rods, where each one represents a power of 3. The rods are organized from right to left, starting with \\(3^0\\).',
            'tutorial-li1': '<strong class="text-teal-300">First rod (on the right):</strong> \\(3^0\\) (value 1)',
            'tutorial-li2': '<strong class="text-teal-300">Second rod:</strong> \\(3^1\\) (value 3)',
            'tutorial-li3': '<strong class="text-teal-300">Third rod:</strong> \\(3^2\\) (value 9)',
            'tutorial-li4': 'and so on...',
            'tutorial-h3-1': 'Representing Values with the Beads',
            'tutorial-p3': 'Each rod has two beads: one on the top part and one on the bottom part. The central horizontal bar is the reference.',
            'tutorial-li5': 'To represent the value <b>1</b> (positive): Click the top bead so that it touches the central bar.',
            'tutorial-li6': 'To represent the value <b>-1</b> (negative): Click the bottom bead so that it touches the central bar.',
            'tutorial-li7': 'To represent the value <b>0</b> (neutral): Leave the beads away from the central bar.',
            'tutorial-li8': 'A special feature of your abacus is that you can represent <b>0</b> in two ways:',
            'tutorial-li9': '<strong class="text-teal-300">"Empty" form:</strong> No beads touch the central bar.',
            'tutorial-li10': '<strong class="text-teal-300">"Balanced" form:</strong> Both beads (the top and bottom) touch the bar, since the sum of \\(1 + (-1)\\) results in \\(0\\).',
            'tutorial-h3-2': 'Reading the Total Value',
            'tutorial-p4': 'The total value of the abacus is the sum of the values of each rod. The application automatically calculates and displays the value in base 10 (decimal). The mathematical notation, such as \\(1 \\cdot 3^1 + (-1) \\cdot 3^0\\), also is shown to help visualize the calculation.',

            'footer-sum-title': 'How to add using the abacus',
            'footer-sum-p1': 'To add two numbers, use the abacus like a manual calculator: first represent the first number; then apply the second number rod by rod.',
            'footer-sum-li1': '<strong class="text-teal-300">1) Set the first number:</strong> Click the beads to form the desired value. The decimal total is shown above.',
            'footer-sum-li2': '<strong class="text-teal-300">2) Add the second number:</strong> Start on the rightmost rod (\\(3^0\\)). For each unit to add, activate the top bead (\\(+1\\)); for each unit to subtract, activate the bottom bead (\\(-1\\)).',
            'footer-sum-li3': '<strong class="text-teal-300">3) Handle balanced carries:</strong> If a rod ends up with two active beads on the same side (equivalent to \\(+2\\) or \\(-2\\)), convert to a balanced digit and carry to the next rod: \\(+2 = -1 + 1\\cdot 3\\) and \\(-2 = 1 - 1\\cdot 3\\).',
            'footer-sum-note': 'Tip: when both beads touch the bar on the same rod, the local value is \\(0\\) — this helps to see combinations like \\(1 + (-1) = 0\\). You can verify the result in the decimal reading and in the mathematical notation.',

            'footer-sum-table-title': 'Addition combinations table',
            'footer-sum-col1': 'Target (+n)',
            'footer-sum-col2': 'Combination in powers of 3',

            'footer-sub-title': 'How to subtract using the abacus',
            'footer-sub-p1': 'To subtract \\(B\\) from \\(A\\), think of it as addition with the opposite: add \\(-B\\). You can also apply the units to subtract rod by rod.',
            'footer-sub-li1': '<strong class="text-teal-300">1) Set the minuend \\(A\\):</strong> Represent \\(A\\) on the abacus. The decimal total is shown above.',
            'footer-sub-li2': '<strong class="text-teal-300">2) Subtract the subtrahend \\(B\\):</strong> Start on the rightmost rod (\\(3^0\\)). For each unit to subtract, activate the bottom bead (\\(-1\\)); to undo one unit, activate the top bead (\\(+1\\)).',
            'footer-sub-li3': '<strong class="text-teal-300">3) Handle balanced borrows:</strong> If a rod reaches \\(-2\\) or \\(+2\\), convert using balanced digits and perform the borrow/carry: \\(-2 = 1 - 1\\cdot 3\\) (borrow \\(1\\) from the next rod) and \\(+2 = -1 + 1\\cdot 3\\) (carry \\(1\\) to the next rod).',
            'footer-sub-note': 'Tip: subtraction is the same as adding the negative. To form \\(-B\\), flip the signs of the digits of \\(B\\) (\\(1 \\leftrightarrow -1\\)) and then add.',

            'footer-sub-table-title': 'Subtraction combinations table',
            'footer-sub-col1': 'Target (-n)',
            'footer-sub-col2': 'Combination in powers of 3',

            /* Soroban-inspired tips */
            'soroban-toggle': '💡 Heisanban tips',
            'soroban-title': 'Tips inspired by the Soroban (Japanese abacus)',
            'soroban-p1': 'Soroban offers ergonomic and reading practices that are also useful for this balanced ternary abacus.',
            'soroban-li1': '<strong class="text-teal-300">Visual grouping:</strong> Rods are separated into groups of 3 to ease reading of powers of 3.',
            'soroban-li2': '<strong class="text-teal-300">Heaven and Earth:</strong> The top and bottom areas have a subtle contrast, recalling Soroban regions and helping visual reference.',
            'soroban-li3': '<strong class="text-teal-300">Clear button:</strong> Use the “Clear” button to quickly reset the abacus, similar to a sweeping motion on the Soroban.',
            'soroban-li4': '<strong class="text-teal-300">Read right-to-left:</strong> Always start with the \\(3^0\\) rod (right) when adding/subtracting, as done on the Soroban.',
            'soroban-li5': '<strong class="text-teal-300">Carry/borrow flow:</strong> When a rod reaches \\(+2\\) or \\(-2\\), convert to a balanced digit and carry/borrow to the next rod.',
            'clear-button': 'Clear'
        }
    };

    let currentLang = 'pt';

    const updateLanguage = async () => {
        const lang = translations[currentLang];
        document.title = lang['main-title'];
        document.getElementById('main-title').textContent = lang['main-title'];
        document.getElementById('description').textContent = lang['description'];
        document.getElementById('total-title').textContent = lang['total-title'];
        document.getElementById('tutorial-toggle').textContent = lang['tutorial-toggle'];
        document.getElementById('sum-toggle').textContent = lang['sum-toggle'];
        document.getElementById('sub-toggle').textContent = lang['sub-toggle'];
        document.getElementById('soroban-toggle').textContent = lang['soroban-toggle'];
        document.getElementById('tutorial-title').textContent = lang['tutorial-title'];
        document.getElementById('tutorial-p1').innerHTML = lang['tutorial-p1'];
        document.getElementById('tutorial-p2').innerHTML = lang['tutorial-p2'];
        document.getElementById('tutorial-li1').innerHTML = lang['tutorial-li1'];
        document.getElementById('tutorial-li2').innerHTML = lang['tutorial-li2'];
        document.getElementById('tutorial-li3').innerHTML = lang['tutorial-li3'];
        document.getElementById('tutorial-li4').textContent = lang['tutorial-li4'];
        document.getElementById('tutorial-h3-1').textContent = lang['tutorial-h3-1'];
        document.getElementById('tutorial-p3').innerHTML = lang['tutorial-p3'];
        document.getElementById('tutorial-li5').innerHTML = lang['tutorial-li5'];
        document.getElementById('tutorial-li6').innerHTML = lang['tutorial-li6'];
        document.getElementById('tutorial-li7').innerHTML = lang['tutorial-li7'];
        document.getElementById('tutorial-li8').innerHTML = lang['tutorial-li8'];
        document.getElementById('tutorial-li9').innerHTML = lang['tutorial-li9'];
        document.getElementById('tutorial-li10').innerHTML = lang['tutorial-li10'];
        document.getElementById('tutorial-h3-2').textContent = lang['tutorial-h3-2'];
        document.getElementById('tutorial-p4').innerHTML = lang['tutorial-p4'];

        // Footer: How to add section
        document.getElementById('footer-sum-title').textContent = lang['footer-sum-title'];
        document.getElementById('footer-sum-p1').innerHTML = lang['footer-sum-p1'];
        document.getElementById('footer-sum-li1').innerHTML = lang['footer-sum-li1'];
        document.getElementById('footer-sum-li2').innerHTML = lang['footer-sum-li2'];
        document.getElementById('footer-sum-li3').innerHTML = lang['footer-sum-li3'];
        document.getElementById('footer-sum-note').innerHTML = lang['footer-sum-note'];

        // Sum combinations table headers
        document.getElementById('footer-sum-table-title').textContent = lang['footer-sum-table-title'];
        document.getElementById('footer-sum-col1').textContent = lang['footer-sum-col1'];
        document.getElementById('footer-sum-col2').textContent = lang['footer-sum-col2'];

        // Footer: How to subtract section
        document.getElementById('footer-sub-title').textContent = lang['footer-sub-title'];
        document.getElementById('footer-sub-p1').innerHTML = lang['footer-sub-p1'];
        document.getElementById('footer-sub-li1').innerHTML = lang['footer-sub-li1'];
        document.getElementById('footer-sub-li2').innerHTML = lang['footer-sub-li2'];
        document.getElementById('footer-sub-li3').innerHTML = lang['footer-sub-li3'];
        document.getElementById('footer-sub-note').innerHTML = lang['footer-sub-note'];
        // Subtraction combinations table headers
        document.getElementById('footer-sub-table-title').textContent = lang['footer-sub-table-title'];
        document.getElementById('footer-sub-col1').textContent = lang['footer-sub-col1'];
        document.getElementById('footer-sub-col2').textContent = lang['footer-sub-col2'];

        // Soroban tips section
        document.getElementById('soroban-title').textContent = lang['soroban-title'];
        document.getElementById('soroban-p1').innerHTML = lang['soroban-p1'];
        document.getElementById('soroban-li1').innerHTML = lang['soroban-li1'];
        document.getElementById('soroban-li2').innerHTML = lang['soroban-li2'];
        document.getElementById('soroban-li3').innerHTML = lang['soroban-li3'];
        document.getElementById('soroban-li4').innerHTML = lang['soroban-li4'];
        document.getElementById('soroban-li5').innerHTML = lang['soroban-li5'];

        // Clear button label
        document.getElementById('clear-button').textContent = lang['clear-button'];

        // Typeset only visible sections and the math notation line if present
        const toTypeset = [];
        const tutorialVisible = !document.getElementById('tutorial-content').classList.contains('hidden');
        const sumVisible = !document.getElementById('sum-content').classList.contains('hidden');
        const subVisible = !document.getElementById('sub-content').classList.contains('hidden');
        const sorobanVisible = !document.getElementById('soroban-content').classList.contains('hidden');
        if (tutorialVisible) toTypeset.push(document.getElementById('tutorial-content'));
        if (sumVisible) toTypeset.push(document.getElementById('sum-content'));
        if (subVisible) toTypeset.push(document.getElementById('sub-content'));
        if (sorobanVisible) toTypeset.push(document.getElementById('soroban-content'));
        const notationText = document.getElementById('math-notation').textContent || '';
        if (notationText.includes('\\(')) toTypeset.push(document.getElementById('math-notation'));
        if (toTypeset.length) await typesetElements(toTypeset);
    };

    translationBtn.addEventListener('click', () => {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        translationBtn.textContent = currentLang.toUpperCase();
        updateLanguage();
    });

    // Wire foldable sections with a small helper (behavior unchanged)
    wireToggle(tutorialToggleBtn, tutorialContentDiv);
    wireToggle(sumToggleBtn, sumContentDiv);
    wireToggle(subToggleBtn, subContentDiv);
    wireToggle(sorobanToggleBtn, sorobanContentDiv);

    clearButton.addEventListener('click', () => {
        rodValues.fill(0);
        createAbacus();
    });

    let didTypesetRods = false;
    const updateDisplay = async () => {
        let total = 0;
        const terms = [];
        for (let i = 0; i < numRods; i++) {
            const value = rodValues[i];
            total += value * POW3[i];
            if (value !== 0) {
                terms.unshift(`${value} \\cdot 3^{${i}}`);
            }
        }

        totalValueDisplay.textContent = total;
        mathNotationDisplay.textContent = terms.length
            ? `\\( ${terms.join(' + ')} \\)`
            : '';

        if (terms.length) {
            await typesetElements(mathNotationDisplay);
            if (!didTypesetRods) {
                await typesetElements(abacusRodsContainer);
                didTypesetRods = true;
            }
        }
    };

    const createAbacus = () => {
        abacusRodsContainer.innerHTML = '';
        for (let i = 0; i < numRods; i++) {
            const rod = document.createElement('div');
            rod.classList.add('rod');
            rod.setAttribute('data-index', i);

            const rodLine = document.createElement('div');
            rodLine.classList.add('rod-line');
            rod.appendChild(rodLine);

            const topBead = document.createElement('div');
            topBead.classList.add('bead', 'top');
            topBead.style.borderTopColor = COLOR_DEFAULT;
            topBead.addEventListener('click', () => {
                topBead.classList.toggle('active');
                applyRodState(i, topBead, bottomBead);
                updateDisplay();
            });

            const bottomBead = document.createElement('div');
            bottomBead.classList.add('bead', 'bottom');
            bottomBead.style.borderBottomColor = COLOR_DEFAULT;
            bottomBead.addEventListener('click', () => {
                bottomBead.classList.toggle('active');
                applyRodState(i, topBead, bottomBead);
                updateDisplay();
            });

            const topLabel = document.createElement('div');
            topLabel.classList.add('power-label-top');
            topLabel.textContent = String(Math.pow(3, i));

            const powerLabel = document.createElement('div');
            powerLabel.classList.add('power-label');
            powerLabel.textContent = `\\(3^{${i}}\\)`;

            rod.appendChild(topBead);
            rod.appendChild(bottomBead);
            rod.appendChild(topLabel);
            rod.appendChild(powerLabel);
            abacusRodsContainer.prepend(rod);
        }
        updateDisplay();
        // Ensure LaTeX power labels under each rod are typeset even when notation line is empty
        typesetElements(abacusRodsContainer).then(() => { didTypesetRods = true; });
    };

    createAbacus();
});

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js')
      .catch(function (err) { console.warn('SW registration failed', err); });
  });
}