/**
 * Test para verificar que el login devuelve correctamente los campos del usuario
 * Ejecutar con: node test-jero-login.js
 */

const API_URL = 'http://localhost:3000/v1';

async function testLogin() {
  try {
    console.log('🔐 Probando login de jero@jero.com...\n');
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'test-client',
      },
      body: JSON.stringify({
        email: 'jero@jero.com',
        password: '1a2b3c4d@',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Login exitoso\n');
    console.log('📋 Datos del usuario:');
    console.log('  ID:', data.user.id);
    console.log('  Username:', data.user.username);
    console.log('  Email:', data.user.email);
    console.log('  Nombre:', data.user.firstName);
    console.log('  Apellido:', data.user.lastName);
    console.log('  Teléfono:', data.user.phone || '(no tiene)');
    console.log('  Location:', data.user.location || '(no tiene)');
    console.log('  Languages:', data.user.languages || '(no tiene)');
    console.log('  PhotoURL:', data.user.photoUrl ? `${data.user.photoUrl.substring(0, 50)}... (${data.user.photoUrl.length} chars)` : '(no tiene)');
    console.log('  Roles:', data.user.roles);
    
    console.log('\n✅ VERIFICACIÓN:');
    console.log('  ✓ phone:', data.user.phone ? 'SÍ' : 'NO');
    console.log('  ✓ photoUrl:', data.user.photoUrl ? 'SÍ' : 'NO');
    console.log('  ✓ location:', data.user.location ? 'SÍ' : 'NO');
    console.log('  ✓ languages:', data.user.languages ? 'SÍ' : 'NO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
