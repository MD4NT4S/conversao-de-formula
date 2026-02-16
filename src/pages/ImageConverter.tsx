import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import Layout from '../components/Layout';

const ImageConverter: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

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
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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
                                    onClick={() => setFile(null)}
                                    className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors text-neutral-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <button className="mt-6 px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20">
                                Convert Image
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
