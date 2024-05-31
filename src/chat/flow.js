
const chatFlowGraph = {
    start: {
        id: 'start',
        message: `Hi! Je vais vous aider à explorer efficacement nos résidences. Donnez-moi quelques informations sur ce que vous cherchez précisément. Quel est le type de bien que vous recherchez ?`,
        options: ['Résidence privée', 'Appartement', 'Villa', 'Airbnb'],
        next: 'city'
    },
    city: {
        id: 'city',
        message: 'Dans quelle ville ?',
        options: null,
        next: 'budget'
    },
    budget: {
        id: 'budget',
        message: 'Dans quelle tranche de budget voulez-vous que je limite mes recherches ?',
        options: null,
        next: 'addParameter'
    },
    addParameter: {
        id: 'addParameter',
        message: 'Voulez-vous ajouter un paramètre à votre recherche ?',
        options: ['Oui', 'Non'],
        next: { 'Oui': 'newSearch', 'Non': 'filter_by_ai' }
    },
    newSearch: {
        id: 'newSearch',
        message: 'Quels criteres special voulez vous ajouter à la recherche ?',
        options: null,
        next: 'filter_by_ai'
    },
    appointment: {
        id: 'appointment',
        message: 'Vous preferez un appel en visio ou par telephone ? ',
        options: ['Visio', 'Telephone'],
        next: { 'Visio': 'end', 'Telephone': 'phoneDetails' }
    },
    phoneDetails: {
        id: 'phoneDetails',
        message: 'Veuillez fournir votre numero de telephone',
        options: null,
        next: 'end'
    },
    mailDetails: {
        id: 'mailDetails',
        message: 'Veuillez fournir votre email',
        options: null,
        next: 'dateDetails'
    },
    dateDetails: {
        id: 'dateDetails',
        message: 'Quel plage horaire vous convient pour un appel?',
        options: null,
        next: 'appointment'
    },
    questions: {
        id: 'questions',
        message: 'Veuillez poser vos questions.',
        options: null,
        next: 'end'
    },
    filter_by_ai: {
        id: 'filter_by_ai',
        message: 'Merci pour vos réponses.',
        options: ['lancer la recherche'],
        next: "ai_response"
    },
    ai_response: {
        id: 'ai_response',
        message: 'Voici les résultats de votre recherche.',
        options: null,
        next: 'end'
    }, 
    end: {
        id: 'end',
        message: 'Merci pour vos réponses.',
        options: null,
        next: null
    },
    propertydetail: {
        id: 'propertydetail',
        message: 'C\'est un excellent choix. Voulez-vous en savoir plus sur ',
        options: ['Oui', 'Programmer une visite'],
        next: { 'Oui': 'questions', 'Programmer une visite': 'mailDetails' }
    }
};

let currentNode = chatFlowGraph.start;

async function handleUserResponse(response) {
    if (currentNode) {
        if (currentNode.options && !currentNode.options.includes(response)) {
            appendMessage('system', 'Désolé, je n\'ai pas compris votre choix. Veuillez réessayer.');
            return;
        } else {
            currentNode = chatFlowGraph[currentNode.next[response]] || chatFlowGraph[currentNode.next];
        }
    }

    if (currentNode) {
        appendMessage('system', currentNode.message);
        if (currentNode.options) {
            displayOptions(currentNode.options);
        }
        saveCurrentNode();
    }

    if (currentNode && currentNode.id === 'filter_by_ai') {
        const savedChatHistory = localStorage.getItem('chat_history');
        try {
            const res = await fetch('http://localhost:3000/api/parse-to-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: savedChatHistory })
            });

            const data = await res.json();
            if (data && data.message) {
                const { city, type, priceMax, priceMin, rooms, area } = data.message;
                const criteria = { city, type, priceMax, priceMin, rooms, area };
                localStorage.setItem('searchCriteria', JSON.stringify(criteria));
                console.log('Search criteria saved:', criteria); // Debugging log


                // if (currentNode && currentNode.id === 'end') {
                window.location.href = 'http://127.0.0.1:5500/src/property-list/property-list.html';
                // }

            } else {
                console.error('Invalid response format:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }

        currentNode = chatFlowGraph['end'];
        appendMessage('system', currentNode.message);
        saveCurrentNode();
    }
}

async function handleChatFlow(sender, message) {
    appendMessage(sender, message);
    if (sender === 'client') {
        handleUserResponse(message);

        if (currentNode.id === 'end') {
            const loader = createLoader();
            document.getElementById('chat-content').appendChild(loader);
            document.getElementById('chat-content').scrollTop = document.getElementById('chat-content').scrollHeight;

            try {
                const res = await fetch('http://localhost:3000/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });

                const data = await res.json();
                loader.remove();
                appendMessage('system', data.message);

            } catch (error) {
                console.error('Error:', error);
                loader.remove();
            }
        } else {
            saveCurrentNode();
        }
    } else if (currentNode && currentNode.options) {
        displayOptions(currentNode.options);
    }
}

function displayOptions(options) {
    const chatContent = document.querySelector('.chat-content');
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => {
            optionsDiv.remove();
            handleChatFlow('client', option);
        });
        optionsDiv.appendChild(button);
    });
    chatContent.appendChild(optionsDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function startChatFlow() {
    loadCurrentNode();
    if (currentNode.id === chatFlowGraph.start.id) {
        while (currentNode.id !== 'filter_by_ai' && currentNode.next) {
            appendMessage('system', currentNode.message);
            if (currentNode.options) {
                displayOptions(currentNode.options);
                break;
            } else {
                currentNode = chatFlowGraph[currentNode.next];
            }
        }

        if (currentNode.id === 'filter_by_ai') {
            handleUserResponse('lancer la recherche'); // Automatically move to next step
        }
    }
    saveCurrentNode();
}

function saveCurrentNode() {
    localStorage.setItem('currentNode', currentNode.id);
}

function loadCurrentNode() {
    const savedNodeId = localStorage.getItem('currentNode');
    if (savedNodeId && chatFlowGraph[savedNodeId]) {
        currentNode = chatFlowGraph[savedNodeId];
    } else {
        currentNode = chatFlowGraph.start;
    }
}

function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';

    const colors = ['#ff8c00', '#ffd700', '#ffff00'];
    
    colors.forEach((color, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.backgroundColor = color;
        bar.style.animationDelay = `${-0.2 * (colors.length - index)}s`;
        loader.appendChild(bar);
    });

    return loader;
}
