/**
 * SMART PCH - File Approval Module
 * Handles viewing and approving uploaded documents
 */

const FileApproval = {
    async init() {
        console.log('Initializing File Approval Module...');
        this.renderFileList();
    },

    async renderFileList() {
        const container = document.getElementById('pendingFilesContainer');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>';

        try {
            const files = await SmartUtils.fetchAPI('/files/pending');

            if (!files || files.length === 0) {
                container.innerHTML = SmartUtils.getEmptyState('Hozircha tasdiqlanishi kerak bo\'lgan fayllar yo\'q');
                return;
            }

            container.innerHTML = `
                <table class="approval-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid var(--glass-border); color: var(--primary);">
                            <th style="padding: 12px;">Fayl nomi</th>
                            <th style="padding: 12px;">Bo'lim/Modul</th>
                            <th style="padding: 12px;">Kim yuklagan</th>
                            <th style="padding: 12px;">Sana</th>
                            <th style="padding: 12px; text-align: right;">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${files.map(file => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                <td style="padding: 12px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <i class="${this.getFileIcon(file.file_type)}" style="font-size: 1.2rem; color: #00c6ff;"></i>
                                        <div>
                                            <div style="font-weight: 500;">${file.original_name}</div>
                                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${(file.file_size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px;">
                                    <span class="badge" style="background: rgba(0,198,255,0.1); color: #00c6ff; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; text-transform: uppercase;">
                                        ${file.module || file.bolinma_id}
                                    </span>
                                </td>
                                <td style="padding: 12px; font-size: 0.9rem;">${file.uploader || 'Noma\'lum'}</td>
                                <td style="padding: 12px; font-size: 0.85rem; color: rgba(255,255,255,0.6);">${new Date(file.created_at).toLocaleString('uz-UZ')}</td>
                                <td style="padding: 12px; text-align: right;">
                                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                                        <button class="action-btn" onclick="FileApproval.processFile(${file.id}, 'approved')" title="Tasdiqlash" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3);">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="action-btn" onclick="FileApproval.processFile(${file.id}, 'rejected')" title="Rad etish" style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            container.innerHTML = `<div class="error-state" style="color: #e74c3c; padding: 20px; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i> Xatolik: ${error.message}
            </div>`;
        }
    },

    async processFile(id, status) {
        if (!confirm(`Faylni ${status === 'approved' ? 'tasdiqlaysizmi' : 'rad etasizmi'}?`)) return;

        try {
            const result = await SmartUtils.fetchAPI(`/files/approve/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });

            if (result) {
                showToast(`Fayl ${status === 'approved' ? 'tasdiqlandi' : 'rad etildi'}`, 'success');
                this.renderFileList();
            }
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        }
    },

    getFileIcon(mimetype) {
        if (mimetype.includes('pdf')) return 'fas fa-file-pdf';
        if (mimetype.includes('image')) return 'fas fa-file-image';
        if (mimetype.includes('excel') || mimetype.includes('sheet')) return 'fas fa-file-excel';
        if (mimetype.includes('word') || mimetype.includes('document')) return 'fas fa-file-word';
        return 'fas fa-file-alt';
    }
};

window.FileApproval = FileApproval;
