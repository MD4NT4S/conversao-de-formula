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
        <div className="flex flex-col gap-12 w-full mx-auto">

            {/* Header Minimalista */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-serif text-gray-900 tracking-tight">
                    Formula Convert.
                </h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto font-light">
                    Simplifique suas planilhas. Converta lógica do Excel em notação matemática elegante.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Inputs */}
                <div className="space-y-8">

                    {/* Input Box Clean */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Fórmula Original
                        </label>
                        <div className="relative group">
                            <textarea
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-none p-6 text-gray-800 font-mono text-lg focus:ring-0 focus:border-gray-900 outline-none transition-all resize-none placeholder:text-gray-300"
                                placeholder="=SQRT(A1^2 + B1^2)"
                            />
                            <div className="absolute bottom-4 right-4 pointer-events-none">
                                <Calculator className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Variable Mapping Clean */}
                    {detectedVariables.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Variáveis
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {detectedVariables.map((v) => (
                                    <div key={v} className="flex items-center gap-4 group hover:bg-gray-50 p-2 transition-colors -mx-2 rounded">
                                        <div className="w-16 h-10 flex items-center justify-center bg-white border border-gray-200 font-mono text-sm text-gray-600 shadow-sm">
                                            {v}
                                        </div>
                                        <span className="text-gray-300 font-light">→</span>
                                        <input
                                            type="text"
                                            value={mappings[v] || ''}
                                            onChange={(e) => handleMappingChange(v, e.target.value)}
                                            className="flex-1 bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:italic"
                                            placeholder="Ex: x, \\alpha"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Preview */}
                <div className="lg:pl-8 lg:border-l border-gray-100 h-full flex flex-col justify-center">
                    <div className="sticky top-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Visualização
                            </h2>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-all text-sm font-medium active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <Copy className="w-4 h-4" />
                                Copiar
                            </button>
                        </div>

                        {/* LaTeX Render Container Clean */}
                        <div
                            className="bg-white border-none min-h-[300px] flex items-center justify-center p-8 cursor-pointer hover:bg-gray-50 transition-colors rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]"
                            onClick={copyToClipboard}
                            title="Clique para copiar"
                        >
                            <div id="latex-preview" className="text-2xl sm:text-4xl text-gray-900 select-all font-serif"></div>
                        </div>

                        {/* Raw Code Clean */}
                        <div className="text-center">
                            <code className="text-xs text-gray-400 font-mono selection:bg-gray-200 p-2 rounded cursor-pointer hover:text-gray-600 transition-colors" onClick={copyToClipboard}>
                                {latexOutput || 'Aguardando fórmula...'}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
