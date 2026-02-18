DROP DATABASE IF EXISTS tienda98;
CREATE DATABASE tienda98;
USE tienda98;

-- ==========================================
-- 1. USUARIOS Y ROLES
-- ==========================================
CREATE TABLE usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('admin', 'vendedor', 'cliente') DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso DATETIME DEFAULT NULL,
    esta_activo BOOLEAN DEFAULT TRUE,
    -- Datos opcionales para autocompletado de facturación
    ruc_cedula VARCHAR(20),
    razon_social VARCHAR(200)
);

CREATE TABLE vendedor (
    idVendedor INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    nombre_tienda VARCHAR(150) NOT NULL,
    slug_tienda VARCHAR(150) UNIQUE, -- Para URLs amigables /tienda/mi-tienda
    telefono_contacto VARCHAR(20),
    logo_url VARCHAR(255),
    banner_url VARCHAR(255),
    descripcion TEXT,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    cantidad_resenias INT UNSIGNED DEFAULT 0,
    suma_calificaciones INT UNSIGNED DEFAULT 0,
    aprobado BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- ==========================================
-- 2. UBICACIÓN
-- ==========================================
CREATE TABLE provincia (
    idProvincia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE ciudad (
    idCiudad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    idProvincia INT NOT NULL,
    FOREIGN KEY (idProvincia) REFERENCES provincia(idProvincia)
);

CREATE TABLE direccion (
    idDireccion INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT, -- Opcional, puede ser dirección de invitado guardada temporalmente o vinculada a usuario
    calle_principal VARCHAR(150) NOT NULL,
    calle_secundaria VARCHAR(150),
    codigo_postal VARCHAR(20),
    referencia TEXT,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    idCiudad INT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (idCiudad) REFERENCES ciudad(idCiudad),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- ==========================================
-- 3. CATÁLOGO
-- ==========================================
CREATE TABLE categoria (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icono_url VARCHAR(255),
    idPadre INT, -- Subcategorías
    FOREIGN KEY (idPadre) REFERENCES categoria(idCategoria) ON DELETE SET NULL
);

CREATE TABLE producto (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    idVendedor INT NOT NULL,
    idCategoria INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- SEO Friendly URL
    sku VARCHAR(100), -- SKU principal
    marca VARCHAR(100),
    
    -- Precios
    precio DECIMAL(12,2) NOT NULL,
    precio_oferta DECIMAL(12,2), -- compare_price en frontend
    precio_costo DECIMAL(12,2),  -- Para cálculo de ganancia
    
    -- Detalles
    descripcion_corta TEXT,      -- shortDescription
    descripcion_larga TEXT,      -- description
    
    -- Inventario y Logística
    stock INT NOT NULL DEFAULT 0,
    alerta_stock_bajo INT DEFAULT 5, -- lowStockThreshold
    peso_kg DECIMAL(8,2),
    dimensiones_json JSON, -- { largo, ancho, alto }
    tipo_entrega ENUM('inmediata', 'pedido') DEFAULT 'inmediata',
    
    -- Estado y Visibilidad
    estado ENUM('borrador', 'publicado', 'suspendido') DEFAULT 'borrador',
    destacado BOOLEAN DEFAULT FALSE, -- featured
    activo BOOLEAN DEFAULT TRUE,
    
    -- Multimedia
    imagen_principal VARCHAR(255),
    imagenes_json JSON, -- Array de URLs adicionales
    
    -- SEO
    meta_titulo VARCHAR(100),
    meta_descripcion VARCHAR(200),
    
    -- Stats
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    cantidad_resenias INT UNSIGNED DEFAULT 0,
    suma_calificaciones INT UNSIGNED DEFAULT 0,
    
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idVendedor) REFERENCES vendedor(idVendedor) ON DELETE CASCADE,
    FOREIGN KEY (idCategoria) REFERENCES categoria(idCategoria)
);

-- Variantes del producto (Ej: Talla L / Color Rojo)
CREATE TABLE producto_variante (
    idVariante INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- Ej: "Rojo - L"
    sku VARCHAR(100),
    precio DECIMAL(12,2), -- Puede variar del padre
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255), -- Imagen específica de la variante
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE
);

-- Etiquetas para búsqueda
CREATE TABLE producto_tag (
    idTag INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE
);

-- ==========================================
-- 4. VENTAS Y PEDIDOS (WHATSAPP FLOW)
-- ==========================================
CREATE TABLE carrito (
    idCarrito INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT, -- Nullable para invitados (usar localStorage key en frontend)
    session_id VARCHAR(100), -- Identificador para invitados
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE carrito_item (
    idCarritoItem INT AUTO_INCREMENT PRIMARY KEY,
    idCarrito INT NOT NULL,
    idProducto INT NOT NULL,
    idVariante INT, -- Puede ser NULL si no tiene variantes
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCarrito) REFERENCES carrito(idCarrito) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE,
    FOREIGN KEY (idVariante) REFERENCES producto_variante(idVariante) ON DELETE CASCADE
);

-- Esta tabla representa la "Orden de Compra" generada que se envía por WhatsApp
CREATE TABLE orden (
    idOrden INT AUTO_INCREMENT PRIMARY KEY,
    codigo_orden VARCHAR(20) UNIQUE NOT NULL, -- Código corto para referencia (ej: #ORD-9821)
    
    -- Cliente (Puede ser Invitado)
    idUsuario INT, -- NULL si es invitado
    
    -- Datos de Contacto y Envío (Snapshot del momento)
    datos_contacto_json JSON NOT NULL, -- { nombre, email, telefono }
    datos_envio_json JSON NOT NULL,    -- { direccion, ciudad, referencia, coordenadas }
    
    -- Datos de Facturación (Snapshot)
    datos_facturacion_json JSON,       -- { ruc_cedula, razon_social, direccion, correo }
    
    -- Pago
    metodo_pago VARCHAR(50), -- "Efectivo", "Transferencia", "Tarjeta contra entrega"
    estado_pago ENUM('pendiente', 'pagado', 'reembolsado') DEFAULT 'pendiente',
    
    -- Totales
    subtotal DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) DEFAULT 0.00, -- Para cubrir "Quantity Discount" o cupones
    costo_envio DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    
    -- Detalles de Envío seleccionados
    tipo_envio VARCHAR(100), -- Ej: "Envío gratis a domicilio (3 a 5 días)"
    
    -- Estado del Pedido (Alineado con Admin Frontend: pending, processing, on-hold, shipped, completed, cancelled)
    estado ENUM('pendiente', 'procesando', 'en_espera', 'enviado', 'completado', 'cancelado') DEFAULT 'pendiente',
    
    -- Auditoría
    mensaje_whatsapp_generado TEXT, -- Copia del texto enviado
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE SET NULL
);

CREATE TABLE orden_item (
    idOrdenItem INT AUTO_INCREMENT PRIMARY KEY,
    idOrden INT NOT NULL,
    idProducto INT NOT NULL,
    idVariante INT,
    nombre_producto VARCHAR(200) NOT NULL, -- Snapshot del nombre
    nombre_variante VARCHAR(100),          -- Snapshot del nombre variante
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL, -- Snapshot del precio
    total_linea DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (idOrden) REFERENCES orden(idOrden) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto), -- No cascade, mantener historial
    FOREIGN KEY (idVariante) REFERENCES producto_variante(idVariante)
);

