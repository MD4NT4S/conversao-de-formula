import React, { useState } from 'react';
import { FileSpreadsheet, Copy, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { parseExcelFormula } from '../utils/excelParser';

const ExcelConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleConvert = () => {
        if (!input) return;
        const latex = parseExcelFormula(input);
        setOutput(`\\begin{equation} ${latex} \\end{equation}`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* Main Converter Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <FileSpreadsheet size={24} />
                            </div>
                            <h1 className="text-2xl font-bold">Excel to LaTeX</h1>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Paste Excel Formula</label>
                                <textarea
                                    className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                                    placeholder="e.g. =SUM(A1:A10)/SQRT(B2)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleConvert}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
                            >
                                Convert to LaTeX
                            </button>
                        </div>
                    </div>

                    {output && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-neutral-300">LaTeX Output</h3>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                            <div className="bg-neutral-950 rounded-xl p-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                                {output}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Documentation */}
                <div className="space-y-6">
                    {/* Tips */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <h4 className="font-bold text-blue-400 mb-2">Did you know?</h4>
                        <p className="text-sm text-blue-200/80">
                            You can convert entire Excel ranges (e.g., A1:C5) into LaTeX tables by switching to Table Mode above.
                        </p>
                    </div>

                    {/* Reference */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Supported Functions</h3>
                        <div className="space-y-3">
                            {['SUM()', 'SQRT()', 'AVERAGE()', 'PI()'].map(fn => (
                                <div key={fn} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-neutral-800 p-2 rounded-lg -mx-2 transition-colors">
                                    <span className="font-mono text-green-400">{fn}</span>
                                    <Copy size={14} className="opacity-0 group-hover:opacity-50" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Operators</h3>
                        <div className="space-y-3">
                            {[
                                { sym: '^', name: 'Power' },
                                { sym: '/', name: 'Division' },
                                { sym: '*', name: 'Multiplication' }
                            ].map(op => (
                                <div key={op.name} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-neutral-800 p-2 rounded-lg -mx-2 transition-colors">
                                    <span className="font-mono text-purple-400">{op.sym}</span>
                                    <span className="text-neutral-500 text-xs">{op.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ExcelConverter;
