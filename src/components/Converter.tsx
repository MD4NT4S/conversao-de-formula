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
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 px-4 py-8">

            {/* Header Section */}
            <header className="text-center space-y-8">
                <div className="relative inline-block">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase leading-none">
                        Excel to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9FF66] to-[#7dbf43] drop-shadow-md pb-2">
                            Algebra
                        </span>
                    </h1>
                </div>

                <p className="text-xl md:text-2xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    Converta suas planilhas em notação matemática profissional.
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={() => window.open('https://github.com/MD4NT4S/conversao-de-formula', '_blank')}
                        className="px-10 py-4 bg-black text-[#B9FF66] font-bold rounded-full text-xl hover:scale-105 transition-transform shadow-xl border-4 border-black hover:bg-[#B9FF66] hover:text-black"
                    >
                        Ver Projeto no GitHub
                    </button>
                </div>
            </header>

            {/* Main Content Stack */}
            <main className="flex flex-col gap-16">

                {/* STEP 1: INPUT */}
                <section className="bg-white border-4 border-black rounded-[2.5rem] p-8 md:p-14 shadow-[16px_16px_0_0_#000] relative overflow-visible">

                    {/* Badge Static */}
                    <div className="flex justify-center -mt-20 mb-8">
                        <span className="bg-[#B9FF66] px-8 py-3 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000] text-xl md:text-2xl font-black uppercase tracking-wider text-black rotate-1">
                            1. Cole sua Fórmula
                        </span>
                    </div>

                    <div className="space-y-8">
                        <div className="relative group">
                            <textarea
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                className="w-full h-40 bg-[#F4F4F5] border-3 border-gray-300 rounded-3xl p-6 text-xl md:text-3xl font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-[#B9FF66]/50 transition-all resize-none leading-snug shadow-inner"
                                placeholder="=SQRT(A1^2 + B1^2)"
                            />
                        </div>

                        {/* Variables Detected Panel */}
                        {detectedVariables.length > 0 && (
                            <div className="bg-[#EFEFEF] rounded-3xl p-8 border-3 border-gray-300 border-dashed">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-black p-2 rounded-lg text-white">
                                        <RefreshCw className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold uppercase tracking-widest text-gray-600 text-lg">Variáveis Detectadas</h3>
                                </div>

                                <div className="flex flex-wrap gap-6">
                                    {detectedVariables.map((v) => (
                                        <div key={v} className="flex items-center bg-white border-3 border-black rounded-xl shadow-[6px_6px_0_0_rgba(0,0,0,0.15)] overflow-hidden scale-100 hover:scale-110 transition-transform duration-200">
                                            <div className="px-5 py-4 bg-black text-[#B9FF66] font-mono font-bold text-xl border-r-3 border-black">
                                                {v}
                                            </div>
                                            <div className="px-2 bg-white">
                                                <input
                                                    type="text"
                                                    value={mappings[v] || ''}
                                                    onChange={(e) => handleMappingChange(v, e.target.value)}
                                                    className="w-24 py-3 text-center text-2xl font-bold text-black outline-none placeholder:text-gray-300"
                                                    placeholder="x"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Arrow Connector - Simplified */}
                <div className="flex justify-center -my-8 z-10">
                    <div className="bg-white text-black p-4 rounded-full border-4 border-black shadow-[8px_8px_0_0_#B9FF66]">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                {/* STEP 2: RESULT */}
                <section className="bg-black text-white border-4 border-black rounded-[2.5rem] p-8 md:p-14 shadow-[16px_16px_0_0_#B9FF66] relative overflow-visible">

                    {/* Badge Static */}
                    <div className="flex justify-center -mt-20 mb-8">
                        <span className="bg-white px-8 py-3 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#B9FF66] text-xl md:text-2xl font-black uppercase tracking-wider text-black -rotate-1">
                            2. Resultado
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {/* RESULT CONTAINER - UPDATED FOR HIGH CONTRAST */}
                        <div
                            className="w-full bg-[#1A1A1A] rounded-3xl p-10 min-h-[250px] flex items-center justify-center border-4 border-[#333] hover:border-[#B9FF66] cursor-pointer transition-all duration-300 relative group shadow-2xl"
                            onClick={copyToClipboard}
                        >
                            {/* Force white text specifically for KaTeX */}
                            <div id="latex-preview" className="text-4xl md:text-6xl text-white font-serif tracking-wide z-10 [&_.katex]:!text-white"></div>

                            {/* Copy Hint */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-[#B9FF66] text-black text-sm font-bold px-3 py-1 rounded-lg">
                                    Copiar
                                </span>
                            </div>

                            {/* Empty State Hint */}
                            {!formula && (
                                <span className="text-gray-600 font-mono text-lg">O resultado aparecerá aqui...</span>
                            )}
                        </div>

                        <div className="w-full bg-[#111] rounded-xl p-6 border border-white/20 flex justify-between items-center gap-6">
                            <code className="text-[#B9FF66] font-mono text-lg break-all flex-1 tracking-tight">
                                {latexOutput || '...'}
                            </code>
                            <button onClick={copyToClipboard} className="text-white hover:text-[#B9FF66] transition-colors p-3 bg-white/10 rounded-lg">
                                <Copy className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="text-center text-gray-500 font-bold py-16 text-lg">
                <p>&copy; {new Date().getFullYear()} Excel to Algebra</p>
            </footer>
        </div>
    );
};
