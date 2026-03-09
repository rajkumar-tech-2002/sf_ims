import React from 'react';

const CashBookPrint = ({ data, filters, summary }) => {
    return (
        <div id="report-print-area" className="hidden print:block bg-white text-black p-4 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    #report-print-area, #report-print-area * { visibility: visible; }
                    #report-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black !important; padding: 4px; font-size: 10px; }
                    .header-box { border: 1px solid #ccc; background-color: #f0f0f0; padding: 8px; text-align: center; margin-bottom: 20px; }
                    .report-title { font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 12px; }
                }
            `}} />

            {/* Header Box based on StockReportPrint */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-4">
                <h1 className="text-sm font-bold text-rose-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-rose-800 uppercase">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4 uppercase">
                {filters.type.toUpperCase()} CASH BOOK TRANSACTION REPORT
                <div className="text-[9px] font-normal mt-1 italic">
                    Period: {new Date(filters.fromDate).toLocaleDateString('en-GB')} to {new Date(filters.toDate).toLocaleDateString('en-GB')}
                </div>
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-8">SNO</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-24">DATE</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left">PARTICULARS</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-24">INCOME</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-24">EXPENSE</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-28">BALANCE</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => {
                        const currentDateStr = new Date(row.trans_date).toLocaleDateString('en-GB');
                        const previousDateStr = idx > 0 ? new Date(data[idx - 1].trans_date).toLocaleDateString('en-GB') : null;
                        const isFirstOfDate = currentDateStr !== previousDateStr;

                        return (
                            <tr key={idx} className="border-b border-black">
                                <td className="border border-black p-1 text-[10px] text-center">{idx + 1}</td>
                                <td className="border border-black p-1 text-[10px] text-center font-bold">
                                    {isFirstOfDate ? currentDateStr : ''}
                                </td>
                                <td className="border border-black p-1 text-[10px] uppercase font-medium">
                                    <div className="flex flex-col">
                                        <span>{row.type_name}</span>
                                        <span className="text-[8px] italic text-slate-500 lowercase">
                                            {row.source === 'INVOICE' ? 'sales revenue' : 'ledger entry'}
                                        </span>
                                    </div>
                                </td>
                                <td className="border border-black p-1 text-[10px] text-right">
                                    {Number(row.income) > 0 ? Number(row.income).toFixed(2) : '0.00'}
                                </td>
                                <td className="border border-black p-1 text-[10px] text-right">
                                    {Number(row.expense) > 0 ? Number(row.expense).toFixed(2) : '0.00'}
                                </td>
                                <td className="border border-black p-1 text-[10px] text-right font-bold">
                                    {Number(row.balance).toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                    {/* Totals Row */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-black">
                        <td colSpan="3" className="border border-black p-2 text-right uppercase text-[10px] text-rose-900">Total Summary</td>
                        <td className="border border-black p-2 text-right text-[10px]">
                            {Number(summary.totalIncome).toFixed(2)}
                        </td>
                        <td className="border border-black p-2 text-right text-[10px]">
                            {Number(summary.totalExpense).toFixed(2)}
                        </td>
                        <td className="border border-black p-2 text-right text-[10px] font-black">
                            {Number(summary.netBalance).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default CashBookPrint;
