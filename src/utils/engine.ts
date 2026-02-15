/**
 * Engine unificado para Excel -> LaTeX
 * Contém: Tokenizer, AST Parser, Converter
 */

// --- Tipos ---
export type TokenType = 'NUMBER' | 'CELL_REF' | 'OPERATOR' | 'FUNCTION' | 'PAREN_OPEN' | 'PAREN_CLOSE' | 'COMMA' | 'UNKNOWN';

export interface Token {
    type: TokenType;
    value: string;
}

export type ASTNode =
    | { type: 'NUMBER'; value: string }
    | { type: 'VARIABLE'; name: string }
    | { type: 'BINARY_OP'; operator: string; left: ASTNode; right: ASTNode }
    | { type: 'UNARY_OP'; operator: string; right: ASTNode }
    | { type: 'FUNCTION_CALL'; name: string; args: ASTNode[] }
    | { type: 'GROUP'; content: ASTNode };

// --- Tokenizer ---
export function tokenize(formula: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    if (formula.startsWith('=')) current++;

    while (current < formula.length) {
        let char = formula[current];

        // Ignorar espaços
        if (/\s/.test(char)) {
            current++;
            continue;
        }

        // Números (suporte a ponto e vírgula como decimal se necessário, mas focado em PT-BR: vírgula decimal)
        if (/[0-9]/.test(char)) {
            let value = '';
            // Aceita dígitos e [.,] desde que seguidos de dígitos
            while (current < formula.length && /[0-9.,]/.test(formula[current])) {
                // Prevenir que ',' seja capturado se for separador de argumento (verificar lógica simples)
                // Se for ',' e o próximo não for número, pare.
                if (formula[current] === ',' || formula[current] === ';') {
                    // Heurística rápida: Se estamos em contexto PT-BR, ';' é separador, ',' é decimal.
                    // Assumiremos ',' como decimal se estiver entre números.
                }
                value += formula[current];
                current++;
            }
            // Ajuste fino: Se o número termina em ',' ou ';', devolve o caractere para o stream (backtrack)
            // Mas no Regex acima pegamos tudo. Vamos simplificar:
            // Pegar numeros com . ou ,

            // Re-implementação segura para número
            // Volta cursor
            current -= value.length;
            value = '';
            while (current < formula.length) {
                const c = formula[current];
                if (/[0-9]/.test(c)) {
                    value += c;
                    current++;
                } else if (c === ',' || c === '.') {
                    // Só aceita separador decimal se tiver digito depois
                    if (current + 1 < formula.length && /[0-9]/.test(formula[current + 1])) {
                        value += c;
                        current++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            tokens.push({ type: 'NUMBER', value });
            continue;
        }

        // Identificadores (Funções ou Células)
        // Inclui $ para poder remover depois
        if (/[a-zA-Z$]/.test(char)) {
            let value = '';
            while (current < formula.length && /[a-zA-Z0-9_$]/.test(formula[current])) {
                value += formula[current];
                current++;
            }

            // Remover $ (Absolute references ignora-se)
            const cleanValue = value.replace(/\$/g, '');

            // Lookahead para ver se é função
            let lookahead = current;
            while (lookahead < formula.length && /\s/.test(formula[lookahead])) lookahead++;

            if (lookahead < formula.length && formula[lookahead] === '(') {
                tokens.push({ type: 'FUNCTION', value: cleanValue.toUpperCase() });
            } else {
                tokens.push({ type: 'CELL_REF', value: cleanValue.toUpperCase() });
            }
            continue;
        }

        // Operadores
        if (['+', '-', '*', '/', '^', '=', '<', '>'].includes(char)) {
            tokens.push({ type: 'OPERATOR', value: char });
            current++;
            continue;
        }

        // Parênteses
        if (char === '(') {
            tokens.push({ type: 'PAREN_OPEN', value: '(' });
            current++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: 'PAREN_CLOSE', value: ')' });
            current++;
            continue;
        }

        // Separadores de argumento (; ou , fora de numeros)
        if (char === ',' || char === ';') {
            tokens.push({ type: 'COMMA', value: ',' });
            current++;
            continue;
        }

        tokens.push({ type: 'UNKNOWN', value: char });
        current++;
    }

    return tokens;
}

// --- AST Parser ---
export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t => t.type !== 'UNKNOWN');
    }

    private peek(): Token | undefined {
        return this.tokens[this.current];
    }

    private advance(): Token {
        return this.tokens[this.current++];
    }

    private match(...types: TokenType[]): boolean {
        const token = this.peek();
        if (token && types.includes(token.type)) {
            this.advance();
            return true;
        }
        return false;
    }

    // Expression: Handles comparison (=, <, >)
    public parseExpression(): ASTNode {
        let left = this.parseAdditive();
        while (this.peek() && ['=', '<', '>', '<=', '>=', '<>'].includes(this.peek()!.value)) {
            const operator = this.advance().value;
            const right = this.parseAdditive();
            left = { type: 'BINARY_OP', operator, left, right };
        }
        return left;
    }

    // Additive: +, -
    private parseAdditive(): ASTNode {
        let left = this.parseTerm();
        while (this.peek() && ['+', '-'].includes(this.peek()!.value)) {
            const operator = this.advance().value;
            const right = this.parseTerm();
            left = { type: 'BINARY_OP', operator, left, right };
        }
        return left;
    }

    // Term: *, /
    private parseTerm(): ASTNode {
        let left = this.parseFactor();
        while (this.peek() && ['*', '/'].includes(this.peek()!.value)) {
            const operator = this.advance().value;
            const right = this.parseFactor();
            left = { type: 'BINARY_OP', operator, left, right };
        }
        return left;
    }

    // Factor: ^
    private parseFactor(): ASTNode {
        let left = this.parsePrimary();
        while (this.peek() && this.peek()!.value === '^') {
            const operator = this.advance().value;
            const right = this.parsePrimary();
            left = { type: 'BINARY_OP', operator, left, right };
        }
        return left;
    }

    private parsePrimary(): ASTNode {
        const token = this.peek();
        if (!token) throw new Error("Fim inesperado da fórmula");

        if (token.type === 'NUMBER') {
            this.advance();
            return { type: 'NUMBER', value: token.value };
        }

        if (token.type === 'CELL_REF') {
            this.advance();
            return { type: 'VARIABLE', name: token.value };
        }

        if (token.type === 'FUNCTION') {
            this.advance();
            const funcName = token.value;
            if (!this.match('PAREN_OPEN')) throw new Error(`Esperado '(' após ${funcName}`);

            const args: ASTNode[] = [];
            if (this.peek()?.type !== 'PAREN_CLOSE') {
                args.push(this.parseExpression());
                while (this.peek()?.type === 'COMMA') {
                    this.advance();
                    args.push(this.parseExpression());
                }
            }

            if (!this.match('PAREN_CLOSE')) throw new Error("Esperado ')' após argumentos");
            return { type: 'FUNCTION_CALL', name: funcName, args };
        }

        if (token.type === 'PAREN_OPEN') {
            this.advance();
            const expr = this.parseExpression();
            if (!this.match('PAREN_CLOSE')) throw new Error("Esperado ')'");
            return { type: 'GROUP', content: expr };
        }

        if (token.value === '-') {
            this.advance();
            const right = this.parsePrimary();
            return { type: 'UNARY_OP', operator: '-', right };
        }

        throw new Error(`Token inesperado: ${token.value}`);
    }
}

