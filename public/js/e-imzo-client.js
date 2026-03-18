/**
 * E-IMZO (Uzbekistan) Client Helper
 * Provides a clean interface for integrating with e-imzo.uz services.
 */
const EImzoHelper = {
    // Current selected certificate
    selectedCert: null,

    // Check if E-IMZO Agent is installed and running
    async checkAgent() {
        return new Promise((resolve) => {
            if (typeof EIMZOClient === 'undefined') {
                resolve({ success: false, message: "E-IMZO Agent topilmadi. Iltimos, e-imzo.uz saytidan agentni yuklab oling va o'rnating." });
                return;
            }

            EIMZOClient.API_ADDR = "127.0.0.1:28282"; // Default port

            EIMZOClient.checkVersion(function (v) {
                if (v && v.major >= 3) {
                    resolve({ success: true, version: v });
                } else {
                    resolve({ success: false, message: "E-IMZO Agent versiyasi eskirgan. Yangilang." });
                }
            }, function (err) {
                resolve({ success: false, message: "E-IMZO Agent bilan bog'lanib bo'lmadi." });
            });
        });
    },

    // List certificates from the real E-IMZO Agent
    async listCertificates() {
        return new Promise((resolve, reject) => {
            if (typeof EIMZOClient === 'undefined') {
                resolve([]);
                return;
            }

            EIMZOClient.API_ADDR = "localhost:28282";

            EIMZOClient.listAllCertificates(function (certs) {
                if (!certs) return resolve([]);
                const formattedCerts = certs.map(c => ({
                    id: c.certId,
                    name: c.subjectName,
                    serial: c.serialNumber,
                    org: c.organizationName,
                    validFrom: c.validFrom,
                    validTo: c.validTo,
                    inn: c.inn,
                    raw: c
                }));
                resolve(formattedCerts);
            }, function (err) {
                console.error("E-IMZO Error:", err);
                resolve([]);
            });
        });
    },

    // Sign data using real E-IMZO Agent
    async signData(certId, dataToSign) {
        return new Promise((resolve, reject) => {
            if (typeof EIMZOClient === 'undefined') {
                reject(new Error("E-IMZO Agent topilmadi. Iltimos, e-imzo.uz saytidan agentni yuklab oling."));
                return;
            }

            EIMZOClient.createPkcs7(certId, btoa(dataToSign), null, function (sig) {
                if (sig && sig.pkcs7_64) {
                    resolve({ pkcs7: sig.pkcs7_64, status: 1 });
                } else {
                    reject(new Error("Imzo hosil qilinmadi (PKCS7 empty)"));
                }
            }, function (err) {
                reject(new Error("Imzolashda xatolik: " + (err.reason || "Noma'lum")));
            });
        });
    },

    // Show a premium modal for real E-IMZO certificate selection
    async showCertModal() {
        return new Promise(async (resolve) => {
            showToast('Sizning E-IMZO kalitlaringiz qidirilmoqda...', 'info');
            const certs = await this.listCertificates();

            if (certs.length === 0) {
                showToast('Haqiqiy E-IMZO (ERI) kaliti topilmadi. Kalitni kompyuterga ulang yoki E-IMZO Agent ishlayotganini tekshiring.', 'warning');
                // For demo/dev purpose only if absolutely necessary, but we should prioritize real ERI
            }

            let modal = document.getElementById('eimzo-selector-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'eimzo-selector-modal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(10, 20, 35, 0.95); z-index: 100001;
                    display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(15px);
                `;
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';

            let certListHtml = certs.map(c => `
                <div class="eimzo-cert-item" onclick="window.selectEImzoCert('${c.id}')" style="
                    background: rgba(255,255,255,0.03); border: 2px solid rgba(0, 198, 255, 0.2);
                    padding: 20px; border-radius: 16px; margin-bottom: 12px; cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                " onmouseover="this.style.borderColor='#00c6ff'; this.style.transform='translateY(-3px)'; this.style.background='rgba(0, 198, 255, 0.05)'" 
                   onmouseout="this.style.borderColor='rgba(0, 198, 255, 0.2)'; this.style.transform='translateY(0)'; this.style.background='rgba(255,255,255,0.03)'">
                    <div style="font-weight: 800; color: #fff; font-size: 1.1rem; letter-spacing: 0.5px;">${c.name}</div>
                    <div style="font-size: 0.85rem; color: #00c6ff; margin-top: 8px; font-weight: 600;">
                        <i class="fas fa-building" style="margin-right: 5px;"></i> ${c.org || 'O\'ZBEKISTON TEMIR YO\'LLARI'}
                    </div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 8px; display: flex; gap: 15px;">
                         <span><i class="fas fa-id-card"></i> INN: ${c.inn || '---'}</span>
                         <span><i class="fas fa-barcode"></i> SN: ${c.serial}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #2ecc71; margin-top: 10px; font-weight: bold; background: rgba(46, 204, 113, 0.1); padding: 4px 10px; border-radius: 20px; display: inline-block;">
                        <i class="fas fa-shield-check"></i> AMAL QILISH: ${new Date(c.validFrom).toLocaleDateString()} - ${new Date(c.validTo).toLocaleDateString()}
                    </div>
                    <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: rgba(0, 198, 255, 0.2); font-size: 2.5rem;">
                        <i class="fas fa-key"></i>
                    </div>
                </div>
            `).join('');

            modal.innerHTML = `
                <div class="fade-in" style="background: #0f172a; width: 600px; max-width: 95%; border-radius: 24px; border: 1px solid rgba(0, 198, 255, 0.3); padding: 30px; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                        <h2 style="color: white; margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-fingerprint" style="color: #00c6ff;"></i> E-IMZO KALITINI TANLANG
                        </h2>
                        <button onclick="document.getElementById('eimzo-selector-modal').style.display='none'" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: #e74c3c; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: 0.2s;"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div style="max-height: 450px; overflow-y: auto; padding-right: 10px;" id="certs-list-container">
                        ${certs.length > 0 ? certListHtml : `
                            <div style="text-align: center; padding: 50px 20px; background: rgba(0,0,0,0.2); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                                <i class="fas fa-key" style="font-size: 3rem; color: #475569; margin-bottom: 15px;"></i>
                                <p style="color: #94a3b8; line-height: 1.6;">ERI (Elektron Raqamli Imzo) kalitlari topilmadi.<br>Iltimos, kalitni (USB yoki File) kompyuterga ulang yoki E-IMZO Agent ishlayotganiga ishonch hosil qiling.</p>
                                <a href="https://e-imzo.uz" target="_blank" style="display: inline-block; margin-top: 15px; color: #00c6ff; text-decoration: none; font-weight: bold; border-bottom: 1px solid #00c6ff;">E-IMZO Agentni yuklab olish</a>
                            </div>
                        `}
                    </div>
                    
                    <div style="margin-top: 25px; font-size: 0.8rem; color: rgba(255,255,255,0.4); text-align: center; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px;">
                        <i class="fas fa-lock" style="color: #2ecc71; margin-right: 6px;"></i> Ushbu jarayon O'zbekiston Respublikasi qonunchiligiga muvofiq rasmiy hisoblanadi.
                    </div>
                </div>
            `;

            window.selectEImzoCert = (id) => {
                modal.style.display = 'none';
                resolve(id);
            };
        });
    }
};

window.EImzoHelper = EImzoHelper;
