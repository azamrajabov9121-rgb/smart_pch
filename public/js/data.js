/**
 * SMART PCH - Initial Application Data
 */

window.INITIAL_DATA = {
    bolinmaData: {
        labels: ['1-Bo\'linma', '2-Bo\'linma', '3-Bo\'linma', '4-Bo\'linma', '5-Bo\'linma',
            '6-Bo\'linma', '7-Bo\'linma', '8-Bo\'linma', '9-Bo\'linma', '10-Bo\'linma'],
        datasets: [{
            label: 'Ball',
            data: [85, 92, 78, 88, 95, 82, 90, 75, 87, 80],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)',
                'rgba(255, 99, 255, 0.7)',
                'rgba(99, 255, 132, 0.7)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)',
                'rgba(255, 99, 255, 1)',
                'rgba(99, 255, 132, 1)'
            ],
            borderWidth: 2
        }]
    },

    trains: [
        { id: 1, number: 'P-001', route: 'Toshkent - Qorlitog\'', departure: '06:00', arrival: '08:30', status: 'moving', lat: 40.2, lng: 66.5 },
        { id: 2, number: 'P-002', route: 'Qorlitog\' - Buxoro', departure: '09:00', arrival: '11:30', status: 'station', lat: 39.8, lng: 65.8 },
        { id: 3, number: 'P-003', route: 'Samarqand - Qorlitog\'', departure: '12:00', arrival: '14:30', status: 'moving', lat: 39.9, lng: 66.2 },
        { id: 4, number: 'P-004', route: 'Qorlitog\' - Navoi', departure: '15:00', arrival: '17:00', status: 'waiting', lat: 40.0, lng: 65.4 },
        { id: 5, number: 'P-005', route: 'Buxoro - Toshkent', departure: '18:00', arrival: '22:30', status: 'moving', lat: 40.5, lng: 67.0 }
    ],

    workers: [
        { id: 101, name: 'Сайфиддинов С', bolinma: '1-bo\'linma', role: 'Диспетчер', lat: 39.95, lng: 65.9, color: '#e74c3c' },
        { id: 102, name: 'Мансуров А', bolinma: '2-bo\'linma', role: 'Диспетчер', lat: 40.1, lng: 66.1, color: '#3498db' },
        { id: 103, name: 'Хушваков О.', bolinma: '3-bo\'linma', role: 'Диспетчер', lat: 39.85, lng: 65.7, color: '#2ecc71' },
        { id: 104, name: 'Хайриддинов А.', bolinma: '4-bo\'linma', role: 'Диспетчер', lat: 40.05, lng: 66.3, color: '#9b59b6' },
        { id: 105, name: 'Шаропов Х.', bolinma: '5-bo\'linma', role: 'Диспетчер', lat: 39.9, lng: 65.5, color: '#f1c40f' },
        { id: 11, name: 'RAJABOV E', bolinma: '1-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 39.95, lng: 65.9, color: '#e74c3c' },
        { id: 12, name: 'RUSTAMOV A', bolinma: '2-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 40.1, lng: 66.1, color: '#3498db' },
        { id: 13, name: 'ISLOMOV S', bolinma: '3-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 39.85, lng: 65.7, color: '#2ecc71' },
        { id: 14, name: 'ATADJANOV J', bolinma: '4-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 40.05, lng: 66.3, color: '#9b59b6' },
        { id: 15, name: 'CHORIYEV Y', bolinma: '5-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 39.9, lng: 65.5, color: '#f1c40f' },
        { id: 16, name: 'ISLOMOV F.', bolinma: '6-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 40.2, lng: 66.5, color: '#e67e22' },
        { id: 17, name: 'MAMBETOV A.', bolinma: '7-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 39.75, lng: 65.3, color: '#1abc9c' },
        { id: 18, name: 'QUTIMOV R', bolinma: '8-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 40.15, lng: 66.7, color: '#34495e' },
        { id: 19, name: 'KERIMOV U.', bolinma: '9-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 39.8, lng: 65.1, color: '#95a5a6' },
        { id: 20, name: 'DAVLETOV SH.', bolinma: '10-bo\'linma', role: 'TEMIR YO\'L USTASI', lat: 40.3, lng: 66.9, color: '#7f8c8d' }
    ],

    stations: [
        { id: 1, name: 'Navbahor stansiyasi', lat: 39.9, lng: 65.8, bolinma: 1 },
        { id: 2, name: 'Yaxshilik stansiyasi', lat: 40.1, lng: 65.4, bolinma: 2 },
        { id: 3, name: 'Parvoz stansiyasi', lat: 39.77, lng: 64.42, bolinma: 3 },
        { id: 4, name: 'Qorlitog stansiyasi', lat: 39.65, lng: 66.96, bolinma: 4 },
        { id: 5, name: 'Kiyikli stansiyasi', lat: 40.12, lng: 67.84, bolinma: 5 },
        { id: 6, name: 'Xizirbobo stansiyasi', lat: 39.9, lng: 66.26, bolinma: 6 },
        { id: 7, name: 'Jayxun stansiyasi', lat: 39.95, lng: 64.68, bolinma: 7 },
        { id: 8, name: 'Dautepa stansiyasi', lat: 39.72, lng: 64.55, bolinma: 8 },
        { id: 9, name: 'Amudaryo stansiyasi', lat: 41.57, lng: 64.19, bolinma: 9 },
        { id: 10, name: 'Turon stansiyasi', lat: 40.57, lng: 65.69, bolinma: 10 }
    ],

    departments: [
        { id: 'dashboard', name: 'Bosh sahifa', icon: 'fas fa-tachometer-alt' },
        { id: 'bolinma1', name: '1-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma2', name: '2-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma3', name: '3-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma4', name: '4-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma5', name: '5-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma6', name: '6-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma7', name: '7-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma8', name: '8-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma9', name: '9-bo\'linma', icon: 'fas fa-hard-hat' },
        { id: 'bolinma10', name: '10-bo\'linma', icon: 'fas fa-hard-hat' },
    ]
};
