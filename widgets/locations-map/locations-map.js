(function() {
    "use strict";

    const baseURL = "https://grupak-widgets.vercel.app/widgets/locations-map";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-locations-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-locations-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/locations-map.css`;
        document.head.appendChild(link);
    }

    // Helper function to resolve relative image paths to absolute Vercel paths
    function resolveImagePath(path) {
        if (!path) return "";
        if (path.startsWith("http") || path.startsWith("//") || path.startsWith("data:")) {
            return path;
        }
        const relativePart = path.replace("widgets/locations-map/", "");
        return `${baseURL}/${relativePart}`;
    }

    // 2. Fetch and inject HTML markup if root container exists and hasn't been populated
    const container = document.getElementById("gpk-locations-widget-root");
    if (container) {
        fetch(`${baseURL}/locations-map.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading locations widget HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                // Resolve relative image paths in the fetched HTML
                const imgs = container.querySelectorAll("img");
                imgs.forEach(img => {
                    const src = img.getAttribute("src");
                    if (src && !src.startsWith("http") && !src.startsWith("//") && !src.startsWith("data:")) {
                        const relativePart = src.replace("widgets/locations-map/", "");
                        img.src = `${baseURL}/${relativePart}`;
                    }
                });
                initWidget();
            })
            .catch(err => console.error("Error loading locations widget:", err));
    } else if (document.getElementById("gpk-locations-map-widget")) {
        // Fallback for direct integration / static pre-rendered containers
        initWidget();
    }

    // Encapsulated widget controller
    function initWidget() {
        // ==========================================================================
        // DATOS DE UBICACIONES
        // ==========================================================================
        const locationsData = [
            {
                id: 'corporativo-cdmx',
                name: 'Corporativo CDMX',
                category: 'Corporativo',
                categoryClass: 'corporativo',
                address: 'Av. Insurgentes Sur 1971, Piso 11, Col. Guadalupe Inn, Álvaro Obregón, 01020, Ciudad de México',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/corporativo-cdmx.webp',
                pinTop: '52%',
                pinLeft: '44%'
            },
            {
                id: 'planta-cuernavaca',
                name: 'Planta Cuernavaca',
                category: 'Planta papel',
                categoryClass: 'planta-papel',
                address: 'Av. Atlacomulco 117 A, Chapultepec, C.P. 62450, Cuernavaca, Morelos',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-cuernavaca.webp',
                pinTop: '70.86%',
                pinLeft: '22.87%'
            },
            {
                id: 'planta-hidalgo',
                name: 'Planta Hidalgo',
                category: 'Planta papel',
                categoryClass: 'planta-papel',
                address: 'Carretera Federal Pachuca CD. Sahagún tramo Cd. Sahagún Emiliano Zapata Km. 20, Emiliano Zapata, C.P. 43960, Hidalgo',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-hidalgo.webp',
                pinTop: '15.79%',
                pinLeft: '53.69%'
            },
            {
                id: 'abastecimiento-cdmx',
                name: 'Abastecimiento CDMX',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Calle Prol. José López Bonaga, fracción 1 No. Ext 57 Manzana única Int. 24B, San Lorenzo Tetlixtac, Coacalco de Berriozábal Edo. de Méx. C.P. 55718',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                pinTop: '45%',
                pinLeft: '48%'
            },
            {
                id: 'abastecimiento-puebla',
                name: 'Abastecimiento Puebla',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Resurrección Oriente No. 17, Col. Industrial Resurrección C.P. 72228 Puebla, Puebla',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                pinTop: '81.77%',
                pinLeft: '75.99%'
            },
            {
                id: 'abastecimiento-cuatitan',
                name: 'Abastecimiento Cuatitán',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Ebanistas 10, Industrial Xhala, C.P. 54714 Cuautitlán Izcalli; Edo. de México',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                pinTop: '38%',
                pinLeft: '42%'
            },
            {
                id: 'abastecimiento-queretaro',
                name: 'Abastecimiento Querétaro',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Acceso II 4, Parque Industrial Benito Juárez, C.P. 76120 Querétaro, Qro.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                pinTop: '28%',
                pinLeft: '22%'
            },
            {
                id: 'abastecimiento-slp',
                name: 'Abastecimiento San Luis Potosí',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Carretera 57, 3990 Blvr. San Luis, Industrial San Luis, 78395 San Luis, S.L.P.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                pinTop: '14.89%',
                pinLeft: '4.22%'
            },
            {
                id: 'abastecimiento-toluca',
                name: 'Abastecimiento Toluca',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Calle San Antonio No. 36. Colonia Reforma, San Mateo Atenco. Edo de Mex. CP 52120',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-toluca.webp',
                pinTop: '48.4%',
                pinLeft: '12.49%'
            }
        ];

        // Categorías para filtros
        const categories = [
            { id: 'all', name: 'Todas', color: '#6E6E6E' },
            { id: 'abastecimiento', name: 'Abastecimientos', color: '#5F9D2F' },
            { id: 'planta-papel', name: 'Planta papel', color: '#F76D6D' },
            { id: 'corporativo', name: 'Corporativo', color: '#B5E062' },
            { id: 'planta-corrugado', name: 'Planta corrugado y conversión', color: '#BC4D2B' }
        ];

        // ==========================================================================
        // ESTADO GLOBAL DEL WIDGET
        // ==========================================================================
        let state = {
            activeLocationId: null,
            activeFilter: 'all',
            searchQuery: '',
            filteredLocations: [...locationsData]
        };

        // Elementos DOM
        const elements = {
            searchInput: null,
            filterTags: null,
            locationsList: null,
            mapPinsContainer: null,
            mapPopup: null,
            mapOverlay: null,
            popupImage: null,
            popupTitle: null,
            popupCategory: null,
            popupAddress: null,
            popupPhone: null,
            popupHours: null
        };

        // ==========================================================================
        // INICIALIZACIÓN
        // ==========================================================================
        function init() {
            cacheElements();
            renderFilterTags();
            renderMapPins();
            renderLocationsList();
            bindEvents();

            // Seleccionar la primera ubicación por defecto al cargar
            if (locationsData.length > 0) {
                selectLocation(locationsData[0].id, false);
            }

            console.log('🗺️ Scoped Locations Map Widget inicializado');
        }

        function cacheElements() {
            elements.searchInput = document.getElementById('locationSearch');
            elements.filterTags = document.getElementById('filterTags');
            elements.locationsList = document.getElementById('locationsList');
            elements.mapPinsContainer = document.getElementById('mapPinsContainer');
            elements.mapPopup = document.getElementById('mapPopup');
            elements.mapOverlay = document.getElementById('mapOverlay');
            
            elements.popupImage = document.getElementById('popupImage');
            elements.popupTitle = document.getElementById('popupTitle');
            elements.popupCategory = document.getElementById('popupCategory');
            elements.popupAddress = document.getElementById('popupAddress').querySelector('.popup-detail-text');
            elements.popupPhone = document.getElementById('popupPhone').querySelector('.popup-detail-text');
            elements.popupHours = document.getElementById('popupHours');
        }

        function bindEvents() {
            // Evento Buscador (Debounce 150ms)
            if (elements.searchInput) {
                let searchDebounce;
                elements.searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchDebounce);
                    searchDebounce = setTimeout(() => {
                        state.searchQuery = e.target.value.trim().toLowerCase();
                        applyFilters();
                    }, 150);
                });

                elements.searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        e.target.value = '';
                        e.target.blur();
                        state.searchQuery = '';
                        applyFilters();
                    }
                });
            }

            // Filtros Categorías (Delegación)
            if (elements.filterTags) {
                elements.filterTags.addEventListener('click', (e) => {
                    const tag = e.target.closest('.filter-tag');
                    if (tag) {
                        const filterId = tag.dataset.filter;
                        setActiveFilter(filterId);
                    }
                });
            }

            // Listado de Tarjetas (Delegación)
            if (elements.locationsList) {
                elements.locationsList.addEventListener('click', (e) => {
                    const card = e.target.closest('.location-card');
                    if (card) {
                        const locationId = card.dataset.locationId;
                        selectLocation(locationId, true);
                    }
                });

                // Accesibilidad teclado
                elements.locationsList.addEventListener('keydown', (e) => {
                    const card = e.target.closest('.location-card');
                    if (card && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        const locationId = card.dataset.locationId;
                        selectLocation(locationId, true);
                    }
                });
            }

            // Pines del Mapa (Delegación)
            if (elements.mapPinsContainer) {
                elements.mapPinsContainer.addEventListener('click', (e) => {
                    const pin = e.target.closest('.map-pin');
                    if (pin) {
                        const locationId = pin.dataset.locationId;
                        selectLocation(locationId, true);
                    }
                });
            }

            // Cerrar Popup
            if (elements.mapOverlay) {
                elements.mapOverlay.addEventListener('click', closePopup);
            }

            // Escape para cerrar
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.mapPopup && elements.mapPopup.classList.contains('visible')) {
                    closePopup();
                }
            });
        }

        // ==========================================================================
        // RENDERIZADO DE COMPONENTES DOM
        // ==========================================================================

        function renderFilterTags() {
            if (!elements.filterTags) return;

            elements.filterTags.innerHTML = categories.map(cat => `
                <button 
                    class="filter-tag ${cat.id === 'all' ? 'active' : ''}" 
                    data-filter="${cat.id}"
                    style="color: ${cat.color};"
                    role="radio"
                    aria-checked="${cat.id === 'all'}"
                >
                    <span class="tag-dot" style="background-color: ${cat.color};"></span>
                    <span>${cat.name}</span>
                </button>
            `).join('');
        }

        function renderMapPins() {
            if (!elements.mapPinsContainer) return;

            elements.mapPinsContainer.innerHTML = locationsData.map(loc => `
                <button 
                    class="map-pin ${loc.categoryClass}" 
                    id="pin-${loc.id}" 
                    data-location-id="${loc.id}" 
                    style="top: ${loc.pinTop}; left: ${loc.pinLeft};"
                    aria-label="${loc.name}"
                    tabindex="0"
                >
                </button>
            `).join('');
        }

        function renderLocationsList() {
            if (!elements.locationsList) return;

            if (state.filteredLocations.length === 0) {
                elements.locationsList.innerHTML = `
                    <div class="locations-empty" role="status">
                        <span class="empty-icon" aria-hidden="true">🔍</span>
                        <p class="empty-title">Sin resultados</p>
                        <p class="empty-desc">No se encontraron ubicaciones que coincidan con tu búsqueda</p>
                    </div>
                `;
                return;
            }

            elements.locationsList.innerHTML = state.filteredLocations.map((loc, index) => `
                <article 
                    class="location-card ${loc.id === state.activeLocationId ? 'active' : ''} ${loc.categoryClass}" 
                    data-location-id="${loc.id}"
                    role="listitem"
                    tabindex="0"
                    aria-selected="${loc.id === state.activeLocationId}"
                    style="animation-delay: ${index * 30}ms;"
                >
                    <div class="card-icon-container">
                        <!-- Pin SVG vector inlined para poder colorearlo via currentColor -->
                        <svg class="card-pin-bg" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 9C17 13.993 11.461 19.193 9.601 20.799C9.42772 20.9293 9.2168 20.9998 9 20.9998C8.7832 20.9998 8.57228 20.9293 8.399 20.799C6.539 19.193 1 13.993 1 9C1 6.87827 1.84285 4.84344 3.34315 3.34315C4.84344 1.84285 6.87827 1 9 1C11.1217 1 13.1566 1.84285 14.6569 3.34315C16.1571 4.84344 17 6.87827 17 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg class="card-pin-circle" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7C5.65685 7 7 5.65685 7 4C7 2.34315 5.65685 1 4 1C2.34315 1 1 2.34315 1 4C1 5.65685 2.34315 7 4 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="location-info-wrapper">
                        <div class="location-header-row">
                            <h3 class="location-name">${escapeHtml(loc.name)}</h3>
                            <span class="location-badge ${loc.categoryClass}">${escapeHtml(loc.category)}</span>
                        </div>
                        <p class="location-address">${escapeHtml(loc.address)}</p>
                    </div>
                </article>
            `).join('');
        }

        // ==========================================================================
        // FILTRADO Y BÚSQUEDA
        // ==========================================================================
        function applyFilters() {
            let filtered = [...locationsData];

            // 1. Filtrar por categoría
            if (state.activeFilter !== 'all') {
                filtered = filtered.filter(loc => loc.categoryClass === state.activeFilter);
            }

            // 2. Filtrar por búsqueda de texto
            if (state.searchQuery) {
                const query = state.searchQuery;
                filtered = filtered.filter(loc => 
                    loc.name.toLowerCase().includes(query) ||
                    loc.category.toLowerCase().includes(query) ||
                    loc.address.toLowerCase().includes(query)
                );
            }

            state.filteredLocations = filtered;
            renderLocationsList();
            updatePinsVisibility();

            // Si la ubicación seleccionada se filtró, cerrar el popup
            if (state.activeLocationId && !filtered.find(loc => loc.id === state.activeLocationId)) {
                closePopup();
            }
        }

        function updatePinsVisibility() {
            locationsData.forEach(loc => {
                const pinEl = document.getElementById(`pin-${loc.id}`);
                if (!pinEl) return;
                
                const isVisible = state.filteredLocations.some(fLoc => fLoc.id === loc.id);
                if (isVisible) {
                    pinEl.classList.remove('hidden');
                } else {
                    pinEl.classList.add('hidden');
                }
            });
        }

        function setActiveFilter(filterId) {
            state.activeFilter = filterId;

            // Actualizar estados visuales de los tags
            const tags = elements.filterTags.querySelectorAll('.filter-tag');
            tags.forEach(tag => {
                const isActive = tag.dataset.filter === filterId;
                tag.classList.toggle('active', isActive);
                tag.setAttribute('aria-checked', isActive);
            });

            applyFilters();
        }

        // ==========================================================================
        // SELECCIÓN Y COMPORTAMIENTO INTERACTIVO
        // ==========================================================================
        function selectLocation(locationId, triggerScroll = true) {
            const location = locationsData.find(loc => loc.id === locationId);
            if (!location) return;

            state.activeLocationId = locationId;

            // 1. Actualizar clase activa en las tarjetas de la lista
            const cards = elements.locationsList.querySelectorAll('.location-card');
            cards.forEach(card => {
                const isActive = card.dataset.locationId === locationId;
                card.classList.toggle('active', isActive);
                card.setAttribute('aria-selected', isActive);
                
                // Auto scroll de la lista hacia la tarjeta seleccionada (si se activó desde un pin del mapa)
                if (isActive && !triggerScroll) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // 2. Actualizar pines activos
            locationsData.forEach(loc => {
                const pinEl = document.getElementById(`pin-${loc.id}`);
                if (pinEl) {
                    pinEl.classList.toggle('active', loc.id === locationId);
                }
            });

            // 3. Abrir y actualizar Popup
            showPopup(location);

            // 4. Scroll en móvil
            if (triggerScroll && window.innerWidth <= 992) {
                const mapContainer = document.querySelector('.map-container');
                mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function showPopup(location) {
            if (!elements.mapPopup) return;

            // Actualizar datos del Popup
            elements.popupTitle.textContent = location.name;
            
            // Categoria badge
            elements.popupCategory.textContent = location.category;
            elements.popupCategory.className = `popup-category ${location.categoryClass}`;

            // Address
            elements.popupAddress.textContent = location.address;

            // Telefono con enlace
            elements.popupPhone.innerHTML = `<a href="tel:+52${location.phone.replace(/\s/g, '')}">${escapeHtml(location.phone)}</a>`;

            // Helper to resolve images inside initWidget scope
            function resolveImagePath(path) {
                if (!path) return "";
                if (path.startsWith("http") || path.startsWith("//") || path.startsWith("data:")) {
                    return path;
                }
                const relativePart = path.replace("widgets/locations-map/", "");
                return `https://grupak-widgets.vercel.app/widgets/locations-map/${relativePart}`;
            }

            // Imagen
            if (elements.popupImage) {
                elements.popupImage.src = resolveImagePath(location.imageUrl);
                elements.popupImage.alt = `Planta ${location.name}`;
                
                // Fallback si la imagen falla
                elements.popupImage.onerror = () => {
                    elements.popupImage.src = resolveImagePath('widgets/locations-map/images/dji-aerial.webp');
                };
            }

            // Posicionamiento dinámico sobre el pin correspondiente
            const pinEl = document.getElementById(`pin-${location.id}`);
            if (pinEl) {
                elements.mapPopup.style.left = pinEl.style.left;
                elements.mapPopup.style.top = pinEl.style.top;
            }

            // Si el pin está muy arriba (menos del 35% del contenedor), colocar el popup debajo
            const pinTopPercent = parseFloat(location.pinTop);
            if (!isNaN(pinTopPercent) && pinTopPercent < 35) {
                elements.mapPopup.classList.add('popup-below');
            } else {
                elements.mapPopup.classList.remove('popup-below');
            }

            // Mostrar Popup
            elements.mapPopup.classList.add('visible');
            elements.mapOverlay.classList.add('visible');

            // Focus
            elements.mapPopup.focus();
        }

        function closePopup() {
            if (!elements.mapPopup) return;

            elements.mapPopup.classList.remove('visible');
            elements.mapPopup.classList.remove('popup-below');
            elements.mapOverlay.classList.remove('visible');

            // Quitar estado activo en tarjetas y pines
            const activeCard = elements.locationsList.querySelector('.location-card.active');
            if (activeCard) {
                activeCard.classList.remove('active');
                activeCard.setAttribute('aria-selected', 'false');
            }

            locationsData.forEach(loc => {
                const pinEl = document.getElementById(`pin-${loc.id}`);
                if (pinEl) {
                    pinEl.classList.remove('active');
                }
            });

            state.activeLocationId = null;
        }

        // ==========================================================================
        // AUXILIARES
        // ==========================================================================
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Inicializar
        init();
    }
})();
