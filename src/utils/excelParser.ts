
// Token Types
type TokenType = 'NUMBER' | 'IDENTIFIER' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'POWER' | 'EOF';

interface Token {
    type: TokenType;
    value: string;
}

// Lexer
const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];
    let cursor = 0;

    while (cursor < input.length) {
        const char = input[cursor];

        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        if (/[0-9.]/.test(char)) {
            let value = '';
            while (cursor < input.length && /[0-9.]/.test(input[cursor])) {
                value += input[cursor];
                cursor++;
            }
            tokens.push({ type: 'NUMBER', value });
            continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (cursor < input.length && /[a-zA-Z0-9_:]/.test(input[cursor])) { // Include : for ranges
                value += input[cursor];
                cursor++;
            }
            tokens.push({ type: 'IDENTIFIER', value });
            continue;
        }

        switch (char) {
            case '(': tokens.push({ type: 'LPAREN', value: '(' }); cursor++; break;
            case ')': tokens.push({ type: 'RPAREN', value: ')' }); cursor++; break;
            case ',': tokens.push({ type: 'COMMA', value: ',' }); cursor++; break;
            case '+': tokens.push({ type: 'PLUS', value: '+' }); cursor++; break;
            case '-': tokens.push({ type: 'MINUS', value: '-' }); cursor++; break;
            case '*': tokens.push({ type: 'MULTIPLY', value: '*' }); cursor++; break;
            case '/': tokens.push({ type: 'DIVIDE', value: '/' }); cursor++; break;
            case '^': tokens.push({ type: 'POWER', value: '^' }); cursor++; break;
            default: cursor++; break; // Skip unknown
        }
    }
    tokens.push({ type: 'EOF', value: '' });
    return tokens;
};

// Parser
export const parseExcelFormula = (formula: string): string => {
    if (!formula) return '';

    // Clean leading =
    const cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula;
    const tokens = tokenize(cleanFormula);
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    // Grammar:
    // Expression -> Term { (+|-) Term }
    // Term -> Factor { (*|/) Factor }
    // Factor -> Base { ^ Base }
    // Base -> NUMBER | IDENTIFIER | IDENTIFIER(...) | ( Expression )

    const parseExpression = (): string => {
        let left = parseTerm();

        while (peek().type === 'PLUS' || peek().type === 'MINUS') {
            const op = consume();
            const right = parseTerm();
            left = `${left} ${op.value} ${right}`;
        }
        return left;
    };

    const parseTerm = (): string => {
        let left = parseFactor();

        while (peek().type === 'MULTIPLY' || peek().type === 'DIVIDE') {
            const op = consume();
            const right = parseFactor();

            if (op.type === 'DIVIDE') {
                left = `\\frac{${left}}{${right}}`;
            } else {
                left = `${left} \\cdot ${right}`;
            }
        }
        return left;
    };

    const parseFactor = (): string => {
        let left = parseBase();

        while (peek().type === 'POWER') {
            consume(); // ^
            const right = parseBase(); // Right associativity for power? Excel is left, standard math is right. Let's do simple.
            left = `${left}^{${right}}`;
        }
        return left;
    };

    const parseBase = (): string => {
        const token = peek();

        if (token.type === 'NUMBER') {
            consume();
            return token.value;
        }

        if (token.type === 'IDENTIFIER') {
            const name = consume().value;

            // Check if function call
            if (peek().type === 'LPAREN') {
                consume(); // (
                const args: string[] = [];
                if (peek().type !== 'RPAREN') {
                    args.push(parseExpression());
                    while (peek().type === 'COMMA') {
                        consume();
                        args.push(parseExpression());
                    }
                }
                consume(); // )
                return formatFunction(name, args);
            }

            return name; // Variable/Cell
        }

        if (token.type === 'LPAREN') {
            consume();
            const expr = parseExpression();
            consume(); // )
            return `\\left(${expr}\\right)`;
        }

        // Fallback/Error recovery
        consume();
        return '';
    };

    const formatFunction = (name: string, args: string[]): string => {
        const upName = name.toUpperCase();
        switch (upName) {
            case 'SUM': return `\\sum_{${args.join(', ')}}`;
            case 'SQRT': return `\\sqrt{${args[0]}}`;
            case 'AVERAGE': return `\\overline{${args.join(', ')}}`;
            case 'PI': return `\\pi`;
            case 'SIN': return `\\sin(${args[0]})`;
            case 'COS': return `\\cos(${args[0]})`;
            case 'TAN': return `\\tan(${args[0]})`;
            case 'LOG': return `\\log(${args.join(', ')})`;
            default: return `\\text{${name}}(${args.join(', ')})`;
        }
    };

    try {
        return parseExpression();
    } catch (e) {
        return `\\text{Error parsing formula}`;
    }
};