// --- Converter ---
function astToLatex(node: ASTNode, mappings: Record<string, string>): string {
    switch (node.type) {
        case 'NUMBER': return node.value.replace('.', ','); // Output BR format? User used comma.
        case 'VARIABLE':
            return mappings[node.name] || mappings[node.name.toUpperCase()] || node.name;
        case 'BINARY_OP':
            const left = astToLatex(node.left, mappings);
            const right = astToLatex(node.right, mappings);
            if (node.operator === '/') return `\\frac{${left}}{${right}}`;
            if (node.operator === '*') return `${left} \\cdot ${right}`;
            if (node.operator === '^') return `{${left}}^{${right}}`;
            // Handle comparison
            if (node.operator === '=') return `${left} = ${right}`;
            return `${left} ${node.operator} ${right}`;
        case 'UNARY_OP':
            return `${node.operator}${astToLatex(node.right, mappings)}`;
        case 'FUNCTION_CALL':
            const args = node.args.map(arg => astToLatex(arg, mappings));
            const func = node.name.toUpperCase();

            // Math Functions
            if (['SQRT', 'RAIZ'].includes(func)) return `\\sqrt{${args[0] || ''}}`;
            if (['AVERAGE', 'MEDIA', 'MÉDIA'].includes(func)) return `\\overline{${args.join(', ') || 'x'}}`;
            if (['ABS', 'ABS'].includes(func)) return `\\left| ${args[0]} \\right|`;
            if (['SIN', 'SEN', 'SENO'].includes(func)) return `\\sin\\left(${args[0]}\\right)`;
            if (['COS'].includes(func)) return `\\cos\\left(${args[0]}\\right)`;
            if (['TAN'].includes(func)) return `\\tan\\left(${args[0]}\\right)`;

            // Logic Functions
            if (['SE', 'IF'].includes(func)) {
                // \begin{cases} true & \text{se } cond \\ false & \text{caso contrário} \end{cases}
                const condition = args[0] || '?';
                const valTrue = args[1] || '?';
                const valFalse = args[2];

                if (valFalse) {
                    return `\\begin{cases} ${valTrue} & \\text{se } ${condition} \\\\ ${valFalse} & \\text{caso contrário} \\end{cases}`;
                } else {
                    return `\\begin{cases} ${valTrue} & \\text{se } ${condition} \\end{cases}`;
                }
            }

            // Ignored Functions (Transparent wrappers)
            if (['ARRED', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'RADIANOS', 'RADIANS'].includes(func)) {
                return args[0] || '';
            }

            return `\\text{${node.name}}(${args.join(', ')})`;
        case 'GROUP':
            return `\\left(${astToLatex(node.content, mappings)}\\right)`;
        default: return '';
    }
}

export function convertFormulaToLatex(formula: string, mappings: Record<string, string>): string {
    const tokens = tokenize(formula);
    if (tokens.length === 0) return '';

    // Check unknown
    const unknown = tokens.find(t => t.type === 'UNKNOWN');
    if (unknown) return `\\text{Caractere inválido: } ${unknown.value}`;

    const parser = new Parser(tokens);
    try {
        const ast = parser.parseExpression();
        return astToLatex(ast, mappings);
    } catch (e) {
        return `\\text{Erro: ${(e as Error).message}}`;
    }
}
