const XLSX = require('xlsx');
const fs = require('fs');

try {
    const workbook = XLSX.readFile('1 brigada (2).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get range
    const range = XLSX.utils.decode_range(sheet['!ref']);
    console.log(`Dimensions: ${sheet['!ref']}`);

    // Print first 20 rows
    const data = [];
    for (let R = range.s.r; R <= Math.min(range.e.r, 20); ++R) {
        let row = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            const cell = sheet[cell_ref];
            row.push(cell ? cell.v : "");
        }
        data.push(row);
    }

    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    console.error("Error reading excel:", e.message);
}