-- ==========================================
-- 5. RESEÑAS Y FEEDBACK
-- ==========================================
CREATE TABLE resenia (
    idResenia INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    idUsuario INT NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    -- titulo VARCHAR(150), -- ELIMINADO: No se usa en el frontend app/producto/[id]/page.tsx
    comentario TEXT,
    compra_verificada BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_producto (idUsuario, idProducto),
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- TRIGGERS para actualizar calificaciones
DELIMITER //

CREATE TRIGGER trg_resenias_after_insert AFTER INSERT ON resenia
FOR EACH ROW
BEGIN
    UPDATE producto SET 
        suma_calificaciones = suma_calificaciones + NEW.calificacion,
        cantidad_resenias = cantidad_resenias + 1,
        calificacion_promedio = ROUND((suma_calificaciones + NEW.calificacion) / (cantidad_resenias + 1), 2)
    WHERE idProducto = NEW.idProducto;
END //

CREATE TRIGGER trg_resenias_after_update AFTER UPDATE ON resenia
FOR EACH ROW
BEGIN
    IF OLD.calificacion <> NEW.calificacion THEN
        UPDATE producto SET 
            suma_calificaciones = suma_calificaciones - OLD.calificacion + NEW.calificacion,
            calificacion_promedio = ROUND((suma_calificaciones - OLD.calificacion + NEW.calificacion) / cantidad_resenias, 2)
        WHERE idProducto = NEW.idProducto;
    END IF;
END //

CREATE TRIGGER trg_resenias_after_delete AFTER DELETE ON resenia
FOR EACH ROW
BEGIN
    UPDATE producto SET 
        suma_calificaciones = suma_calificaciones - OLD.calificacion,
        cantidad_resenias = cantidad_resenias - 1,
        calificacion_promedio = IF(cantidad_resenias - 1 > 0, 
                                   ROUND((suma_calificaciones - OLD.calificacion) / (cantidad_resenias - 1), 2), 
                                   0.00)
    WHERE idProducto = OLD.idProducto;
END //

DELIMITER ;
