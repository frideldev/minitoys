#!/usr/bin/env node

/**
 * Script para crear una nueva entrada en el historial de versiones del README.md
 * Uso: node scripts/add-version-history.js 1.4.14 "Descripción de la versión"
 */

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];
const description = process.argv[3] || 'Actualización del sistema';

if (!newVersion) {
  console.error('❌ Error: Debes proporcionar una versión');
  console.log('Uso: node scripts/add-version-history.js 1.4.14 "Descripción de la versión"');
  process.exit(1);
}

const readmePath = path.join(__dirname, '..', 'README.md');

try {
  // Leer README.md
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Obtener fecha actual
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  // Crear nueva entrada de versión
  const newVersionEntry = `### 🎯 [v${newVersion}] - ${formattedDate}
**${description}**

#### ✨ Mejoras Principales
- ✅ **Nueva Funcionalidad**: [Describir funcionalidad principal]
- ✅ **Mejora de Performance**: [Describir optimizaciones]
- ✅ **Corrección de Bugs**: [Describir correcciones]
- ✅ **UX Mejorada**: [Describir mejoras de experiencia]

#### 🔧 Cambios Técnicos
- ✅ **[Cambio 1]**: Descripción del cambio técnico
- ✅ **[Cambio 2]**: Descripción del cambio técnico
- ✅ **[Cambio 3]**: Descripción del cambio técnico

#### 🐛 Correcciones
- ✅ **[Bug 1]**: Descripción de la corrección
- ✅ **[Bug 2]**: Descripción de la corrección

`;
  
  // Buscar el lugar donde insertar la nueva versión (después del historial de versiones)
  const historialMatch = readmeContent.match(/(## 🔄 Historial de Versiones\n\n)/);
  
  if (historialMatch) {
    const insertPosition = historialMatch.index + historialMatch[0].length;
    const beforeInsert = readmeContent.substring(0, insertPosition);
    const afterInsert = readmeContent.substring(insertPosition);
    
    readmeContent = beforeInsert + newVersionEntry + afterInsert;
    
    // Escribir el archivo actualizado
    fs.writeFileSync(readmePath, readmeContent);
    
    console.log('✅ Nueva entrada de historial agregada exitosamente:');
    console.log(`   📅 Versión: v${newVersion}`);
    console.log(`   📅 Fecha: ${formattedDate}`);
    console.log(`   📝 Descripción: ${description}`);
    console.log('');
    console.log('⚠️  Recuerda:');
    console.log('   1. Editar la nueva sección con detalles específicos');
    console.log('   2. Completar las mejoras y cambios realizados');
    console.log('   3. Revisar y hacer commit de los cambios');
    
  } else {
    console.error('❌ Error: No se encontró la sección "Historial de Versiones" en README.md');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error al agregar entrada de historial:', error.message);
  process.exit(1);
}
