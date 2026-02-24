// Internal Marketplace Logic
// "Materiallar Birjasi" - Allows departments to exchange surplus materials.

const MARKETPLACE_KEY = 'marketplace_items';

function getMarketplaceItems() {
    return JSON.parse(localStorage.getItem(MARKETPLACE_KEY) || '[]');
}

function saveMarketplaceItems(items) {
    localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(items));
}

function openMarketplaceWindow(bolinmaId) {
    const modalId = 'marketplace-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 10020; display: flex; flex-direction: column;";

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #16a085 0%, #1abc9c 100%); padding: 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-handshake"></i> Materiallar Birjasi (Internal Marketplace)
                </h2>
                <button onclick="closeMarketplaceWindow()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            
            <div class="window-content" style="flex-grow: 1; padding: 20px; background: #ecf0f1; display: flex; flex-direction: column;">
                
                <!-- Toolbar -->
                <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="marketplace-tabs" style="display: flex; gap: 10px;">
                        <button class="mp-tab active" onclick="switchMarketplaceTab('surplus')" style="padding: 10px 20px; border: none; background: #1abc9c; color: white; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-box-open"></i> Ortiqcha Materiallar
                        </button>
                        <button class="mp-tab" onclick="switchMarketplaceTab('needed')" style="padding: 10px 20px; border: none; background: #ecf0f1; color: #7f8c8d; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-search"></i> Kerakli Materiallar
                        </button>
                        <button class="mp-tab" onclick="switchMarketplaceTab('my-posts')" style="padding: 10px 20px; border: none; background: #ecf0f1; color: #7f8c8d; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-user-tag"></i> Mening E'lonlarim
                        </button>
                    </div>
                    
                    <button onclick="openPostItemModal('${bolinmaId}')" style="background: #e67e22; color: white; border: none; padding: 10px 25px; border-radius: 30px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 10px rgba(230, 126, 34, 0.3);">
                        <i class="fas fa-plus-circle"></i> E'lon Berish
                    </button>
                </div>

                <!-- Content Area -->
                <div id="marketplace-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; overflow-y: auto; padding-bottom: 20px;">
                    <!-- Items will be loaded here -->
                </div>

            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.add('active');

    // Default load
    window.currentMarketplaceTab = 'surplus';
    window.currentMarketplaceBolinma = bolinmaId;
    loadMarketplaceItems();
}

function closeMarketplaceWindow() {
    document.getElementById('marketplace-modal')?.remove();
}

function switchMarketplaceTab(tab) {
    window.currentMarketplaceTab = tab;

    // Update Tab Styles
    document.querySelectorAll('.mp-tab').forEach(btn => {
        btn.style.background = '#ecf0f1';
        btn.style.color = '#7f8c8d';
    });

    // Find absolute index logic or just by text content matches
    // Simplified: Just re-render based on state
    const tabs = document.querySelectorAll('.mp-tab');
    if (tab === 'surplus') {
        tabs[0].style.background = '#1abc9c';
        tabs[0].style.color = 'white';
    } else if (tab === 'needed') {
        tabs[1].style.background = '#3498db';
        tabs[1].style.color = 'white';
    } else {
        tabs[2].style.background = '#9b59b6';
        tabs[2].style.color = 'white';
    }

    loadMarketplaceItems();
}

