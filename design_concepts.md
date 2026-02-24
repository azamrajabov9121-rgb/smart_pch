# Dizayn Konsepsiyalari (Design Concepts)

Quyida "Mehnat Muhofazasi" tizimi uchun 3 xil turlicha zamonaviy dizayn yo'nalishlarini ko'rishingiz mumkin. Bu ko'rinishlarni biz tizimga to'liq integratsiya qila olamiz.

````carousel
<!-- slide 1: Cyber-Tech -->
<div style="background: #0f172a; padding: 40px; border-radius: 20px; font-family: 'Segoe UI', sans-serif; color: white; border: 1px solid #06b6d4;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="margin: 0; color: #06b6d4; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 10px #06b6d4;">Cyber-Tech Mode</h2>
        <div style="background: rgba(6, 182, 212, 0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid #06b6d4; font-size: 0.8rem; color: #06b6d4; animation: neonPulse 2s infinite;">LIVE DATA</div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: rgba(30, 41, 59, 0.5); padding: 20px; border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.2); backdrop-filter: blur(10px);">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 10px;">SIGNATURE COMPLETION</div>
            <div style="font-size: 2.5rem; font-weight: 900; color: #06b6d4;">87.4%</div>
            <div style="width: 100%; height: 4px; background: #334155; margin-top: 15px; border-radius: 2px;">
                <div style="width: 87%; height: 100%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></div>
            </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); padding: 20px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 10px;">ACTIVE WORKERS</div>
            <div style="font-size: 2.5rem; font-weight: 900; color: #f59e0b;">1,248</div>
            <div style="font-size: 0.8rem; color: #2ecc71; margin-top: 10px;">+12.5% from yesterday</div>
        </div>
    </div>
    
    <div style="margin-top: 30px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px dashed rgba(6, 182, 212, 0.3);">
        <code style="color: #06b6d4; font-size: 0.8rem;">[SYSTEM_LOG]: Signature verified for User_092<br>[SYSTEM_LOG]: GPS Coordinates Logged: 40.7128° N</code>
    </div>
</div>

<style>
@keyframes neonPulse { 0% { opacity: 0.5; box-shadow: 0 0 5px #06b6d4; } 50% { opacity: 1; box-shadow: 0 0 20px #06b6d4; } 100% { opacity: 0.5; box-shadow: 0 0 5px #06b6d4; } }
</style>

<!-- slide 2: Minimalist Professional -->
<div style="background: #f8fafc; padding: 40px; border-radius: 20px; font-family: 'Inter', system-ui, sans-serif; color: #1e293b;">
    <div style="margin-bottom: 30px;">
        <h2 style="margin: 0; font-weight: 700; font-size: 1.8rem; color: #0f172a;">Professional Care</h2>
        <p style="margin: 5px 0 0 0; color: #64748b;">Safety monitoring for modern enterprises</p>
    </div>
    
    <div style="display: flex; gap: 20px;">
        <div style="background: white; flex: 1; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: #ecfdf5; color: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <i class="fas fa-check"></i>
            </div>
            <div style="font-size: 1.5rem; font-weight: 700;">852</div>
            <div style="font-size: 0.85rem; color: #64748b;">Signed Today</div>
        </div>
        <div style="background: white; flex: 1; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: #fff1f2; color: #f43f5e; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <i class="fas fa-clock"></i>
            </div>
            <div style="font-size: 1.5rem; font-weight: 700;">48</div>
            <div style="font-size: 0.85rem; color: #64748b;">Pending Approval</div>
        </div>
    </div>
    
    <div style="margin-top: 30px; display: flex; align-items: center; gap: 15px; padding: 15px; background: #f1f5f9; border-radius: 12px;">
        <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
        <div style="font-size: 0.9rem; color: #475569;">Next inspection scheduled for <strong>Tomorrow at 09:00</strong></div>
    </div>
</div>

<!-- slide 3: Industrial Rugged -->
<div style="background: #171717; padding: 40px; border-radius: 20px; font-family: 'Roboto Condensed', sans-serif; color: white;">
    <div style="height: 10px; background: repeating-linear-gradient(45deg, #facc15, #facc15 10px, #000 10px, #000 20px); border-radius: 5px 5px 0 0; margin-bottom: 20px;"></div>
    
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <div>
            <h2 style="margin: 0; font-size: 2.5rem; font-weight: 900; line-height: 1;">SAFETY FIRST</h2>
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <div style="width: 5px; height: 5px; background: #ef4444;"></div>
                <div style="width: 5px; height: 5px; background: #ef4444;"></div>
                <div style="width: 5px; height: 5px; background: #ef4444;"></div>
            </div>
        </div>
        <div style="text-align: right;">
            <div style="color: #ef4444; font-weight: 900; font-size: 1.2rem;">CRITICAL STATUS</div>
            <div style="color: #666; font-size: 0.8rem;">ZONE-B RECRUITMENT</div>
        </div>
    </div>
    
    <div style="background: #262626; padding: 25px; border-radius: 4px; border-left: 10px solid #facc15;">
        <div style="display: flex; align-items: baseline; gap: 15px;">
            <span style="font-size: 4rem; font-weight: 900; color: white; line-height: 1;">12</span>
            <span style="font-size: 1.5rem; font-weight: 400; color: #a3a3a3;">DAYS WITHOUT INCIDENT</span>
        </div>
    </div>
    
    <div style="margin-top: 25px; grid-template-columns: 1fr 1fr; display: grid; gap: 10px;">
        <div style="background: #ef4444; color: white; padding: 15px; font-weight: 900; text-align: center; border-radius: 4px;">EMERGENCY LOG</div>
        <div style="background: #404040; color: white; padding: 15px; font-weight: 900; text-align: center; border-radius: 4px;">EQUIPMENT CHECK</div>
    </div>
</div>
````

### Qaysi biri ma'qul?
Sizga ushbu yo'nalishlardan biri yoqqan bo'lsa, ayting, biz hozirgi "Mehnat Muhofazasi" bo'limini aynan shu stilda to'liq o'zgartira olamiz. Masalan, hozir bizda **Minimalist + Modern** stili qo'llanilgan.
