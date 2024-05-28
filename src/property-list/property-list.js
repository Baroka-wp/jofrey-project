const properties = [
    {
        id: 1,
        name: 'Luxury Villa',
        city: 'Paris',
        price: 2000000, // price as float
        area: 1476, // area as float
        rooms: 7, // rooms as integer
        image: '../../../assets/image_2.png',
        description: 'Ludovic Graillot vous propose à la vente cet ensemble immobilier situé proche de la gare de CHAUMONT. À 5 minutes à pied du centre-ville, venez visiter cet ensemble immobilier composé...'
    },
    {
        id: 2,
        name: 'Modern Apartment',
        city: 'Berlin',
        price: 1200000, // price as float
        area: 68, // area as float
        rooms: 3, // rooms as integer
        image: '../../../assets/image1.jpg',
        description: 'Fabrice PAYNE vous propose cet appartement de 2 chambres dans le cadre de ce programme bénéficiant de la nouvelle norme énergétique RE 2020 à quelques pas de la station de métro...'
    },
    {
        id: 3,
        name: 'Cozy Cottage',
        city: 'London',
        price: 850000, // price as float
        area: 100, // area as float
        rooms: 5, // rooms as integer
        image: '../../../assets/image3.jpeg',
        description: 'Venez découvrir ce charmant cottage situé dans un quartier calme et verdoyant, idéal pour une famille. Avec ses 5 pièces et son jardin spacieux, il offre un cadre de vie paisible...'
    },
    // Add more properties here...
];

document.addEventListener('DOMContentLoaded', () => {
    const criteria = JSON.parse(localStorage.getItem('searchCriteria'));
    if (criteria) {
        document.getElementById('location-input').value = criteria.city || '';
        document.getElementById('type-input').value = criteria.type || '';
        document.getElementById('min-price').value = criteria.priceMin || '';
        document.getElementById('max-price').value = criteria.priceMax || '';
        document.getElementById('rooms-input').value = criteria.rooms || '';
        document.getElementById('area-input').value = criteria.area || '';

        handleSearch();
    }
});

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
    saveCurrentNode()
}

// Attach event listeners to input fields
document.querySelectorAll('.property-search-filters input').forEach(input => {
    input.addEventListener('input', handleSearch);
});

function toggleFilterPopup() {
    const filterPopup = document.querySelector('.filter-popup');
    filterPopup.style.display = filterPopup.style.display === 'none' || filterPopup.style.display === '' ? 'block' : 'none';
}


