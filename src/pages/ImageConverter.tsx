import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import Layout from '../components/Layout';

const ImageConverter: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);


    const preprocessImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const scaleFactor = 2.5; // Upscale for better OCR
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scaleFactor;
                canvas.height = img.height * scaleFactor;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(URL.createObjectURL(file));
                    return;
                }

                // Quality settings
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let totalBrightness = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    totalBrightness += (r + g + b) / 3;
                }
                const avgBrightness = totalBrightness / (data.length / 4);
                const isDark = avgBrightness < 128; // Detect dark mode image

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];

                    if (isDark) {
                        // Invert colors if dark image (Tesseract prefers black text on white)
                        r = 255 - r;
                        g = 255 - g;
                        b = 255 - b;
                    }

                    // Increase Contrast
                    const contrast = 1.5; // Factor
                    const intercept = 128 * (1 - contrast);
                    r = r * contrast + intercept;
                    g = g * contrast + intercept;
                    b = b * contrast + intercept;

                    // Grayscale & Binarize
                    const avg = (r + g + b) / 3;
                    const threshold = 160; // Slightly higher threshold for cleaner text
                    const color = avg > threshold ? 255 : 0;

                    data[i] = color;
                    data[i + 1] = color;
                    data[i + 2] = color;
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsProcessing(true);
        setResult(null);
        try {
            const processedImage = await preprocessImage(file);

            const worker = await createWorker('eng');

            // Experiment with different PSM modes if needed (single block vs single line)
            // For now default is usually auto.
            const ret = await worker.recognize(processedImage);
            await worker.terminate();

            let text = ret.data.text;

            // Heuristics for cleanup
            text = text.replace(/\n\s*\n/g, '\\\\ '); // Double newline to LaTeX break
            text = text.replace(/\n/g, ' ');         // Single newline to space

            // Fix common OCR mis-recognitions for math
            text = text.replace(/\|/g, 'I');         // Vertical bar probably I or 1
            text = text.replace(/l/g, 'l');          // Lowercase l

            // Naive fraction detection (looks for horizontal lines text blocks - extremely hard with plain OCR)
            // Instead, let's just ensure basic symbols are spaced

            text = text.replace(/([=+\-*/])/g, ' $1 '); // Space operators
            text = text.replace(/\s+/g, ' ').trim();    // Clean spaces

            setResult(text);
        } catch (err) {
            console.error(err);
            setResult('Error processing image. Post-processing failed.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResult(null); // Clear result on new file drop
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Clear result on new file selection
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Image to LaTeX</h1>
                    <p className="text-neutral-400">Upload an image of an equation to get the LaTeX code.</p>
                </div>

                <div
                    className={`relative h-96 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8
            ${dragActive ? 'border-primary bg-primary/5' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}
            ${file ? 'border-none bg-neutral-900' : ''}
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Upload preview"
                                className="max-h-64 rounded-lg object-contain mb-4"
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-neutral-400">{file.name}</span>
                                <button
                                    onClick={() => { setFile(null); setResult(null); }}
                                    className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors text-neutral-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className="mt-6 px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? 'Processing... (may take seconds)' : 'Convert Image'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
                                <Upload size={32} className="text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Click to upload or drag and drop</h3>
                            <p className="text-neutral-500 text-sm mb-6">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleChange}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer px-6 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium"
                            >
                                Select File
                            </label>
                        </>
                    )}
                </div>

                {result && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-neutral-300">LaTeX Output (Beta)</h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="text-sm text-primary hover:underline"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="bg-neutral-950 rounded-xl p-4 font-mono text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}

                {/* Recent Section - specific to Image tool */}
                <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-neutral-900">
                    <div className="text-sm text-neutral-500 font-medium uppercase tracking-wider mb-2 md:col-span-3">Recent Uploads</div>
                    {[
                        { name: 'Matrix_Calc_V2.png', time: '10 mins ago' },
                        { name: 'Homework_Q3.jpg', time: '2 hours ago' },
                        { name: 'Statistical_Model.png', time: 'Yesterday' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-900 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-400">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <div className="font-medium text-sm text-neutral-200">{item.name}</div>
                                <div className="text-xs text-neutral-500">{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default ImageConverter;
