CREATE DATABASE tienda98;
use tienda98;

CREATE TABLE categoria (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  idSubCategoria INT, -- se relaciona a categoria mismo
  FOREIGN KEY (idSubCategoria) 
    REFERENCES categoria(idCategoria)
    ON DELETE SET NULL
);

CREATE TABLE provincia (
  idProvincia INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE ciudad (
  idCiudad INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  idProvincia INT NOT NULL,
  FOREIGN KEY (idProvincia) 
    REFERENCES provincia(idProvincia)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,          -- guarda hash (bcrypt)
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso DATETIME DEFAULT NULL,
    esta_activo BOOLEAN DEFAULT TRUE,
    es_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE vendedor (
	idVendedor INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    cantidad_resenias INT UNSIGNED DEFAULT 0,
    suma_calificaciones INT UNSIGNED DEFAULT 0,
    aprobado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (idUsuario) 
      REFERENCES usuario(idUsuario)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

CREATE TABLE direccion (
  idDireccion INT AUTO_INCREMENT PRIMARY KEY,
  calle_principal VARCHAR(150) NOT NULL,
  calle_secundaria VARCHAR(150),
  codigo_postal VARCHAR(20),
  referencia TEXT,
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  idCiudad INT NOT NULL,
  FOREIGN KEY (idCiudad) 
    REFERENCES ciudad(idCiudad)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE tienda (
	idTienda INT AUTO_INCREMENT PRIMARY KEY,
    idVendedor INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    logo VARCHAR(255),
    banner VARCHAR(255),
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    idCategoria INT,
    telefono VARCHAR(20) NOT NULL,
    idDireccion INT NOT NULL,
    
    FOREIGN KEY (idVendedor) 
      REFERENCES vendedor(idVendedor)
      ON DELETE CASCADE
      ON UPDATE CASCADE,

    FOREIGN KEY (idCategoria) 
      REFERENCES categoria(idCategoria)
      ON DELETE RESTRICT
      ON UPDATE CASCADE,

    FOREIGN KEY (idDireccion) 
      REFERENCES direccion(idDireccion)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE producto(
	idProducto INT AUTO_INCREMENT PRIMARY KEY,
    idTienda INT, -- Opcional, no todos los productos están relacionados a una tienda D:
    idVendedor INT NOT NULL, -- Obligatorio para llevar quien creo cada producto
    nombre VARCHAR(150) NOT NULL,
    imagen_principal VARCHAR(255) NOT NULL,
    imagenes JSON,
    precio DECIMAL(12,2) NOT NULL,
    idCategoria INT NOT NULL,
    sku VARCHAR(100) UNIQUE,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    calificacion_promedio DECIMAL(3,2) UNSIGNED DEFAULT 0.00,
    cantidad_resenias INT UNSIGNED DEFAULT 0,
    suma_calificaciones INT UNSIGNED DEFAULT 0,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    precio_oferta DECIMAL(12,2) DEFAULT NULL,
    caracteristicas_json JSON NOT NULL,
    especificaciones_json JSON NOT NULL,
    
    FOREIGN KEY (idVendedor)   REFERENCES vendedor(idVendedor)   ON DELETE RESTRICT   ON UPDATE CASCADE,
    FOREIGN KEY (idTienda)    REFERENCES tienda(idTienda)     ON DELETE SET NULL    ON UPDATE CASCADE,
    FOREIGN KEY (idCategoria) REFERENCES categoria(idCategoria) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE resenias (
    idResenia INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    idUsuario INT NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    titulo VARCHAR(150) DEFAULT NULL,
    comentario TEXT DEFAULT NULL,
    verificada_compra BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_producto (idUsuario, idProducto),
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE resenias_vendedor (
    idReseniaVendedor  INT AUTO_INCREMENT PRIMARY KEY,
    idVendedor        INT NOT NULL,
    idUsuario         INT NOT NULL,
    calificacion      TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario        TEXT,
    verificada_compra BOOLEAN DEFAULT FALSE,
    fecha             DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_vendedor (idUsuario, idVendedor),
    FOREIGN KEY (idVendedor) REFERENCES vendedor(idVendedor) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario)  REFERENCES usuario(idUsuario)   ON DELETE CASCADE
);

CREATE TABLE carrito (
    idCarrito       INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario       INT NOT NULL UNIQUE,          -- 1 usuario → 1 carrito activo
    fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado          ENUM('activo', 'abandonado', 'convertido_en_pedido') DEFAULT 'activo',
    
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE carrito_item (
    idCarritoItem   INT AUTO_INCREMENT PRIMARY KEY,
    idCarrito       INT NOT NULL,
    idProducto      INT NOT NULL,
    cantidad        INT UNSIGNED NOT NULL DEFAULT 1 
        CHECK (cantidad >= 1),
    
    -- Precio capturado en el momento de agregar (para evitar cambios si el precio sube/baja)
    precio_unitario DECIMAL(12,2) NOT NULL,
    
    -- Opcional: precio con oferta aplicada en ese momento
    precio_oferta_aplicado DECIMAL(12,2) DEFAULT NULL,
    
    -- Para control de stock futuro y mensajes
    fecha_agregado  DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves únicas y relaciones
    UNIQUE KEY uk_carrito_producto (idCarrito, idProducto),  -- evita duplicar el mismo producto
    
    FOREIGN KEY (idCarrito)  REFERENCES carrito(idCarrito)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto)
        ON DELETE CASCADE          -- si borran el producto, se elimina del carrito
        ON UPDATE CASCADE
);

CREATE TABLE deseos (
    idDeseo       INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario     INT NOT NULL,
    idProducto    INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario)  REFERENCES usuario(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE
);

CREATE INDEX idx_carrito_usuario ON carrito(idUsuario);
CREATE INDEX idx_carritoitem_carrito ON carrito_item(idCarrito);
CREATE INDEX idx_carritoitem_producto ON carrito_item(idProducto);

CREATE INDEX idx_ciudad_provincia ON ciudad(idProvincia);
CREATE INDEX idx_direccion_ciudad ON direccion(idCiudad);
CREATE INDEX idx_tienda_vendedor ON tienda(idVendedor);
CREATE INDEX idx_tienda_categoria ON tienda(idCategoria);

DELIMITER //

-- Triggers para tabla resenias (productos)

CREATE TRIGGER trg_resenias_after_insert
AFTER INSERT ON resenias
FOR EACH ROW
BEGIN
    UPDATE producto
    SET 
        suma_calificaciones   = suma_calificaciones + NEW.calificacion,
        cantidad_resenias     = cantidad_resenias + 1,
        calificacion_promedio = IF(cantidad_resenias + 1 > 0, 
                                   ROUND((suma_calificaciones + NEW.calificacion) / (cantidad_resenias + 1), 2), 
                                   0.00)
    WHERE idProducto = NEW.idProducto;
END //

CREATE TRIGGER trg_resenias_after_update
AFTER UPDATE ON resenias
FOR EACH ROW
BEGIN
    IF OLD.calificacion <> NEW.calificacion THEN
        UPDATE producto
        SET 
            suma_calificaciones   = suma_calificaciones - OLD.calificacion + NEW.calificacion,
            calificacion_promedio = IF(cantidad_resenias > 0, 
                                       ROUND(suma_calificaciones / cantidad_resenias, 2), 
                                       0.00)
        WHERE idProducto = NEW.idProducto;
    END IF;
END //

CREATE TRIGGER trg_resenias_after_delete
AFTER DELETE ON resenias
FOR EACH ROW
BEGIN
    UPDATE producto
    SET 
        suma_calificaciones   = suma_calificaciones - OLD.calificacion,
        cantidad_resenias     = cantidad_resenias - 1,
        calificacion_promedio = IF(cantidad_resenias - 1 > 0, 
                                   ROUND((suma_calificaciones - OLD.calificacion) / (cantidad_resenias - 1), 2), 
                                   0.00)
    WHERE idProducto = OLD.idProducto;
END //

-- Triggers para tabla resenias_vendedor

CREATE TRIGGER trg_resenias_vendedor_after_insert
AFTER INSERT ON resenias_vendedor
FOR EACH ROW
BEGIN
    UPDATE vendedor
    SET 
        suma_calificaciones   = suma_calificaciones + NEW.calificacion,
        cantidad_reseñas      = cantidad_reseñas + 1,
        calificacion_promedio = IF(cantidad_reseñas + 1 > 0, 
                                   ROUND((suma_calificaciones + NEW.calificacion) / (cantidad_reseñas + 1), 2), 
                                   0.00)
    WHERE idVendedor = NEW.idVendedor;
END //

CREATE TRIGGER trg_resenias_vendedor_after_update
AFTER UPDATE ON resenias_vendedor
FOR EACH ROW
BEGIN
    IF OLD.calificacion <> NEW.calificacion THEN
        UPDATE vendedor
        SET 
            suma_calificaciones   = suma_calificaciones - OLD.calificacion + NEW.calificacion,
            calificacion_promedio = IF(cantidad_reseñas > 0, 
                                       ROUND(suma_calificaciones / cantidad_reseñas, 2), 
                                       0.00)
        WHERE idVendedor = NEW.idVendedor;
    END IF;
END //

CREATE TRIGGER trg_resenias_vendedor_after_delete
AFTER DELETE ON resenias_vendedor
FOR EACH ROW
BEGIN
    UPDATE vendedor
    SET 
        suma_calificaciones   = suma_calificaciones - OLD.calificacion,
        cantidad_reseñas      = cantidad_reseñas - 1,
        calificacion_promedio = IF(cantidad_reseñas - 1 > 0, 
                                   ROUND((suma_calificaciones - OLD.calificacion) / (cantidad_reseñas - 1), 2), 
                                   0.00)
    WHERE idVendedor = OLD.idVendedor;
END //

DELIMITER ;

