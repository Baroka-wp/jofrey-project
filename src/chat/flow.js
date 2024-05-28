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
        next: { 'Oui': 'newSearch', 'Non': 'end' }
    },
    newSearch: {
        id: 'newSearch',
        message: 'Quel critere special voulez vous ajouter à la recherche ?',
        options: null,
        next: 'end'
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

function handleUserResponse(response) {
    if (currentNode.options) {
        if (!currentNode.options.includes(response)) {
            appendMessage('system', 'Désolé, je n\'ai pas compris votre choix. Veuillez réessayer.');
            return;
        }
        if (typeof currentNode.next === 'object') {
            currentNode = chatFlowGraph[currentNode.next[response]];
        } else {
            currentNode = chatFlowGraph[currentNode.next];
        }
    } else {
        currentNode = chatFlowGraph[currentNode.next];
    }

    if (currentNode) {
        appendMessage('system', currentNode.message);
        if (currentNode.options) {
            displayOptions(currentNode.options);
        }
        saveCurrentNode();
    }
    
    if (currentNode.id === 'end') {
        window.location.href = 'http://127.0.0.1:5500/jofrey/src/property-list/property-list.html';
    }
}


function handleChatFlow(sender, message) {
    appendMessage(sender, message);
    if (sender === 'client') {
        if (currentNode.id === 'end') {
            saveCurrentNode();
            return;
        }
        handleUserResponse(message);
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
    if (currentNode.id !== 'end' && currentNode.id !== chatFlowGraph.start.id) {
        appendMessage('system', currentNode.message);
        if (currentNode.options) {
            displayOptions(currentNode.options);
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


