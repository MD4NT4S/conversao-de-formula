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
        <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-4 py-8">

            {/* Header Centered */}
            <div className="text-center space-y-6 flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-bold text-[#191A23] leading-tight tracking-tight">
                    Excel to <br />
                    <span className="bg-[#B9FF66] px-4 py-1 rounded-[10px] inline-block transform -rotate-2 border-2 border-black shadow-[4px_4px_0px_0px_#000]">Algebra</span>
                </h1>
                <p className="text-[#191A23] text-lg font-medium max-w-md mx-auto">
                    Converta planilhas em matemática pura.
                </p>

                <button
                    onClick={() => window.open('https://github.com/MD4NT4S/conversao-de-formula', '_blank')}
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_#191A23] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#191A23] transition-all"
                >
                    <span className="w-2 h-2 bg-[#B9FF66] rounded-full border border-black"></span>
                    GitHub
                </button>
            </div>

            {/* Main Stack - Single Column */}
            <div className="flex flex-col gap-12">

                {/* CARD 1: INPUT */}
                <div className="bg-white border-2 border-black rounded-[30px] p-1 shadow-[8px_8px_0px_0px_#191A23] relative z-10 transition-transform hover:-translate-y-1">
                    <div className="bg-[#F3F3F3] rounded-[24px] p-6 md:p-8 border border-black/10">
                        {/* Label Badge */}
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                            <span className="bg-[#B9FF66] px-6 py-2 text-lg font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] rotate-1 inline-block">
                                1. Cole a Fórmula
                            </span>
                        </div>

                        <textarea
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            className="w-full h-32 bg-white border-2 border-black rounded-[16px] p-4 text-[#191A23] font-mono text-lg focus:outline-none focus:ring-4 focus:ring-[#B9FF66]/50 transition-all resize-none shadow-inner mt-4"
                            placeholder="=SQRT(A1^2 + B1^2)"
                        />

                        {/* Variables Inline */}
                        {detectedVariables.length > 0 && (
                            <div className="mt-6 p-4 bg-white border-2 border-black rounded-[16px] relative">
                                <span className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold rounded">VARIÁVEIS</span>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    {detectedVariables.map((v) => (
                                        <div key={v} className="flex items-center bg-[#F3F3F3] border border-black rounded-lg overflow-hidden shadow-sm">
                                            <div className="px-3 py-2 bg-black text-white font-mono text-sm border-r border-black">
                                                {v}
                                            </div>
                                            <input
                                                type="text"
                                                value={mappings[v] || ''}
                                                onChange={(e) => handleMappingChange(v, e.target.value)}
                                                className="w-24 px-3 py-2 bg-transparent outline-none font-bold text-center text-[#191A23] placeholder:font-normal"
                                                placeholder="x"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex justify-center -my-6 z-0">
                    <div className="bg-black text-[#B9FF66] p-3 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#B9FF66] z-20">
                        <Calculator className="w-8 h-8" />
                    </div>
                </div>

                {/* CARD 2: OUTPUT */}
                <div className="bg-[#191A23] border-2 border-black rounded-[30px] p-1 shadow-[8px_8px_0px_0px_#B9FF66]">
                    <div className="bg-[#191A23] rounded-[24px] p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col items-center text-center">
                        {/* Label Badge */}
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                            <span className="bg-white text-black px-6 py-2 text-lg font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#B9FF66] -rotate-1 inline-block">
                                2. Resultado
                            </span>
                        </div>

                        <div
                            className="w-full mt-6 bg-[#2C2D35] border-2 border-[#B9FF66] border-dashed rounded-[20px] p-8 min-h-[160px] flex items-center justify-center cursor-pointer hover:bg-[#2C2D35]/80 transition-all group relative"
                            onClick={copyToClipboard}
                        >
                            <div id="latex-preview" className="text-2xl sm:text-4xl text-white select-all font-serif relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[#B9FF66] font-bold bg-black/80 px-4 py-1 rounded-full backdrop-blur-sm">Copiar</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                            <Copy className="w-4 h-4 text-gray-500" />
                            <code className="text-sm font-mono text-[#B9FF66] truncate max-w-xs">{latexOutput || '...'}</code>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
