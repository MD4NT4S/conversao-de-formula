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
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-16">

            {/* Header Section */}
            <header className="text-center space-y-6">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase leading-[0.9]">
                    Excel to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9FF66] to-[#92cc4e] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] stroke-black decoration-4" style={{ WebkitTextStroke: '2px black' }}>
                        Algebra
                    </span>
                </h1>

                <p className="text-xl md:text-2xl font-medium text-gray-600 max-w-2xl mx-auto">
                    Converta suas planilhas em notação matemática profissional.
                </p>

                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => window.open('https://github.com/MD4NT4S/conversao-de-formula', '_blank')}
                        className="group relative px-8 py-3 bg-black text-white font-bold rounded-full text-lg shadow-[8px_8px_0_0_#B9FF66] border-2 border-black hover:transform hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#B9FF66] transition-all active:translate-y-1 active:shadow-none"
                    >
                        Ver Projeto no GitHub
                    </button>
                </div>
            </header>

            {/* Main Content Stack */}
            <main className="flex flex-col gap-12">

                {/* STEP 1: INPUT */}
                <section className="bg-white border-[3px] border-black rounded-[2rem] p-8 md:p-12 shadow-[12px_12px_0_0_#000] relative group hover:shadow-[16px_16px_0_0_#000] transition-shadow duration-300">

                    {/* Floating Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#B9FF66] px-6 py-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_#000] rotate-2">
                        <span className="text-xl font-bold uppercase tracking-wide text-black">1. Cole sua Fórmula</span>
                    </div>

                    <div className="mt-4 space-y-6">
                        <div className="relative">
                            <textarea
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                className="w-full h-48 bg-[#F8F9FA] border-[3px] border-gray-200 rounded-xl p-6 text-xl md:text-2xl font-mono text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-black focus:ring-4 focus:ring-[#B9FF66]/30 transition-all resize-none leading-relaxed"
                                placeholder="=SQRT(A1^2 + B1^2)"
                            />
                            <div className="absolute bottom-4 right-4 pointer-events-none opacity-50">
                                <Calculator className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Variables Detected Panel */}
                        {detectedVariables.length > 0 && (
                            <div className="bg-[#F3F4F6] rounded-xl p-6 border-2 border-dashed border-gray-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <RefreshCw className="w-5 h-5" />
                                    <h3 className="font-bold uppercase tracking-wider text-gray-500 text-sm">Variáveis Detectadas</h3>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {detectedVariables.map((v) => (
                                        <div key={v} className="flex items-center bg-white border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] overflow-hidden hover:scale-105 transition-transform">
                                            <div className="px-4 py-3 bg-black text-white font-mono font-bold text-lg">
                                                {v}
                                            </div>
                                            <div className="px-1 bg-white">
                                                <input
                                                    type="text"
                                                    value={mappings[v] || ''}
                                                    onChange={(e) => handleMappingChange(v, e.target.value)}
                                                    className="w-20 py-2 text-center text-xl font-bold text-black outline-none placeholder:text-gray-300"
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

                {/* Arrow Connector */}
                <div className="flex justify-center -my-8 z-10">
                    <div className="bg-black text-[#B9FF66] p-4 rounded-full border-[3px] border-black shadow-[6px_6px_0_0_#B9FF66]">
                        <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                {/* STEP 2: RESULT */}
                <section className="bg-[#191A23] text-white border-[3px] border-black rounded-[2rem] p-8 md:p-12 shadow-[12px_12px_0_0_#B9FF66] relative z-0 overflow-hidden">
                    {/* Floating Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_#B9FF66] -rotate-1 z-20">
                        <span className="text-xl font-bold uppercase tracking-wide text-black">2. Resultado</span>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <div
                            className="w-full bg-[#24252E] rounded-2xl p-8 md:p-12 min-h-[200px] flex items-center justify-center border-2 border-[#3F414D] hover:border-[#B9FF66] cursor-pointer transition-colors relative group"
                            onClick={copyToClipboard}
                        >
                            <div id="latex-preview" className="text-3xl md:text-5xl text-white font-serif tracking-wide z-10"></div>

                            {/* Copy Overlay */}
                            <div className="absolute inset-0 bg-[#191A23]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-2xl">
                                <span className="text-[#B9FF66] text-xl font-bold border-2 border-[#B9FF66] px-6 py-2 rounded-full shadow-[0_0_15px_rgba(185,255,102,0.5)]">
                                    Clique para Copiar
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 w-full bg-black/40 rounded-lg p-4 border border-white/10 flex justify-between items-center gap-4">
                            <code className="text-[#B9FF66] font-mono text-sm md:text-base break-all flex-1">
                                {latexOutput || '\\text{Aguardando entrada...}'}
                            </code>
                            <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors p-2">
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="text-center text-gray-500 font-medium py-12">
                <p>&copy; {new Date().getFullYear()} Excel to Algebra. Feito com matemática.</p>
            </footer>
        </div>
    );
};
