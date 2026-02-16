
export const parseExcelFormula = (formula: string): string => {
    if (!formula) return '';

    let tex = formula.trim();

    // Remove leading equals sign if present
    if (tex.startsWith('=')) {
        tex = tex.substring(1);
    }

    // Basic arithmetic operators
    // Replace * with \cdot for better LaTeX multiplication look, or keep as * if preferred. 
    // Standard LaTeX multiplication is often implicit or \cdot or \times. 
    // Let's use \cdot for explicit mult.
    tex = tex.replace(/\*/g, ' \\cdot ');

    // Power ^ is already good in LaTeX, but let's ensure spacing.
    // Division / should be \frac{}{} but that requires parsing nested structures which is hard with regex.
    // For a basic parser, we can try to replace simple A/B with \frac{A}{B}.
    // Since full parsing is complex, let's just make operators look Latex-y.

    // Functions map
    // SUM(A1:B2) -> \sum (range) - hard to know context, maybe \sum_{A1:B2} ?
    // Let's do simple text replacements for common functions.

    tex = tex.replace(/SUM\((.*?)\)/gi, '\\sum_{$1}');
    tex = tex.replace(/SQRT\((.*?)\)/gi, '\\sqrt{$1}');
    tex = tex.replace(/AVERAGE\((.*?)\)/gi, '\\overline{$1}');
    tex = tex.replace(/PI\(\)/gi, '\\pi');

    // Cell references (e.g. A1, B2) - we might want to wrap them in \text{} or leave as implies variables.
    // For now, leave them.

    // Division / handling (very basic)
    // Converting a/b to \frac{a}{b} is tricky without a full parser tree.
    // We will leave / as is or maybe \div. Let's use / for now to be safe against breaking syntax.

    return tex;
};
