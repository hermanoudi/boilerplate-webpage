// LL Magazine - Color Name to Hex Mapping
// Mapeia nomes de cores em português para códigos hexadecimais

const COLOR_MAP = {
    // Cores básicas
    'preto': '#000000',
    'branco': '#FFFFFF',
    'cinza': '#808080',
    'cinza claro': '#D3D3D3',
    'cinza escuro': '#4A4A4A',

    // Vermelho
    'vermelho': '#DC2626',
    'vermelho escuro': '#B91C1C',
    'vermelho claro': '#FCA5A5',
    'rosa': '#FF69B4',
    'rosa claro': '#FFB6C1',
    'rosa pink': '#FF1493',

    // Azul
    'azul': '#3B82F6',
    'azul claro': '#87CEEB',
    'azul escuro': '#1E3A8A',
    'azul marinho': '#000080',
    'azul royal': '#4169E1',
    'azul turquesa': '#40E0D0',
    'ciano': '#00FFFF',

    // Verde
    'verde': '#10B981',
    'verde claro': '#86EFAC',
    'verde escuro': '#065F46',
    'verde limão': '#32CD32',
    'verde água': '#7FFFD4',
    'verde oliva': '#808000',

    // Amarelo
    'amarelo': '#FBBF24',
    'amarelo claro': '#FEF3C7',
    'amarelo ouro': '#FFD700',
    'amarelo pastel': '#F0E68C',

    // Laranja
    'laranja': '#F97316',
    'laranja claro': '#FDBA74',
    'laranja escuro': '#C2410C',
    'pêssego': '#FFDAB9',

    // Roxo/Violeta
    'roxo': '#9333EA',
    'roxo claro': '#C4B5FD',
    'roxo escuro': '#581C87',
    'violeta': '#8B00FF',
    'lilás': '#C8A2C8',
    'lavanda': '#E6E6FA',

    // Marrom
    'marrom': '#92400E',
    'marrom claro': '#D2691E',
    'bege': '#F5F5DC',
    'caramelo': '#C68E17',
    'terracota': '#E27B58',

    // Outros
    'nude': '#E8C6B5',
    'coral': '#FF7F50',
    'salmão': '#FA8072',
    'vinho': '#722F37',
    'bordô': '#800020',
    'mostarda': '#FFDB58',
    'off white': '#F8F8FF',
    'creme': '#FFFDD0',
    'champagne': '#F7E7CE',
    'dourado': '#FFD700',
    'prateado': '#C0C0C0',
    'bronze': '#CD7F32'
};

/**
 * Converts color name to hex code
 * @param {string} colorName - Nome da cor em português
 * @returns {string} Código hexadecimal da cor
 */
function colorNameToHex(colorName) {
    const normalized = colorName.toLowerCase().trim();
    return COLOR_MAP[normalized] || '#000000'; // Default to black if not found
}

/**
 * Converts array of color names to array of hex codes
 * @param {string[]} colorNames - Array de nomes de cores
 * @returns {string[]} Array de códigos hexadecimais
 */
function colorNamesToHex(colorNames) {
    return colorNames.map(name => colorNameToHex(name));
}

/**
 * Converts hex code to closest color name
 * @param {string} hexCode - Código hexadecimal
 * @returns {string} Nome da cor
 */
function hexToColorName(hexCode) {
    hexCode = hexCode.toUpperCase();

    // Exact match
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
        if (hex.toUpperCase() === hexCode) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }

    // If no exact match, return the hex code
    return hexCode;
}

/**
 * Get all available color names
 * @returns {string[]} Array com todos os nomes de cores disponíveis
 */
function getAvailableColors() {
    return Object.keys(COLOR_MAP).map(name =>
        name.charAt(0).toUpperCase() + name.slice(1)
    );
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        colorNameToHex,
        colorNamesToHex,
        hexToColorName,
        getAvailableColors,
        COLOR_MAP
    };
}
