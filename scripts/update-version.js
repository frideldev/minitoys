#!/usr/bin/env node

/**
 * Script para actualizar la versión en múltiples archivos del proyecto
 * 
 * Actualiza automáticamente:
 * - package.json (version field)
 * - README.md (badges y footer)
 * - footer.component.html (copyright text)
 * 
 * Uso: node scripts/update-version.js 1.4.14
 */

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];
if (!newVersion) {
  console.error('❌ Error: Debes proporcionar una versión');
  console.log('Uso: node scripts/update-version.js 1.4.14');
  process.exit(1);
}

const readmePath = path.join(__dirname, '..', 'README.md');
const packagePath = path.join(__dirname, '..', 'package.json');
const footerPath = path.join(__dirname, '..', 'src', 'app', 'shared', 'ui', 'layout', 'footer', 'footer.component.html');

// Validar que los archivos existan
const filesToUpdate = [
  { path: packagePath, name: 'package.json' },
  { path: readmePath, name: 'README.md' },
  { path: footerPath, name: 'footer.component.html' }
];

for (const file of filesToUpdate) {
  if (!fs.existsSync(file.path)) {
    console.error(`❌ Error: No se encontró el archivo ${file.name} en ${file.path}`);
    process.exit(1);
  }
}

try {
  // Leer README.md
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Leer footer.component.html
  let footerContent = fs.readFileSync(footerPath, 'utf8');
  
  // Leer package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Actualizar package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  // Patrones de reemplazo para README.md
  const readmePatterns = [
    // Badge principal
    {
      search: /version-\d+\.\d+\.\d+-blue\.svg/g,
      replace: `version-${newVersion}-blue.svg`
    },
    // Footer badge
    {
      search: /Minitoys-v\d+\.\d+\.\d+-success/g,
      replace: `Minitoys-v${newVersion}-success`
    },
    // Footer text
    {
      search: /\*\*📦 Minitoys v\d+\.\d+\.\d+\*\*/g,
      replace: `**📦 Minitoys v${newVersion}**`
    }
  ];
  
  // Patrones de reemplazo para footer.component.html
  const footerPatterns = [
    // Versión en el copyright del footer
    {
      search: /Photo Store v\.\d+\.\d+\.\d+/g,
      replace: `Photo Store v.${newVersion}`
    }
  ];
  
  // Aplicar reemplazos en README.md
  readmePatterns.forEach(pattern => {
    readmeContent = readmeContent.replace(pattern.search, pattern.replace);
  });
  
  // Aplicar reemplazos en footer.component.html
  footerPatterns.forEach(pattern => {
    footerContent = footerContent.replace(pattern.search, pattern.replace);
  });
  
  // Escribir archivos actualizados
  fs.writeFileSync(readmePath, readmeContent);
  fs.writeFileSync(footerPath, footerContent);
  
  console.log('✅ Versión actualizada exitosamente:');
  console.log(`   📦 package.json: ${newVersion}`);
  console.log(`   📄 README.md: ${newVersion}`);
  console.log(`   🦶 footer.component.html: ${newVersion}`);
  console.log('');
  console.log('🔄 Próximos pasos:');
  console.log('   1. Agregar nueva sección de versión en historial');
  console.log('   2. Actualizar fecha de release');
  console.log('   3. Commit y push de los cambios');
  
} catch (error) {
  console.error('❌ Error al actualizar versión:', error.message);
  process.exit(1);
}
