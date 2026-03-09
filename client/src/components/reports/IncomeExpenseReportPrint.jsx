import React from 'react';

const IncomeExpenseReportPrint = ({ data, filters }) => {
    const totalIncome = data.reduce((sum, row) => sum + Number(row.income || 0), 0);
    const totalExpense = data.reduce((sum, row) => sum + Number(row.expense || 0), 0);
    const balance = totalIncome - totalExpense;

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
                    .header-box { border: 1px solid #ccc; background-color: #f0f0f0; padding: 8px; text-align: center; margin-bottom: 10px; }
                    .report-title { font-weight: bold; margin-bottom: 5px; text-align: center; font-size: 11px; }
                    .balance-row { font-weight: bold; border-top: 2px solid black; }
                }
            `}} />

            {/* Header Box */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-2 relative">
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-slate-800 uppercase">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
                <div className="absolute right-2 bottom-1 text-[10px]">Page 1 of 1</div>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4 uppercase">
                REPORT - {new Date(filters.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} To {new Date(filters.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-10">SNO</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-24">DATE</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-32">Group</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-32">HEAD</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-48">DISCRIPTION</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-20">BILL NO</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-24">INCOME</th>
                        <th className="border border-black p-1 text-[9px] text-rose-900 font-bold uppercase text-center w-24">EXPENSE</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="border border-black p-1 text-[9px] text-center">{index + 1}</td>
                            <td className="border border-black p-1 text-[9px] text-center">{new Date(row.income_expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                            <td className="border border-black p-1 text-[9px] uppercase">{row.group_name}</td>
                            <td className="border border-black p-1 text-[9px] uppercase">{row.authorization_name}</td>
                            <td className="border border-black p-1 text-[9px] uppercase italic text-slate-700">{row.details || '---'}</td>
                            <td className="border border-black p-1 text-[9px] text-center uppercase">{row.bill_no || '---'}</td>
                            <td className="border border-black p-1 text-[9px] text-right font-bold">{row.income > 0 ? Number(row.income).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</td>
                            <td className="border border-black p-1 text-[9px] text-right font-bold">{row.expense > 0 ? Number(row.expense).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="8" className="text-center py-10 text-slate-400 italic text-[10px]">No income or expense records found for the selected period</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Total Balance Area in Table Style */}
            <div className="mt-0 border-x border-b border-black p-1 flex justify-center items-center gap-2">
                <span className="text-[10px] font-bold text-rose-900 uppercase">Balance :</span>
                <span className="text-[10px] font-bold">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, style: 'currency', currency: 'INR' })}</span>
            </div>

            <div className="mt-4 border-t border-black w-full" />
        </div>
    );
};

export default IncomeExpenseReportPrint;
