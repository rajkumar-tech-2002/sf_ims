import React from 'react';

const AssetReportPrint = ({ data }) => {
    // Group by asset name to match the user's image with subtotals
    const groupedData = data.reduce((acc, current) => {
        const name = current.asset_name;
        if (!acc[name]) {
            acc[name] = [];
        }
        acc[name].push(current);
        return acc;
    }, {});

    const assetEntries = Object.entries(groupedData);

    return (
        <div className="print-only hidden print:block bg-white text-black p-4 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 4px; text-align: left; font-size: 10px; }
                    .header-box { text-align: center; margin-bottom: 20px; }
                }
            `}} />

            {/* Header section matching user style */}
            <div className="header-box text-center mb-6">
                <h1 className="text-[14px] font-bold uppercase mb-1">D.S. CHITRS TEX</h1>
                <p className="text-[10px] font-medium uppercase mb-4 tracking-tighter">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
                <div className="text-[12px] font-bold uppercase border-b-2 border-black pb-1 inline-block px-10">
                    ASSETS REPORT
                </div>
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black mb-10">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-center w-12">SNO</th>
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-center w-28">DATE</th>
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-left">NAME</th>
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-right w-24">QUANTITY</th>
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-right w-24">RATE</th>
                        <th className="border border-black p-2 text-[10px] font-bold uppercase text-right w-32">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {assetEntries.map(([name, items], groupIndex) => {
                        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                        return (
                            <React.Fragment key={name}>
                                {items.map((row, idx) => (
                                    <tr key={`${name}-${idx}`} className="border-b border-black">
                                        <td className="border border-black p-2 text-[10px] text-center">{items.length === 1 || idx === 0 ? groupIndex + 1 : ''}</td>
                                        <td className="border border-black p-2 text-[10px] text-center">
                                            {new Date(row.entry_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </td>
                                        <td className="border border-black p-2 text-[10px] uppercase">{row.asset_name}</td>
                                        <td className="border border-black p-2 text-[10px] text-right">{parseFloat(row.qty)}</td>
                                        <td className="border border-black p-2 text-[10px] text-right">{parseFloat(row.rate).toFixed(2)}</td>
                                        <td className="border border-black p-2 text-[10px] text-right">{parseFloat(row.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold border-b border-black">
                                    <td colSpan="5" className="border border-black p-2 text-[10px] text-right uppercase">TOTAL</td>
                                    <td className="border border-black p-2 text-[10px] text-right">{subtotal.toFixed(2)}</td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AssetReportPrint;
