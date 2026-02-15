import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import katex from 'katex';
import { createWorker } from 'tesseract.js';
import { convertFormulaToLatex, tokenize } from '../utils/engine';

export const Converter: React.FC = () => {
    const [formula, setFormula] = useState<string>('=3*A1 + 5');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [latexOutput, setLatexOutput] = useState<string>('');
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // --- OCR Logic ---
    const processImage = async (file: File) => {
        setIsOcrLoading(true);
        try {
            const worker = await createWorker('eng');
            const ret = await worker.recognize(file);
            const text = ret.data.text;

            // Basic sanitization for formulas
            // Replace newlines with spaces, remove excessive whitespace
            const sanitized = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

            setFormula(sanitized);
            await worker.terminate();
        } catch (err) {
            console.error('OCR Error:', err);
            alert('Não foi possível ler o texto da imagem. Tente uma imagem mais clara.');
        } finally {
            setIsOcrLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processImage(e.target.files[0]);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        // Handle image paste
        if (e.clipboardData.files?.[0]) {
            e.preventDefault();
            const file = e.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                processImage(file);
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-16 px-6 py-12">

            {/* Header Section */}
            <header className="text-center space-y-6">
                <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase leading-none">
                    Excel to <br />
                    <span className="text-[#FF9F1C] bg-black px-4 rounded-lg inline-block transform -rotate-2 mt-2">
                        Algebra
                    </span>
                </h1>

                <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
                    Converta planilhas em equações matemáticas.
                </p>

                <div className="pt-4">
                    <button
                        onClick={() => window.open('https://github.com/MD4NT4S/conversao-de-formula', '_blank')}
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        GitHub Project
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-12">

                {/* STEP 1: INPUT */}
                <section className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0_0_#000]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                            <span className="bg-[#FF9F1C] w-10 h-10 flex items-center justify-center rounded-lg border-3 border-black text-xl">1</span>
                            Sua Fórmula
                        </h2>

                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isOcrLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                title="Enviar imagem com fórmula"
                            >
                                {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isOcrLoading ? 'Lendo...' : 'Imagem'}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        {isOcrLoading && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#FF9F1C]" />
                                    <span className="font-bold text-black">Processando Imagem...</span>
                                </div>
                            </div>
                        )}
                        <textarea
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            onPaste={handlePaste}
                            className="w-full h-40 bg-[#F4F4F5] border-3 border-black rounded-xl p-4 text-xl font-mono text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#FF9F1C] transition-all resize-none mb-8"
                            placeholder="=SQRT(A1^2 + B1^2) ou Cole uma imagem (Ctrl+V)"
                        />
                    </div>

                    {/* Variables */}
                    {detectedVariables.length > 0 && (
                        <div className="bg-[#F0F0F0] rounded-2xl p-6 border-3 border-black/10">
                            <h3 className="font-bold uppercase text-gray-500 mb-4 text-sm tracking-wider">Mapear Variáveis</h3>
                            <div className="flex flex-wrap gap-4">
                                {detectedVariables.map((v) => (
                                    <div key={v} className="flex bg-white border-3 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                                        <div className="px-4 py-2 bg-black text-[#FF9F1C] font-bold font-mono border-r-3 border-black flex items-center">
                                            {v}
                                        </div>
                                        <input
                                            type="text"
                                            value={mappings[v] || ''}
                                            onChange={(e) => handleMappingChange(v, e.target.value)}
                                            className="w-20 px-2 text-center font-bold text-black outline-none bg-transparent"
                                            placeholder="x"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Arrow */}
                <div className="flex justify-center -my-6 z-10">
                    <div className="bg-[#FF9F1C] border-4 border-black p-3 rounded-full shadow-[4px_4px_0_0_#000]">
                        <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                {/* STEP 2: RESULT */}
                <section className="bg-black border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0_0_#FF9F1C]">
                    <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-white">
                        <span className="bg-[#FF9F1C] text-black w-10 h-10 flex items-center justify-center rounded-lg border-3 border-white text-xl">2</span>
                        Resultado
                    </h2>

                    <div
                        className="w-full bg-[#1A1A1A] rounded-2xl min-h-[240px] flex flex-col items-center justify-center p-8 border-3 border-[#333] hover:border-[#FF9F1C] transition-colors relative group cursor-pointer"
                        onClick={copyToClipboard}
                    >
                        {/* KaTeX Renderer - Explicit White override */}
                        <div
                            id="latex-preview"
                            className="text-4xl md:text-5xl font-serif z-10 overflow-x-auto max-w-full flex justify-center py-4"
                            style={{ color: 'white' }}
                        ></div>

                        {!formula && <span className="text-gray-600 font-mono">O resultado aparecerá aqui...</span>}

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-[#FF9F1C] text-black text-xs font-bold px-3 py-1 rounded">COPIAR</span>
                        </div>
                    </div>


                </section>
            </main>

            <footer className="text-center text-gray-500 font-bold">
                <p>&copy; 2026 Excel to Algebra</p>
            </footer>
        </div>
    );
};

