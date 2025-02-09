const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Remplacez par votre clé API Gemini
const apiKey = 'AIzaSyAL4GPw5_5mgrkqNXL_aXDioFkTX8qto08';
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;

let referenceCounter = 1; // Compteur pour les références

// Envoi du message via le bouton ou la touche Entrée
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Empêcher le saut de ligne
        sendMessage();
    }
});

// Gérer l'agrandissement de la zone d'input
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
});

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage('user', userMessage);
        userInput.value = '';
        userInput.style.height = 'auto'; // Réinitialiser la hauteur de l'input

        // Simuler une réponse en cours de frappe
        const typingIndicator = addTypingIndicator();
        const aiMessage = await getAIResponse(userMessage);
        removeTypingIndicator(typingIndicator);
        addMessage('ai', aiMessage);
    }
}

async function getAIResponse(userMessage) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: userMessage}]
                }]
            }),
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Erreur lors de la récupération de la réponse de Gemini:', error);
        return "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }
}

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);


    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = formatMarkdown(message);
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function formatMarkdown(message) {
    // Titres
    message = message.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    message = message.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    message = message.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Texte en gras et souligné
    message = message.replace(/(\*\*|__)(.*?)\1/g, '<strong><u>$2</u></strong>');

    // Italique
    message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
    message = message.replace(/_(.*?)_/g, '<em>$1</em>');

    // Barré
    message = message.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Listes non ordonnées
    message = message.replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>');
    message = message.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>');

    // Blocs de code avec couleurs ANSI
    message = message.replace(/```([\s\S]*?)```/g, (match, p1) => {
        return `<pre><code>${ansiToHtml(p1)}</code></pre>`;
    });

    // Code inline
    message = message.replace(/`(.*?)`/g, '<code>$1</code>');

    // Liens
    message = message.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="reference">$1</a>');

    // Images
    message = message.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

    // Citations
    message = message.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Lignes horizontales
    message = message.replace(/^---$/gm, '<hr>');
    message = message.replace(/^\*\*\*$/gm, '<hr>');
    message = message.replace(/^___$/gm, '<hr>');

    // Références avec indices
    message = message.replace(/\[ref(\d+)\]/g, (match, p1) => {
        return `<sup><a href="#ref${p1}" class="reference-index">[${p1}]</a></sup>`;
    });

    return message;
}

// Fonction pour convertir les codes ANSI en HTML
function ansiToHtml(text) {
    const ansiColors = {
        '30': 'ansi-black',
        '31': 'ansi-red',
        '32': 'ansi-green',
        '33': 'ansi-yellow',
        '34': 'ansi-blue',
        '35': 'ansi-magenta',
        '36': 'ansi-cyan',
        '37': 'ansi-white',
        '90': 'ansi-bright-black',
        '91': 'ansi-bright-red',
        '92': 'ansi-bright-green',
        '93': 'ansi-bright-yellow',
        '94': 'ansi-bright-blue',
        '95': 'ansi-bright-magenta',
        '96': 'ansi-bright-cyan',
        '97': 'ansi-bright-white',
    };

    return text.replace(/\x1b\[([\d;]+)m/g, (match, p1) => {
        const codes = p1.split(';');
        let html = '';
        codes.forEach(code => {
            if (ansiColors[code]) {
                html += `<span class="${ansiColors[code]}">`;
            }
        });
        return html;
    }).replace(/\x1b\[0m/g, '</span>');
}

function addTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'ai');
    typingIndicator.innerHTML = `
        <div class="avatar">AI</div>
        <div class="message-content typing-animation">...</div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingIndicator;
}

function removeTypingIndicator(typingIndicator) {
    typingIndicator.remove();
}
