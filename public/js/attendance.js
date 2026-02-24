/**
 * SMART PCH - General Face ID Attendance Module
 * Allows scanning any worker to record their daily attendance
 */

const FaceIDAttendance = {
    /**
     * Open the attendance scanner
     */
    openScanner: async function () {
        // Reuse the Face ID modal from tnu19.js or define a fresh one
        // Since tnu19.js is already loaded, we can use its UI components

        const existing = document.getElementById('attendance-faceid-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'attendance-faceid-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #0d1117; z-index: 20000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
        `;

        modal.innerHTML = `
            <div style="position: absolute; top: 20px; right: 20px;">
                <button onclick="FaceIDAttendance.close()" style="background: rgba(248, 81, 73, 0.1); border: 1px solid #f85149; color: #f85149; padding: 10px 20px; border-radius: 20px; cursor: pointer;">
                    <i class="fas fa-times"></i> Yopish
                </button>
            </div>

            <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #238636; font-size: 2rem; letter-spacing: 4px; margin: 0;">FACE ID DAVOMAT</h2>
                <p style="color: #8b949e; margin-top: 10px;">Xodim davomatini qayd etish uchun yuzni skanerlang</p>
            </div>

            <div id="attendance-viewport" style="position: relative; width: 400px; height: 400px; border-radius: 50%; border: 4px solid #30363d; overflow: hidden; background: #000; box-shadow: 0 0 100px rgba(35, 134, 54, 0.2);">
                <video id="attendance-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); filter: grayscale(100%) brightness(1.2);"></video>
                <div id="attendance-scanner-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #238636; box-shadow: 0 0 15px #238636; z-index: 10;"></div>
                
                <div id="attendance-success-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(35, 134, 54, 0.9); display: none; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 30;">
                    <i class="fas fa-check-circle" style="font-size: 100px; margin-bottom: 20px;"></i>
                    <h2 id="attendance-worker-name" style="margin: 0;">---</h2>
                    <p style="font-weight: bold; margin-top: 10px;"> DAVOMAT QAYD ETILDI!</p>
                </div>
            </div>

            <div style="margin-top: 50px; width: 350px;">
                <div style="color: #8b949e; font-size: 0.8rem; margin-bottom: 10px; text-align: center;">Yoki xodimni ro'yxatdan tanlang (Simulyatsiya uchun):</div>
                <select id="attendance-manual-select" style="width: 100%; padding: 12px; background: #161b22; border: 1px solid #30363d; color: white; border-radius: 8px;">
                    <option value="">-- Xodimni tanlang --</option>
                </select>
                <button onclick="FaceIDAttendance.triggerManual()" style="width: 100%; margin-top: 15px; padding: 15px; background: #238636; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                    SKANERLASHNI BOSHLASH
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Populate workers for simulation
        const workers = await this.getWorkers();
        const select = document.getElementById('attendance-manual-select');
        workers.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.id || w.tabelNumber;
            opt.textContent = `${w.name} (${w.position})`;
            select.appendChild(opt);
        });

        // Start Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.stream = stream;
            document.getElementById('attendance-video').srcObject = stream;
        } catch (e) {
            console.error("Camera error:", e);
        }

        // Animate scanner line
        let pos = 0;
        let dir = 1;
        this.lineTimer = setInterval(() => {
            pos += (3 * dir);
            if (pos >= 398 || pos <= 0) dir *= -1;
            const line = document.getElementById('attendance-scanner-line');
            if (line) line.style.top = pos + "px";
        }, 15);
    },

    close: function () {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        clearInterval(this.lineTimer);
        document.getElementById('attendance-faceid-modal')?.remove();
    },

    getWorkers: async function () {
        try {
            const data = await SmartUtils.fetchAPI('/hr/employees');
            return data || [];
        } catch (e) {
            return [];
        }
    },

    triggerManual: async function () {
        const select = document.getElementById('attendance-manual-select');
        const workerId = select.value;
        if (!workerId) {
            showToast('Iltimos, xodimni tanlang', 'warning');
            return;
        }

        const workerName = select.options[select.selectedIndex].text.split('(')[0].trim();

        // Show success animation
        const overlay = document.getElementById('attendance-success-overlay');
        const nameDisplay = document.getElementById('attendance-worker-name');
        nameDisplay.innerText = workerName;
        overlay.style.display = 'flex';

        // Record attendance on server
        try {
            // --- AUTOMATIC FACE TEMPLATE CAPTURE ---
            const video = document.getElementById('attendance-video');
            const faceCanvas = document.createElement('canvas');
            faceCanvas.width = video.videoWidth;
            faceCanvas.height = video.videoHeight;
            faceCanvas.getContext('2d').drawImage(video, 0, 0);
            const faceBase64 = faceCanvas.toDataURL('image/jpeg', 0.8);

            // Update face template
            await SmartUtils.fetchAPI(`/hr/employees/${workerId}/face`, {
                method: 'PATCH',
                body: JSON.stringify({ face_template: faceBase64 })
            });
            // ----------------------------------------

            await SmartUtils.fetchAPI('/timesheet/attendance', {
                method: 'POST',
                body: JSON.stringify({
                    employee_id: workerId,
                    hours: 8
                })
            });
            showToast(`${workerName} uchun davomat qayd etildi`, 'success');
            if (typeof initHRData === 'function') await initHRData();
        } catch (e) {
            showToast('Serverga ulanishda xatolik', 'error');
        }

        // Auto close after 2 seconds
        setTimeout(() => {
            this.close();
        }, 2500);
    }
};

window.openGeneralFaceIDAttendance = () => FaceIDAttendance.openScanner();
