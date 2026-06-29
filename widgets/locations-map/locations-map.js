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
        // Resuelve rutas relativas de imágenes a rutas absolutas en Vercel
        function resolveImagePath(path) {
            if (!path) return "";
            if (path.startsWith("http") || path.startsWith("//") || path.startsWith("data:")) {
                return path;
            }
            const relativePart = path.replace("widgets/locations-map/", "");
            return `${baseURL}/${relativePart}`;
        }

        // ==========================================================================
        // DATOS DE UBICACIONES (coordenadas geográficas reales)
        // ==========================================================================
        const locationsData = [
            {
                id: 'corporativo-cdmx',
                name: 'Corporativo',
                category: 'Corporativo',
                categoryClass: 'corporativo',
                address: 'Lago Zúrich 245, Edificio Zúrich, piso 7, Ampliación Granada, C.P. 11529, Ciudad de México',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/corporativo-cdmx.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lago+Zurich+245+Edificio+Zurich+Piso+7+Ampliacion+Granada+11529+Ciudad+de+Mexico',
                lat: 19.4360,
                lng: -99.2030
            },
            {
                id: 'planta-toluca',
                name: 'Planta Toluca',
                category: 'Planta',
                categoryClass: 'planta-papel',
                address: 'Calle Cuatro Norte 302, Parque Industrial Toluca 2000, C.P. 50200 Toluca de Lerdo, Estado de México.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-toluca.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+Cuatro+Norte+302+Parque+Industrial+Toluca+2000+50200+Toluca+Estado+de+Mexico',
                lat: 19.3071,
                lng: -99.6575
            },
            {
                id: 'planta-cuernavaca',
                name: 'Planta Cuernavaca',
                category: 'Planta',
                categoryClass: 'planta-papel',
                address: 'Av. Atlacomulco 117 A, Chapultepec, C.P. 62450, Cuernavaca, Morelos.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-cuernavaca.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av+Atlacomulco+117+A+Chapultepec+62450+Cuernavaca+Morelos',
                lat: 18.9317,
                lng: -99.2381
            },
            {
                id: 'planta-hidalgo',
                name: 'Planta Hidalgo',
                category: 'Planta',
                categoryClass: 'planta-papel',
                address: 'Carretera Federal Pachuca CD. Sahagún tramo Cd. Sahagún Emiliano Zapata Km. 20, Emiliano Zapata, C.P. 43960, Hidalgo.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-hidalgo.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Carretera+Federal+Pachuca+Ciudad+Sahagun+Tramo+Ciudad+Sahagun+Emiliano+Zapata+Km+20+43960+Hidalgo',
                lat: 19.8440,
                lng: -98.6020
            },
            {
                id: 'empaques-digital',
                name: 'Empaques digital',
                category: 'Planta',
                categoryClass: 'planta-papel',
                address: 'Carretera Federal Pachuca CD. Sahagún tramo Cd. Sahagún Emiliano Zapata Km. 20, Emiliano Zapata, C.P. 43960, Hidalgo.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Carretera+Federal+Pachuca+Ciudad+Sahagun+Tramo+Ciudad+Sahagun+Emiliano+Zapata+Km+20+43960+Hidalgo',
                lat: 19.8443,
                lng: -98.6020
            },
            {
                id: 'abastecimiento-cdmx',
                name: 'Abastecimientos CDMX',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Calle Prol. José López Bonaga, fracción 1 No. Ext 57 Manzana única Int. 24B, San Lorenzo Tetlixtac, Coacalco de Berriozábal Edo. de Méx. C.P. 55718',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Prolongacion+Jose+Lopez+Bonaga+57+San+Lorenzo+Tetlixtac+55718+Coacalco+Estado+de+Mexico',
                lat: 19.6268,
                lng: -99.1073
            },
            {
                id: 'abastecimiento-puebla',
                name: 'Abastecimientos Puebla',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Resurrección Oriente No. 17, Col. Industrial Resurrección C.P. 72228 Puebla, Puebla.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Resurreccion+Oriente+17+Industrial+Resurreccion+72228+Puebla+Puebla',
                lat: 19.0465,
                lng: -98.1547
            },
            {
                id: 'abastecimiento-cuautitlan',
                name: 'Abastecimientos Cuautitlán',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Ebanistas 10, Industrial Xhala, C.P. 54714 Cuautitlán Izcalli; Edo. de México.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ebanistas+10+Industrial+Xhala+54714+Cuautitlan+Izcalli+Estado+de+Mexico',
                lat: 19.6452,
                lng: -99.2148
            },
            {
                id: 'abastecimiento-queretaro',
                name: 'Abastecimientos Querétaro',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Acceso II 4, Parque Industrial Benito Juárez, C.P. 76120 Querétaro, Qro.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Acceso+II+4+Parque+Industrial+Benito+Juarez+76120+Queretaro+Queretaro',
                lat: 20.5975,
                lng: -100.4148
            },
            {
                id: 'abastecimiento-slp',
                name: 'Abastecimientos San Luis Potosí',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Carretera 57, 3990 Blvr. San Luis, Industrial San Luis, 78395 San Luis, S.L.P.',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/dji-aerial.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Carretera+57+3990+Boulevard+San+Luis+Industrial+San+Luis+78395+San+Luis+Potosi',
                lat: 22.0915,
                lng: -100.9672
            },
            {
                id: 'abastecimiento-toluca',
                name: 'Abastecimientos Toluca',
                category: 'Abastecimiento',
                categoryClass: 'abastecimiento',
                address: 'Calle San Antonio No. 36. Colonia Reforma, San Mateo Atenco. Edo de Mex. CP 52120',
                phone: '55 2581 0700',
                imageUrl: 'widgets/locations-map/images/planta-toluca.webp',
                mapUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+San+Antonio+36+Colonia+Reforma+San+Mateo+Atenco+52120+Estado+de+Mexico',
                lat: 19.2718,
                lng: -99.5384
            }
        ];

        // Categorías para filtros (una sola categoría de planta)
        const categories = [
            { id: 'all', name: 'Todas', color: '#6E6E6E' },
            { id: 'abastecimiento', name: 'Abastecimientos', color: '#5F9D2F' },
            { id: 'planta-papel', name: 'Plantas', color: '#F76D6D' },
            { id: 'corporativo', name: 'Corporativo', color: '#B5E062' }
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

        const elements = {
            searchInput: null,
            filterTags: null,
            locationsList: null,
            mapEl: null
        };

        // Mapa Leaflet y marcadores (id -> L.marker)
        let map = null;
        const markers = {};

        // ==========================================================================
        // INICIALIZACIÓN
        // ==========================================================================
        function init() {
            cacheElements();
            renderFilterTags();
            renderLocationsList();
            bindEvents();
            loadLeaflet(initMap);

            console.log('🗺️ Locations Map Widget (Leaflet) inicializado');
        }

        function cacheElements() {
            elements.searchInput = document.getElementById('locationSearch');
            elements.filterTags = document.getElementById('filterTags');
            elements.locationsList = document.getElementById('locationsList');
            elements.mapEl = document.getElementById('gpkMap');
        }

        // ==========================================================================
        // CARGA DINÁMICA DE LEAFLET (CSS + JS desde CDN)
        // ==========================================================================
        function loadLeaflet(callback) {
            if (window.L && window.L.map) {
                callback();
                return;
            }

            if (!document.getElementById('gpk-leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'gpk-leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            let script = document.getElementById('gpk-leaflet-js');
            if (script) {
                // Ya se está cargando desde otra instancia: esperar al evento load
                script.addEventListener('load', callback);
                return;
            }

            script = document.createElement('script');
            script.id = 'gpk-leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = callback;
            script.onerror = () => console.error('No se pudo cargar Leaflet desde el CDN');
            document.head.appendChild(script);
        }

        // ==========================================================================
        // INICIALIZACIÓN DEL MAPA Y MARCADORES
        // ==========================================================================
        function initMap() {
            if (!elements.mapEl || typeof L === 'undefined') return;

            map = L.map(elements.mapEl, {
                scrollWheelZoom: false, // evita atrapar el scroll de la página
                zoomControl: true,
                attributionControl: true
            }).setView([19.8, -99.3], 7);

            // Capa de teselas CARTO claro (minimalista, combina con el diseño)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            // Crear un marcador por cada ubicación
            locationsData.forEach(loc => {
                const icon = L.divIcon({
                    className: `gpk-map-pin-wrap ${loc.categoryClass}`,
                    html: `<span class="gpk-map-pin ${loc.categoryClass}"></span>`,
                    iconSize: [26, 33],
                    iconAnchor: [13, 33],
                    popupAnchor: [0, -30]
                });

                const marker = L.marker([loc.lat, loc.lng], {
                    icon: icon,
                    title: loc.name,
                    riseOnHover: true,
                    keyboard: true
                });

                marker.bindPopup(buildPopupHtml(loc), {
                    className: 'gpk-popup',
                    maxWidth: 340,
                    minWidth: 320,
                    autoPanPadding: [24, 24],
                    closeButton: true
                });

                marker.on('popupopen', () => onPopupOpen(loc.id));
                marker.on('popupclose', () => onPopupClose(loc.id));

                markers[loc.id] = marker;
                marker.addTo(map);
            });

            // Ajustar la vista para que se vean todos los marcadores
            fitToVisible();

            // Recalcular tamaño tras el render inicial y en cada resize
            setTimeout(() => { if (map) map.invalidateSize(); }, 250);

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { if (map) map.invalidateSize(); }, 200);
            });
        }

        // Construye el HTML del popup (mismo diseño/información que el original)
        function buildPopupHtml(loc) {
            const phoneClean = loc.phone.replace(/\s/g, '');
            const img = resolveImagePath(loc.imageUrl);
            const fallback = resolveImagePath('widgets/locations-map/images/dji-aerial.webp');
            const addressIcon = resolveImagePath('widgets/locations-map/images/icon-address.svg');
            const phoneIcon = resolveImagePath('widgets/locations-map/images/icon-phone.svg');
            const mapUrl = loc.mapUrl || `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

            return `
                <div class="popup-image-container">
                    <img class="popup-image" src="${img}" alt="${escapeHtml(loc.name)}" loading="lazy"
                         onerror="this.onerror=null;this.src='${fallback}';">
                </div>
                <div class="popup-content">
                    <div class="popup-header">
                        <h2 class="popup-name">${escapeHtml(loc.name)}</h2>
                        <span class="popup-category ${loc.categoryClass}">${escapeHtml(loc.category)}</span>
                    </div>
                    <div class="popup-divider"></div>
                    <div class="popup-detail">
                        <img class="popup-detail-icon" src="${addressIcon}" alt="Dirección" aria-hidden="true">
                        <span class="popup-detail-text"><a href="${mapUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(loc.name)} en Google Maps">${escapeHtml(loc.address)}</a></span>
                    </div>
                    <div class="popup-detail">
                        <img class="popup-detail-icon" src="${phoneIcon}" alt="Teléfono" aria-hidden="true">
                        <span class="popup-detail-text"><a href="tel:+52${phoneClean}">${escapeHtml(loc.phone)}</a></span>
                    </div>
                    <div class="popup-hours">
                        <span class="status-dot" aria-hidden="true"></span>
                        <span class="status-open">Abierto ahora</span>
                        <span class="status-separator" aria-hidden="true">•</span>
                        <span class="status-close">Cierra a las 20:00 hrs</span>
                    </div>
                </div>
            `;
        }

        // Ajusta la vista a los marcadores actualmente visibles
        function fitToVisible() {
            if (!map) return;
            const visible = Object.values(markers).filter(m => map.hasLayer(m));
            if (!visible.length) return;
            const group = L.featureGroup(visible);
            map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 10 });
        }

        // ==========================================================================
        // EVENTOS
        // ==========================================================================
        function bindEvents() {
            // Buscador (Debounce 150ms)
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

            // Filtros de categoría (delegación)
            if (elements.filterTags) {
                elements.filterTags.addEventListener('click', (e) => {
                    const tag = e.target.closest('.filter-tag');
                    if (tag) setActiveFilter(tag.dataset.filter);
                });
            }

            // Listado de tarjetas (delegación)
            if (elements.locationsList) {
                elements.locationsList.addEventListener('click', (e) => {
                    const card = e.target.closest('.location-card');
                    if (card) selectLocation(card.dataset.locationId);
                });

                elements.locationsList.addEventListener('keydown', (e) => {
                    const card = e.target.closest('.location-card');
                    if (card && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        selectLocation(card.dataset.locationId);
                    }
                });
            }
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
        }

        // Muestra/oculta los marcadores del mapa según el filtrado actual
        function updatePinsVisibility() {
            if (!map) return;

            locationsData.forEach(loc => {
                const marker = markers[loc.id];
                if (!marker) return;

                const isVisible = state.filteredLocations.some(fLoc => fLoc.id === loc.id);
                if (isVisible) {
                    if (!map.hasLayer(marker)) marker.addTo(map);
                } else {
                    if (map.hasLayer(marker)) {
                        if (state.activeLocationId === loc.id) marker.closePopup();
                        map.removeLayer(marker);
                    }
                }
            });
        }

        function setActiveFilter(filterId) {
            state.activeFilter = filterId;

            const tags = elements.filterTags.querySelectorAll('.filter-tag');
            tags.forEach(tag => {
                const isActive = tag.dataset.filter === filterId;
                tag.classList.toggle('active', isActive);
                tag.setAttribute('aria-checked', isActive);
            });

            applyFilters();
            fitToVisible();
        }

        // ==========================================================================
        // SELECCIÓN E INTERACCIÓN
        // ==========================================================================
        function selectLocation(locationId) {
            const location = locationsData.find(loc => loc.id === locationId);
            if (!location) return;

            const marker = markers[locationId];
            if (map && marker) {
                if (!map.hasLayer(marker)) marker.addTo(map);
                marker.openPopup(); // dispara popupopen -> resalta tarjeta y pin
            } else {
                // El mapa aún no está listo: al menos resaltar la tarjeta
                highlightCard(locationId);
            }

            // En móvil, desplazar hacia el mapa
            if (window.innerWidth <= 992) {
                const mapContainer = document.querySelector('#gpk-locations-map-widget .map-container');
                if (mapContainer) mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function onPopupOpen(id) {
            state.activeLocationId = id;
            highlightCard(id);
            highlightPin(id);
        }

        function onPopupClose(id) {
            if (state.activeLocationId === id) clearActive();
        }

        function highlightCard(id) {
            if (!elements.locationsList) return;
            elements.locationsList.querySelectorAll('.location-card').forEach(card => {
                const isActive = card.dataset.locationId === id;
                card.classList.toggle('active', isActive);
                card.setAttribute('aria-selected', isActive);
                if (isActive) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }

        function highlightPin(id) {
            Object.keys(markers).forEach(key => {
                const marker = markers[key];
                if (marker && marker._icon) {
                    marker._icon.classList.toggle('active', key === id);
                }
            });
        }

        function clearActive() {
            state.activeLocationId = null;

            if (elements.locationsList) {
                const activeCard = elements.locationsList.querySelector('.location-card.active');
                if (activeCard) {
                    activeCard.classList.remove('active');
                    activeCard.setAttribute('aria-selected', 'false');
                }
            }

            Object.values(markers).forEach(marker => {
                if (marker._icon) marker._icon.classList.remove('active');
            });
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
