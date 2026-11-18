#!/usr/bin/env node

/**
 * Script de ayuda para gestión de versiones
 * Muestra comandos disponibles y su uso
 */

console.log('📦 Minitoys - Gestión de Versiones\n');

console.log('🚀 Comandos disponibles:\n');

console.log('1. Actualizar versión específica:');
console.log('   npm run version:update 1.4.14\n');

console.log('2. Incrementar versión patch (1.4.13 → 1.4.14):');
console.log('   npm run version:patch\n');

console.log('3. Incrementar versión minor (1.4.13 → 1.5.0):');
console.log('   npm run version:minor\n');

console.log('4. Incrementar versión major (1.4.13 → 2.0.0):');
console.log('   npm run version:major\n');

console.log('5. Agregar entrada al historial de versiones:');
console.log('   npm run version:history 1.4.14 "Descripción de cambios"\n');

console.log('📁 Archivos que se actualizan automáticamente:');
console.log('   ✅ package.json');
console.log('   ✅ README.md (badges y footer)');
console.log('   ✅ footer.component.html (copyright)\n');

console.log('⚠️  Recuerda después de ejecutar:');
console.log('   1. Agregar nueva sección en historial de README.md');
console.log('   2. Actualizar fecha de release');
console.log('   3. Hacer commit y push de los cambios\n');

console.log('💡 Ejemplo de uso completo:');
console.log('   npm run version:patch');
console.log('   npm run version:history $(node -p \'require("./package.json").version\') "Mejoras en el sistema de ventas"');
console.log('   # Editar manualmente los detalles en README.md');
console.log('   git add .');
console.log('   git commit -m "Release v1.4.14"');
console.log('   git push origin main\n');
