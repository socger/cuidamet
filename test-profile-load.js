// Test temporal para verificar carga de perfiles
const API_URL = 'http://localhost:3000';
const API_VERSION = 'v1';

async function testProfileLoad() {
  try {
    // 1. Login
    console.log('1. Intentando login...');
    const loginResponse = await fetch(`${API_URL}/${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'lico@lico.com',
        password: 'lico' // Asumiendo que la contraseña es 'lico'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const { accessToken, user } = loginData;
    console.log('\nUser ID:', user.id);
    console.log('User roles:', user.roles);
    
    // 2. Intentar cargar perfil de proveedor
    console.log('\n2. Intentando cargar perfil de proveedor...');
    const providerResponse = await fetch(`${API_URL}/${API_VERSION}/provider-profiles/user/${user.id}`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (providerResponse.ok) {
      const providerData = await providerResponse.json();
      console.log('Provider profile:', JSON.stringify(providerData, null, 2));
    } else {
      console.log('Provider profile not found:', await providerResponse.text());
    }
    
    // 3. Intentar cargar perfil de cliente
    console.log('\n3. Intentando cargar perfil de cliente...');
    const clientResponse = await fetch(`${API_URL}/${API_VERSION}/client-profiles/user/${user.id}`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (clientResponse.ok) {
      const clientData = await clientResponse.json();
      console.log('Client profile:', JSON.stringify(clientData, null, 2));
    } else {
      console.log('Client profile not found:', await clientResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProfileLoad();
