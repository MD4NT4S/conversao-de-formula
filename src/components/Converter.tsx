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
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Excel para Álgebra
                    </h1>
                    <p className="text-gray-400 text-sm">Transforme suas planilhas em equações profissionais.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Input & Settings */}
                <div className="space-y-6">

                    {/* Input Box */}
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Fórmula do Excel
                        </label>
                        <textarea
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Ex: =A1^2 + 2*A1 - 4"
                        />
                    </div>

                    {/* Variable Mapping */}
                    {detectedVariables.length > 0 && (
                        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Mapear Variáveis
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                    {detectedVariables.length} encontradas
                                </span>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {detectedVariables.map((v) => (
                                    <div key={v} className="flex items-center gap-3 group">
                                        <div className="w-16 h-10 flex items-center justify-center bg-gray-900/80 rounded-lg border border-gray-700 font-mono text-sm text-blue-400">
                                            {v}
                                        </div>
                                        <span className="text-gray-500">→</span>
                                        <input
                                            type="text"
                                            value={mappings[v] || ''}
                                            onChange={(e) => handleMappingChange(v, e.target.value)}
                                            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                            placeholder={`Substituto para ${v}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Preview */}
                <div className="flex flex-col h-full">
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Resultado Algébrico</h2>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20 active:scale-95 transform"
                            >
                                <Copy className="w-4 h-4" />
                                Copiar LaTeX
                            </button>
                        </div>

                        {/* LaTeX Render Container */}
                        <div className="flex-1 flex items-center justify-center bg-white rounded-xl p-8 min-h-[200px] overflow-auto shadow-inner relative group cursor-pointer transition-colors"
                            onClick={copyToClipboard}
                            title="Clique para copiar">
                            <div id="latex-preview" className="text-xl sm:text-2xl text-gray-900 select-all"></div>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 pointer-events-none">
                                Previsão (KaTeX)
                            </div>
                        </div>

                        {/* Raw Code Preview (Optional, helpful for debugging or manual copy) */}
                        <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                            <code className="text-xs text-gray-400 font-mono break-all">{latexOutput || '...'}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
