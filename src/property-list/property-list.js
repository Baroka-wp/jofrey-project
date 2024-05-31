
// const localhost_api = "http://localhost:3000" ;
// const localhost_app = "http://127.0.0.1:5500" ;

const localhost_api = "https://api.africasamurai.com" ;
const localhost_app = "https://jofrey.africasamurai.com" ;


let properties = [];
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Before loading properties, searchCriteria:', localStorage.getItem('searchCriteria'));

    properties = await fetchProperties();

    // Debugging log to verify `searchCriteria`
    const criteria = JSON.parse(localStorage.getItem('searchCriteria')) || {};
    console.log('Loaded search criteria:', criteria);

    if (criteria) {
        document.getElementById('location-input').value = criteria.city || 'paris';
        document.getElementById('type-input').value = criteria.type || '';
        document.getElementById('min-price').value = criteria.priceMin || '';
        document.getElementById('max-price').value = criteria.priceMax || '';
        document.getElementById('rooms-input').value = criteria.rooms || '';
        document.getElementById('area-input').value = criteria.area || '';

        handleSearch();
    }
});

async function fetchProperties() {
    try {
        const response = await fetch(`${localhost_api}/api/properties`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const properties = await response.json();
        return properties;
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
}

function handleSearch() {
    const city = document.getElementById('location-input').value;
    const type = document.getElementById('type-input').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const rooms = document.getElementById('rooms-input').value;
    const area = document.getElementById('area-input').value;

    const criteria = {
        city,
        type,
        priceMin: minPrice,
        priceMax: maxPrice,
        rooms,
        area
    };

    const filteredProperties = filterProperties(criteria);
    displayPropertyList(filteredProperties);
    localStorage.setItem('searchCriteria', JSON.stringify(criteria));
}

function filterProperties(criteria) {
    return properties.filter(property => {
        return (
            (!criteria.city || property.city.toLowerCase().includes(criteria.city.toLowerCase())) &&
            (!criteria.type || property.name.toLowerCase().includes(criteria.type.toLowerCase())) &&
            (!criteria.priceMin || property.price >= parseFloat(criteria.priceMin)) &&
            (!criteria.priceMax || property.price <= parseFloat(criteria.priceMax)) &&
            (!criteria.rooms || property.rooms >= parseInt(criteria.rooms)) &&
            (!criteria.area || property.area >= parseFloat(criteria.area))
        );
    });
}


function displayPropertyList(filteredProperties) {
    const propertiesContainer = document.querySelector('.properties');
    propertiesContainer.innerHTML = '';

    if (filteredProperties.length === 0) {
        const noPropertyCard = document.createElement('div');
        noPropertyCard.className = 'property-card';
        noPropertyCard.innerHTML = `
            <div class="property-details">
                <h3>No Properties Found</h3>
                <p>Please adjust your search criteria and try again.</p>
            </div>
        `;
        propertiesContainer.appendChild(noPropertyCard);
        return;
    }

    filteredProperties.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        propertyCard.innerHTML = `
            <div class="property-image">
                <img src="${property.image}" alt="${property.name}">
            </div>
            <div class="property-details">
                <div class="property-header">
                    <h3>${property.name}</h3>
                </div>
                <div class="property-body">
                    <div class="property-body-item">
                        <i class="fa fa-euro"></i>
                        <p>€${property.price.toLocaleString()}</p>
                    </div>
                    <div class="property-body-item">
                        <i class="fa fa-expand"></i>
                        <p>${property.area} m²</p>
                    </div>
                    <div class="property-body-item">
                        <i class="fa fa-bed"></i>
                        <p>${property.rooms} Pièce(s)</p>
                    </div>
                    <div class="property-body-item">
                        <i class="fa fa-map-marker"></i>
                        <p>${property.city}</p>
                    </div>
                </div>
                <div class="property-contact">
                    <button class="property-contact-btn">Interested</button>
                </div>
                <p class="property-description">${property.description}</p>
            </div>
        `;
        propertyCard.addEventListener('click', () => startChatFlowWithProperty(property.name));
        propertiesContainer.appendChild(propertyCard);
    });

    document.querySelectorAll('.property-contact-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const propertyCard = button.closest('.property-card');
            const propertyName = propertyCard.querySelector('.property-header h3').textContent;
            startChatFlowWithProperty(propertyName);
        });
    });
}


function startChatFlowWithProperty(propertyName) {
    toggleChat();
    currentNode = chatFlowGraph.propertydetail;
    appendMessage('system', currentNode.message + propertyName + '?');
    displayOptions(currentNode.options, handleUserResponse);
    saveCurrentNode();
}

// Attach event listeners to input fields
document.querySelectorAll('.property-search-filters input').forEach(input => {
    input.addEventListener('input', handleSearch);
});

