/**
 * Centralized Report Generator Utility
 * Generates a premium, printable HTML report in a new tab.
 */

export const generateReport = ({ title, reportName, orientation, columns, data, summaryFields = [] }) => {
    const reportWindow = window.open("", "_blank");

    // Process columns for display
    const headerRow = columns.map(col => `<th>${col.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('');

    // Process rows
    const bodyRows = data.map(row => `
        <tr>
            ${columns.map(col => {
        let value = row[col];
        // Handle nested objects (like student.name)
        if (col.includes('.')) {
            const keys = col.split('.');
            value = keys.reduce((o, i) => (o ? o[i] : "-"), row);
        }

        // Format money
        if (typeof value === 'number' && (col.toLowerCase().includes('price') || col.toLowerCase().includes('amount'))) {
            value = `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        }

        // Handle status color coding
        if (col === 'status') {
            const colorClass = value === 'Returned' || value === 'Paid' ? '#10b981' : '#ef4444';
            return `<td style="color: ${colorClass}; font-weight: 700;">${value || "-"}</td>`;
        }

        return `<td>${value || "-"}</td>`;
    }).join('')}
        </tr>
    `).join('');

    // Summary calculation
    let summaryHtml = "";
    if (summaryFields.length > 0) {
        summaryHtml = `
            <div class="summary-box">
                ${summaryFields.map(field => `
                    <span class="summary-label">${field.label}:</span>
                    <span class="summary-value">${field.value}</span>
                `).join('')}
            </div>
        `;
    }

    const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - ${reportName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @media print { @page { size: ${orientation.toLowerCase()}; margin: 1.5cm; } }
                body { font-family: 'Inter', system-ui, sans-serif; padding: 100px 60px 60px 60px; color: #1a1a1a; line-height: 1.5; background: #fdfdfd; }
                .controls { position: fixed; top: 30px; right: 30px; display: flex; gap: 12px; z-index: 1000; }
                .btn { border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }
                .btn-print { background: #800000; color: white; box-shadow: 0 4px 15px rgba(128,0,0,0.25); }
                .btn-print:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(128,0,0,0.35); }
                .btn-close { background: white; color: #444; border: 1px solid #ddd; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .btn-close:hover { background: #f8f8f8; color: #000; }
                
                .report-container { background: white; max-width: 1200px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border-radius: 8px; padding: 60px; min-height: 80vh; display: flex; flex-direction: column; }
                
                .header { position: relative; margin-bottom: 50px; }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 25px; }
                .header-title-area { flex: 1; }
                .header h1 { font-size: 32px; font-weight: 800; color: #800000; margin: 0; letter-spacing: -0.025em; text-transform: uppercase; }
                .header h2 { font-size: 16px; font-weight: 600; color: #666; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 1.5px; }
                
                .header-info-bar { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 15px; font-size: 11px; font-weight: 700; color: #999; border-top: 1px solid #f0f0f0; text-transform: uppercase; letter-spacing: 1px; }
                .header-info-item b { color: #1a1a1a; margin-left: 4px; }
                
                table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; font-size: 11px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
                th { background: #f9fafb; color: #374151; font-weight: 700; text-align: left; padding: 14px 16px; border-bottom: 2.5px solid #800000; text-transform: uppercase; letter-spacing: 0.5px; }
                td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-weight: 600; }
                tr:last-child td { border-bottom: none; }
                tr:nth-child(even) { background: #fafafa; }
                
                .summary-box { margin-left: auto; width: fit-content; min-width: 320px; margin-top: auto; padding: 25px; background: #fff; border: 2px solid #f3f4f6; border-radius: 16px; display: grid; grid-template-columns: 1fr auto; gap: 15px; margin-top: 40px; }
                .summary-label { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
                .summary-value { font-size: 14px; font-weight: 800; color: #1a1a1a; text-align: right; }
                .summary-total { border-top: 1px dashed #ddd; margin-top: 10px; padding-top: 15px; grid-column: span 2; display: flex; justify-content: space-between; align-items: baseline; }
                .summary-total .summary-value { color: #800000; font-size: 18px; }

                .footer-note { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #eee; padding-top: 25px; }

                @media print { 
                    .controls { display: none !important; }
                    body { padding: 0 !important; background: white !important; }
                    .report-container { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; min-height: auto !important; }
                    th { border-bottom-width: 3px !important; }
                }
            </style>
        </head>
        <body>
            <div class="controls">
                <button class="btn btn-close" onclick="window.close()">Close (Esc)</button>
                <button class="btn btn-print" onclick="window.print()">Print Report</button>
            </div>

            <div class="report-container">
                <div class="header">
                    <div class="header-top">
                        <div class="header-title-area">
                            <h1>Central Library Information System</h1>
                            <h2>${reportName}</h2>
                        </div>
                    </div>
                    <div class="header-info-bar">
                        <div class="header-info-item">Extraction Date: <b>${new Date().toLocaleDateString()}</b></div>
                        <div class="header-info-item">Layout: <b>${orientation}</b></div>
                        <div class="header-info-item">Total Row Count: <b>${data.length}</b></div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>${headerRow}</tr>
                    </thead>
                    <tbody>
                        ${bodyRows}
                    </tbody>
                </table>

                ${summaryHtml}

                <div class="footer-note">
                    Official automated report from LMS Database • System Integrity Verified • ${new Date().toLocaleString()}
                </div>
            </div>

            <script>
                window.onkeydown = function(e) {
                    if (e.key === "Escape") window.close();
                };
            </script>
        </body>
        </html>
    `;

    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
};
