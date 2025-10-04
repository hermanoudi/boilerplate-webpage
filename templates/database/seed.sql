-- {{COMPANY_NAME}} Database Seed Data
-- Initial data for categories and products

USE `{{DB_NAME}}`;

-- Insert categories
INSERT INTO `categories` (`id`, `name`, `icon`, `display_order`) VALUES
('all', 'Todos os Produtos', 'fas fa-tshirt', 0),
('looks', 'Looks', 'fas fa-camera', 1),
('masculino', 'Masculino', 'fas fa-male', 2),
('feminino', 'Feminino', 'fas fa-female', 3),
('infantil', 'Infantil', 'fa fa-child', 4),
('acessorios', 'Acessórios', 'fa fa-shopping-bag', 5);

-- Insert sample products
INSERT INTO `products` (`name`, `category`, `price`, `original_price`, `discount`, `image`, `description`, `colors`, `sizes`, `in_stock`, `featured`) VALUES
(
    'Conjunto Premium Black',
    'looks',
    '179,90',
    '299,90',
    40,
    'assets/images/products/produto-1.jpg',
    'Conjunto elegante em preto, perfeito para o dia a dia ou ocasiões especiais.',
    JSON_ARRAY('#000000', '#333333', '#666666'),
    JSON_ARRAY('PP', 'P', 'M', 'G', 'GG'),
    TRUE,
    TRUE
),
(
    'Conjunto Listrado',
    'looks',
    '159,90',
    NULL,
    NULL,
    'assets/images/products/produto-2.jpg',
    'Conjunto moderno com estampa listrada, ideal para um visual despojado e elegante.',
    JSON_ARRAY('#FFB6C1', '#FFFFE0', '#F0F0F0'),
    JSON_ARRAY('PP', 'P', 'M', 'G', 'GG'),
    TRUE,
    TRUE
),
(
    'Vestido Floral Primavera',
    'feminino',
    '249,90',
    '349,90',
    30,
    'assets/images/products/produto-3.jpg',
    'Vestido romântico com estampa floral, ideal para a estação da primavera.',
    JSON_ARRAY('#FFB6C1', '#98FB98', '#F0E68C'),
    JSON_ARRAY('PP', 'P', 'M', 'G', 'GG'),
    TRUE,
    FALSE
),
(
    'Camisa Social Slim Fit',
    'masculino',
    '129,90',
    '179,90',
    25,
    'assets/images/products/produto-4.jpg',
    'Camisa social masculina com corte moderno, ideal para o trabalho e eventos.',
    JSON_ARRAY('#FFFFFF', '#87CEEB', '#F5F5DC'),
    JSON_ARRAY('P', 'M', 'G', 'GG', 'XGG'),
    TRUE,
    FALSE
),
(
    'Conjunto Infantil Colorido',
    'infantil',
    '89,90',
    NULL,
    NULL,
    'assets/images/products/produto-5.jpg',
    'Conjunto infantil confortável e colorido, perfeito para brincar.',
    JSON_ARRAY('#FF69B4', '#FFD700', '#87CEEB'),
    JSON_ARRAY('2', '4', '6', '8', '10'),
    TRUE,
    FALSE
),
(
    'Bolsa Fashion Premium',
    'acessorios',
    '199,90',
    '299,90',
    35,
    'assets/images/products/produto-6.jpg',
    'Bolsa elegante de couro sintético, ideal para complementar qualquer look.',
    JSON_ARRAY('#8B4513', '#000000', '#DC143C'),
    NULL,
    TRUE,
    FALSE
);
