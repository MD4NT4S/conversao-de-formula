import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Image as ImageIcon, ArrowRight, History } from 'lucide-react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-16 py-12">
                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Convert Images and Excel<br />Formulas to LaTeX Instantly
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        Stop typing complex equations manually. Transform your spreadsheets and screenshots into publication-ready code in seconds with our AI-powered engine.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Link to="/image-to-latex" className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ImageIcon size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                                <ImageIcon size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Image to LaTeX</h3>
                            <p className="text-neutral-400">Supports PNG, JPG, WEBP. Click to upload or drag and drop.</p>
                            <div className="flex items-center text-primary font-medium mt-4">
                                Start Converting <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    <Link to="/excel-to-latex" className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500 ms-auto">
                            <FileSpreadsheet size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                                <FileSpreadsheet size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Excel to LaTeX</h3>
                            <p className="text-neutral-400">Paste your Excel formulas directly to get the LaTeX equation.</p>
                            <div className="flex items-center text-green-500 font-medium mt-4">
                                Start Converting <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent History Preview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <History size={20} />
                            <h2 className="text-lg font-semibold text-white">Recent Conversions</h2>
                        </div>
                        <button className="text-sm text-primary hover:underline">View all history</button>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { tex: '\\frac{\\sum_{i=1}^{n} x_i}{n}', time: '2 mins ago' },
                            { tex: '\\int_{a}^{b} f(x) dx', time: '1 hour ago' },
                            { tex: 'E = mc^2', time: 'Yesterday' }
                        ].map((item, i) => (
                            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center font-mono text-sm">
                                <code className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{item.tex}</code>
                                <span className="text-neutral-500 text-xs">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
