/**
 * HOMEHUB STREAMING - MOTOR DE ADMINISTRACIÓN Y GESTIÓN EN VIVO
 * Clave de acceso: HomeHub2027Prime
 */

(function() {
    const ADMIN_PASSWORD = "HomeHub2027Prime";
    const STORAGE_KEY = "homehub_custom_products";
    const AUTH_SESSION_KEY = "homehub_admin_auth";

    const DEFAULT_PRODUCTS = [
        { id: "netflix", name: "Netflix Premium", price: 11, whatsappPrice: 12, soldOut: false, category: "streaming", color: "#E50914", description: "4K Ultra HD, 4 pantallas simultáneas. La mejor librería de series y películas." },
        { id: "disney", name: "Disney+ Full ESPN", price: 5.5, whatsappPrice: 6, soldOut: false, category: "streaming", color: "#1130CC", description: "Disney, Marvel, Star Wars, National Geographic + ESPN en un solo paquete." },
        { id: "max", name: "Max (HBO Max)", price: 2.5, whatsappPrice: 3, soldOut: false, category: "streaming", color: "#6A0DAD", description: "Series y películas exclusivas de HBO, Warner Bros y mucho más." },
        { id: "crunchyroll", name: "Crunchyroll Premium", price: 2, whatsappPrice: 3, soldOut: false, category: "streaming", color: "#F47521", description: "El mayor catálogo de anime en streaming. Sin anuncios, en HD." },
        { id: "primevideo", name: "Prime Video", price: 3, whatsappPrice: 4, soldOut: false, category: "streaming", color: "#00A8E0", description: "Series y películas Amazon Originals. Grandes estrenos exclusivos." },
        { id: "paramount", name: "Paramount+", price: 5, whatsappPrice: 5, soldOut: false, category: "streaming", color: "#0064FF", description: "Series originales, películas exclusivas y deportes en vivo." },
        { id: "vix", name: "Vix Premium", price: 2, whatsappPrice: 3, soldOut: false, category: "streaming", color: "#FF2D55", description: "El entretenimiento en español más grande del mundo. Telenovelas, deportes y más." },
        { id: "canva", name: "Canva Pro", price: 3.5, whatsappPrice: 4, soldOut: false, category: "tools", color: "#7D2AE7", description: "Diseño profesional ilimitado. Plantillas premium, marca de agua removida." },
        { id: "spotify", name: "Spotify Premium", price: 6, whatsappPrice: 7, soldOut: false, category: "música", color: "#1DB954", description: "Música sin anuncios, descargas offline y la mejor calidad de audio." },
        { id: "youtube", name: "YouTube Premium", price: 2.5, whatsappPrice: 4, soldOut: false, category: "streaming", color: "#FF0000", description: "Videos sin anuncios, YouTube Music incluido y reproducción en segundo plano." },
        { id: "iptv", name: "IPTV (Canales del Mundo)", price: 6, whatsappPrice: 6, soldOut: false, category: "streaming", color: "#FF6B00", description: "Miles de canales en vivo, eventos deportivos exclusivos y películas actualizadas." },
        { id: "appletv", name: "Apple TV+", price: 5, whatsappPrice: 5, soldOut: false, category: "streaming", color: "#a0a0a0", description: "Series y películas Originals de Apple. Producción cinematográfica premium." },
        { id: "chatgpt", name: "ChatGPT Plus", price: 6, whatsappPrice: 6, soldOut: false, category: "ia", color: "#10A37F", description: "Acceso a GPT-4o, generación de imágenes DALL-E y máxima velocidad." },
        { id: "capcut", name: "CapCut Pro", price: 6, whatsappPrice: 6, soldOut: false, category: "tools", color: "#000000", description: "Edición de video profesional con IA. Plantillas premium, sin marca de agua." },
        { id: "gemini", name: "Gemini Pro", price: 2.5, whatsappPrice: 4, soldOut: false, category: "ia", color: "#4f8ef7", description: "IA de Google con acceso avanzado. Generación de imágenes, análisis y más." }
    ];

    let currentProducts = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

    // 1. Cargar productos desde Storage o API
    async function loadProducts() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    currentProducts = parsed;
                }
            }
        } catch (e) {}

        try {
            const res = await fetch('/api/products', { cache: 'no-store' });
            if (res.ok) {
                const serverData = await res.json();
                if (Array.isArray(serverData) && serverData.length > 0) {
                    currentProducts = serverData;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
                }
            }
        } catch (e) {}

        // Migración automática: Limpiar bloqueo de 'Agotado' persistente en ChatGPT y CapCut del almacenamiento anterior
        if (!localStorage.getItem('homehub_v4_stock_reset')) {
            currentProducts.forEach(p => {
                if (p.id === 'chatgpt' || p.id === 'capcut') {
                    p.soldOut = false;
                }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProducts));
            localStorage.setItem('homehub_v4_stock_reset', 'true');
        }

        applyProductsToDOM();
    }

    // 2. Guardar productos local y remotamente
    async function saveProducts(newProducts) {
        currentProducts = newProducts;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProducts)
            });
        } catch (e) {}
        applyProductsToDOM();
    }

    // 3. Crear tarjeta dinámica en el catálogo
    function createDynamicProductCard(prod) {
        const card = document.createElement('div');
        card.className = 'group relative flex flex-col rounded-2xl overflow-hidden glass border border-white/6 cursor-pointer';
        card.dataset.productId = prod.id;
        card.style.border = '1px solid rgba(255, 255, 255, 0.06)';
        card.style.opacity = '1';
        card.style.transform = 'none';

        const pct = prod.whatsappPrice > prod.price 
            ? Math.round(((prod.whatsappPrice - prod.price) / prod.whatsappPrice) * 100) 
            : 0;

        card.innerHTML = `
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" style="background: radial-gradient(circle 200px at var(--mouse-x, 0px) var(--mouse-y, 0px), ${prod.color || '#4f8ef7'}12, transparent 80%);"></div>
            <div class="absolute top-0 left-0 right-0 h-px opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:h-[2px]" style="background: linear-gradient(90deg, transparent, ${prod.color || '#4f8ef7'}, transparent);"></div>
            <div class="p-6 flex flex-col flex-1 relative z-10">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 font-black text-xl text-white" style="background: ${prod.color || '#4f8ef7'}18; border: 1px solid ${prod.color || '#4f8ef7'}35;">
                        ${prod.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-white font-semibold text-sm leading-tight transition-colors duration-250 group-hover:text-white">${prod.name}</h3>
                        <p class="text-white/50 text-xs capitalize mt-0.5">${prod.category || 'streaming'}</p>
                    </div>
                </div>
                <p class="text-white/60 text-sm leading-relaxed mb-5 flex-1 transition-colors duration-300 group-hover:text-white/75">${prod.description || 'Acceso Premium con activación inmediata y soporte 24/7 garantizado.'}</p>
                <div class="flex flex-wrap gap-1.5 mb-5">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/8">✔ Renovable</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/8">✔ Soporte incluido</span>
                </div>
                <div class="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span class="line-through text-white/30 text-[11px] font-medium">S/ ${Number(prod.whatsappPrice).toFixed(2)}</span>
                            <span class="text-[9px] font-extrabold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/25 px-1.5 py-0.25 rounded-md leading-none tracking-wide" style="${pct > 0 ? '' : 'display:none;'}">-${pct}% WEB</span>
                        </div>
                        <div>
                            <span class="text-2xl font-bold text-white">S/ ${Number(prod.price).toFixed(2)}</span>
                            <span class="text-white/30 text-xs ml-1">/mes</span>
                        </div>
                    </div>
                    <button id="buy-${prod.id}" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-300 group-hover:scale-[1.06] active:scale-[0.97] cursor-pointer" style="background: ${prod.color || '#4f8ef7'}; box-shadow: 0 4px 20px ${prod.color || '#4f8ef7'}35;">
                        Comprar
                        <svg class="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>
        `;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });

        const buyBtn = card.querySelector(`#buy-${prod.id}`);
        if (buyBtn) {
            buyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (prod.soldOut) return;
                const waUrl = `https://wa.me/51916982923?text=${encodeURIComponent(`Hola HomeHub 👋, quisiera adquirir ${prod.name} (Oferta Web S/ ${Number(prod.price).toFixed(2)}).`)}`;
                window.open(waUrl, '_blank');
            });
        }

        return card;
    }

    // 4. Aplicar productos al DOM (Sincronización, Adición, Eliminación y Stock)
    let isApplying = false;
    function applyProductsToDOM() {
        if (isApplying) return;
        isApplying = true;
        try {
            const catalog = document.getElementById('catalog');
            if (!catalog) return;

            const grid = catalog.querySelector('.grid.grid-cols-1') || catalog.querySelector('[class*="grid-cols-1"]');
            if (!grid) return;

            const allCards = Array.from(grid.children);

            // A. Ocultar tarjetas que fueron borradas por el usuario
            allCards.forEach(card => {
                const h3 = card.querySelector('h3');
                if (!h3) return;
                const title = h3.textContent.trim().toLowerCase();
                const cardId = (card.dataset.productId || '').toLowerCase();

                const exists = currentProducts.some(p => {
                    const pName = p.name.toLowerCase();
                    const pId = p.id.toLowerCase();
                    return cardId === pId || title === pName || title.includes(pName) || pName.includes(title);
                });

                if (!exists) {
                    card.style.display = 'none';
                } else {
                    card.style.display = '';
                }
            });

            // B. Actualizar tarjetas existentes o crear nuevas
            currentProducts.forEach(prod => {
                let card = allCards.find(c => {
                    if (c.dataset.productId === prod.id) return true;
                    const h3 = c.querySelector('h3');
                    if (!h3) return false;
                    const txt = h3.textContent.trim().toLowerCase();
                    const pName = prod.name.toLowerCase();
                    return txt.includes(pName) || pName.includes(txt);
                });

                if (!card) {
                    card = createDynamicProductCard(prod);
                    grid.appendChild(card);
                }

                card.dataset.productId = prod.id;
                card.style.display = '';

                // Precio normal (tachado)
                const strikethroughSpan = card.querySelector('.line-through');
                if (strikethroughSpan) {
                    const newTxt = `S/ ${Number(prod.whatsappPrice).toFixed(2)}`;
                    if (strikethroughSpan.textContent !== newTxt) {
                        strikethroughSpan.textContent = newTxt;
                    }
                }

                // Precio web (destacado)
                const webPriceSpan = card.querySelector('.text-2xl.font-bold');
                if (webPriceSpan) {
                    const newWebTxt = `S/ ${Number(prod.price).toFixed(2)}`;
                    if (webPriceSpan.textContent !== newWebTxt) {
                        webPriceSpan.textContent = newWebTxt;
                    }
                }

                // Badge de descuento
                const discountBadge = card.querySelector('span[class*="text-[#25D366]"]');
                if (discountBadge) {
                    if (prod.whatsappPrice > prod.price) {
                        const pct = Math.round(((prod.whatsappPrice - prod.price) / prod.whatsappPrice) * 100);
                        discountBadge.style.display = 'inline-block';
                        discountBadge.textContent = `-${pct}% WEB`;
                    } else {
                        discountBadge.style.display = 'none';
                    }
                }

                // Gestión de Estado de Stock (Agotado vs En Stock)
                const buyButton = card.querySelector(`button[id*="buy-"]`) || card.querySelector('button');
                let agotadoOverlay = card.querySelector('.admin-agotado-overlay');

                // Detectar overlay nativo de React (que contenía "AGOTADO")
                const allDivs = Array.from(card.querySelectorAll('div'));
                const nativeAgotado = allDivs.find(d => d.textContent.trim() === 'AGOTADO' && !d.classList.contains('admin-agotado-overlay'));
                const nativeAgotadoContainer = nativeAgotado ? nativeAgotado.closest('.absolute.inset-0') : null;

                if (prod.soldOut) {
                    card.classList.add('filter', 'grayscale', 'opacity-60', 'cursor-not-allowed', 'select-none');
                    card.style.border = '1px solid rgba(239, 68, 68, 0.25)';

                    if (!agotadoOverlay) {
                        agotadoOverlay = document.createElement('div');
                        agotadoOverlay.className = 'admin-agotado-overlay absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none';
                        agotadoOverlay.innerHTML = `
                            <div style="transform: rotate(-12deg); border: 2px solid #ff3b3b; background: rgba(15,0,0,0.9); box-shadow: 0 0 25px rgba(255,59,59,0.35);" class="px-5 py-2 rounded-xl text-xs font-black tracking-widest text-[#ff3b3b] uppercase">
                                AGOTADO
                            </div>
                        `;
                        card.appendChild(agotadoOverlay);
                    } else {
                        agotadoOverlay.style.display = 'flex';
                    }

                    if (nativeAgotadoContainer) {
                        nativeAgotadoContainer.style.display = 'flex';
                    }

                    if (buyButton) {
                        buyButton.disabled = true;
                        buyButton.textContent = 'Sin Stock';
                        buyButton.classList.add('bg-neutral-900', 'border', 'border-neutral-800', 'text-neutral-500', 'cursor-not-allowed');
                        buyButton.style.boxShadow = 'none';
                        buyButton.style.background = '#1a1a1a';
                    }
                } else {
                    // EN STOCK: Eliminar cualquier vestigio de Agotado
                    card.classList.remove('filter', 'grayscale', 'opacity-60', 'cursor-not-allowed', 'select-none');
                    card.style.filter = 'none';
                    card.style.opacity = '1';
                    card.style.cursor = 'pointer';
                    card.style.border = '1px solid rgba(255, 255, 255, 0.06)';

                    // Remover overlays
                    card.querySelectorAll('.admin-agotado-overlay').forEach(el => el.remove());
                    Array.from(card.querySelectorAll('div')).forEach(d => {
                        if (d.textContent.trim() === 'AGOTADO') {
                            const wrapper = d.closest('.absolute.inset-0') || d;
                            wrapper.remove();
                        }
                    });

                    if (buyButton) {
                        buyButton.disabled = false;
                        buyButton.innerHTML = `Comprar <svg class="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
                        buyButton.classList.remove('bg-neutral-900', 'border', 'border-neutral-800', 'text-neutral-500', 'cursor-not-allowed', 'opacity-50', 'pointer-events-none');
                        buyButton.style.background = prod.color || '#4f8ef7';
                        buyButton.style.boxShadow = `0 4px 20px ${prod.color || '#4f8ef7'}35`;
                        buyButton.style.cursor = 'pointer';
                        buyButton.style.pointerEvents = 'auto';
                    }
                }
            });
        } finally {
            isApplying = false;
        }
    }

    // 5. Inyectar botón de engranaje flotante
    function injectAdminGearButton() {
        if (document.getElementById('homehub-admin-gear-btn')) return;

        if (!document.getElementById('homehub-admin-styles')) {
            const style = document.createElement('style');
            style.id = 'homehub-admin-styles';
            style.innerHTML = `
                .admin-gear-trigger {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 99998;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(10, 10, 15, 0.75);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.6), 0 0 15px rgba(79, 142, 247, 0.15);
                }
                .admin-gear-trigger:hover {
                    background: rgba(79, 142, 247, 0.25);
                    border-color: rgba(79, 142, 247, 0.5);
                    color: #4f8ef7;
                    transform: rotate(60deg) scale(1.08);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.7), 0 0 25px rgba(79, 142, 247, 0.4);
                }
                .admin-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.82);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    padding: 16px;
                }
                .admin-modal-overlay.active {
                    opacity: 1;
                    pointer-events: auto;
                }
                .admin-modal-card {
                    background: #09090d;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(79, 142, 247, 0.15);
                    width: 100%;
                    max-width: 420px;
                    padding: 32px;
                    transform: scale(0.95) translateY(10px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .admin-modal-overlay.active .admin-modal-card {
                    transform: scale(1) translateY(0);
                }
                .admin-panel-card {
                    background: #09090d;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 24px;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(79, 142, 247, 0.15);
                    width: 100%;
                    max-width: 950px;
                    max-height: 92vh;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95) translateY(10px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }
                .admin-modal-overlay.active .admin-panel-card {
                    transform: scale(1) translateY(0);
                }
                .admin-input-styled {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #fff;
                    border-radius: 12px;
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    width: 100%;
                }
                .admin-input-styled:focus {
                    outline: none;
                    border-color: #4f8ef7;
                    background: rgba(79, 142, 247, 0.08);
                }
                .admin-switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 26px;
                    flex-shrink: 0;
                }
                .admin-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .admin-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(239, 68, 68, 0.3);
                    border: 1px solid rgba(239, 68, 68, 0.6);
                    transition: .3s;
                    border-radius: 26px;
                }
                .admin-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .admin-slider {
                    background-color: rgba(37, 211, 102, 0.4);
                    border-color: #25D366;
                }
                input:checked + .admin-slider:before {
                    transform: translateX(22px);
                    background-color: #25D366;
                }
            `;
            document.head.appendChild(style);
        }

        const gearBtn = document.createElement('button');
        gearBtn.id = 'homehub-admin-gear-btn';
        gearBtn.className = 'admin-gear-trigger';
        gearBtn.title = 'Configuración y Precios Admin';
        gearBtn.setAttribute('aria-label', 'Panel de Control');
        gearBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;

        document.body.appendChild(gearBtn);
        gearBtn.addEventListener('click', handleGearClick);
    }

    function handleGearClick() {
        const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
        if (isAuth) {
            openAdminPanel();
        } else {
            openPasswordModal();
        }
    }

    // 6. Modal de Contraseña Maestra
    function openPasswordModal() {
        let modal = document.getElementById('homehub-auth-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'homehub-auth-modal';
            modal.className = 'admin-modal-overlay';
            modal.innerHTML = `
                <div class="admin-modal-card">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-[#4f8ef7]/15 border border-[#4f8ef7]/30 flex items-center justify-center text-[#4f8ef7]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-white font-bold text-base">Acceso Administrador</h3>
                                <p class="text-white/40 text-xs">HomeHub Control System</p>
                            </div>
                        </div>
                        <button id="auth-close-btn" class="text-white/40 hover:text-white p-1 text-base transition-colors">✕</button>
                    </div>

                    <form id="admin-auth-form" class="space-y-4">
                        <div>
                            <label class="block text-white/60 text-xs font-medium mb-1.5">Contraseña Maestra:</label>
                            <div class="relative">
                                <input type="password" id="admin-pass-input" placeholder="Ingresa tu clave maestra" required autofocus
                                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f8ef7] transition-all">
                                <button type="button" id="toggle-pass-visibility" class="absolute right-3 top-2.5 text-white/40 hover:text-white text-xs">👁️</button>
                            </div>
                            <p id="admin-auth-error" class="text-red-400 text-xs mt-2 hidden">❌ Contraseña incorrecta. Inténtalo de nuevo.</p>
                        </div>

                        <button type="submit" id="admin-auth-submit"
                            class="w-full py-2.5 rounded-xl bg-[#4f8ef7] hover:bg-[#3d7bd4] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#4f8ef7]/20">
                            Ingresar al Panel
                        </button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('auth-close-btn').addEventListener('click', () => modal.classList.remove('active'));

            const passInput = document.getElementById('admin-pass-input');
            const toggleBtn = document.getElementById('toggle-pass-visibility');
            toggleBtn.addEventListener('click', () => {
                passInput.type = passInput.type === 'password' ? 'text' : 'password';
            });

            document.getElementById('admin-auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const pass = passInput.value.trim();
                const errorMsg = document.getElementById('admin-auth-error');

                if (pass === ADMIN_PASSWORD) {
                    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
                    modal.classList.remove('active');
                    passInput.value = '';
                    errorMsg.classList.add('hidden');
                    openAdminPanel();
                } else {
                    errorMsg.classList.remove('hidden');
                    passInput.classList.add('border-red-500');
                    setTimeout(() => passInput.classList.remove('border-red-500'), 1500);
                }
            });
        }

        modal.classList.add('active');
        setTimeout(() => document.getElementById('admin-pass-input')?.focus(), 150);
    }

    // 7. Panel de Administración Completo (Gestor de Precios, Stock, Adición y Eliminación)
    function openAdminPanel() {
        let panelModal = document.getElementById('homehub-admin-panel-modal');
        if (!panelModal) {
            panelModal = document.createElement('div');
            panelModal.id = 'homehub-admin-panel-modal';
            panelModal.className = 'admin-modal-overlay';
            panelModal.innerHTML = `
                <div class="admin-panel-card">
                    <!-- Header -->
                    <div class="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-[#4f8ef7]/15 border border-[#4f8ef7]/30 flex items-center justify-center text-[#4f8ef7]">
                                ⚙️
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-white font-bold text-lg tracking-tight">Gestor de Precios y Stock</h2>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30">Sesión Activa</span>
                                </div>
                                <p class="text-white/40 text-xs mt-0.5">Modifica precios, stock y gestiona plataformas activas en tu web</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="admin-toggle-add-btn" class="px-3.5 py-1.5 rounded-xl bg-[#4f8ef7]/15 hover:bg-[#4f8ef7]/25 text-[#4f8ef7] text-xs font-bold border border-[#4f8ef7]/35 transition-all flex items-center gap-1.5 shadow-sm">
                                ➕ Nueva Plataforma
                            </button>
                            <button id="admin-logout-btn" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 text-xs border border-white/10 transition-all" title="Cerrar sesión">
                                Salir
                            </button>
                            <button id="admin-panel-close" class="text-white/40 hover:text-white p-2 text-base transition-colors">✕</button>
                        </div>
                    </div>

                    <!-- Formulario Desplegable para Agregar Plataforma -->
                    <div id="admin-add-form-container" class="hidden p-5 border-b border-white/10 bg-[#0c0c14]/90">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-white font-bold text-sm flex items-center gap-2">
                                <span class="text-[#4f8ef7]">✨</span> Agregar Nueva Plataforma al Catálogo
                            </h3>
                            <button id="admin-add-form-close" class="text-white/40 hover:text-white text-xs">Cerrar ✕</button>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label class="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Nombre del Servicio</label>
                                <input type="text" id="new-prod-name" placeholder="Ej: IPTV MagisTV" class="admin-input-styled">
                            </div>
                            <div>
                                <label class="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Categoría</label>
                                <select id="new-prod-cat" class="admin-input-styled bg-[#14141c] text-white">
                                    <option value="streaming">Streaming</option>
                                    <option value="música">Música</option>
                                    <option value="ia">IA</option>
                                    <option value="tools">Tools</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Precio Normal (Tachado)</label>
                                <div class="flex items-center gap-1">
                                    <span class="text-white/40 text-xs font-mono">S/</span>
                                    <input type="number" step="0.5" id="new-prod-waprice" placeholder="15.00" class="admin-input-styled">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] text-[#4f8ef7] mb-1 uppercase font-semibold">Precio Web (Oferta)</label>
                                <div class="flex items-center gap-1">
                                    <span class="text-white/40 text-xs font-mono">S/</span>
                                    <input type="number" step="0.5" id="new-prod-price" placeholder="10.00" class="admin-input-styled border-[#4f8ef7]/40 bg-[#4f8ef7]/5 text-[#4f8ef7]">
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                            <div class="sm:col-span-2">
                                <label class="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Descripción Corta</label>
                                <input type="text" id="new-prod-desc" placeholder="Ej: Más de 1000 canales en vivo Full HD y series exclusivas." class="admin-input-styled">
                            </div>
                            <div>
                                <label class="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Color de Marca</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" id="new-prod-color" value="#4f8ef7" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0">
                                    <div class="flex items-center gap-1">
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#E50914]" onclick="document.getElementById('new-prod-color').value='#E50914'"></button>
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#1130CC]" onclick="document.getElementById('new-prod-color').value='#1130CC'"></button>
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#6A0DAD]" onclick="document.getElementById('new-prod-color').value='#6A0DAD'"></button>
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#1DB954]" onclick="document.getElementById('new-prod-color').value='#1DB954'"></button>
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#FF0000]" onclick="document.getElementById('new-prod-color').value='#FF0000'"></button>
                                        <button type="button" class="w-5 h-5 rounded-full bg-[#FF6B00]" onclick="document.getElementById('new-prod-color').value='#FF6B00'"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                            <button id="admin-cancel-add-btn" class="px-3.5 py-1.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-medium">Cancelar</button>
                            <button id="admin-confirm-add-btn" class="px-5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-bold shadow-md shadow-[#25D366]/20">Añadir a la Web</button>
                        </div>
                    </div>

                    <!-- Products Table / List -->
                    <div class="p-5 overflow-y-auto flex-1 space-y-3" id="admin-products-list"></div>

                    <!-- Footer / Actions -->
                    <div class="p-5 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-2">
                            <button id="admin-reset-defaults" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium border border-white/10 transition-all">
                                🔄 Restaurar Precios de Fábrica
                            </button>
                            <span id="admin-save-status" class="text-xs text-green-400 opacity-0 transition-opacity">✅ ¡Cambios guardados con éxito!</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="admin-cancel-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-all">
                                Cancelar
                            </button>
                            <button id="admin-save-btn" class="px-6 py-2.5 rounded-xl bg-[#4f8ef7] hover:bg-[#3d7bd4] text-white text-xs font-bold tracking-wide shadow-lg shadow-[#4f8ef7]/25 transition-all">
                                💾 Guardar y Aplicar a la Web
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(panelModal);

            document.getElementById('admin-panel-close').addEventListener('click', () => panelModal.classList.remove('active'));
            document.getElementById('admin-cancel-btn').addEventListener('click', () => panelModal.classList.remove('active'));

            document.getElementById('admin-logout-btn').addEventListener('click', () => {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
                panelModal.classList.remove('active');
            });

            // Toggle formulario de agregar
            const addFormContainer = document.getElementById('admin-add-form-container');
            document.getElementById('admin-toggle-add-btn').addEventListener('click', () => {
                addFormContainer.classList.toggle('hidden');
                if (!addFormContainer.classList.contains('hidden')) {
                    document.getElementById('new-prod-name')?.focus();
                }
            });
            document.getElementById('admin-add-form-close').addEventListener('click', () => addFormContainer.classList.add('hidden'));
            document.getElementById('admin-cancel-add-btn').addEventListener('click', () => addFormContainer.classList.add('hidden'));

            // Confirmar adición de producto
            document.getElementById('admin-confirm-add-btn').addEventListener('click', () => {
                const name = document.getElementById('new-prod-name').value.trim();
                const cat = document.getElementById('new-prod-cat').value;
                const waPrice = parseFloat(document.getElementById('new-prod-waprice').value) || 0;
                const price = parseFloat(document.getElementById('new-prod-price').value) || 0;
                const desc = document.getElementById('new-prod-desc').value.trim();
                const color = document.getElementById('new-prod-color').value || '#4f8ef7';

                if (!name || price <= 0) {
                    alert('Por favor ingresa un nombre y un precio web válido.');
                    return;
                }

                const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4);
                const newProduct = {
                    id: newId,
                    name: name,
                    category: cat,
                    whatsappPrice: waPrice > 0 ? waPrice : price,
                    price: price,
                    description: desc || 'Acceso Premium con activación inmediata y soporte garantizado.',
                    color: color,
                    soldOut: false
                };

                currentProducts.push(newProduct);
                saveProducts(currentProducts);
                renderAdminProductsList();
                showSaveStatus(`¡${name} añadido con éxito!`);

                // Limpiar campos
                document.getElementById('new-prod-name').value = '';
                document.getElementById('new-prod-waprice').value = '';
                document.getElementById('new-prod-price').value = '';
                document.getElementById('new-prod-desc').value = '';
                addFormContainer.classList.add('hidden');
            });

            document.getElementById('admin-reset-defaults').addEventListener('click', () => {
                if (confirm('¿Deseas restaurar todos los productos, precios y stocks originales?')) {
                    saveProducts(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
                    renderAdminProductsList();
                    showSaveStatus('Valores originales restaurados.');
                }
            });

            document.getElementById('admin-save-btn').addEventListener('click', () => {
                const updated = currentProducts.map(prod => {
                    const priceInput = document.getElementById(`input-price-${prod.id}`);
                    const waInput = document.getElementById(`input-wa-${prod.id}`);
                    const stockInput = document.getElementById(`switch-stock-${prod.id}`);

                    return {
                        ...prod,
                        price: priceInput ? parseFloat(priceInput.value) || prod.price : prod.price,
                        whatsappPrice: waInput ? parseFloat(waInput.value) || prod.whatsappPrice : prod.whatsappPrice,
                        soldOut: stockInput ? !stockInput.checked : prod.soldOut
                    };
                });

                saveProducts(updated);
                showSaveStatus('¡Cambios guardados y aplicados a la web!');
                setTimeout(() => panelModal.classList.remove('active'), 900);
            });
        }

        renderAdminProductsList();
        panelModal.classList.add('active');
    }

    function showSaveStatus(msg) {
        const el = document.getElementById('admin-save-status');
        if (!el) return;
        el.innerText = msg;
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; }, 3000);
    }

    // 8. Renderizar filas en el Panel Admin
    function renderAdminProductsList() {
        const list = document.getElementById('admin-products-list');
        if (!list) return;

        if (currentProducts.length === 0) {
            list.innerHTML = `<div class="p-8 text-center text-white/40 text-sm">No hay plataformas en la lista. ¡Haz clic en "➕ Nueva Plataforma" para añadir una!</div>`;
            return;
        }

        list.innerHTML = currentProducts.map((prod, idx) => {
            const isStock = !prod.soldOut;
            const pct = prod.whatsappPrice > prod.price 
                ? Math.round(((prod.whatsappPrice - prod.price) / prod.whatsappPrice) * 100) 
                : 0;

            return `
                <div class="p-3.5 rounded-2xl bg-white/[0.025] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <!-- Info Plataforma -->
                    <div class="flex items-center gap-3 min-w-[200px]">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style="background: ${prod.color}25; color: ${prod.color}; border: 1px solid ${prod.color}40;">
                            ${idx + 1}
                        </div>
                        <div>
                            <h4 class="text-white font-semibold text-sm leading-tight">${prod.name}</h4>
                            <span class="text-white/40 text-[11px] uppercase tracking-wider font-mono">${prod.category || 'streaming'}</span>
                        </div>
                    </div>

                    <!-- Campos de Precios -->
                    <div class="grid grid-cols-2 sm:flex sm:items-center gap-3">
                        <div>
                            <label class="block text-[10px] text-white/50 font-medium mb-1 uppercase tracking-wide">Precio Normal (Tachado)</label>
                            <div class="flex items-center gap-1.5">
                                <span class="text-white/40 text-xs font-mono">S/</span>
                                <input type="number" step="0.5" min="0" id="input-wa-${prod.id}" value="${prod.whatsappPrice}" 
                                    class="admin-input-styled w-24 text-center">
                            </div>
                        </div>

                        <div>
                            <label class="block text-[10px] text-[#4f8ef7] font-semibold mb-1 uppercase tracking-wide">Precio Web (Oferta)</label>
                            <div class="flex items-center gap-1.5">
                                <span class="text-white/40 text-xs font-mono">S/</span>
                                <input type="number" step="0.5" min="0" id="input-price-${prod.id}" value="${prod.price}" 
                                    class="admin-input-styled w-24 text-center text-[#4f8ef7] border-[#4f8ef7]/40 bg-[#4f8ef7]/5">
                            </div>
                        </div>

                        <div class="hidden sm:flex flex-col items-center justify-center min-w-[65px] pt-3">
                            <span class="text-[10px] text-[#25D366] font-bold bg-[#25D366]/10 px-2 py-0.5 rounded-md border border-[#25D366]/20">
                                -${pct}%
                            </span>
                        </div>
                    </div>

                    <!-- Switch de Stock y Botón Eliminar -->
                    <div class="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 min-w-[190px]">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold ${isStock ? 'text-[#25D366]' : 'text-red-400'}">
                                ${isStock ? '🟢 En Stock' : '🔴 Agotado'}
                            </span>
                            <label class="admin-switch">
                                <input type="checkbox" id="switch-stock-${prod.id}" ${isStock ? 'checked' : ''} onchange="
                                    this.parentElement.previousElementSibling.textContent = this.checked ? '🟢 En Stock' : '🔴 Agotado';
                                    this.parentElement.previousElementSibling.className = 'text-xs font-semibold ' + (this.checked ? 'text-[#25D366]' : 'text-red-400');
                                ">
                                <span class="admin-slider"></span>
                            </label>
                        </div>
                        <button class="admin-del-btn p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all text-xs" 
                            data-del-id="${prod.id}" title="Eliminar ${prod.name} del catálogo">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Adjuntar eventos de eliminación
        list.querySelectorAll('.admin-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delId = btn.dataset.delId;
                const targetProd = currentProducts.find(p => p.id === delId);
                const pName = targetProd ? targetProd.name : delId;

                if (confirm(`¿Estás seguro de eliminar "${pName}" de la tienda y del catálogo?`)) {
                    currentProducts = currentProducts.filter(p => p.id !== delId);
                    saveProducts(currentProducts);
                    renderAdminProductsList();
                    showSaveStatus(`"${pName}" ha sido eliminado.`);
                }
            });
        });
    }

    // 9. Inicialización segura tras hidratación de React
    let isInitialized = false;
    function safeInit() {
        if (isInitialized) return;
        isInitialized = true;

        injectAdminGearButton();
        loadProducts();

        setInterval(injectAdminGearButton, 2000);

        const catalog = document.getElementById('catalog');
        if (catalog) {
            catalog.addEventListener('click', (e) => {
                if (e.target.closest('button')) {
                    setTimeout(applyProductsToDOM, 60);
                    setTimeout(applyProductsToDOM, 300);
                }
            });

            let debounceTimer = null;
            const observer = new MutationObserver(() => {
                if (isApplying) return;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    applyProductsToDOM();
                }, 200);
            });
            observer.observe(catalog, { childList: true });
        }

        setTimeout(applyProductsToDOM, 500);
        setTimeout(applyProductsToDOM, 1500);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(safeInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(safeInit, 400));
        window.addEventListener('load', () => setTimeout(safeInit, 400));
    }
})();
