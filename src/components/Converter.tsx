import React, { useState, useEffect, useMemo } from 'react';
import { Copy, RefreshCw, Calculator } from 'lucide-react';
import katex from 'katex';
import { convertFormulaToLatex, tokenize } from '../utils/engine';

export const Converter: React.FC = () => {
    const [formula, setFormula] = useState<string>('=3*A1 + 5');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [latexOutput, setLatexOutput] = useState<string>('');

    // Detectar variaveis automaticamente
    const detectedVariables = useMemo(() => {
        const tokens = tokenize(formula);
        const vars = new Set<string>();

        tokens.forEach(token => {
            if (token.type === 'CELL_REF') {
                vars.add(token.value);
            }
        });

        return Array.from(vars).sort();
    }, [formula]);

    // Atualizar mappings quando novas variáveis são detectadas
    useEffect(() => {
        setMappings(prev => {
            const newMappings = { ...prev };
            let changed = false;

            detectedVariables.forEach(v => {
                if (!newMappings[v]) {
                    newMappings[v] = v; // Default
                    changed = true;
                }
            });

            return changed ? newMappings : prev;
        });
    }, [detectedVariables]);

    // Atualizar output LaTeX
    useEffect(() => {
        const latex = convertFormulaToLatex(formula, mappings);
        setLatexOutput(latex);
    }, [formula, mappings]);

    // Renderizar LaTeX no elemento DOM
    useEffect(() => {
        const container = document.getElementById('latex-preview');
        if (container && latexOutput) {
            try {
                katex.render(latexOutput, container, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                container.innerHTML = `<span class="text-red-500">Erro de renderização: ${(e as Error).message}</span>`;
            }
        } else if (container) {
            container.innerHTML = '<span class="text-gray-500 italic">Digite uma fórmula...</span>';
        }
    }, [latexOutput]);

    const handleMappingChange = (original: string, newValue: string) => {
        setMappings(prev => ({
            ...prev,
            [original]: newValue
        }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(latexOutput);
    };

    return (
        <div className="flex flex-col gap-12 w-full mx-auto max-w-6xl px-4 md:px-8">

            {/* Header / Hero Section - Positivus Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="space-y-4 max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-bold text-[#191A23] leading-tight">
                        Excel to <br />
                        <span className="bg-[#B9FF66] px-2 rounded-lg inline-block transform -rotate-1">Algebra</span>
                    </h1>
                    <p className="text-[#191A23] text-lg md:text-xl font-normal max-w-lg">
                        Transforme planilhas complexas em equações matemáticas elegantes. Simples, rápido e visual.
                    </p>
                </div>

                {/* CTA / Action Button Style */}
                <button
                    onClick={() => window.open('https://github.com/MD4NT4S/conversao-de-formula', '_blank')}
                    className="bg-[#191A23] text-white px-8 py-4 rounded-[14px] text-lg font-medium hover:bg-gray-800 transition-colors border border-black shadow-[5px_5px_0px_0px_#B9FF66] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all"
                >
                    Ver no GitHub
                </button>
            </div>

            {/* Main Grid: Neo-Brutalist Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT CARD: INPUT (Light Gray Theme) */}
                <div className="bg-[#F3F3F3] border border-black rounded-[45px] p-8 md:p-10 shadow-[8px_8px_0px_0px_#191A23] flex flex-col gap-6 relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-[#B9FF66] rounded-full blur-[40px] opacity-50" />

                    <div className="flex items-center gap-3">
                        <span className="bg-[#B9FF66] px-2 py-1 text-xl font-bold border border-black rounded shadow-[2px_2px_0px_0px_#000]">Input</span>
                        <h2 className="text-2xl font-bold">Fórmula Excel</h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <textarea
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            className="w-full h-48 bg-white border border-black rounded-[20px] p-6 text-[#191A23] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-black transition-all resize-none shadow-[4px_4px_0px_0px_#E0E0E0]"
                            placeholder="Cole sua fórmula aqui...&#10;Ex: =SQRT(A1^2 + B1^2)"
                        />

                        {/* Variables Section */}
                        {detectedVariables.length > 0 && (
                            <div className="mt-6 bg-white border border-black rounded-[20px] p-6 shadow-[4px_4px_0px_0px_#E0E0E0]">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5" /> Variáveis Detectadas
                                </h3>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {detectedVariables.map((v) => (
                                        <div key={v} className="flex items-center gap-3">
                                            <div className="bg-[#191A23] text-white px-3 py-1 rounded-md font-mono text-sm border border-black">
                                                {v}
                                            </div>
                                            <span className="text-gray-400">→</span>
                                            <input
                                                type="text"
                                                value={mappings[v] || ''}
                                                onChange={(e) => handleMappingChange(v, e.target.value)}
                                                className="flex-1 bg-[#F3F3F3] border-b-2 border-gray-300 focus:border-[#B9FF66] outline-none px-2 py-1 transition-colors font-medium"
                                                placeholder="Símbolo (Ex: x)"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT CARD: OUTPUT (Dark Theme) */}
                <div className="bg-[#191A23] border border-black rounded-[45px] p-8 md:p-10 shadow-[8px_8px_0px_0px_#191A23] flex flex-col gap-6 text-white relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10">
                        <Calculator className="w-12 h-12 text-[#B9FF66] opacity-20 transform rotate-12" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-white text-black px-2 py-1 text-xl font-bold border border-black rounded shadow-[2px_2px_0px_0px_#B9FF66]">Output</span>
                            <h2 className="text-2xl font-bold text-[#B9FF66]">Resultado</h2>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
                        >
                            <Copy className="w-4 h-4" /> Copiar
                        </button>
                    </div>

                    {/* Preview Area - "Terminal" Style */}
                    <div
                        className="flex-1 bg-[#2C2D35] border border-gray-700 rounded-[30px] p-8 flex items-center justify-center min-h-[300px] relative cursor-pointer hover:border-[#B9FF66] transition-colors group"
                        onClick={copyToClipboard}
                    >
                        <div id="latex-preview" className="text-2xl sm:text-4xl text-white select-all font-serif z-10"></div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                            <div className="bg-[#B9FF66] text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg pointer-events-none transform translate-y-12 group-hover:translate-y-0 transition-transform">
                                Clique para Copiar
                            </div>
                        </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Código LaTeX</p>
                        <code className="text-sm font-mono text-[#B9FF66] break-all">
                            {latexOutput || '...'}
                        </code>
                    </div>
                </div>

            </div>

            {/* Footer Style */}
            <div className="mt-12 flex justify-between items-center border-t-2 border-black pt-8">
                <div className="flex gap-4">
                    {['Amazon', 'Dribbble', 'HubSpot', 'Notion', 'Netflix', 'Zoom'].map((brand) => (
                        <span key={brand} className="text-gray-400 font-bold text-lg grayscale hover:grayscale-0 transition-all cursor-default">{brand}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};