function loadMarketplaceItems() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const items = getMarketplaceItems();
    const tab = window.currentMarketplaceTab;
    const myBolinma = window.currentMarketplaceBolinma;

    let filteredItems = [];

    if (tab === 'my-posts') {
        filteredItems = items.filter(i => i.bolinmaId === myBolinma);
    } else if (tab === 'surplus') {
        filteredItems = items.filter(i => i.type === 'surplus' && i.status === 'active');
    } else if (tab === 'needed') {
        filteredItems = items.filter(i => i.type === 'needed' && i.status === 'active');
    }

    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #95a5a6; margin-top: 50px;">
                <i class="fas fa-inbox" style="font-size: 60px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Hozircha bu bo'limda e'lonlar yo'q</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const isMine = item.bolinmaId === myBolinma;
        const color = item.type === 'surplus' ? '#1abc9c' : '#3498db';
        const icon = item.type === 'surplus' ? 'fa-arrow-up' : 'fa-arrow-down';
        const badgeText = item.type === 'surplus' ? 'ORTIQCHA' : 'KERAK';

        const card = document.createElement('div');
        card.style.cssText = `
            background: white; border-radius: 12px; padding: 20px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.05); position: relative;
            border-top: 5px solid ${color}; transition: transform 0.2s;
        `;
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <span style="background: ${color}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">
                    <i class="fas ${icon}"></i> ${badgeText}
                </span>
                <span style="color: #bdc3c7; font-size: 0.8rem;">${new Date(item.date).toLocaleDateString()}</span>
            </div>
            
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${item.materialName}</h3>
            
            <div style="display: flex; align-items: baseline; gap: 5px; margin-bottom: 15px;">
                <span style="font-size: 1.5rem; font-weight: bold; color: ${color};">${item.qty}</span>
                <span style="color: #7f8c8d;">${item.uom}</span>
            </div>
            
            <div style="border-top: 1px solid #f1f1f1; padding-top: 15px; margin-top: auto;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="width: 35px; height: 35px; background: #ecf0f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #7f8c8d;">
                        <i class="fas fa-building"></i>
                    </div>
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem; color: #34495e;">${item.bolinmaId.toUpperCase()}</div>
                        <div style="font-size: 0.8rem; color: #95a5a6;">${item.contact || 'Aloqa: Umumiy'}</div>
                    </div>
                </div>
                
                ${isMine ? `
                    <button onclick="deleteMarketplaceItem('${item.id}')" style="width: 100%; padding: 10px; border: 1px solid #e74c3c; background: white; color: #e74c3c; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-trash"></i> O'chirish
                    </button>
                ` : `
                    <button onclick="contactForExchange('${item.id}')" style="width: 100%; padding: 10px; border: none; background: ${color}; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-phone"></i> Aloqaga Chiqish
                    </button>
                `}
            </div>
        `;
        grid.appendChild(card);
    });
}

function openPostItemModal(bolinmaId) {
    const modalId = 'post-item-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10030; display: flex; justify-content: center; align-items: center;";

    modal.innerHTML = `
        <div style="background: white; width: 400px; padding: 25px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <h3 style="margin-top: 0; color: #2c3e50; text-align: center;">Yangi E'lon</h3>
            
            <label style="display: block; margin-bottom: 5px; color: #7f8c8d; font-size: 0.9rem;">E'lon Turi</label>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <label style="flex: 1; cursor: pointer;">
                    <input type="radio" name="postType" value="surplus" checked> Ortiqcha (Sotish/Almashish)
                </label>
                <label style="flex: 1; cursor: pointer;">
                    <input type="radio" name="postType" value="needed"> Kerak (Sotib olish)
                </label>
            </div>

            <label style="display: block; margin-bottom: 5px; color: #7f8c8d; font-size: 0.9rem;">Material Nomi</label>
            <input type="text" id="post-material-name" placeholder="Masalan: Sement M-400" style="width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 5px; margin-bottom: 15px;" list="material-suggestions">
            <datalist id="material-suggestions">
                <option value="Sement">
                <option value="Bo'yoq">
                <option value="Shpal (Yog'och)">
                <option value="Shpal (Beton)">
                <option value="Bolt">
                <option value="Gayka">
                <option value="Dizel Yoqilg'isi">
            </datalist>

            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px; color: #7f8c8d; font-size: 0.9rem;">Miqdori</label>
                    <input type="number" id="post-qty" placeholder="0" style="width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 5px;">
                </div>
                <div style="width: 100px;">
                    <label style="display: block; margin-bottom: 5px; color: #7f8c8d; font-size: 0.9rem;">O'lchov</label>
                    <select id="post-uom" style="width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 5px;">
                        <option value="dona">dona</option>
                        <option value="kg">kg</option>
                        <option value="tonna">tonna</option>
                        <option value="litr">litr</option>
                        <option value="metr">metr</option>
                        <option value="komplekt">komplekt</option>
                    </select>
                </div>
            </div>

            <label style="display: block; margin-bottom: 5px; color: #7f8c8d; font-size: 0.9rem;">Mas'ul Shaxs (Tel)</label>
            <input type="text" id="post-contact" placeholder="+998 90 123 45 67" style="width: 100%; padding: 10px; border: 1px solid #bdc3c7; border-radius: 5px; margin-bottom: 20px;">

            <div style="display: flex; gap: 10px;">
                <button onclick="submitPost('${bolinmaId}')" style="flex: 1; padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                    Joylashtirish
                </button>
                <button onclick="document.getElementById('post-item-modal').remove()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                    Bekor qilish
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function submitPost(bolinmaId) {
    const type = document.querySelector('input[name="postType"]:checked').value;
    const name = document.getElementById('post-material-name').value;
    const qty = document.getElementById('post-qty').value;
    const uom = document.getElementById('post-uom').value;
    const contact = document.getElementById('post-contact').value;

    if (!name || !qty) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }

    const newItem = {
        id: Date.now().toString(),
        type,
        materialName: name,
        qty,
        uom,
        contact,
        bolinmaId,
        date: new Date().toISOString(),
        status: 'active'
    };

    const items = getMarketplaceItems();
    items.push(newItem);
    saveMarketplaceItems(items);

    document.getElementById('post-item-modal').remove();
    loadMarketplaceItems();
    alert("E'lon muvaffaqiyatli joylashtirildi!");
}

function deleteMarketplaceItem(id) {
    if (!confirm("E'lonni o'chirmoqchimisiz?")) return;

    let items = getMarketplaceItems();
    items = items.filter(i => i.id !== id);
    saveMarketplaceItems(items);
    loadMarketplaceItems();
}

function contactForExchange(id) {
    const items = getMarketplaceItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    alert(`
        Bog'lanish uchun ma'lumot:
        
        Bo'linma: ${item.bolinmaId.toUpperCase()}
        Material: ${item.materialName}
        Tel: ${item.contact || 'Ko\'rsatilmagan'}
        
        Iltimos, ushbu raqamga qo'ng'iroq qilib, kelishib oling.
    `);
}

// Export
window.openMarketplaceWindow = openMarketplaceWindow;
window.closeMarketplaceWindow = closeMarketplaceWindow;
window.switchMarketplaceTab = switchMarketplaceTab;
window.loadMarketplaceItems = loadMarketplaceItems;
window.openPostItemModal = openPostItemModal;
window.submitPost = submitPost;
window.deleteMarketplaceItem = deleteMarketplaceItem;
window.contactForExchange = contactForExchange;
